type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <section className="p-6 lg:p-10">
      <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.22em]">
        {eyebrow}
      </p>
      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-semibold text-3xl tracking-tight">{title}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-7">{description}</p>
        </div>
      </div>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}
