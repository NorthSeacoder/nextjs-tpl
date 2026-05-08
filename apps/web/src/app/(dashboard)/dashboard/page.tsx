import { getSessionUser } from '@/lib/auth/session';

export default async function DashboardPage() {
  const user = await getSessionUser();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
      <p className="mt-2 text-[var(--text-secondary)]">Welcome, {user?.name}</p>
    </div>
  );
}
