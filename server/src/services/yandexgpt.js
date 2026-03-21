const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

const DEFAULT_COMPLETION_ENDPOINT = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';
const IAM_TOKEN_ENDPOINT = 'https://iam.api.cloud.yandex.net/iam/v1/tokens';
const TOKEN_EXPIRY_SKEW_MS = 5 * 60 * 1000;

const ROLE_LABELS = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Fullstack',
  design: 'Design',
  ml: 'ML',
  mobile: 'Mobile',
  other: 'Other',
};

const CLAIMED_GRADE_LABELS = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
};

const SYSTEM_PROMPTS = {
  free: `Ты — сервис оценки IT-навыков для хакатонов. Тебе дают данные кандидата и заявленный контекст оценки (роль + claimedGrade).
Нужно вернуть оценку соответствия заявленному уровню по шкале 0–100.

КРИТИЧЕСКИ ВАЖНО:
- Ответь ТОЛЬКО валидным JSON.
- Никакого markdown, никакого текста вокруг, никаких комментариев.
- Никаких дополнительных ключей.

Интерпретация score относительно claimedGrade:
- 0–40: не дотягивает до заявленного грейда
- 41–60: частично/нестабильно соответствует
- 61–80: уверенно соответствует
- 81–100: превосходит заявленный уровень

Будь строгим: если данных мало или они слабые, снижай score.

Формат ответа (ровно эти ключи):
{
  "score": number,
  "grade": string,
  "roleLabel": string
}

Правила:
- score только integer 0..100.
- roleLabel должен соответствовать specializationRole из входа.
- grade должен соответствовать claimedGrade + roleLabel.

Самопроверка перед ответом:
1) Убедись, что это JSON-объект и он парсится.
2) Убедись, что ключи только score/grade/roleLabel.
3) Убедись, что score integer в диапазоне 0..100.
Если что-то не сходится, исправь и выведи финальный JSON.`,
  pro: `Ты — сервис оценки IT-навыков для хакатонов. Тебе дают данные кандидата и заявленный контекст оценки (роль + claimedGrade).
Нужно вернуть оценку соответствия заявленному уровню по шкале 0–100, а также краткие сильные стороны и зоны роста.

КРИТИЧЕСКИ ВАЖНО:
- Ответь ТОЛЬКО валидным JSON.
- Никакого markdown, никакого текста вокруг, никаких комментариев.
- Никаких дополнительных ключей.

Интерпретация score относительно claimedGrade:
- 0–40: не дотягивает до заявленного грейда
- 41–60: частично/нестабильно соответствует
- 61–80: уверенно соответствует
- 81–100: превосходит заявленный уровень

Будь строгим: если данных мало или они слабые, снижай score.

Формат ответа (ровно эти ключи):
{
  "score": number,
  "grade": string,
  "roleLabel": string,
  "strengths": string[],
  "improvements": string[]
}

Правила:
- score только integer 0..100.
- strengths/improvements: 2..5 элементов, каждый элемент — непустая строка.
- roleLabel должен соответствовать specializationRole из входа.
- grade должен соответствовать claimedGrade + roleLabel.

Самопроверка перед ответом:
1) Убедись, что ответ — JSON-объект и он парсится.
2) Убедись, что ключи только score/grade/roleLabel/strengths/improvements.
3) Убедись, что score integer 0..100.
4) Убедись, что strengths/improvements — массивы строк длиной 2..5.
Если что-то не сходится, исправь и выведи финальный JSON.`,
};

const iamTokenCache = {
  token: null,
  expiresAt: 0,
  sourcePath: null,
};

const serviceAccountKeyCache = {
  path: null,
  value: null,
};

function normalizeModelUri(value) {
  return String(value || '').trim();
}

function resolveCompletionEndpoint() {
  const endpoint = normalizeModelUri(env.YANDEXGPT_LLM_ENDPOINT) || DEFAULT_COMPLETION_ENDPOINT;
  if (endpoint.endsWith('/completion')) {
    return endpoint;
  }

  return `${endpoint.replace(/\/+$/, '')}/completion`;
}

