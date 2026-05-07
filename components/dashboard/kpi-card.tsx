type KpiCardProps = {
  title: string;
  value: string;
  delta: string;
  description: string;
};

export function KpiCard({ title, value, delta, description }: KpiCardProps) {
  const isPositive = delta.startsWith("+");
  const isNeutral = delta === "--" || delta === "0%";

  return (
    <article className="rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-sm">{title}</p>
        <span
          className={
            isNeutral
              ? "text-muted-foreground text-xs"
              : isPositive
                ? "text-emerald-600 text-xs"
                : "text-red-600 text-xs"
          }
        >
          {delta}
        </span>
      </div>
      <p className="mt-3 font-semibold text-3xl tracking-tight">{value}</p>
      <p className="mt-2 text-muted-foreground text-xs leading-5">{description}</p>
    </article>
  );
}
