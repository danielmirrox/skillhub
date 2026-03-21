import type { ChangeEvent } from "react";
import type { ClaimedGrade, Profile, ProfileRole, ProjectLink } from "../../api/profile";

type ProfileFormValues = {
  role: ProfileRole;
  claimedGrade: ClaimedGrade;
  primaryStackText: string;
  experienceYears: number;
  hackathonsCount: number;
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
    experienceYears: profile?.experienceYears ?? 0,
    hackathonsCount: profile?.hackathonsCount ?? 0,
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
      const numberValue = Number(event.target.value);
      setField(key, Number.isFinite(numberValue) ? numberValue : 0);
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
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold">Редактирование профиля</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          Специализация
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            value={values.role}
            onChange={(event) => setField("role", event.target.value as ProfileRole)}
          >
            <option value="frontend">frontend</option>
            <option value="backend">backend</option>
            <option value="fullstack">fullstack</option>
            <option value="design">design</option>
            <option value="ml">ml</option>
            <option value="mobile">mobile</option>
            <option value="other">other</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Заявленный грейд
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            value={values.claimedGrade}
            onChange={(event) => setField("claimedGrade", event.target.value as ClaimedGrade)}
          >
            <option value="junior">junior</option>
            <option value="middle">middle</option>
            <option value="senior">senior</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm md:col-span-2">
          Основной стек (через запятую)
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            value={values.primaryStackText}
            onChange={(event) => setField("primaryStackText", event.target.value)}
            placeholder="React, TypeScript, Tailwind"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Опыт (лет)
          <input
            type="number"
            min={0}
            max={50}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
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
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            value={values.hackathonsCount}
            onChange={onNumber("hackathonsCount")}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm md:col-span-2">
          О себе
          <textarea
            rows={4}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            value={values.bio}
            onChange={(event) => setField("bio", event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Telegram username
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            value={values.telegramUsername}
            onChange={(event) => setField("telegramUsername", event.target.value)}
            placeholder="denisui"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          GitHub URL
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            value={values.githubUrl}
            onChange={(event) => setField("githubUrl", event.target.value)}
            placeholder="https://github.com/username"
          />
        </label>

        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm">Проекты</p>
            <button
              type="button"
              onClick={addProjectLink}
              className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
            >
              + Добавить проект
            </button>
          </div>

          <div className="space-y-3">
            {values.projectLinks.map((item, index) => (
              <div key={`${item.url}-${index}`} className="rounded-lg border border-slate-800 p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                    placeholder="Название проекта"
                    value={item.title}
                    onChange={(event) => updateProjectLink(index, "title", event.target.value)}
                  />
                  <input
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                    placeholder="https://github.com/user/project"
                    value={item.url}
                    onChange={(event) => updateProjectLink(index, "url", event.target.value)}
                  />
                </div>
                <textarea
                  rows={2}
                  className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Короткое описание"
                  value={item.description}
                  onChange={(event) =>
                    updateProjectLink(index, "description", event.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => removeProjectLink(index)}
                  className="mt-2 text-xs text-red-300 hover:text-red-200"
                >
                  Удалить проект
                </button>
              </div>
            ))}
            {values.projectLinks.length === 0 ? (
              <p className="text-sm text-slate-400">Добавь хотя бы 1 проект для более точного скоринга.</p>
            ) : null}
          </div>
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={values.isPublic}
          onChange={(event) => setField("isPublic", event.target.checked)}
        />
        Публичный профиль
      </label>

      <button
        type="button"
        onClick={onSubmit}
        disabled={Boolean(loading)}
        className="mt-6 rounded-lg bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Сохраняем..." : "Сохранить профиль"}
      </button>
    </section>
  );
}

export type { ProfileFormValues };
