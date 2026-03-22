import React from "react";
import { Link } from "react-router-dom";
import { getApplications, updateApplicationStatus, type ApplicationView } from "../api/applications";
import { UserAvatar } from "../components/ui/UserAvatar";

type TabKey = "incoming" | "outgoing";

function getApplicationStatusLabel(status: ApplicationView["status"]) {
  switch (status) {
    case "pending":
      return "На рассмотрении";
    case "accepted":
      return "Принята";
    case "declined":
      return "Отклонена";
    default:
      return status;
  }
}

function ApplicationCard({
  application,
  onAccept,
  onDecline,
}: {
  application: ApplicationView;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}) {
  const teamIsAccepting = Boolean(application.team?.status === "active" && application.team?.isActive && (application.team?.slotsOpen ?? 0) > 0);
  const teamAvailabilityLabel =
    application.team?.status === "closed"
      ? "Набор закрыт"
      : application.team?.status === "paused" || !application.team?.isActive
        ? "Набор на паузе"
        : application.team && (application.team.slotsOpen ?? 0) <= 0
          ? "Команда заполнена"
          : !teamIsAccepting
          ? "Набор на паузе"
          : null;

  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/25 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-300/60 to-transparent" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{application.team?.name ?? "Команда не указана"}</p>
          <p className="text-sm text-slate-400">{application.team?.hackathonName ?? "Хакатон"}</p>
          {teamAvailabilityLabel ? (
            <p
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                teamAvailabilityLabel === "Набор на паузе"
                  ? "border border-white/10 bg-white/5 text-slate-300"
                  : "border border-amber-300/20 bg-amber-300/10 text-amber-100"
              }`}
            >
              {teamAvailabilityLabel}
            </p>
          ) : null}
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
            application.status === "accepted"
              ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
              : application.status === "declined"
                ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
                : "border-white/10 bg-white/5 text-slate-200"
          }`}
        >
          {getApplicationStatusLabel(application.status)}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/55 p-3">
        <UserAvatar
          src={application.applicant?.avatarUrl}
          alt={application.applicant?.displayName ?? "Участник"}
          className="h-11 w-11 rounded-2xl border border-white/10 object-cover"
        />
        <div>
          <p className="font-medium text-slate-100">{application.applicant?.displayName ?? "Участник"}</p>
          <p className="text-sm text-slate-400">
            {application.applicant?.rating ? `Рейтинг ${application.applicant.rating.score}` : "Рейтинг не указан"}
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
            disabled={!teamIsAccepting}
            className="rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {teamAvailabilityLabel ?? "Принять"}
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
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [incoming, setIncoming] = React.useState<ApplicationView[]>([]);
  const [outgoing, setOutgoing] = React.useState<ApplicationView[]>([]);

  const load = React.useCallback((options?: { minimumDelayMs?: number }) => {
    let active = true;
    const startedAt = Date.now();
    setLoading(true);
    setError(null);

    if (options?.minimumDelayMs) {
      setRefreshing(true);
    }

    void (async () => {
      try {
        const response = await getApplications();

        if (options?.minimumDelayMs) {
          const elapsed = Date.now() - startedAt;
          const remaining = options.minimumDelayMs - elapsed;

          if (remaining > 0) {
            await new Promise((resolve) => window.setTimeout(resolve, remaining));
          }
        }

        if (!active) return;

        setIncoming(response.incoming);
        setOutgoing(response.outgoing);
      } catch {
        if (active) {
          setError("Не удалось загрузить заявки.");
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();

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
      const typed = err as Error & { status?: number; code?: string };
      if ((typed as Error & { status?: number }).status === 409 && status === "accepted") {
        if (typed.code === "TEAM_FULL") {
          setActionError("Команда уже заполнена. Принять заявку нельзя.");
        } else {
          setActionError("Набор уже закрыт. Принять заявку нельзя.");
        }
      } else {
        setActionError(typed.message || "Не удалось обновить статус отклика.");
      }
    }
  };

  const activeItems = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-[2rem] border border-lime-300/20 bg-gradient-to-br from-lime-300/10 via-slate-950 to-cyan-400/10 p-6 shadow-2xl shadow-slate-950/30 sm:p-7 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-lime-300">Заявки</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Заявки в команды</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
            Входящие и исходящие заявки в одном месте.
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
            <p className="mt-2 text-lg font-semibold text-white">{loading ? "Синхронизируем" : "Готово"}</p>
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

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <article key={index} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/25 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3">
                  <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
                  <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
                </div>
                <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
              </div>
              <div className="mt-4 h-20 animate-pulse rounded-2xl bg-white/5" />
              <div className="mt-4 h-16 animate-pulse rounded-2xl bg-white/5" />
            </article>
          ))}
        </div>
      ) : null}
      {error ? <p className="text-red-300">{error}</p> : null}
      {actionError ? <p className="text-red-300">{actionError}</p> : null}

      {!loading && !error && activeItems.length === 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-slate-300 backdrop-blur-xl">
          <p className="text-lg font-semibold text-white">Пока пусто</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
            Здесь появятся заявки после поиска и отправки запроса на вступление. Если ждёшь входящие, проверь поиск или открой профиль участника, чтобы отправить первый запрос.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
            >
              Перейти к поиску
            </Link>
            <button
              type="button"
              onClick={() => {
                void load({ minimumDelayMs: 450 });
              }}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-200 border-t-transparent" />
                  Обновляем…
                </>
              ) : (
                "Обновить список"
              )}
            </button>
          </div>
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
