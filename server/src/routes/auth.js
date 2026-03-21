const express = require('express');

const { env } = require('../config/env');
const { requireAuth } = require('../middleware/auth');
const { demoStore } = require('../data/demoStore');

const authRouter = express.Router();

authRouter.get('/github', (_req, res) => {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CALLBACK_URL) {
    return res.status(503).json({
      error: 'OAUTH_NOT_CONFIGURED',
      message: 'GitHub OAuth is not configured yet.',
    });
  }

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
    allow_signup: 'true',
  });

  return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

authRouter.get('/github/callback', (_req, res) => {
  return res.json({
    success: true,
    message: 'GitHub OAuth callback placeholder. Session exchange will be implemented next.',
    next: `${env.CLIENT_URL}/`,
  });
});

authRouter.get('/me', requireAuth, (req, res) => {
  return res.json({
    user: req.user,
    profile: demoStore.getAuthMe(req.user.id).profile,
  });
});

module.exports = { authRouter };