function resolveModelUri() {
  const explicitModelUri = normalizeModelUri(env.YANDEXGPT_MODEL_URI);
  if (explicitModelUri) {
    return explicitModelUri;
  }

  const folderId = normalizeModelUri(env.YANDEXGPT_FOLDER_ID);
  if (!folderId) {
    return null;
  }

  const modelName = normalizeModelUri(env.YANDEXGPT_MODEL) || 'yandexgpt/latest';
  if (modelName.startsWith('gpt://')) {
    return modelName;
  }

  return `gpt://${folderId}/${modelName.replace(/^\/+/, '')}`;
}

function resolveFolderId(modelUri) {
  const configuredFolderId = normalizeModelUri(env.YANDEXGPT_FOLDER_ID);
  if (configuredFolderId) {
    return configuredFolderId;
  }

  const normalizedModelUri = normalizeModelUri(modelUri);
  const match = normalizedModelUri.match(/^gpt:\/\/([^/]+)\//);
  return match ? match[1] : null;
}

function resolvePathMaybeRelative(filePath) {
  if (!filePath) {
    return null;
  }

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  const cwdPath = path.resolve(process.cwd(), filePath);
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }

  const repoPath = path.resolve(__dirname, '..', '..', '..', filePath);
  if (fs.existsSync(repoPath)) {
    return repoPath;
  }

  return cwdPath;
}

function readServiceAccountKey() {
  const configuredPath = normalizeModelUri(env.YANDEXGPT_SA_KEY_PATH);
  if (!configuredPath) {
    return null;
  }

  const resolvedPath = resolvePathMaybeRelative(configuredPath);
  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    const error = new Error(`Service account key file not found: ${configuredPath}`);
    error.statusCode = 500;
    error.code = 'YANDEX_SA_KEY_NOT_FOUND';
    throw error;
  }

  if (serviceAccountKeyCache.path === resolvedPath && serviceAccountKeyCache.value) {
    return serviceAccountKeyCache.value;
  }

  const raw = fs.readFileSync(resolvedPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!parsed?.private_key || !parsed?.service_account_id || !parsed?.id) {
    const error = new Error('Invalid Yandex service account key JSON.');
    error.statusCode = 500;
    error.code = 'YANDEX_SA_KEY_INVALID';
    throw error;
  }

  const key = {
    id: String(parsed.id).trim(),
    serviceAccountId: String(parsed.service_account_id).trim(),
    privateKey: String(parsed.private_key),
    keyAlgorithm: String(parsed.key_algorithm || 'RSA_2048'),
  };

  serviceAccountKeyCache.path = resolvedPath;
  serviceAccountKeyCache.value = key;

  return key;
}

function buildJwtForServiceAccount(key) {
  const normalizedPrivateKey = key.privateKey.replace(/\\n/g, '\n');

  return jwt.sign(
    {
      aud: IAM_TOKEN_ENDPOINT,
      iss: key.serviceAccountId,
    },
    normalizedPrivateKey,
    {
      algorithm: 'PS256',
      keyid: key.id,
      expiresIn: '1h',
      noTimestamp: false,
    },
  );
}

async function exchangeJwtForIamToken(jwtToken) {
  const response = await fetch(IAM_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jwt: jwtToken }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.message || `Failed to exchange JWT for IAM token (${response.status}).`);
    error.statusCode = response.status;
    error.code = 'YANDEX_IAM_TOKEN_EXCHANGE_FAILED';
    throw error;
  }

  const iamToken = payload.iamToken || payload.iam_token;
  const expiresAt = payload.expiresAt || payload.expires_at;

  if (!iamToken) {
    const error = new Error('Yandex IAM token exchange returned empty token.');
    error.statusCode = 502;
    error.code = 'YANDEX_IAM_TOKEN_MISSING';
    throw error;
  }

  return {
    token: String(iamToken),
    expiresAt: expiresAt ? new Date(expiresAt).getTime() : Date.now() + 60 * 60 * 1000,
  };
}

