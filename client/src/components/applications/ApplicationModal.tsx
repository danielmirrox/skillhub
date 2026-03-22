import React from "react";
import { createPortal } from "react-dom";
import type { TeamSummary } from "../../api/teams";

type ApplicationModalProps = {
  teams: TeamSummary[];
  selectedTeam?: TeamSummary | null;
  loadingTeams?: boolean;
  error?: string | null;
  onSubmit: (payload: { teamId: string; message: string }) => void;
  onClose: () => void;
};

export function ApplicationModal({ teams, selectedTeam, loadingTeams, error, onSubmit, onClose }: ApplicationModalProps) {
  const initialTeamId = selectedTeam?.id ?? teams[0]?.id ?? "";
  const [teamId, setTeamId] = React.useState(initialTeamId);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const nextTeamId = selectedTeam?.id ?? teams[0]?.id ?? "";

    if (!teamId && nextTeamId) {
      setTeamId(nextTeamId);
      return;
    }

    if (selectedTeam?.id && teamId !== selectedTeam.id) {
      setTeamId(selectedTeam.id);
    }
  }, [selectedTeam, teamId, teams]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 px-4 py-4 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center py-2 sm:items-center sm:py-4">
        <div className="relative flex w-full max-w-xl max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/95 shadow-2xl shadow-cyan-950/30 sm:max-h-[calc(100dvh-2rem)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400" />
          <div className="shrink-0 border-b border-white/10 px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Вступить в команду</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Выбери команду и оставь короткое сообщение. Заявка уйдёт капитану команды в список заявок.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 transition duration-300 ease-out hover:bg-slate-900"
              >
                Закрыть
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 pr-4 sm:px-6">
            <div className="space-y-4">
              {selectedTeam ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <p className="text-slate-400">Команда</p>
                  <p className="mt-1 text-base font-medium text-white">{selectedTeam.name}</p>
                  <p className="mt-1 text-slate-400">{selectedTeam.hackathonName}</p>
                </div>
              ) : (
                <label className="flex flex-col gap-2 text-sm">
                  Команда
                  <select
                    className="rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 shadow-inner shadow-black/20"
                    value={teamId}
                    onChange={(event) => setTeamId(event.target.value)}
                    disabled={loadingTeams}
                  >
                    {teams.length === 0 ? <option value="">Команды не найдены</option> : null}
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} · {team.hackathonName}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="flex flex-col gap-2 text-sm">
                Сообщение
                <textarea
                  rows={5}
                  className="rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 shadow-inner shadow-black/20"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Привет! Хочу присоединиться к вашей команде..."
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition duration-300 ease-out hover:bg-slate-900"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => onSubmit({ teamId, message })}
                disabled={!teamId || loadingTeams}
                className="rounded-lg bg-cyan-400 px-4 py-2 font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Вступить в команду
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    ,
    document.body
  );
}
