'use client';

import { useState, useEffect, useCallback } from 'react';

interface Token {
  id: string;
  name: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export default function TokenManager() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [name, setName] = useState('');
  const [newToken, setNewToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTokens = useCallback(async () => {
    const res = await fetch('/api/tokens');
    if (res.ok) setTokens(await res.json());
  }, []);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      setNewToken(data.plainToken);
      setName('');
      fetchTokens();
    }
    setLoading(false);
  }

  async function handleRevoke(id: string) {
    const res = await fetch(`/api/tokens/${id}`, { method: 'DELETE' });
    if (res.ok) fetchTokens();
  }

  return (
    <div>
      {newToken && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-800">
            Token created. Copy it now — it won&apos;t be shown again:
          </p>
          <code className="mt-2 block rounded bg-white p-2 text-xs break-all border">
            {newToken}
          </code>
          <button
            onClick={() => setNewToken(null)}
            className="mt-2 text-sm text-green-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Token name"
          required
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Create
        </button>
      </form>

      {tokens.length === 0 ? (
        <p className="text-sm text-gray-500">No active tokens.</p>
      ) : (
        <div className="space-y-2">
          {tokens.map((token) => (
            <div key={token.id} className="flex items-center justify-between rounded-md border bg-white p-3">
              <div>
                <p className="font-medium text-sm">{token.name}</p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(token.createdAt).toLocaleDateString()}
                  {token.lastUsedAt && ` · Last used: ${new Date(token.lastUsedAt).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => handleRevoke(token.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
