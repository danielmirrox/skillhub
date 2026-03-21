const { env } = require('../config/env');
const { demoStore } = require('../data/demoStore');
const jwt = require('jsonwebtoken');

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

function resolveUserFromToken(token) {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const userId = payload.sub || payload.userId;
    return userId ? demoStore.getUserById(userId) : null;
  } catch {
    return null;
  }
}

function resolveViewer(req, _res, next) {
  const demoUserId = req.get('x-demo-user-id');
  const authHeader = req.get('authorization');
  const sessionToken = getCookieValue(req.headers.cookie, 'skillhub.session');
  const allowDemoAuth = env.NODE_ENV !== 'production';
  let user = null;

  if (!user) {
    user = resolveUserFromToken(sessionToken);
  }

  if (!user && authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    if (allowDemoAuth && (token === 'demo' || token === 'dev')) {
      user = demoStore.getDefaultViewer();
    } else {
      user = resolveUserFromToken(token);

      if (!user && allowDemoAuth) {
        user = demoStore.getUserById(token);
      }
    }
  }

  if (!user && allowDemoAuth && demoUserId) {
    user = demoStore.getUserById(demoUserId);
  }

  if (user) {
    req.user = user;
  }

  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication required.',
    });
  }

  return next();
}

module.exports = { resolveViewer, requireAuth };
