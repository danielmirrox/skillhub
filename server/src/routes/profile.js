const express = require('express');
const { z } = require('zod');

const { requireAuth } = require('../middleware/auth');
const { demoStore } = require('../data/demoStore');
const { env } = require('../config/env');
const { scoreWithYandexGpt } = require('../services/yandexgpt');

const profileRouter = express.Router();

const projectLinkSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(240),
});

const profileUpdateSchema = z.object({
  role: z.enum(['frontend', 'backend', 'fullstack', 'design', 'ml', 'mobile', 'other']).optional(),
  claimedGrade: z.enum(['junior', 'middle', 'senior']).optional(),
  primaryStack: z.array(z.string().min(1).max(64)).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  hackathonsCount: z.number().int().min(0).max(100).optional(),
  bio: z.string().min(1).max(2000).optional(),
  projectLinks: z.array(projectLinkSchema).optional(),
  telegramUsername: z.string().min(1).max(64).optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
});

const githubImportSchema = z.object({
  githubData: z
    .object({
      fetchedAt: z.string().optional(),
      publicRepos: z.number().int().min(0).optional(),
      followers: z.number().int().min(0).optional(),
      accountAgeYears: z.number().int().min(0).optional(),
      languages: z.record(z.number().min(0)).optional(),
      topRepos: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().optional().nullable(),
            stars: z.number().int().min(0).optional(),
            primaryLanguage: z.string().optional().nullable(),
          })
        )
        .optional(),
    })
    .optional(),
});

function extractGithubUsername(githubUrl) {
  if (!githubUrl) {
    return null;
  }

  try {
    const parsed = new URL(githubUrl);
    const segments = parsed.pathname.split('/').filter(Boolean);
    return segments[0] || null;
  } catch {
    return null;
  }
}

async function fetchGitHubJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(env.GITHUB_API_TOKEN ? { Authorization: `Bearer ${env.GITHUB_API_TOKEN}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'SkillHub-Hackathon-Demo',
    },
  });

  if (!response.ok) {
    const error = new Error(`GitHub API request failed with status ${response.status}`);
    error.statusCode = 502;
    error.code = 'GITHUB_IMPORT_FAILED';
    throw error;
  }

  return response.json();
}

async function buildGithubDataFromGitHub(userId) {
  const profile = demoStore.getProfileByUserId(userId);
  const githubUsername = extractGithubUsername(profile?.githubUrl);

  if (!githubUsername) {
    const error = new Error('Provide githubData or set githubUrl before importing.');
    error.statusCode = 400;
    error.code = 'GITHUB_DATA_REQUIRED';
    throw error;
  }

  const [githubUser, githubRepos] = await Promise.all([
    fetchGitHubJson(`https://api.github.com/users/${encodeURIComponent(githubUsername)}`),
    fetchGitHubJson(`https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?per_page=100&sort=updated`),
  ]);

  const languages = {};
  for (const repo of githubRepos) {
    if (!repo.language) continue;
    languages[repo.language] = (languages[repo.language] || 0) + 1;
  }

  const topRepos = [...githubRepos]
    .sort((left, right) => (right.stargazers_count || 0) - (left.stargazers_count || 0))
    .slice(0, 3)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count || 0,
      primaryLanguage: repo.language,
    }));

  const accountAgeYears = githubUser?.created_at
    ? Math.max(0, Math.floor((Date.now() - new Date(githubUser.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))
    : 0;

  return {
    fetchedAt: new Date().toISOString(),
    publicRepos: githubUser?.public_repos || 0,
    followers: githubUser?.followers || 0,
    accountAgeYears,
    languages,
    topRepos,
  };
}

profileRouter.get('/', requireAuth, (req, res) => {
  return res.json(demoStore.getAuthMe(req.user.id));
});

profileRouter.put('/', requireAuth, async (req, res, next) => {
  try {
    const payload = profileUpdateSchema.parse(req.body || {});
    const profile = await demoStore.updateProfile(req.user.id, payload);

    return res.json({
      profile,
    });
  } catch (error) {
    return next(error);
  }
});

profileRouter.post('/score', requireAuth, (req, res) => {
  (async () => {
    const payload = profileUpdateSchema.partial().parse(req.body || {});
    const rateLimitStatus = demoStore.getRateLimitStatus(req.user.id);

    if (!rateLimitStatus.allowed) {
      return res.status(429).json({
        error: 'RATE_LIMITED',
        message: 'Profile scoring is temporarily limited.',
        nextAllowedAt: rateLimitStatus.nextAllowedAt,
      });
    }

    if (Object.keys(payload).length > 0) {
      await demoStore.updateProfile(req.user.id, payload);
    }

    const currentProfile = demoStore.getProfileByUserId(req.user.id);
    const mergedProfile = currentProfile
      ? {
          ...currentProfile,
          ...payload,
          primaryStack: payload.primaryStack || currentProfile.primaryStack,
          projectLinks: payload.projectLinks || currentProfile.projectLinks,
          githubData: payload.githubData || currentProfile.githubData,
        }
      : payload;

    let aiResult = null;
    let aiSource = 'formula';

    try {
      aiResult = await scoreWithYandexGpt(mergedProfile);
      if (aiResult) {
        aiSource = 'yandexgpt';
      }
    } catch (aiError) {
      aiSource = 'formula_fallback';
    }

    const rating = await demoStore.scoreProfile(req.user.id, payload, aiResult);
    const ownProfile = demoStore.getAuthMe(req.user.id).profile;

    const ratingResponse = req.user.isPro
      ? { ...rating, source: aiSource }
      : {
          score: rating.score,
          grade: rating.grade,
          roleLabel: rating.roleLabel,
        };

    return res.json({
      jobId: rating.id,
      rating: ratingResponse,
      profile: ownProfile,
      nextAllowedAt: null,
    });
  })().catch((error) => {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.errors.map((issue) => issue.message).join(', '),
      });
    }

    return res.status(500).json({
      error: 'SCORING_FAILED',
      message: error.message || 'Failed to score profile.',
    });
  });
});

