import 'dotenv/config';
import { db } from './client';
import { env } from './env';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from './utils/password';

async function seed() {
  const location = env.databaseDriver === 'postgres'
    ? `schema ${env.databaseSchema}`
    : env.databaseUrl;
  console.log(`Seeding ${env.databaseDriver}: ${location}`);

  const existingAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, env.adminEmail))
    .limit(1);

  if (existingAdmin.length > 0) {
    console.log('Admin user already exists, skipping seed.');
    return;
  }

  const passwordHash = await hashPassword(env.adminPassword);

  await db.insert(users).values({
    email: env.adminEmail,
    name: 'Admin',
    passwordHash,
  });

  console.log(`Admin user created: ${env.adminEmail}`);
}

seed()
  .then(() => {
    console.log('Seed completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
