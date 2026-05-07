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
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="font-semibold text-gray-900">Next.js Template</a>
          <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</a>
          <a href="/settings" className="text-sm text-gray-600 hover:text-gray-900">Settings</a>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
            Logout
          </button>
        </form>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
