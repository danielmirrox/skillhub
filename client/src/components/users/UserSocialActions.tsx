import React from "react";
import { toggleFavorite, toggleVote, type UserSummary } from "../../api/users";

type UserSocialState = Pick<
  UserSummary,
  "favoriteCount" | "isFavorite" | "upvotes" | "downvotes" | "voteScore" | "myVote"
>;

type UserSocialActionsProps = {
  userId: string;
  social: UserSocialState;
  canInteract: boolean;
  onChange?: (next: UserSocialState) => void;
  className?: string;
};

function normalizeSocialState(social: UserSocialState): UserSocialState {
  return {
    favoriteCount: social.favoriteCount ?? 0,
    isFavorite: Boolean(social.isFavorite),
    upvotes: social.upvotes ?? 0,
    downvotes: social.downvotes ?? 0,
    voteScore: social.voteScore ?? 0,
    myVote: social.myVote ?? null,
  };
}

function extractSocial(user: UserSummary): UserSocialState {
  return {
    favoriteCount: user.favoriteCount,
    isFavorite: user.isFavorite,
    upvotes: user.upvotes,
    downvotes: user.downvotes,
    voteScore: user.voteScore,
    myVote: user.myVote,
  };
}

export function UserSocialActions({ userId, social, canInteract, onChange, className }: UserSocialActionsProps) {
  const [value, setValue] = React.useState<UserSocialState>(() => normalizeSocialState(social));
  const [loading, setLoading] = React.useState<"favorite" | "vote" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setValue(normalizeSocialState(social));
  }, [social.downvotes, social.favoriteCount, social.isFavorite, social.myVote, social.upvotes, social.voteScore]);

  const updateValue = React.useCallback(
    (next: UserSocialState) => {
      setValue(next);
      onChange?.(next);
    },
    [onChange],
  );

  const handleFavoriteClick = async () => {
    if (!canInteract || loading) {
      return;
    }

    setLoading("favorite");
    setError(null);
    try {
      const response = await toggleFavorite(userId);
      updateValue(extractSocial(response.user));
    } catch (err) {
      const typed = err as Error;
      setError(typed.message || "Не удалось обновить избранное.");
    } finally {
      setLoading(null);
    }
  };

  const handleVoteClick = async (nextVote: 1 | -1) => {
    if (!canInteract || loading) {
      return;
    }

    setLoading("vote");
    setError(null);
    try {
      const response = await toggleVote(userId, nextVote);
      updateValue(extractSocial(response.user));
    } catch (err) {
      const typed = err as Error;
      setError(typed.message || "Не удалось обновить оценку.");
    } finally {
      setLoading(null);
    }
  };

  const favoriteLabel = value.isFavorite ? "В избранном" : "В избранное";
  const favoriteButtonClass = value.isFavorite
    ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-100"
    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10";
  const upvoteActive = value.myVote === 1;
  const downvoteActive = value.myVote === -1;

  return (
    <div className={["flex flex-col gap-2", className].filter(Boolean).join(" ")}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleFavoriteClick()}
          disabled={!canInteract || loading !== null}
          aria-pressed={value.isFavorite}
          aria-label={value.isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
          title={!canInteract ? "Недоступно для собственного профиля" : "Повторный клик снимет действие"}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50",
            favoriteButtonClass,
          ].join(" ")}
        >
          {favoriteLabel}
          <span className="rounded-full border border-current/20 bg-black/10 px-2 py-0.5 text-[11px] normal-case tracking-normal">
            {value.favoriteCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => void handleVoteClick(1)}
          disabled={!canInteract || loading !== null}
          aria-pressed={upvoteActive}
          aria-label="Поставить плюс"
          title={!canInteract ? "Недоступно для собственного профиля" : "Повторный клик снимет голос"}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50",
            upvoteActive
              ? "border-lime-300/30 bg-lime-300/15 text-lime-100"
              : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
          ].join(" ")}
        >
          +
          <span className="rounded-full border border-current/20 bg-black/10 px-2 py-0.5 text-[11px] normal-case tracking-normal">
            {value.upvotes}
          </span>
        </button>

        <button
          type="button"
          onClick={() => void handleVoteClick(-1)}
          disabled={!canInteract || loading !== null}
          aria-pressed={downvoteActive}
          aria-label="Поставить минус"
          title={!canInteract ? "Недоступно для собственного профиля" : "Повторный клик снимет голос"}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50",
            downvoteActive
              ? "border-rose-300/30 bg-rose-300/15 text-rose-100"
              : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
          ].join(" ")}
        >
          −
          <span className="rounded-full border border-current/20 bg-black/10 px-2 py-0.5 text-[11px] normal-case tracking-normal">
            {value.downvotes}
          </span>
        </button>

        <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-950/55 px-3 py-1.5 text-xs text-slate-300">
          Счёт {value.voteScore >= 0 ? "+" : ""}
          {value.voteScore}
        </span>
      </div>

      {!canInteract ? (
        <p className="text-xs leading-5 text-slate-400">
          Это ваш профиль. Голоса и избранное для себя недоступны.
        </p>
      ) : null}

      {error ? <p className="text-xs leading-5 text-rose-200">{error}</p> : null}
    </div>
  );
}
