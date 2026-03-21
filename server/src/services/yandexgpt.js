const { env } = require('../config/env');

const YANDEXGPT_API_URL = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

const SYSTEM_PROMPT = `Ты — эксперт по оценке IT-навыков студентов для хакатонов. Кандидат сам выбрал свой заявленный грейд (Junior/Middle/Senior + роль). Твоя задача — оценить, насколько он соответствует этому грейду, по шкале 0–100.

Интерпретация балла относительно заявленного грейда:
- 0–40: Не дотягивает до заявленного грейда (переоценка себя)
- 41–60: Близко, но нестабильно соответствует
- 61–80: Соответствует заявленному грейду
- 81–100: Превосходит заявленный грейд (готов к следующему уровню)

Учитывай: заявленный стек, реальные проекты, опыт, участие в хакатонах. Будь строг: завышенная самооценка — частая проблема. Отвечай ТОЛЬКО в формате JSON.`;

function buildUserPrompt(profile) {
  const projectsText =
    (profile.projectLinks || []).length > 0
      ? (profile.projectLinks || [])
          .map((link) => `- ${link.title}: ${link.description} (${link.url})`)
          .join('\n')
      : '- Нет проектов';

  const githubSection = profile.githubData
    ? `\nДанные GitHub:\n- Публичных репозиториев: ${profile.githubData.publicRepos || 0}\n- Подписчиков: ${profile.githubData.followers || 0}\n- Возраст аккаунта: ${profile.githubData.accountAgeYears || 0} лет\n- Языки: ${JSON.stringify(profile.githubData.languages || {})}\n- Топ репо: ${(profile.githubData.topRepos || []).map((repo) => `${repo.name} (${repo.primaryLanguage || 'unknown'}, ${repo.stars || 0} ⭐) — ${repo.description || ''}`).join(', ')}`
    : '';

  return `Кандидат заявил грейд: ${profile.claimedGrade} ${profile.role}. Оцени, насколько он соответствует этому уровню.

Роль: ${profile.role || 'other'}
Заявленный грейд: ${profile.claimedGrade || 'junior'}
Стек: ${(profile.primaryStack || []).join(', ') || 'не указан'}
Опыт: ${profile.experienceYears || 0} лет
Хакатоны: ${profile.hackathonsCount || 0}
О себе: ${profile.bio || 'не заполнено'}

Проекты:
${projectsText}
${githubSection}

Ответь СТРОГО в формате JSON:
{
  "score": <число 0-100>,
  "grade": "<Junior|Middle|Senior> <Backend|Frontend|...>",
  "roleLabel": "<Frontend|Backend|Fullstack|Design|ML|Mobile|Other>",
  "strengths": ["<сильная сторона 1>", "<сильная сторона 2>"],
  "improvements": ["<зона роста 1>", "<зона роста 2>"]
}`;
}

function extractJsonFromText(text) {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    return jsonObjectMatch[0];
  }

  return text.trim();
}

function parseYandexGptResponse(raw) {
  const text = raw?.result?.alternatives?.[0]?.message?.text;
  if (!text) {
    throw new Error('Empty response from YandexGPT API');
  }

  const jsonText = extractJsonFromText(text);
  const parsed = JSON.parse(jsonText);

  const score = Number(parsed.score);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error(`Invalid score value: ${parsed.score}`);
  }

  return {
    score: Math.round(score),
    grade: String(parsed.grade || ''),
    roleLabel: String(parsed.roleLabel || ''),
    strengths: Array.isArray(parsed.strengths)
      ? parsed.strengths.slice(0, 5).map(String)
      : [],
    improvements: Array.isArray(parsed.improvements)
      ? parsed.improvements.slice(0, 5).map(String)
      : [],
  };
}

async function scoreWithYandexGpt(profile) {
  if (!env.YANDEXGPT_API_KEY || !env.YANDEXGPT_FOLDER_ID) {
    return null;
  }

  const modelUri = `gpt://${env.YANDEXGPT_FOLDER_ID}/yandexgpt/latest`;
  const userPrompt = buildUserPrompt(profile);

  const requestBody = {
    modelUri,
    completionOptions: {
      stream: false,
      temperature: 0.3,
      maxTokens: 1024,
    },
    messages: [
      { role: 'system', text: SYSTEM_PROMPT },
      { role: 'user', text: userPrompt },
    ],
  };

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(YANDEXGPT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Api-Key ${env.YANDEXGPT_API_KEY}`,
          'x-folder-id': env.YANDEXGPT_FOLDER_ID,
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
      const result = parseYandexGptResponse(raw);

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
