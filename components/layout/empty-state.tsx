type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-black/15 bg-white p-8 dark:border-white/15 dark:bg-zinc-950">
      <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground text-sm leading-6">{description}</p>
    </div>
  );
}
