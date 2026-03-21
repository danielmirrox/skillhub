const express = require('express');
const { z } = require('zod');

const { requireAuth } = require('../middleware/auth');
const { demoStore } = require('../data/demoStore');

const applicationsRouter = express.Router();

const createApplicationSchema = z.object({
  teamId: z.string().min(1),
  message: z.string().max(1000).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['accepted', 'declined']),
});

applicationsRouter.get('/', requireAuth, (req, res) => {
  return res.json(demoStore.listApplicationsForUser(req.user.id));
});

applicationsRouter.post('/', requireAuth, (req, res, next) => {
  try {
    const payload = createApplicationSchema.parse(req.body || {});
    const application = demoStore.createApplication({
      applicantId: req.user.id,
      teamId: payload.teamId,
      message: payload.message || '',
    });

    return res.status(201).json({ application });
  } catch (error) {
    return next(error);
  }
});

applicationsRouter.patch('/:applicationId', requireAuth, (req, res) => {
  const payload = updateStatusSchema.parse(req.body || {});
  const application = demoStore.updateApplicationStatus(req.params.applicationId, req.user.id, payload.status);

  if (application.error === 'not_found') {
    return res.status(404).json({
      error: 'APPLICATION_NOT_FOUND',
      message: 'Application not found.',
    });
  }

  if (application.error === 'forbidden') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Only the team author can update applications for this team.',
    });
  }

  return res.json({ application });
});

module.exports = { applicationsRouter };
