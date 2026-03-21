const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { env } = require('./config/env');
const { resolveViewer } = require('./middleware/auth');
const { notFoundHandler } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');
const { pingDatabase } = require('./data/db');
const { apiRouter } = require('./routes');

function createApp() {
  const app = express();
  const allowedClientOrigins = new Set(
    [env.CLIENT_URL, ...(env.CLIENT_URLS || [])]
      .filter(Boolean)
      .map((value) => {
        try {
          return new URL(value).origin;
        } catch {
          return value;
        }
      }),
  );

  const isAllowedOrigin = (origin) => {
    if (!origin) {
      return true;
    }

    if (allowedClientOrigins.has(origin)) {
      return true;
    }

    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  };

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }

        return callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.LOG_LEVEL === 'debug' ? 'dev' : 'combined'));
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/health', async (_req, res) => {
    const database = await pingDatabase();
    const oauthConfigured = Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET && env.GITHUB_CALLBACK_URL);
    const yandexConfigured = Boolean(env.YANDEXGPT_API_KEY && env.YANDEXGPT_FOLDER_ID);
    const healthy = database.healthy;

    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'ok' : 'degraded',
      service: 'skillhub-server',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database,
      oauth: {
        githubConfigured: oauthConfigured,
      },
      yandexgpt: {
        configured: yandexConfigured,
      },
    });
  });

  app.use(resolveViewer);
  app.use('/api/v1', apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
