import React from "react";
import { useNavigate } from "react-router-dom";
import { getOwnProfile, importGithubProfile, updateOwnProfile, type Profile } from "../api/profile";
import {
  ProfileForm,
  buildFormValues,
  type ProfileFormValues,
} from "../components/profile/ProfileForm";
import { formatGithubActivityLabel } from "../utils/profileLabels";

const GITHUB_IMPORT_SAMPLE = {
  fetchedAt: new Date().toISOString(),
  username: "skillhub-user",
  displayName: "SkillHub User",
  avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
  bio: "Пример профиля для импорта и проверки рекомендаций.",
  githubUrl: "https://github.com/skillhub-user",
  publicRepos: 18,
  followers: 42,
  totalStars: 86,
  totalForks: 21,
  accountAgeYears: 4,
  lastActivityAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  activityRecencyDays: 6,
  activityBucket: "fresh",
  languages: {
    TypeScript: 14,
    React: 12,
    Node: 10,
    SQL: 5,
  },
  topRepos: [
    {
      name: "team-radar",
      url: "https://github.com/skillhub-user/team-radar",
      description: "Пример проекта для матчинга участников и команд",
      stars: 31,
      forks: 7,
      primaryLanguage: "TypeScript",
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      name: "profile-signal",
      url: "https://github.com/skillhub-user/profile-signal",
      description: "Пример панели для работы с профилем и рейтингом",
      stars: 22,
      forks: 4,
      primaryLanguage: "React",
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeGitHubUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('@')) {
    return `https://github.com/${trimmed.slice(1).replace(/^\/+/, '')}`;
  }

  if (/^(?:https?:\/\/)?(?:www\.)?github\.com\//i.test(trimmed)) {
    return trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
  }

  return `https://github.com/${trimmed.replace(/^\/+/, '')}`;
}

function toPayload(values: ProfileFormValues) {
  const experienceYears = Number(values.experienceYears || 0);
  const hackathonsCount = Number(values.hackathonsCount || 0);

  return {
    role: values.role,
    claimedGrade: values.claimedGrade,
    primaryStack: values.primaryStackText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    experienceYears: Number.isFinite(experienceYears) ? experienceYears : 0,
    hackathonsCount: Number.isFinite(hackathonsCount) ? hackathonsCount : 0,
    bio: values.bio.trim(),
    projectLinks: values.projectLinks
      .map((item) => ({
        url: item.url.trim(),
        title: item.title.trim(),
        description: item.description.trim(),
      }))
      .filter((item) => item.url && item.title && item.description),
    telegramUsername: values.telegramUsername.trim() || null,
    githubUrl: normalizeGitHubUrl(values.githubUrl),
    isPublic: values.isPublic,
  };
}

export function ProfileEditPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [importResult, setImportResult] = React.useState<{
    suggestedPrimaryStack: string[];
    suggestedProjectLinks: { url: string; title: string; description: string }[];
    importedAt: string | null;
    source: "manual" | "stored" | "github-rest";
    githubData: Awaited<ReturnType<typeof importGithubProfile>>["githubData"];
  } | null>(null);
  const [profileSnapshot, setProfileSnapshot] = React.useState<Profile | null>(null);
  const [values, setValues] = React.useState<ProfileFormValues | null>(null);
  const [githubDataText, setGithubDataText] = React.useState(
    JSON.stringify(GITHUB_IMPORT_SAMPLE, null, 2),
  );

  React.useEffect(() => {
    getOwnProfile()
      .then((data) => {
        setProfileSnapshot(data.profile ?? null);
        setValues(buildFormValues(data.profile));
      })
      .catch(() => setError("Не удалось загрузить данные профиля."))
      .finally(() => setLoading(false));
  }, []);

  const applyImportResult = (result: Awaited<ReturnType<typeof importGithubProfile>>) => {
    setImportResult({
      suggestedPrimaryStack: result.suggestedPrimaryStack,
      suggestedProjectLinks: result.suggestedProjectLinks,
      importedAt: result.importedAt,
      source: result.source,
      githubData: result.githubData,
    });
    setProfileSnapshot(result.profile);
    setValues((current) =>
      current
        ? {
            ...current,
            primaryStackText: result.suggestedPrimaryStack.join(", ") || current.primaryStackText,
            projectLinks:
              result.suggestedProjectLinks.length > 0 ? result.suggestedProjectLinks : current.projectLinks,
            githubUrl: result.profile.githubUrl || current.githubUrl,
          }
        : current,
    );
  };

  const runImport = async (payload?: Parameters<typeof importGithubProfile>[0]) => {
    setImportError(null);
    setImportResult(null);
    setImporting(true);

    try {
      const result = await importGithubProfile(payload);
      applyImportResult(result);
    } catch (err) {
      const typed = err as Error;
      setImportError(typed.message || "Не удалось импортировать данные из GitHub.");
    } finally {
      setImporting(false);
    }
  };

  const onImportGithub = async () => {
    await runImport();
  };

  const onImportGithubSmoke = async () => {
    try {
      const parsed = JSON.parse(githubDataText) as Parameters<typeof importGithubProfile>[0];
      await runImport(parsed);
    } catch (err) {
      const typed = err as Error;
      setImportError(typed.message || "Не удалось импортировать данные из GitHub.");
    }
  };

  const githubConnected = Boolean(values?.githubUrl?.trim() || profileSnapshot?.githubUrl?.trim());
  const githubImportedAt = profileSnapshot?.githubData?.fetchedAt || importResult?.importedAt || null;
  const githubImportedAtLabel = formatDateTime(githubImportedAt);
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/profile");
  };

  const onSubmit = async () => {
    if (!values) return;
    setSaving(true);
    setError(null);
    try {
      await updateOwnProfile(toPayload(values));
      navigate("/profile");
    } catch (err) {
      const typed = err as Error;
      setError(typed.message || "Не удалось сохранить профиль.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-slate-300">Загружаем форму профиля...</p>;
  }

  if (!values) {
    return <p className="text-red-300">{error ?? "Форма недоступна."}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Редактирование</p>
          <p className="mt-1 text-sm text-slate-300">Вернуться назад можно без потери текущего контекста.</p>
        </div>
        <button
          type="button"
          onClick={goBack}
          className="rounded-full border border-white/10 bg-slate-950/55 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          Назад
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.58fr)_minmax(0,1.42fr)] 2xl:grid-cols-[minmax(300px,0.55fr)_minmax(0,1.45fr)]">
        <div className="xl:col-span-2 min-h-[2.25rem]">
          {error ? <p className="text-red-300">{error}</p> : null}
        </div>
        <section
          id="github-import"
          className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl xl:sticky xl:top-28 xl:max-h-[calc(100vh-9rem)] xl:self-start xl:overflow-y-auto xl:pr-3"
        >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Импорт из GitHub</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Импорт GitHub</h2>
            <p className="mt-2 text-sm text-slate-400">
              Подтягиваем открытые данные GitHub и сразу предлагаем подсказки для формы профиля.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Подключение GitHub помогает точнее собрать стек, проекты и AI-рекомендации, чтобы профиль выглядел сильнее.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
              <span className={`rounded-full border px-3 py-1 ${githubConnected ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-white/5 text-slate-300"}`}>
                {githubConnected ? "GitHub подключён" : "GitHub не указан"}
              </span>
              <span className={`rounded-full border px-3 py-1 ${githubImportedAtLabel ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300"}`}>
                {githubImportedAtLabel ? `Импорт обновлён ${githubImportedAtLabel}` : "Импорт ещё не запускался"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onImportGithub}
              disabled={importing || (!githubConnected && !profileSnapshot?.githubData)}
              className="rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-violet-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {importing ? "Импортируем..." : "Импортировать из GitHub"}
            </button>
            {!githubConnected && !profileSnapshot?.githubData ? (
              <p className="max-w-xs text-right text-xs leading-5 text-slate-400">
                Сначала укажи ссылку на GitHub в форме ниже, чтобы живой импорт взял открытые данные из профиля.
              </p>
            ) : null}
          </div>
        </div>

        <details className="mt-4 rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/45 p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-200">
            Dev / smoke fallback
          </summary>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Этот путь оставлен для локальной проверки без живого GitHub-профиля. В обычном сценарии используй кнопку выше.
          </p>
          <label className="mt-4 flex flex-col gap-2 text-sm text-slate-300">
            JSON с данными GitHub для dev/smoke
            <textarea
              rows={10}
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-xs text-slate-100 shadow-inner shadow-black/20"
              value={githubDataText}
              onChange={(event) => setGithubDataText(event.target.value)}
              spellCheck={false}
            />
          </label>
          <button
            type="button"
            onClick={onImportGithubSmoke}
            disabled={importing}
            className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Импортировать JSON
          </button>
        </details>

        {importError ? <p className="mt-3 text-sm text-red-300">{importError}</p> : null}

        {importResult ? (
          <div className="mt-4 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50">
            <p className="font-semibold">Подсказки применены к форме</p>
            <p className="mt-1 text-emerald-200">
              Источник: {importResult.source === "github-rest" ? "GitHub REST API" : importResult.source === "stored" ? "сохранённый импорт" : "ручной JSON"}
            </p>
            {importResult.importedAt ? (
              <p className="mt-1 text-emerald-200">
                Импорт обновлён: {formatDateTime(importResult.importedAt)}
              </p>
            ) : null}
            <p className="mt-2 text-emerald-200">
              Стек: {importResult.suggestedPrimaryStack.join(", ") || "не найден"}
            </p>
            <ul className="mt-2 list-inside list-disc text-emerald-100/90">
              {importResult.suggestedProjectLinks.map((project, index) => (
                <li key={`${project.url}-${index}`}>{project.title}</li>
              ))}
            </ul>
            {importResult.githubData ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200/20 bg-slate-950/45 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-100/70">Публичные репозитории</p>
                  <p className="mt-1 text-lg font-semibold text-white">{importResult.githubData.publicRepos ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200/20 bg-slate-950/45 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-100/70">Звезды</p>
                  <p className="mt-1 text-lg font-semibold text-white">{importResult.githubData.totalStars ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200/20 bg-slate-950/45 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-100/70">Подписчики</p>
                  <p className="mt-1 text-lg font-semibold text-white">{importResult.githubData.followers ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200/20 bg-slate-950/45 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-100/70">Активность</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {importResult.githubData.activityBucket
                      ? formatGithubActivityLabel(importResult.githubData.activityBucket)
                      : importResult.githubData.lastActivityAt
                        ? formatDateTime(importResult.githubData.lastActivityAt) ?? "обновлена"
                        : "нет данных"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
        <div className="xl:pt-0">
          <ProfileForm values={values} onChange={setValues} onSubmit={onSubmit} loading={saving} />
        </div>
      </div>
    </div>
  );
}
