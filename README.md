# nextjs-tpl

A self-hosted, agent-friendly full-stack Next.js template for building single-user web applications.

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your database URL, schema, session secret, etc.
```

### 3. Set up database

```bash
pnpm db:generate    # Generate migration files
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed admin user
```

### 4. Start development

```bash
pnpm dev            # Start all packages in dev mode
```

Visit http://localhost:3000. Log in with the admin credentials from `.env`.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev servers |
| `pnpm build` | Production build |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run tests |
| `pnpm db:generate` | Generate DB migrations |
| `pnpm db:migrate` | Apply DB migrations |
| `pnpm db:seed` | Seed admin user |
| `pnpm db:studio` | Open Drizzle Studio |

## Docker

### Local build & run

```bash
docker compose -f compose.dev.yml up --build
```

### NAS production deployment

Requires a running Traefik reverse proxy on an external `proxy` network and a shared PostgreSQL instance.

```bash
# Configure .env with shared PostgreSQL connection info
docker compose -f compose.prod.yml up -d
```

See [docs/deployment-nas.md](docs/deployment-nas.md) for full NAS deployment details.

## CI/CD

Push to the `release` branch to trigger automatic image build and push via GitHub Actions.

The workflow reuses `Dockerfile.web` and pushes to `ghcr.io/<owner>/<repo>` using the current GitHub repository name.

On `release` pushes, the workflow publishes:

- a commit SHA tag
- `latest`

## Project Structure

```
apps/web          Next.js App Router application
packages/db       Drizzle ORM schema, client, migrations
packages/api-contract  OpenAPI v1 specification
packages/config   Shared TypeScript/ESLint config
packages/ui       Shared UI components
```

## Environment Variables

See `.env.example` for all required and optional variables. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
- `DATABASE_SCHEMA` — Project schema for isolation
- `SESSION_SECRET` — Session cookie signing key
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — Initial admin user (used by seed)
- `NEXT_PUBLIC_APP_URL` — Public URL of the application
