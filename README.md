# Cresora Commerce — ROI Calculator

Compare merchant processing costs and discover how much you could save.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon serverless in production)
- **ORM**: Drizzle ORM
- **Auth**: better-auth (email/password with email verification)
- **Email**: Resend
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (or Docker)

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy environment template and fill in your values
cp .env.example .env.local

# Run database migrations
npx drizzle-kit migrate

# Start the dev server
npm run dev
```

The app will be available at http://localhost:3000.

### Environment Variables

See `.env.example` for all required variables. At minimum you need:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth token signing key (generate with `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | App base URL (`http://localhost:3000` for local dev) |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `EMAIL_FROM` | Sender email address |

## Docker Development

Run the full stack (app + Postgres) in containers.

### Setup

```bash
# Copy the Docker environment template
cp .env.docker.example .env

# Edit .env with your values (especially BETTER_AUTH_SECRET and RESEND_API_KEY)

# Start everything (Postgres → migrations → app)
docker compose up
```

The app will be available at http://localhost:3000.

### How it works

1. **Postgres** starts and waits until healthy
2. **Migrate** runs `drizzle-kit migrate` against the database
3. **App** validates all required env vars are set, then starts

If any required environment variable is missing, the app container exits with a clear error listing the missing variables.

### Commands

```bash
docker compose up              # start all services
docker compose up -d           # start in background
docker compose down            # stop (data persists)
docker compose down -v         # stop and delete database data
docker compose up --build      # rebuild after code changes
docker compose logs app        # view app logs
```

### Connecting to a Remote Database

To use Neon (or another remote Postgres) instead of the local container:

```bash
# Set DATABASE_URL to your remote connection string in .env, then:
docker compose up app
```

## Running Tests

```bash
npm run test           # run all tests
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
npm run lint           # run ESLint
```

## Database Migrations

```bash
# Generate a new migration after changing src/db/schema.ts
npx drizzle-kit generate

# Apply pending migrations
npx drizzle-kit migrate
```

In Docker, migrations run automatically before the app starts. If a migration fails, the app will not start. Fix the migration and run `docker compose up --build migrate`.

There is no automated rollback. To revert a migration, write a new migration that undoes the changes.

## CI/CD Pipeline

### Environment Flow

```
Feature Branch → dev (Development) → staging (Staging) → main (Production)
```

### What Happens When Code Is Committed

1. **Pull request created** → CI runs build, lint, tests, and Docker build
2. **PR merged to `dev`** → Vercel deploys to development preview
3. **Promote to staging** → Run the "Promote to Staging" workflow in GitHub Actions (creates a PR from `dev` → `staging`). Merging runs migrations and deploys to staging.
4. **Promote to production** → Run the "Promote to Production" workflow (creates a PR from `staging` → `main`). Requires environment approval. Merging runs migrations and deploys to production.

### Promotion Commands

Promotions are triggered via GitHub Actions workflows (Actions tab → workflow → Run workflow):

- **Promote to Staging**: Creates a PR from `dev` → `staging`
- **Promote to Production**: Creates a PR from `staging` → `main` (requires approval)

### Database Migrations in Pipeline

Migrations run automatically as part of each environment's deploy:
- **Staging**: Runs `drizzle-kit migrate` against the staging database before deploy
- **Production**: Runs `drizzle-kit migrate` against the production database before deploy

Each environment uses its own `DATABASE_URL` stored as a GitHub Actions secret.

### Rollback

If a production deploy fails the health check:
1. Revert the merge commit on `main`
2. Push the revert — Vercel redeploys the previous version
3. If a migration needs reverting, create a new migration that undoes the changes

## Health Check

The app exposes `GET /api/health` which returns database connection status:

```json
{ "status": "healthy", "database": "connected" }
```

The Docker container uses this endpoint for its health check (every 30s, with a 10s cache to reduce DB load).

## Project Structure

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/auth/         # better-auth API handler
│   ├── api/health/       # Health check endpoint
│   ├── api/scenarios/    # Scenario CRUD API
│   ├── api/user/         # User profile API
│   ├── dashboard/        # Protected dashboard pages
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── verify-email/     # Email verification pages
│   ├── forgot-password/  # Password reset request
│   └── reset-password/   # Password reset form
├── components/           # React components
├── db/                   # Database schema and connection
└── lib/                  # Auth config, utilities
drizzle/                  # Migration SQL files
```