async function getYandexAuthHeaders() {
  const serviceAccountKey = readServiceAccountKey();
  if (serviceAccountKey) {
    if (
      iamTokenCache.token &&
      iamTokenCache.sourcePath === serviceAccountKeyCache.path &&
      Date.now() < iamTokenCache.expiresAt - TOKEN_EXPIRY_SKEW_MS
    ) {
      return {
        Authorization: `Bearer ${iamTokenCache.token}`,
      };
    }

    const jwtToken = buildJwtForServiceAccount(serviceAccountKey);
    const iamTokenResult = await exchangeJwtForIamToken(jwtToken);

    iamTokenCache.token = iamTokenResult.token;
    iamTokenCache.expiresAt = iamTokenResult.expiresAt;
    iamTokenCache.sourcePath = serviceAccountKeyCache.path;

    return {
      Authorization: `Bearer ${iamTokenResult.token}`,
    };
  }

  const iamToken = normalizeModelUri(env.YANDEXGPT_IAM_TOKEN);
  if (iamToken) {
    return {
      Authorization: `Bearer ${iamToken}`,
    };
  }

  const apiKey = normalizeModelUri(env.YANDEXGPT_API_KEY);
  if (apiKey) {
    return {
      Authorization: `Api-Key ${apiKey}`,
    };
  }

  return null;
}

function buildProjectSection(projectLinks) {
  if (!Array.isArray(projectLinks) || projectLinks.length === 0) {
    return '- нет';
  }

  return projectLinks
    .map((project) => `- title: ${project.title}\n  description: ${project.description}\n  url: ${project.url}`)
    .join('\n');
}

function buildGithubSection(githubData) {
  if (!githubData) {
    return '- нет';
  }

  const topRepos = Array.isArray(githubData.topRepos) && githubData.topRepos.length > 0
    ? githubData.topRepos
        .map(
          (repo) =>
            `  - name: ${repo.name}\n    primaryLanguage: ${repo.primaryLanguage || 'unknown'}\n    stars: ${repo.stars || 0}\n    description: ${repo.description || ''}`,
        )
        .join('\n')
    : '  - нет';

  return [
    `- publicRepos: ${githubData.publicRepos ?? 0}`,
    `- followers: ${githubData.followers ?? 0}`,
    `- accountAgeYears: ${githubData.accountAgeYears ?? 0}`,
    `- languages(bytes): ${JSON.stringify(githubData.languages || {})}`,
    '- topRepos:',
    topRepos,
  ].join('\n');
}

function buildUserPrompt(profile) {
  const specializationRole = String(profile.role || 'other').toLowerCase();
  const claimedGrade = String(profile.claimedGrade || 'junior').toLowerCase();
  const primaryStack = Array.isArray(profile.primaryStack) ? profile.primaryStack.join(', ') : '';
  const projectLinks = buildProjectSection(profile.projectLinks);
  const githubSection = buildGithubSection(profile.githubData);

  return `Оцени кандидата относительно заявленного уровня.

Контекст:
- specializationRole: ${specializationRole} (frontend|backend|fullstack|design|ml|mobile|other)
- claimedGrade: ${claimedGrade} (junior|middle|senior)

Профиль:
- primaryStack: ${primaryStack || 'не указан'}
- experienceYears: ${Number.isFinite(profile.experienceYears) ? profile.experienceYears : 0}
- hackathonsCount: ${Number.isFinite(profile.hackathonsCount) ? profile.hackathonsCount : 0}
- bio: ${profile.bio || 'не заполнено'}

Проекты:
${projectLinks}

GitHubData:
${githubSection}

Ответь строго JSON по схеме ${String(profile.mode || 'FREE').toUpperCase()}.`;
}

function extractJsonFromText(text) {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    return jsonObjectMatch[0].trim();
  }

  return text.trim();
}

function parseTextPayload(raw) {
  const text = raw?.result?.alternatives?.[0]?.message?.text;
  if (!text) {
    throw new Error('Empty response from YandexGPT API');
  }

  const jsonText = extractJsonFromText(text);
  const parsed = JSON.parse(jsonText);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('YandexGPT response must be a JSON object.');
  }

  return parsed;
}

