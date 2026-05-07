export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-lg text-center space-y-6">
        <h1 className="text-4xl font-bold">Next.js Template</h1>
        <p className="text-lg text-gray-600">
          A self-hosted, agent-friendly full-stack template for building
          single-user web applications with API access.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/dashboard"
            className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Dashboard
          </a>
          <a
            href="/api/health"
            className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Health Check
          </a>
        </div>
        <div className="pt-8 text-sm text-gray-400 space-y-1">
          <p>Shared PostgreSQL + Schema Isolation</p>
          <p>Session Auth + Personal Access Tokens</p>
          <p>OpenAPI v1 Contract</p>
        </div>
      </div>
    </main>
  );
}
