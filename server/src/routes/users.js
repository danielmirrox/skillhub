const express = require('express');
const { z } = require('zod');

const { requireAuth } = require('../middleware/auth');
const { demoStore } = require('../data/demoStore');

const usersRouter = express.Router();

const usersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['frontend', 'backend', 'fullstack', 'design', 'ml', 'mobile', 'other']).optional(),
  grade: z.enum(['junior', 'middle', 'senior']).optional(),
  minRating: z.coerce.number().int().min(0).max(100).optional(),
  stack: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const votePayloadSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

function toErrorResponse(error, fallbackMessage) {
  if (error instanceof Error) {
    return {
      statusCode: typeof error.statusCode === 'number' ? error.statusCode : 500,
      code: typeof error.code === 'string' ? error.code : 'INTERNAL_ERROR',
      message: error.message || fallbackMessage,
    };
  }

  return {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message: fallbackMessage,
  };
}

usersRouter.get('/', requireAuth, (req, res) => {
  const query = usersQuerySchema.parse(req.query || {});
  const result = demoStore.listUsers(query, req.user);

  return res.json(result);
});

usersRouter.get('/me', requireAuth, (req, res) => {
  return res.json(demoStore.getAuthMe(req.user.id));
});

usersRouter.get('/favorites', requireAuth, (req, res) => {
  return res.json(demoStore.listFavoriteUsers(req.user));
});

usersRouter.post('/:id/favorite', requireAuth, async (req, res) => {
  try {
    const user = await demoStore.toggleFavorite(req.user.id, req.params.id);
    return res.json({ user });
  } catch (error) {
    const typed = toErrorResponse(error, 'Failed to update favorite state.');
    return res.status(typed.statusCode || 500).json({
      error: typed.code || 'INTERNAL_ERROR',
      message: typed.message || 'Failed to update favorite state.',
    });
  }
});

usersRouter.post('/:id/vote', requireAuth, async (req, res) => {
  try {
    const payload = votePayloadSchema.parse(req.body || {});
    const user = await demoStore.toggleVote(req.user.id, req.params.id, payload.value);
    return res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid vote payload.',
      });
    }

    const typed = toErrorResponse(error, 'Failed to update vote.');
    return res.status(typed.statusCode || 500).json({
      error: typed.code || 'INTERNAL_ERROR',
      message: typed.message || 'Failed to update vote.',
    });
  }
});

usersRouter.get('/:id', requireAuth, (req, res) => {
  const summary = demoStore.buildUserSummary(req.params.id, req.user);

  if (!summary) {
    return res.status(404).json({
      error: 'USER_NOT_FOUND',
      message: 'User not found.',
    });
  }

  return res.json({ user: summary });
});

module.exports = { usersRouter };
