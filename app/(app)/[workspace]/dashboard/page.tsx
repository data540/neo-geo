type DashboardPageProps = {
  params: Promise<{ workspace: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { workspace } = await params;

  return (
    <section className="p-6 lg:p-10">
      <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.22em]">
        Workspace / {workspace}
      </p>
      <h1 className="mt-3 font-semibold text-3xl tracking-tight">Dashboard</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Auth y onboarding estan listos. Los KPIs se implementaran en el PR 8.
      </p>
    </section>
  );
}
