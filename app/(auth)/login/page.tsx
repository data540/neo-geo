import Link from "next/link";
import { loginAction, loginWithGoogleAction } from "@/lib/actions/auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div>
          <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.22em]">
            neo-geo
          </p>
          <h1 className="mt-3 font-semibold text-3xl tracking-tight">Inicia sesion</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Accede para monitorizar la visibilidad de FoodBox y competidores.
          </p>
        </div>

        {params.error ? (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {params.error}
          </p>
        ) : null}

        {params.message ? (
          <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm">
            {params.message}
          </p>
        ) : null}

        <form action={loginAction} className="mt-8 space-y-5">
          <label className="block space-y-2">
            <span className="font-medium text-sm">Email</span>
            <input
              className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 outline-none ring-0 transition focus:border-black dark:border-white/15 dark:focus:border-white"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="font-medium text-sm">Contrasena</span>
            <input
              className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 outline-none ring-0 transition focus:border-black dark:border-white/15 dark:focus:border-white"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button
            className="h-11 w-full rounded-xl bg-foreground font-medium text-background transition hover:opacity-90"
            type="submit"
          >
            Entrar
          </button>
        </form>

        <form action={loginWithGoogleAction} className="mt-3">
          <button
            className="h-11 w-full rounded-xl border border-black/10 font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            type="submit"
          >
            Entrar con Google
          </button>
        </form>

        <p className="mt-6 text-center text-muted-foreground text-sm">
          No tienes cuenta?{" "}
          <Link className="font-medium text-foreground" href="/register">
            Crear cuenta
          </Link>
        </p>
      </section>
    </main>
  );
}
