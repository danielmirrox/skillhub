import React from "react";
import { useNavigate } from "react-router-dom";
import { getOwnProfile, importGithubProfile, updateOwnProfile } from "../api/profile";
import {
  ProfileForm,
  buildFormValues,
  type ProfileFormValues,
} from "../components/profile/ProfileForm";

const GITHUB_IMPORT_SAMPLE = {
  fetchedAt: new Date().toISOString(),
  publicRepos: 18,
  followers: 42,
  accountAgeYears: 4,
  languages: {
    TypeScript: 14,
    React: 12,
    Node: 10,
    SQL: 5,
  },
  topRepos: [
    {
      name: "skillhub-matcher",
      description: "Hackathon matching prototype with profile scoring",
      stars: 31,
      primaryLanguage: "TypeScript",
    },
    {
      name: "team-boards",
      description: "Team planning dashboard for fast collaboration",
      stars: 22,
      primaryLanguage: "React",
    },
  ],
};

function toPayload(values: ProfileFormValues) {
  return {
    role: values.role,
    claimedGrade: values.claimedGrade,
    primaryStack: values.primaryStackText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    experienceYears: values.experienceYears,
    hackathonsCount: values.hackathonsCount,
    bio: values.bio.trim(),
    projectLinks: values.projectLinks
      .map((item) => ({
        url: item.url.trim(),
        title: item.title.trim(),
        description: item.description.trim(),
      }))
      .filter((item) => item.url && item.title && item.description),
    telegramUsername: values.telegramUsername.trim() || null,
    githubUrl: values.githubUrl.trim() || null,
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
  } | null>(null);
  const [values, setValues] = React.useState<ProfileFormValues | null>(null);
  const [githubDataText, setGithubDataText] = React.useState(
    JSON.stringify(GITHUB_IMPORT_SAMPLE, null, 2),
  );

  React.useEffect(() => {
    getOwnProfile()
      .then((data) => setValues(buildFormValues(data.profile)))
      .catch(() => setError("Не удалось загрузить данные профиля."))
      .finally(() => setLoading(false));
  }, []);

  const onImportGithub = async () => {
    setImportError(null);
    setImportResult(null);
    setImporting(true);

    try {
      const parsed = JSON.parse(githubDataText) as Parameters<typeof importGithubProfile>[0];
      const result = await importGithubProfile(parsed);
      setImportResult({
        suggestedPrimaryStack: result.suggestedPrimaryStack,
        suggestedProjectLinks: result.suggestedProjectLinks,
      });
      setValues((current) =>
        current
          ? {
              ...current,
              primaryStackText: result.suggestedPrimaryStack.join(", ") || current.primaryStackText,
              projectLinks:
                result.suggestedProjectLinks.length > 0 ? result.suggestedProjectLinks : current.projectLinks,
            }
          : current,
      );
    } catch (err) {
      const typed = err as Error;
      setImportError(typed.message || "Не удалось импортировать данные из GitHub.");
    } finally {
      setImporting(false);
    }
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
    <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
      {error ? <p className="mb-4 text-red-300">{error}</p> : null}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl xl:sticky xl:top-28 xl:self-start">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">GitHub import</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Импорт GitHub</h2>
            <p className="mt-2 text-sm text-slate-400">
              Проверяем импорт профиля через GitHub data и сразу подставляем подсказки в форму.
            </p>
          </div>
          <button
            type="button"
            onClick={onImportGithub}
            disabled={importing}
            className="rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-violet-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importing ? "Импортируем..." : "Импортировать GitHub"}
          </button>
        </div>

        <label className="mt-4 flex flex-col gap-2 text-sm text-slate-300">
          JSON GitHub data
          <textarea
            rows={10}
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-xs text-slate-100 shadow-inner shadow-black/20"
            value={githubDataText}
            onChange={(event) => setGithubDataText(event.target.value)}
            spellCheck={false}
          />
        </label>

        {importError ? <p className="mt-3 text-sm text-red-300">{importError}</p> : null}

        {importResult ? (
          <div className="mt-4 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50">
            <p className="font-semibold">Подсказки применены к форме</p>
            <p className="mt-2 text-emerald-200">
              Stack: {importResult.suggestedPrimaryStack.join(", ") || "не найден"}
            </p>
            <ul className="mt-2 list-inside list-disc text-emerald-100/90">
              {importResult.suggestedProjectLinks.map((project, index) => (
                <li key={`${project.url}-${index}`}>{project.title}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
      <div className="xl:pt-0">
        <ProfileForm values={values} onChange={setValues} onSubmit={onSubmit} loading={saving} />
      </div>
    </div>
  );
}
