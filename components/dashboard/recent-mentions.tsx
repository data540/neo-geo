type RecentMention = {
  id: string;
  brand: string;
  prompt: string;
  llmId: string;
  sentiment: string | null;
  ranAt: string | null;
};

type RecentMentionsProps = {
  mentions: RecentMention[];
};

export function RecentMentions({ mentions }: RecentMentionsProps) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
      <h2 className="font-semibold text-xl tracking-tight">Menciones recientes</h2>
      <div className="mt-4 space-y-4">
        {mentions.length > 0 ? (
          mentions.map((mention) => (
            <article
              className="border-black/5 border-b pb-4 last:border-0 last:pb-0 dark:border-white/10"
              key={mention.id}
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{mention.brand}</span>
                <span className="text-muted-foreground">en {mention.llmId}</span>
                {mention.sentiment ? (
                  <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs dark:bg-white/10">
                    {mention.sentiment}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">{mention.prompt}</p>
              <p className="mt-1 text-muted-foreground text-xs">{mention.ranAt ?? "Sin fecha"}</p>
            </article>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">Aun no hay menciones detectadas.</p>
        )}
      </div>
    </section>
  );
}
