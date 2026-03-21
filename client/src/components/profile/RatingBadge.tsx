type RatingBadgeProps = {
  score: number;
};

export function RatingBadge({ score }: RatingBadgeProps) {
  const colorClass =
    score >= 80
      ? "border-emerald-200/70 bg-gradient-to-r from-lime-200 via-emerald-200 to-cyan-200 text-slate-950 shadow-[0_10px_30px_rgba(34,197,94,0.18)]"
      : score >= 50
        ? "border-amber-200/70 bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 text-slate-950 shadow-[0_10px_30px_rgba(251,191,36,0.18)]"
        : "border-rose-300/60 bg-gradient-to-r from-rose-400 via-orange-300 to-amber-300 text-slate-950 shadow-[0_10px_30px_rgba(244,63,94,0.18)]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold tracking-tight ${colorClass}`}
    >
      {score}/100
    </span>
  );
}
