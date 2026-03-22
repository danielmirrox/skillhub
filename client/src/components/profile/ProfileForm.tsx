import type { ChangeEvent } from "react";
import type { ClaimedGrade, Profile, ProfileRole, ProjectLink } from "../../api/profile";

type ProfileFormValues = {
  role: ProfileRole;
  claimedGrade: ClaimedGrade;
  primaryStackText: string;
  experienceYears: string;
  hackathonsCount: string;
  bio: string;
  telegramUsername: string;
  githubUrl: string;
  isPublic: boolean;
  projectLinks: ProjectLink[];
};

type ProfileFormProps = {
  values: ProfileFormValues;
  loading?: boolean;
  onChange: (next: ProfileFormValues) => void;
  onSubmit: () => void;
};

export function buildFormValues(profile: Profile | null): ProfileFormValues {
  return {
    role: profile?.role ?? "frontend",
    claimedGrade: profile?.claimedGrade ?? "junior",
    primaryStackText: (profile?.primaryStack ?? []).join(", "),
    experienceYears: profile?.experienceYears !== undefined ? String(profile.experienceYears) : "",
    hackathonsCount: profile?.hackathonsCount !== undefined ? String(profile.hackathonsCount) : "",
    bio: profile?.bio ?? "",
    telegramUsername: profile?.telegramUsername ?? "",
    githubUrl: profile?.githubUrl ?? "",
    isPublic: profile?.isPublic ?? true,
    projectLinks: profile?.projectLinks ?? [],
  };
}

export function ProfileForm({ values, loading, onChange, onSubmit }: ProfileFormProps) {
  const setField = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  const onNumber =
    (key: "experienceYears" | "hackathonsCount") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setField(key, nextValue);
    };

  const updateProjectLink = (index: number, field: keyof ProjectLink, value: string) => {
    const nextLinks = values.projectLinks.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    setField("projectLinks", nextLinks);
  };

  const addProjectLink = () => {
    setField("projectLinks", [
      ...values.projectLinks,
      { url: "", title: "", description: "" },
    ]);
  };

  const removeProjectLink = (index: number) => {
    setField(
      "projectLinks",
      values.projectLinks.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Профиль</p>
          <h2 className="mt-2 text-2xl font-semibold">Редактирование профиля</h2>
          <p className="mt-2 text-sm text-slate-400">
            Заполни профиль так, чтобы AI-рейтинг и поиск работали на тебя, а не против.
          </p>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={Boolean(loading)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Сохраняем..." : "Сохранить профиль"}
        </button>
      </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Основное</p>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              Специализация
              <select
                className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 shadow-inner shadow-black/20 transition focus:border-cyan-300/30 focus:bg-slate-950 sm:text-sm"
                value={values.role}
                onChange={(event) => setField("role", event.target.value as ProfileRole)}
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="fullstack">Fullstack</option>
                <option value="design">Design</option>
                <option value="ml">ML</option>
                <option value="mobile">Mobile</option>
                <option value="other">Другое</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Грейд
              <select
                className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 shadow-inner shadow-black/20 transition focus:border-cyan-300/30 focus:bg-slate-950 sm:text-sm"
                value={values.claimedGrade}
                onChange={(event) => setField("claimedGrade", event.target.value as ClaimedGrade)}
              >
                <option value="junior">Junior</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Опыт (лет)
              <input
                type="number"
                min={0}
                max={50}
                inputMode="numeric"
                className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 shadow-inner shadow-black/20 transition focus:border-cyan-300/30 focus:bg-slate-950 sm:text-sm"
                value={values.experienceYears}
                onChange={onNumber("experienceYears")}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Хакатоны
              <input
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 shadow-inner shadow-black/20 transition focus:border-cyan-300/30 focus:bg-slate-950 sm:text-sm"
                value={values.hackathonsCount}
                onChange={onNumber("hackathonsCount")}
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm">
            Основной стек
            <input
              className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 transition focus:border-cyan-300/30 focus:bg-slate-950 sm:text-sm"
              value={values.primaryStackText}
              onChange={(event) => setField("primaryStackText", event.target.value)}
              placeholder="React, TypeScript, Tailwind"
            />
            <span className="text-xs text-slate-500">Пиши через запятую: так проще читать на мобильном и точнее для поиска.</span>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            О себе
            <textarea
              rows={6}
              className="min-h-32 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 shadow-inner shadow-black/20 transition focus:border-cyan-300/30 focus:bg-slate-950 sm:text-sm"
              value={values.bio}
              onChange={(event) => setField("bio", event.target.value)}
              placeholder="Коротко опиши роль, интересы и что ищешь в команде"
            />
          </label>
        </div>

        <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Контакты и ссылки</p>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              Telegram
              <input
                className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 transition focus:border-cyan-300/30 focus:bg-slate-950 sm:text-sm"
                value={values.telegramUsername}
                onChange={(event) => setField("telegramUsername", event.target.value)}
                placeholder="denisui"
              />
              <span className="text-xs text-slate-500">Показываем только если ты включил public/pro visibility.</span>
            </label>

            <label className="flex flex-col gap-2 text-sm">
              GitHub
              <input
                className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 transition focus:border-cyan-300/30 focus:bg-slate-950 sm:text-sm"
                value={values.githubUrl}
                onChange={(event) => setField("githubUrl", event.target.value)}
                placeholder="https://github.com/username"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={values.isPublic}
              onChange={(event) => setField("isPublic", event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-slate-950 text-cyan-400"
            />
            Публичный профиль
          </label>

          <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">Проекты</p>
                <p className="text-xs text-slate-400">Добавь 1–3 проекта — это помогает скорингу и поиску.</p>
              </div>
              <button
                type="button"
                onClick={addProjectLink}
                className="inline-flex items-center gap-1 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/20"
              >
                <span aria-hidden="true">+</span>
                + Добавить проект
              </button>
            </div>

            <div className="space-y-3">
              {values.projectLinks.map((item, index) => (
                <div key={`${item.url}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                    <input
                      className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 transition focus:border-cyan-300/30 focus:bg-slate-950 sm:text-sm"
                      placeholder="Название проекта"
                      value={item.title}
                      onChange={(event) => updateProjectLink(index, "title", event.target.value)}
                    />
                    <input
                      className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 transition focus:border-cyan-300/30 focus:bg-slate-950 sm:text-sm"
                      placeholder="https://github.com/user/project"
                      value={item.url}
                      onChange={(event) => updateProjectLink(index, "url", event.target.value)}
                    />
                  </div>
                  <textarea
                    rows={2}
                    className="mt-3 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 transition focus:border-cyan-300/30 focus:bg-slate-950 sm:text-sm"
                    placeholder="Короткое описание"
                    value={item.description}
                    onChange={(event) =>
                      updateProjectLink(index, "description", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeProjectLink(index)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-200 hover:text-rose-100"
                  >
                    <span aria-hidden="true">−</span>
                    Удалить проект
                  </button>
                </div>
              ))}
              {values.projectLinks.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-slate-950/45 px-4 py-5 text-sm text-slate-400">
                  Добавь хотя бы один проект для более точного скоринга.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export type { ProfileFormValues };
