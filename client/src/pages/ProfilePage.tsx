import React from "react";
import { Link } from "react-router-dom";
import { getOwnProfile, scoreProfile } from "../api/profile";
import { RatingBadge } from "../components/profile/RatingBadge";

export function ProfilePage() {
  const [loading, setLoading] = React.useState(true);
  const [scoring, setScoring] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [profileData, setProfileData] = React.useState<Awaited<
    ReturnType<typeof getOwnProfile>
  > | null>(null);

  React.useEffect(() => {
    getOwnProfile()
      .then((data) => setProfileData(data))
      .catch(() => setError("Не удалось загрузить профиль."))
      .finally(() => setLoading(false));
  }, []);

  const onScore = async () => {
    setScoring(true);
    setError(null);
    try {
      await scoreProfile();
      const fresh = await getOwnProfile();
      setProfileData(fresh);
    } catch (err) {
      const typed = err as Error & { status?: number; nextAllowedAt?: string | null };
      if (typed.status === 429) {
        setError(
          `Лимит скоринга исчерпан. Следующая попытка: ${typed.nextAllowedAt ?? "позже"}.`,
        );
      } else {
        setError(typed.message || "Не удалось выполнить скоринг.");
      }
    } finally {
      setScoring(false);
    }
  };

  if (loading) {
    return <p className="text-slate-300">Загружаем профиль...</p>;
  }

  if (error && !profileData) {
    return <p className="text-red-300">{error}</p>;
  }

  const profile = profileData?.profile;
  if (!profile) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-xl font-semibold">Профиль еще не создан</h2>
        <p className="mt-2 text-slate-300">Заполни профиль, чтобы запустить AI-скоринг.</p>
        <Link
          to="/profile/edit"
          className="mt-4 inline-flex rounded-lg bg-cyan-400 px-4 py-2 font-medium text-slate-950"
        >
          Перейти к заполнению
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Мой профиль</h2>
        <Link to="/profile/edit" className="text-cyan-300 hover:text-cyan-200">
          Редактировать
        </Link>
      </div>

      <p className="mt-3 text-slate-300">{profile.bio || "Добавь описание, чтобы профиль выглядел сильнее."}</p>
      <p className="mt-2 text-slate-400">
        Роль: {profile.role} · Грейд: {profile.claimedGrade}
      </p>
      <p className="mt-2 text-slate-400">Стек: {profile.primaryStack.join(", ") || "не указан"}</p>
      {profile.projectLinks.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm text-slate-400">Проекты</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            {profile.projectLinks.map((project, index) => (
              <li key={`${project.url}-${index}`} className="rounded-lg border border-slate-800 p-3">
                <p className="font-medium">{project.title}</p>
                <p className="mt-1 text-slate-400">{project.description}</p>
                <a
                  className="mt-1 inline-block text-cyan-300 hover:text-cyan-200"
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {project.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
        <p className="text-sm text-slate-400">AI-рейтинг</p>
        {typeof profile.rating?.score === "number" ? (
          <>
            <div className="mt-2 flex items-center gap-3">
              <RatingBadge score={profile.rating.score} />
              <span className="text-slate-300">{profile.rating.grade}</span>
            </div>
            {profile.rating.strengths?.length ? (
              <div className="mt-4">
                <p className="text-sm text-slate-400">Сильные стороны</p>
                <ul className="mt-1 list-inside list-disc text-sm text-slate-300">
                  {profile.rating.strengths.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {profile.rating.improvements?.length ? (
              <div className="mt-3">
                <p className="text-sm text-slate-400">Рекомендации по улучшению</p>
                <ul className="mt-1 list-inside list-disc text-sm text-slate-300">
                  {profile.rating.improvements.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-slate-300">Рейтинг пока не рассчитан.</p>
        )}
      </div>

      {error ? <p className="mt-4 text-red-300">{error}</p> : null}

      <button
        type="button"
        onClick={onScore}
        disabled={scoring}
        className="mt-6 rounded-lg bg-lime-300 px-5 py-3 font-medium text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {scoring ? "Считаем рейтинг..." : "Получить рейтинг"}
      </button>
    </section>
  );
}
