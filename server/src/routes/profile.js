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

const githubRepositorySchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  stars: z.number().int().min(0).optional(),
  forks: z.number().int().min(0).optional(),
  primaryLanguage: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});

const profileUpdateSchema = z.object({
  role: z.enum(['frontend', 'backend', 'fullstack', 'design', 'ml', 'mobile', 'other']).optional(),
  claimedGrade: z.enum(['junior', 'middle', 'senior']).optional(),
  primaryStack: z.array(z.string().min(1).max(64)).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  hackathonsCount: z.number().int().min(0).max(100).optional(),
  bio: z.string().max(2000).optional().nullable(),
  projectLinks: z.array(projectLinkSchema).optional(),
  telegramUsername: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return null;
    }

    return value;
  }, z.string().min(1).max(64).optional().nullable()),
  githubUrl: z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith('@')) {
      return `https://github.com/${trimmed.slice(1).replace(/^\/+/, '')}`;
    }

    if (/^(?:https?:\/\/)?(?:www\.)?github\.com\//i.test(trimmed)) {
      return trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    }

    return `https://github.com/${trimmed.replace(/^\/+/, '')}`;
  }, z.string().url().optional().nullable()),
  isPublic: z.boolean().optional(),
});

const scoreProfileSchema = profileUpdateSchema.partial().extend({
  bypassRateLimit: z.boolean().optional(),
});

const githubImportSchema = z.object({
  githubData: z
    .object({
      fetchedAt: z.string().optional(),
      username: z.string().optional(),
      displayName: z.string().optional().nullable(),
      avatarUrl: z.string().url().optional().nullable(),
      bio: z.string().optional().nullable(),
      githubUrl: z.string().url().optional().nullable(),
      publicRepos: z.number().int().min(0).optional(),
      followers: z.number().int().min(0).optional(),
      totalStars: z.number().int().min(0).optional(),
      totalForks: z.number().int().min(0).optional(),
      accountAgeYears: z.number().int().min(0).optional(),
      lastActivityAt: z.string().optional().nullable(),
      activityRecencyDays: z.number().int().min(0).optional().nullable(),
      activityBucket: z.enum(['fresh', 'recent', 'steady', 'stale']).optional().nullable(),
      languages: z.record(z.number().min(0)).optional(),
      topRepos: z.array(githubRepositorySchema).optional(),
    })
    .optional(),
});

function isValidationError(error) {
  return Boolean(error && (error.name === 'ZodError' || Array.isArray(error.issues)));
}

function formatValidationError(error, fallbackMessage) {
  const issues = (Array.isArray(error?.issues) ? error.issues : []).map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

  const fields = {};
  for (const issue of issues) {
    if (!fields[issue.path]) {
      fields[issue.path] = issue.message;
    }
  }

  return {
    error: 'VALIDATION_ERROR',
    message: fallbackMessage,
    fields,
    issues,
  };
}

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

async function fetchAllGitHubRepos(githubUsername) {
  const repos = [];

  for (let page = 1; page <= 5; page += 1) {
    const batch = await fetchGitHubJson(
      `https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?per_page=100&sort=updated&type=owner&page=${page}`,
    );

    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    repos.push(...batch);

    if (batch.length < 100) {
      break;
    }
  }

  return repos;
}

function getActivityBucket(activityRecencyDays) {
  if (activityRecencyDays == null) {
    return null;
  }

  if (activityRecencyDays <= 14) {
    return 'fresh';
  }

  if (activityRecencyDays <= 60) {
    return 'recent';
  }

  if (activityRecencyDays <= 180) {
    return 'steady';
  }

  return 'stale';
}

function normalizeGitHubRepositoryUrl(value) {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

    if (host !== 'github.com') {
      return null;
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length !== 2) {
      return null;
    }

    return `https://github.com/${segments[0]}/${segments[1]}`;
  } catch {
    return null;
  }
}

function inferGitHubRepoName(url, explicitName) {
  const trimmedName = String(explicitName || '').trim();
  if (trimmedName) {
    return trimmedName;
  }

  const normalizedUrl = normalizeGitHubRepositoryUrl(url);
  if (!normalizedUrl) {
    return '';
  }

  const parsed = new URL(normalizedUrl);
  const segments = parsed.pathname.split('/').filter(Boolean);
  return segments[1] || '';
}

