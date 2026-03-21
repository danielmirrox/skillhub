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

usersRouter.get('/', requireAuth, (req, res) => {
  const query = usersQuerySchema.parse(req.query || {});
  const result = demoStore.listUsers(query, req.user);

  return res.json(result);
});

usersRouter.get('/me', requireAuth, (req, res) => {
  return res.json(demoStore.getAuthMe(req.user.id));
});

module.exports = { usersRouter };
