export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-2xl text-center">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.25em]">
          FoodBox internal MVP
        </p>
        <h1 className="mt-4 font-semibold text-4xl tracking-tight sm:text-6xl">neo-geo</h1>
        <p className="mt-6 text-lg text-muted-foreground leading-8">
          Monitorizacion API-only de visibilidad de marca en respuestas de LLMs.
        </p>
      </section>
    </main>
  );
}
