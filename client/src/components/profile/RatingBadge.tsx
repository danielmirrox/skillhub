type RatingBadgeProps = {
  score: number;
};

export function RatingBadge({ score }: RatingBadgeProps) {
  const colorClass =
    score >= 80
      ? "bg-lime-300 text-slate-950"
      : score >= 50
        ? "bg-amber-300 text-slate-950"
        : "bg-red-400 text-white";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${colorClass}`}>
      {score}/100
    </span>
  );
}
