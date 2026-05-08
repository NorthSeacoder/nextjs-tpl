import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../client';
import { apiTokens, exampleItems, users } from '../schema';

describe('sqlite smoke', () => {
  it('supports token and example CRUD primitives on the default sqlite database', async () => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, 'admin@example.com'),
    });

    expect(user).toBeTruthy();

    const tokenHash = `smoke-${Date.now()}`;
    await db.insert(apiTokens).values({
      userId: user!.id,
      name: 'smoke',
      tokenHash,
      scopes: [],
    });

    const token = await db.query.apiTokens.findFirst({
      where: eq(apiTokens.tokenHash, tokenHash),
    });

    expect(token?.name).toBe('smoke');

    const [created] = await db.insert(exampleItems).values({
      title: 'sqlite smoke',
      status: 'active',
      notes: 'ok',
    }).returning();

    expect(created.title).toBe('sqlite smoke');

    const [updated] = await db.update(exampleItems)
      .set({ status: 'done', updatedAt: new Date() })
      .where(eq(exampleItems.id, created.id))
      .returning();

    expect(updated.status).toBe('done');

    const [removed] = await db.delete(exampleItems)
      .where(eq(exampleItems.id, created.id))
      .returning({ id: exampleItems.id });

    expect(removed.id).toBe(created.id);
  });
});
