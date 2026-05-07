import { getSessionUser } from '@/lib/auth/session';

export default async function SettingsPage() {
  const user = await getSessionUser();

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-4 space-y-3">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-medium">Account</h2>
          <p className="mt-1 text-sm text-gray-600">Email: {user?.email}</p>
          <p className="text-sm text-gray-600">Name: {user?.name}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-medium">API Tokens</h2>
          <p className="mt-1 text-sm text-gray-600">
            <a href="/settings/tokens" className="text-blue-600 hover:underline">
              Manage API tokens
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
