const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { requireAuth } = require('../middleware/auth');
const { demoStore } = require('../data/demoStore');

const authRouter = express.Router();
const sessionCookieName = 'skillhub.session';
const oauthStateCookieName = 'skillhub.oauth_state';

function parseDurationToMs(value, fallbackMs) {
  if (typeof value !== 'string') {
    return fallbackMs;
  }

  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return fallbackMs;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
}

function buildSessionCookie(token) {
  const maxAge = parseDurationToMs(env.JWT_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000);
  const parts = [
    `${sessionCookieName}=${token}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${Math.floor(maxAge / 1000)}`,
    'SameSite=Lax',
  ];

  if (env.COOKIE_SECURE) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function clearSessionCookie() {
  const parts = [
    `${sessionCookieName}=`,
    'HttpOnly',
    'Path=/',
    'Max-Age=0',
    'SameSite=Lax',
  ];

  if (env.COOKIE_SECURE) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function buildOAuthStateCookie(state) {
  const parts = [
    `${oauthStateCookieName}=${state}`,
    'HttpOnly',
    'Path=/',
    'Max-Age=300',
    'SameSite=Lax',
  ];

  if (env.COOKIE_SECURE) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function clearOAuthStateCookie() {
  const parts = [
    `${oauthStateCookieName}=`,
    'HttpOnly',
    'Path=/',
    'Max-Age=0',
    'SameSite=Lax',
  ];

  if (env.COOKIE_SECURE) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function getCookieValue(cookieHeader, name) {
  if (!cookieHeader) {
    return null;
  }

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || null;
}

async function exchangeGitHubCode(code) {
  const body = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    client_secret: env.GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: env.GITHUB_CALLBACK_URL,
  });

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'User-Agent': 'SkillHub-Hackathon-Demo',
    },
    body,
  });

  const payload = await response.json();

  if (!response.ok || !payload.access_token) {
    const error = new Error(payload.error_description || 'GitHub token exchange failed.');
    error.statusCode = 502;
    error.code = 'GITHUB_OAUTH_FAILED';
    throw error;
  }

  return payload.access_token;
}

async function fetchGitHubJson(url, accessToken) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'SkillHub-Hackathon-Demo',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const error = new Error(`GitHub API request failed with status ${response.status}${errorText ? `: ${errorText}` : ''}`);
    error.statusCode = 502;
    error.code = 'GITHUB_OAUTH_FAILED';
    throw error;
  }

  return response.json();
}

function pickPrimaryEmail(emails) {
  if (!Array.isArray(emails)) {
    return null;
  }

  const primaryVerified = emails.find((entry) => entry?.primary && entry?.verified);
  if (primaryVerified?.email) {
    return primaryVerified.email;
  }

  const verified = emails.find((entry) => entry?.verified);
  if (verified?.email) {
    return verified.email;
  }

  return emails[0]?.email || null;
}

authRouter.get('/github', (_req, res) => {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CALLBACK_URL) {
    return res.status(503).json({
      error: 'OAUTH_NOT_CONFIGURED',
      message: 'GitHub OAuth is not configured yet.',
    });
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
    allow_signup: 'true',
    state,
  });

  res.setHeader('Set-Cookie', buildOAuthStateCookie(state));
  return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

authRouter.get('/github/callback', async (req, res, next) => {
  try {
    const { code, error, error_description: errorDescription, state } = req.query;
    const storedState = getCookieValue(req.headers.cookie, oauthStateCookieName);

    if (error) {
      return res.status(400).json({
        error: 'GITHUB_OAUTH_FAILED',
        message: typeof errorDescription === 'string' ? errorDescription : 'GitHub OAuth failed.',
      });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'INVALID_OAUTH_CALLBACK',
        message: 'Missing OAuth code.',
      });
    }

    if (!state || typeof state !== 'string' || !storedState || storedState !== state) {
      return res.status(400).json({
        error: 'INVALID_OAUTH_STATE',
        message: 'OAuth state mismatch.',
      });
    }

    const accessToken = await exchangeGitHubCode(code);
    const githubUser = await fetchGitHubJson('https://api.github.com/user', accessToken);
    const githubEmails = await fetchGitHubJson('https://api.github.com/user/emails', accessToken);
    const email = pickPrimaryEmail(githubEmails) || githubUser.email || null;

    const user = await demoStore.upsertOAuthUser({
      githubId: githubUser.id,
      username: githubUser.login,
      displayName: githubUser.name || githubUser.login,
      avatarUrl: githubUser.avatar_url || null,
      email,
    });

    const token = jwt.sign(
      {
        sub: user.id,
        provider: 'github',
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN,
      },
    );

    res.setHeader('Set-Cookie', [buildSessionCookie(token), clearOAuthStateCookie()]);

    return res.redirect(`${env.CLIENT_URL}/dashboard`);
  } catch (error) {
    return next(error);
  }
});

authRouter.post('/logout', requireAuth, (_req, res) => {
  res.setHeader('Set-Cookie', clearSessionCookie());

  return res.json({
    success: true,
    message: 'Logged out.',
  });
});

authRouter.post('/pro/upgrade', requireAuth, async (req, res, next) => {
  try {
    const days = Number.isInteger(req.body?.days) ? req.body.days : 30;
    const normalizedDays = Math.min(365, Math.max(1, days));
    const result = await demoStore.upgradeUserToPro(req.user.id, normalizedDays);

    if (!result) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      message: 'PRO status activated for demo.',
      user: result,
    });
  } catch (error) {
    return next(error);
  }
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
