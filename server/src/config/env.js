const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().optional().default(''),
  GITHUB_CLIENT_ID: z.string().optional().default(''),
  GITHUB_CLIENT_SECRET: z.string().optional().default(''),
  GITHUB_CALLBACK_URL: z.string().optional().default('http://localhost:5000/api/v1/auth/github/callback'),
  YANDEXGPT_API_KEY: z.string().optional().default(''),
  YANDEXGPT_IAM_TOKEN: z.string().optional().default(''),
  YANDEXGPT_FOLDER_ID: z.string().optional().default(''),
  YANDEXGPT_MODEL_URI: z.string().optional().default(''),
  YANDEXGPT_SA_KEY_PATH: z.string().optional().default(''),
  YANDEXGPT_LLM_ENDPOINT: z.string().optional().default('https://llm.api.cloud.yandex.net/foundationModels/v1/completion'),
  YANDEXGPT_MODEL: z.string().optional().default('yandexgpt-5-lite/latest'),
  YANDEXGPT_BASE_URL: z.string().optional().default('https://ai.api.cloud.yandex.net/v1'),
  YANDEX_CLOUD_API_KEY: z.string().optional().default(''),
  YANDEX_CLOUD_FOLDER: z.string().optional().default(''),
  YANDEX_CLOUD_MODEL: z.string().optional().default(''),
  YANDEX_CLOUD_BASE_URL: z.string().optional().default(''),
  JWT_SECRET: z.string().optional().default('dev-secret'),
  JWT_EXPIRES_IN: z.string().optional().default('7d'),
  COOKIE_SECURE: z
    .string()
    .optional()
    .default('false')
    .transform((value) => ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())),
  CLIENT_URL: z.string().optional().default('http://localhost:5173'),
  CLIENT_URLS: z
    .string()
    .optional()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  GITHUB_API_TOKEN: z.string().optional().default(''),
  DEBUG: z.string().optional().default('skillhub:*'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const messages = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${messages.join('\n')}`);
}

const env = parsed.data;

module.exports = { env };
