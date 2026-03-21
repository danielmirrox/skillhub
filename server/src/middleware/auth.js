const { env } = require('../config/env');
const { demoStore } = require('../data/demoStore');

function resolveViewer(req, _res, next) {
  const demoUserId = req.get('x-demo-user-id');
  const authHeader = req.get('authorization');
  let user = null;

  if (demoUserId) {
    user = demoStore.getUserById(demoUserId);
  }

  if (!user && authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    if (token === 'demo' || token === 'dev') {
      user = demoStore.getDefaultViewer();
    } else {
      user = demoStore.getUserById(token);
    }
  }

  if (!user && env.NODE_ENV !== 'production') {
    user = demoStore.getDefaultViewer();
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
