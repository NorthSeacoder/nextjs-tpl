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
        <div className="mb-4 rounded-md border border-[var(--success-border)] bg-[var(--success-bg)] p-4">
          <p className="text-sm font-medium text-[var(--success-text)]">
            Token created. Copy it now. It won&apos;t be shown again:
          </p>
          <code className="mt-2 block rounded border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-2 text-xs break-all text-[var(--text-primary)]">
            {newToken}
          </code>
          <button
            onClick={() => setNewToken(null)}
            className="mt-2 rounded text-sm text-[var(--text-primary)] underline transition-colors hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="token-name" className="sr-only">Token name</label>
        <input
          id="token-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Token name"
          required
          className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--bg-panel-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-panel-contrast)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0"
        >
          Create
        </button>
      </form>

      {tokens.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No active tokens.</p>
      ) : (
        <div className="space-y-2">
          {tokens.map((token) => (
            <div key={token.id} className="flex flex-col gap-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-[var(--text-primary)]">{token.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Created: {new Date(token.createdAt).toLocaleDateString()}
                  {token.lastUsedAt && ` · Last used: ${new Date(token.lastUsedAt).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => handleRevoke(token.id)}
                className="min-h-11 shrink-0 rounded px-1 text-left text-sm text-[var(--danger-text)] transition-colors hover:text-[var(--danger-text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] sm:min-h-0"
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
