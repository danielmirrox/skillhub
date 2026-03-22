const express = require('express');
const { z } = require('zod');

const { requireAuth } = require('../middleware/auth');
const { demoStore } = require('../data/demoStore');

const teamsRouter = express.Router();

const teamRoleSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  return value;
}, z.enum(['frontend', 'backend', 'fullstack', 'design', 'ml', 'mobile', 'other']));

const teamSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(2000),
  hackathonName: z.string().trim().min(2).max(120),
  requiredRoles: z.array(teamRoleSchema).min(1),
  minRating: z.number().int().min(0).max(100).optional().nullable(),
  stack: z.array(z.string().trim().min(1).max(64)).min(1),
  slotsOpen: z.number().int().min(2).max(20),
  isActive: z.boolean().optional(),
  status: z.enum(['active', 'paused', 'closed']).optional(),
});

function formatValidationError(error) {
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
    message: 'Исправь поля команды.',
    fields,
    issues,
  };
}

function isValidationError(error) {
  return Boolean(error && (error.name === 'ZodError' || Array.isArray(error.issues)));
}

teamsRouter.get('/', requireAuth, (req, res) => {
  const includeClosed = req.query.includeClosed === 'true' || req.query.includeClosed === '1';
  const query = {
    role: req.query.role,
    stack: req.query.stack,
    hackathon: req.query.hackathon,
    includeClosed,
  };

  return res.json({
    items: demoStore.listTeams(query, req.user.id),
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
    if (isValidationError(error)) {
      return res.status(400).json(formatValidationError(error));
    }

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
    if (isValidationError(error)) {
      return res.status(400).json(formatValidationError(error));
    }

    return next(error);
  }
});

teamsRouter.delete('/:teamId/members/:userId', requireAuth, async (req, res, next) => {
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
        message: 'Only the team captain can remove members.',
      });
    }

    const updatedTeam = await demoStore.removeTeamMember(req.params.teamId, req.params.userId);

    return res.json({ team: updatedTeam });
  } catch (error) {
    if (error.code === 'TEAM_MEMBER_NOT_FOUND' || error.code === 'TEAM_NOT_FOUND') {
      return res.status(error.statusCode || 404).json({
        error: error.code,
        message: error.message,
      });
    }

    if (error.code === 'CANNOT_REMOVE_TEAM_AUTHOR') {
      return res.status(409).json({
        error: error.code,
        message: error.message,
      });
    }

    return next(error);
  }
});

module.exports = { teamsRouter };