profileRouter.get('/score/history', requireAuth, (req, res) => {
  return res.json({
    items: demoStore.getRatingHistoryByUserId(req.user.id),
  });
});

profileRouter.get('/score/status/:jobId', requireAuth, (req, res) => {
  const status = demoStore.getScoreJobStatus(req.params.jobId, req.user.id);

  if (!status) {
    return res.status(404).json({
      error: 'SCORE_JOB_NOT_FOUND',
      message: 'Score job not found.',
    });
  }

  return res.json(status);
});

profileRouter.post('/import-github', requireAuth, (req, res) => {
  (async () => {
    const payload = githubImportSchema.parse(req.body || {});
    const currentProfile = demoStore.getProfileByUserId(req.user.id);
    const githubData = payload.githubData || currentProfile?.githubData || (await buildGithubDataFromGitHub(req.user.id));

    const result = await demoStore.importGithubData(req.user.id, githubData);

    return res.json({
      suggestedPrimaryStack: result.suggestedPrimaryStack,
      suggestedProjectLinks: result.suggestedProjectLinks,
      profile: result.profile,
    });
  })().catch((error) => {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.code || 'GITHUB_IMPORT_FAILED',
        message: error.message,
      });
    }

    return res.status(500).json({
      error: 'GITHUB_IMPORT_FAILED',
      message: error.message || 'Failed to import GitHub data.',
    });
  });
});

profileRouter.post('/pro', requireAuth, (req, res, next) => {
  (async () => {
    const upgradedUser = await demoStore.setUserPro(req.user.id, true);

    if (!upgradedUser) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    return res.json({
      user: upgradedUser,
      success: true,
    });
  })().catch(next);
});

profileRouter.get('/:userId', requireAuth, (req, res) => {
  const profile = demoStore.getProfileByUserId(req.params.userId);

  if (!profile) {
    return res.status(404).json({
      error: 'PROFILE_NOT_FOUND',
      message: 'Profile not found.',
    });
  }

  return res.json({
    profile: demoStore.buildPublicProfile(profile, req.user),
  });
});

module.exports = { profileRouter };
