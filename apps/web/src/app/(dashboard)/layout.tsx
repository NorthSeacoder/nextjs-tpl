import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <nav className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-6 py-3">
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="font-semibold text-[var(--text-primary)]">Next.js Template</a>
          <a href="/dashboard" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Dashboard</a>
          <a href="/settings" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Settings</a>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Logout
          </button>
        </form>
      </nav>
      <main className="px-6 py-6">{children}</main>
    </div>
  );
}
