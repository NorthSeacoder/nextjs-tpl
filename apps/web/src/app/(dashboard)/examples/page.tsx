'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loading, Empty, ErrorAlert } from '@/components/ui';

interface ExampleItem {
  id: string;
  title: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ExamplesPage() {
  const [items, setItems] = useState<ExampleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [formNotes, setFormNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/examples');
      if (res.ok) setItems(await res.json());
      else setError('Failed to load items');
    } catch {
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { title: formTitle, status: formStatus, notes: formNotes || undefined };

    if (editingId) {
      const res = await fetch(`/api/v1/examples/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) { resetForm(); fetchItems(); }
    } else {
      const res = await fetch('/api/v1/examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) { resetForm(); fetchItems(); }
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/v1/examples/${id}`, { method: 'DELETE' });
    if (res.ok) fetchItems();
  }

  function startEdit(item: ExampleItem) {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormStatus(item.status);
    setFormNotes(item.notes || '');
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormTitle('');
    setFormStatus('active');
    setFormNotes('');
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Examples</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--bg-panel-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-panel-contrast)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] sm:min-h-0"
        >
          Add Item
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4">
          <div>
            <label htmlFor="example-title" className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              id="example-title"
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>
          <div>
            <label htmlFor="example-status" className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Status</label>
            <select
              id="example-status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div>
            <label htmlFor="example-notes" className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Notes</label>
            <textarea
              id="example-notes"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              className="min-h-11 rounded-md border border-[var(--border-strong)] bg-[var(--bg-panel-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-panel-contrast)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] sm:min-h-0"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="min-h-11 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-panel)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] sm:min-h-0"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <Empty text='No items yet. Click "Add Item" to create one.' />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="break-words font-medium text-[var(--text-primary)]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                    item.status === 'active' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' :
                    item.status === 'archived' ? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]' :
                    'bg-[var(--warning-bg)] text-[var(--warning-text)]'
                  }`}>
                    {item.status}
                  </span>
                  {item.notes && <span className="ml-2 break-words">{item.notes}</span>}
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  onClick={() => startEdit(item)}
                  className="min-h-11 rounded px-1 text-sm text-[var(--text-primary)] transition-colors hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] sm:min-h-0"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="min-h-11 rounded px-1 text-sm text-[var(--danger-text)] transition-colors hover:text-[var(--danger-text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] sm:min-h-0"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
