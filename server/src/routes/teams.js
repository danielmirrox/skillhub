const express = require('express');
const { z } = require('zod');

const { requireAuth } = require('../middleware/auth');
const { demoStore } = require('../data/demoStore');

const teamsRouter = express.Router();

const teamSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(10).max(2000),
  hackathonName: z.string().min(2).max(120),
  requiredRoles: z.array(z.enum(['frontend', 'backend', 'fullstack', 'design', 'ml', 'mobile', 'other'])).min(1),
  minRating: z.number().int().min(0).max(100).optional().nullable(),
  stack: z.array(z.string().min(1).max(64)).min(1),
  slotsOpen: z.number().int().min(2).max(20),
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'paused', 'closed']).optional(),
});

teamsRouter.get('/', requireAuth, (req, res) => {
  const query = {
    role: req.query.role,
    stack: req.query.stack,
    hackathon: req.query.hackathon,
  };

  return res.json({
    items: demoStore.listTeams(query),
  });
});

teamsRouter.get('/:teamId', requireAuth, (req, res) => {
  const team = demoStore.getTeamById(req.params.teamId);

  if (!team) {
    return res.status(404).json({
      error: 'TEAM_NOT_FOUND',
      message: 'Team not found.',
    });
  }

  return res.json({ team });
});

teamsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = teamSchema.parse(req.body || {});
    const team = await demoStore.createTeam(req.user.id, payload);

    return res.status(201).json({ team });
  } catch (error) {
    return next(error);
  }
});

teamsRouter.put('/:teamId', requireAuth, async (req, res, next) => {
  try {
    const team = demoStore.getTeamById(req.params.teamId);

    if (!team) {
      return res.status(404).json({
        error: 'TEAM_NOT_FOUND',
        message: 'Team not found.',
      });
    }

    if (team.authorId !== req.user.id) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Only the team author can edit the team.',
      });
    }

    const payload = teamSchema.partial().parse(req.body || {});
    const updatedTeam = await demoStore.updateTeam(req.params.teamId, payload);

    return res.json({ team: updatedTeam });
  } catch (error) {
    return next(error);
  }
});

module.exports = { teamsRouter };
