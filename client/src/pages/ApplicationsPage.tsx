import React from "react";
import { getApplications, updateApplicationStatus, type ApplicationView } from "../api/applications";

type TabKey = "incoming" | "outgoing";

function ApplicationCard({
  application,
  onAccept,
  onDecline,
}: {
  application: ApplicationView;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/25 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-300/60 to-transparent" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{application.team?.name ?? "Unknown team"}</p>
          <p className="text-sm text-slate-400">{application.team?.hackathonName ?? "Hackathon"}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
          {application.status}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/55 p-3">
        <img
          src={application.applicant?.avatarUrl ?? "https://avatars.githubusercontent.com/u/1?v=4"}
          alt={application.applicant?.displayName ?? "Applicant"}
          className="h-11 w-11 rounded-2xl border border-white/10 object-cover"
        />
        <div>
          <p className="font-medium text-slate-100">{application.applicant?.displayName ?? "Applicant"}</p>
          <p className="text-sm text-slate-400">
            {application.applicant?.rating ? `rating ${application.applicant.rating.score}` : "rating unavailable"}
          </p>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
        {application.message || "Без сообщения"}
      </p>

      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Создано: {new Date(application.createdAt).toLocaleString()}</p>

      {onAccept && onDecline && application.status === "pending" ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onAccept(application.id)}
            className="rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
          >
            Принять
          </button>
          <button
            type="button"
            onClick={() => onDecline(application.id)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100 hover:bg-white/10"
          >
            Отклонить
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function ApplicationsPage() {
  const [tab, setTab] = React.useState<TabKey>("incoming");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [incoming, setIncoming] = React.useState<ApplicationView[]>([]);
  const [outgoing, setOutgoing] = React.useState<ApplicationView[]>([]);

  const load = React.useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getApplications()
      .then((response) => {
        if (!active) return;
        setIncoming(response.incoming);
        setOutgoing(response.outgoing);
      })
      .catch(() => {
        if (active) {
          setError("Не удалось загрузить applications.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  const handleStatus = async (applicationId: string, status: "accepted" | "declined") => {
    setActionError(null);

    try {
      await updateApplicationStatus(applicationId, status);
      const response = await getApplications();
      setIncoming(response.incoming);
      setOutgoing(response.outgoing);
    } catch (err) {
      const typed = err as Error;
      setActionError(typed.message || "Не удалось обновить статус отклика.");
    }
  };

  const activeItems = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-[2rem] border border-lime-300/20 bg-gradient-to-br from-lime-300/10 via-slate-950 to-cyan-400/10 p-7 shadow-2xl shadow-slate-950/30 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-lime-300">Applications</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">Отклики и управление заявками</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Видно incoming и outgoing applications, а также можно принять или отклонить отклик без ручного API.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Входящие</p>
            <p className="mt-2 text-3xl font-semibold text-white">{incoming.length}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Исходящие</p>
            <p className="mt-2 text-3xl font-semibold text-white">{outgoing.length}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Статус</p>
            <p className="mt-2 text-lg font-semibold text-white">{loading ? "Loading" : "Ready"}</p>
          </article>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setTab("incoming")}
          className={`rounded-full px-4 py-2 font-semibold ${tab === "incoming" ? "bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 text-slate-950 shadow-lg shadow-cyan-500/20" : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"}`}
        >
          Входящие ({incoming.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("outgoing")}
          className={`rounded-full px-4 py-2 font-semibold ${tab === "outgoing" ? "bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 text-slate-950 shadow-lg shadow-cyan-500/20" : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"}`}
        >
          Исходящие ({outgoing.length})
        </button>
      </div>

      {loading ? <p className="text-slate-300">Загружаем applications...</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}
      {actionError ? <p className="text-red-300">{actionError}</p> : null}

      {!loading && !error && activeItems.length === 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-slate-300 backdrop-blur-xl">
          Пока пусто. Здесь появятся отклики после работы поиска и modal flow.
        </section>
      ) : null}

      {!loading && !error && activeItems.length > 0 ? (
        <div className="grid gap-4">
          {activeItems.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onAccept={tab === "incoming" ? (id) => handleStatus(id, "accepted") : undefined}
              onDecline={tab === "incoming" ? (id) => handleStatus(id, "declined") : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}