function normalizeGithubRepoCandidate(repo, githubUsername) {
  if (!repo || typeof repo !== 'object') {
    return null;
  }

  const normalizedUrl = normalizeGitHubRepositoryUrl(repo.url || repo.html_url);
  if (!normalizedUrl) {
    return null;
  }

  const normalizedName = inferGitHubRepoName(normalizedUrl, repo.name);
  const normalizedUsername = String(githubUsername || '').trim().toLowerCase();
  if (!normalizedName) {
    return null;
  }
  if (normalizedName && normalizedUsername && normalizedName.toLowerCase() === normalizedUsername) {
    return null;
  }

  return {
    name: normalizedName,
    url: normalizedUrl,
    description: repo.description || null,
    stars: repo.stars_count ?? repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    primaryLanguage: repo.language || repo.primaryLanguage || null,
    updatedAt: repo.updated_at || repo.updatedAt || null,
  };
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

  let githubUser = null;
  let githubRepos = [];

  try {
    githubUser = await fetchGitHubJson(`https://api.github.com/users/${encodeURIComponent(githubUsername)}`);
  } catch (error) {
    if (error.statusCode === 502) {
      const notFoundError = new Error(`GitHub profile ${githubUsername} was not found or is unavailable.`);
      notFoundError.statusCode = 404;
      notFoundError.code = 'GITHUB_PROFILE_NOT_FOUND';
      throw notFoundError;
    }

    throw error;
  }

  try {
    githubRepos = await fetchAllGitHubRepos(githubUsername);
  } catch {
    githubRepos = [];
  }

  const normalizedRepos = Array.isArray(githubRepos) ? githubRepos : [];
  const repoCandidates = normalizedRepos
    .map((repo) => normalizeGithubRepoCandidate(repo, githubUsername))
    .filter(Boolean);

  const languages = {};
  for (const repo of repoCandidates) {
    if (!repo.primaryLanguage) continue;
    languages[repo.primaryLanguage] = (languages[repo.primaryLanguage] || 0) + 1;
  }

  const totalStars = repoCandidates.reduce((sum, repo) => sum + (repo.stars || 0), 0);
  const totalForks = repoCandidates.reduce((sum, repo) => sum + (repo.forks || 0), 0);
  const lastActivityAt = repoCandidates
    .map((repo) => repo.updatedAt || null)
    .filter(Boolean)
    .sort()
    .at(-1) || null;
  const activityRecencyDays = lastActivityAt
    ? Math.max(0, Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / (24 * 60 * 60 * 1000)))
    : null;

  const topRepos = [...repoCandidates]
    .sort((left, right) => (right.stars || 0) - (left.stars || 0))
    .slice(0, 3)
    .map((repo) => ({
      name: repo.name,
      url: repo.url,
      description: repo.description,
      stars: repo.stars || 0,
      forks: repo.forks || 0,
      primaryLanguage: repo.primaryLanguage,
      updatedAt: repo.updatedAt || null,
    }));

  const accountAgeYears = githubUser?.created_at
    ? Math.max(0, Math.floor((Date.now() - new Date(githubUser.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))
    : 0;

  return {
    fetchedAt: new Date().toISOString(),
    username: githubUser?.login || githubUsername,
    displayName: githubUser?.name || githubUser?.login || githubUsername,
    avatarUrl: githubUser?.avatar_url || null,
    bio: githubUser?.bio || null,
    githubUrl: githubUser?.html_url || `https://github.com/${githubUsername}`,
    publicRepos: repoCandidates.length,
    followers: githubUser?.followers || 0,
    totalStars,
    totalForks,
    accountAgeYears,
    lastActivityAt,
    activityRecencyDays,
    activityBucket: getActivityBucket(activityRecencyDays),
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
    if (isValidationError(error)) {
      return res.status(400).json(formatValidationError(error, 'Проверь поля профиля.'));
    }

    return next(error);
  }
});

profileRouter.post('/score', requireAuth, (req, res) => {
  (async () => {
    const body = scoreProfileSchema.parse(req.body || {});
    const { bypassRateLimit = false, ...payload } = body;
    const rateLimitStatus = demoStore.getRateLimitStatus(req.user.id);

    if (bypassRateLimit && env.NODE_ENV !== 'production') {
      // Dev-only escape hatch for repeated scoring during local development.
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
        aiResult = await scoreWithYandexGpt(mergedProfile, {
          mode: req.user.isPro ? 'pro' : 'free',
        });
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
        bypassRateLimit: true,
      });
    }

    if (!rateLimitStatus.allowed) {
      return res.status(429).json({
        error: 'RATING_LIMIT_EXCEEDED',
        message: `Бесплатный скоринг доступен раз в 7 дней. Следующий: ${rateLimitStatus.nextAllowedAt}`,
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
      aiResult = await scoreWithYandexGpt(mergedProfile, {
        mode: req.user.isPro ? 'pro' : 'free',
      });
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
      nextAllowedAt: demoStore.getRateLimitStatus(req.user.id).nextAllowedAt,
    });
  })().catch((error) => {
    if (isValidationError(error)) {
      return res.status(400).json(formatValidationError(error, 'Проверь поля для оценки.'));
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
    let githubData = payload.githubData || null;
    let source = payload.githubData ? 'manual' : 'stored';

    if (!githubData) {
      if (currentProfile?.githubUrl) {
        githubData = await buildGithubDataFromGitHub(req.user.id);
        source = 'github-rest';
      } else if (currentProfile?.githubData) {
        githubData = currentProfile.githubData;
        source = 'stored';
      }
    }

    if (!githubData) {
      const error = new Error('Provide githubData or set githubUrl before importing.');
      error.statusCode = 400;
      error.code = 'GITHUB_DATA_REQUIRED';
      throw error;
    }

    const result = await demoStore.importGithubData(req.user.id, githubData);

    return res.json({
      suggestedPrimaryStack: result.suggestedPrimaryStack,
      suggestedProjectLinks: result.suggestedProjectLinks,
      profile: result.profile,
      githubData: result.githubData,
      importedAt: githubData.fetchedAt || null,
      source,
    });
  })().catch((error) => {
    if (isValidationError(error)) {
      return res.status(400).json(formatValidationError(error, 'Проверь данные GitHub импорта.'));
    }

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