function ensureAllowedKeys(parsed, allowedKeys) {
  const keys = Object.keys(parsed);
  const unexpectedKeys = keys.filter((key) => !allowedKeys.includes(key));
  if (unexpectedKeys.length > 0) {
    throw new Error(`Unexpected keys in YandexGPT response: ${unexpectedKeys.join(', ')}`);
  }
}

function sanitizeTextArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${fieldName}: expected array.`);
  }

  const items = value
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  const unique = [];
  for (const item of items) {
    if (!unique.includes(item)) {
      unique.push(item);
    }
  }

  if (unique.length < 2 || unique.length > 5) {
    throw new Error(`Invalid ${fieldName}: expected 2..5 non-empty items.`);
  }

  return unique.slice(0, 5);
}

function normalizeRoleLabel(role) {
  return ROLE_LABELS[String(role || '').toLowerCase()] || ROLE_LABELS.other;
}

function normalizeClaimedGrade(grade) {
  return CLAIMED_GRADE_LABELS[String(grade || '').toLowerCase()] || CLAIMED_GRADE_LABELS.junior;
}

function parseYandexGptResponse(raw, profile, mode) {
  const parsed = parseTextPayload(raw);
  const allowedKeys =
    mode === 'PRO'
      ? ['score', 'grade', 'roleLabel', 'strengths', 'improvements']
      : ['score', 'grade', 'roleLabel'];

  ensureAllowedKeys(parsed, allowedKeys);

  const score = Number(parsed.score);
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    throw new Error(`Invalid score value: ${parsed.score}`);
  }

  const expectedRoleLabel = normalizeRoleLabel(profile.role);
  const receivedRoleLabel = normalizeRoleLabel(parsed.roleLabel);
  if (receivedRoleLabel !== expectedRoleLabel) {
    throw new Error(`Role label mismatch: expected ${expectedRoleLabel}, got ${parsed.roleLabel}`);
  }

  const grade = `${normalizeClaimedGrade(profile.claimedGrade)} ${expectedRoleLabel}`;

  if (mode === 'PRO') {
    return {
      score,
      grade,
      roleLabel: expectedRoleLabel,
      strengths: sanitizeTextArray(parsed.strengths, 'strengths'),
      improvements: sanitizeTextArray(parsed.improvements, 'improvements'),
    };
  }

  return {
    score,
    grade,
    roleLabel: expectedRoleLabel,
    strengths: [],
    improvements: [],
  };
}

async function scoreWithYandexGpt(profile, options = {}) {
  const modelUri = resolveModelUri();
  if (!modelUri) {
    return null;
  }

  const authHeaders = await getYandexAuthHeaders();
  if (!authHeaders) {
    return null;
  }

  const mode = options.mode === 'pro' ? 'PRO' : 'FREE';
  const folderId = resolveFolderId(modelUri);
  const endpoint = resolveCompletionEndpoint();
  const userPrompt = buildUserPrompt({ ...profile, mode });

  const requestBody = {
    modelUri,
    completionOptions: {
      stream: false,
      temperature: mode === 'PRO' ? 0.3 : 0.2,
      maxTokens: mode === 'PRO' ? 700 : 400,
    },
    messages: [
      { role: 'system', text: SYSTEM_PROMPTS[mode.toLowerCase()] },
      { role: 'user', text: userPrompt },
    ],
  };

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...(folderId ? { 'x-folder-id': folderId } : {}),
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        const error = new Error(`YandexGPT API error ${response.status}: ${errorText}`);
        error.statusCode = response.status;
        throw error;
      }

      const raw = await response.json();
      const result = parseYandexGptResponse(raw, profile, mode);

      return {
        ...result,
        rawResponse: raw,
      };
    } catch (error) {
      lastError = error;

      if (error.statusCode && error.statusCode < 500) {
        break;
      }

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }

  throw lastError;
}

module.exports = { scoreWithYandexGpt };
