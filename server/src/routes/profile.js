const express = require('express');
const { z } = require('zod');

const { requireAuth } = require('../middleware/auth');
const { demoStore } = require('../data/demoStore');

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

profileRouter.get('/', requireAuth, (req, res) => {
  return res.json(demoStore.getAuthMe(req.user.id));
});

profileRouter.put('/', requireAuth, (req, res) => {
  const payload = profileUpdateSchema.parse(req.body || {});
  const profile = demoStore.updateProfile(req.user.id, payload);

  return res.json({
    profile,
  });
});

profileRouter.post('/score', requireAuth, (req, res) => {
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
    demoStore.updateProfile(req.user.id, payload);
  }

  const rating = demoStore.scoreProfile(req.user.id, payload);
  const ownProfile = demoStore.getAuthMe(req.user.id).profile;

  return res.json({
    rating: req.user.isPro
      ? rating
      : {
          score: rating.score,
          grade: rating.grade,
          roleLabel: rating.roleLabel,
        },
    profile: ownProfile,
    nextAllowedAt: null,
  });
});

profileRouter.post('/import-github', requireAuth, (req, res) => {
  const payload = githubImportSchema.parse(req.body || {});
  const currentProfile = demoStore.getProfileByUserId(req.user.id);
  const githubData = payload.githubData || currentProfile?.githubData || null;

  if (!githubData) {
    return res.status(400).json({
      error: 'GITHUB_DATA_REQUIRED',
      message: 'Provide githubData to import or connect GitHub first.',
    });
  }

  const result = demoStore.importGithubData(req.user.id, githubData);

  return res.json({
    suggestedPrimaryStack: result.suggestedPrimaryStack,
    suggestedProjectLinks: result.suggestedProjectLinks,
    profile: result.profile,
  });
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
