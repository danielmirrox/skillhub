const express = require('express');

const { authRouter } = require('./auth');
const { profileRouter } = require('./profile');
const { usersRouter } = require('./users');
const { teamsRouter } = require('./teams');
const { applicationsRouter } = require('./applications');

const apiRouter = express.Router();

apiRouter.get('/', (_req, res) => {
  res.json({
    service: 'skillhub-server',
    version: 'v1',
    endpoints: ['/auth', '/profile', '/users', '/teams', '/applications'],
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/teams', teamsRouter);
apiRouter.use('/applications', applicationsRouter);

module.exports = { apiRouter };
