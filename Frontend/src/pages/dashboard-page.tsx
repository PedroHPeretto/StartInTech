import { Link } from '@tanstack/react-router';
import { useAuth } from '@/auth/use-auth';

export function DashboardPage() {
  const { profile } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-blue px-4">
      <section className="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
        <h1 className="font-heading text-2xl font-bold text-brand-midnight">
          Dashboard
        </h1>
        {profile ? (
          <div className="mt-6 space-y-4">
            <div>
              <p className="font-sans text-xs font-medium text-muted-foreground">
                Nome
              </p>
              <p
                className="mt-1 font-sans text-lg font-semibold text-brand-midnight"
                data-testid="dashboard-full-name"
              >
                {profile.fullName}
              </p>
            </div>
            <div>
              <p className="font-sans text-xs font-medium text-muted-foreground">
                Carreira
              </p>
              <p
                className="mt-1 font-sans text-sm font-semibold text-brand-blue"
                data-testid="dashboard-career-name"
              >
                {profile.careerTrack.name}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-2 font-sans text-muted-foreground">
            Área principal em construção.
          </p>
        )}
        <Link
          to="/roadmap"
          data-testid="dashboard-roadmap-link"
          className="mt-6 inline-flex h-9 items-center justify-center rounded-4xl bg-brand-blue px-4 font-sans text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
        >
          Ver trilha
        </Link>
      </section>
    </main>
  );
}
