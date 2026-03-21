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

authRouter.post('/logout', requireAuth, (_req, res) => {
  return res.json({
    success: true,
    message: 'Logged out.',
  });
});

authRouter.get('/me', requireAuth, (req, res) => {
  const me = demoStore.getAuthMe(req.user.id);

  return res.json({
    user: {
      id: me.user.id,
      username: me.user.username,
      displayName: me.user.displayName,
      avatarUrl: me.user.avatarUrl,
      email: me.user.email,
      isPro: me.user.isPro,
      proExpiresAt: me.user.proExpiresAt,
      role: me.user.userRole,
      userRole: me.user.userRole,
    },
    profile: me.profile,
  });
});

module.exports = { authRouter };
