import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div>
          <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.22em]">
            neo-geo
          </p>
          <h1 className="mt-3 font-semibold text-3xl tracking-tight">Crea tu cuenta</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Empieza con email y contrasena. Despues crearemos el workspace.
          </p>
        </div>

        {params.error ? (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {params.error}
          </p>
        ) : null}

        <form action={registerAction} className="mt-8 space-y-5">
          <label className="block space-y-2">
            <span className="font-medium text-sm">Email</span>
            <input
              className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="font-medium text-sm">Contrasena</span>
            <input
              className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <button
            className="h-11 w-full rounded-xl bg-foreground font-medium text-background transition hover:opacity-90"
            type="submit"
          >
            Crear cuenta
          </button>
        </form>

        <p className="mt-6 text-center text-muted-foreground text-sm">
          Ya tienes cuenta?{" "}
          <Link className="font-medium text-foreground" href="/login">
            Iniciar sesion
          </Link>
        </p>
      </section>
    </main>
  );
}
