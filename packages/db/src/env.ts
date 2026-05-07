function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function envFactory() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return {
      databaseUrl: '',
      databaseSchema: 'public',
      sessionSecret: '',
      adminEmail: optionalEnv('ADMIN_EMAIL', 'admin@example.com'),
      adminPassword: optionalEnv('ADMIN_PASSWORD', 'changeme123'),
      appUrl: optionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
      dockerRegistry: optionalEnv('DOCKER_REGISTRY', ''),
      dockerImageName: optionalEnv('DOCKER_IMAGE_NAME', 'nextjs-tpl'),
      isConfigured: false as const,
    };
  }

  return {
    databaseUrl: requireEnv('DATABASE_URL'),
    databaseSchema: requireEnv('DATABASE_SCHEMA'),
    sessionSecret: requireEnv('SESSION_SECRET'),
    adminEmail: optionalEnv('ADMIN_EMAIL', 'admin@example.com'),
    adminPassword: optionalEnv('ADMIN_PASSWORD', 'changeme123'),
    appUrl: optionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    dockerRegistry: optionalEnv('DOCKER_REGISTRY', ''),
    dockerImageName: optionalEnv('DOCKER_IMAGE_NAME', 'nextjs-tpl'),
    isConfigured: true as const,
  };
}

export const env = envFactory();

export type Env = ReturnType<typeof envFactory>;
