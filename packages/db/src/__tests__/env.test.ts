import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('env factory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns isConfigured false when DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_SCHEMA;
    delete process.env.SESSION_SECRET;
    const { env } = await import('../env?test=' + Date.now());
    expect(env.isConfigured).toBe(false);
  });

  it('returns isConfigured true when required vars are present', async () => {
    process.env.DATABASE_URL = 'postgresql://u:p@localhost/db';
    process.env.DATABASE_SCHEMA = 'test_schema';
    process.env.SESSION_SECRET = 'secret';
    const { env } = await import('../env?test=' + Date.now());
    expect(env.isConfigured).toBe(true);
    expect(env.databaseUrl).toBe('postgresql://u:p@localhost/db');
    expect(env.databaseSchema).toBe('test_schema');
  });
});
