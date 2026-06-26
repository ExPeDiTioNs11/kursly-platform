# Kursly

> Online video course platform — learn anything, on your schedule.

Kursly is a course-based learning platform where instructors publish video
courses organised into sections and lessons, and students enroll, watch, track
their progress, and leave reviews. It is built as a TypeScript monorepo with a
NestJS API and a Next.js front-end.

## Tech stack

| Layer    | Technology                                                              |
| -------- | ----------------------------------------------------------------------- |
| Monorepo | pnpm workspaces (`apps/*`, `packages/*`)                                |
| Backend  | NestJS · Prisma · PostgreSQL · JWT auth (access + refresh) · Swagger    |
| Frontend | Next.js 15 (App Router) · Tailwind CSS · shadcn/ui · HLS.js + Video.js  |
| Video    | Cloudflare R2 (S3-compatible) — presigned upload & playback URLs        |
| Shared   | `@kursly/shared` — framework-agnostic types, enums, contracts           |
| DevOps   | Docker + docker-compose · GitHub Actions CI · ESLint + Prettier + Husky |
| Testing  | Jest (API) · Vitest (web/shared) · Playwright (e2e)                     |

## Repository layout

```
kursly/
├── apps/
│   ├── api/          # NestJS REST API (Prisma, JWT auth, Swagger)
│   └── web/          # Next.js 15 front-end (App Router, Tailwind, shadcn/ui)
├── packages/
│   └── shared/       # Shared TypeScript types, enums and constants
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Data model (Phase 1)

`User`, `Category`, `Course`, `Section`, `Lesson`, `Enrollment`, `Progress`,
`Review`, `RefreshToken`. Roles: `STUDENT`, `INSTRUCTOR`, `ADMIN`.

> Payments, certificates and quizzes are deferred to **Phase 2**.

## Prerequisites

- Node.js ≥ 20 (22 recommended)
- pnpm ≥ 10
- Docker (for PostgreSQL, or the full stack)

## Getting started

### 1. Install & configure

```bash
pnpm install
cp .env.example .env   # then fill in secrets / R2 credentials
```

### 2. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 3. Set up the database

```bash
pnpm --filter @kursly/api prisma:generate
pnpm --filter @kursly/api prisma:migrate    # creates the schema
pnpm --filter @kursly/api db:seed           # seeds demo users + a course
```

Seeded accounts (password `Password123!`):

| Role       | Email                   |
| ---------- | ----------------------- |
| Admin      | `admin@kursly.dev`      |
| Instructor | `instructor@kursly.dev` |
| Student    | `student@kursly.dev`    |

### 4. Run the apps

```bash
# Build the shared package once (other apps depend on it)
pnpm --filter @kursly/shared build

# Then, in separate terminals:
pnpm --filter @kursly/api dev    # API → http://localhost:4000/api (docs at /api/docs)
pnpm --filter @kursly/web dev    # Web → http://localhost:3000
```

Or run everything in parallel:

```bash
pnpm dev
```

## Running the full stack with Docker

```bash
docker compose up --build
```

This starts PostgreSQL, the API (running migrations on boot) and the web app.

## Useful scripts

Run from the repo root:

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `pnpm lint`       | Lint all packages                  |
| `pnpm type-check` | Type-check all packages            |
| `pnpm test`       | Run unit tests across all packages |
| `pnpm build`      | Build all packages                 |
| `pnpm format`     | Format the codebase with Prettier  |

## API overview

The API is served under the `/api` prefix; interactive Swagger docs live at
`/api/docs`. Highlights:

- `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/refresh`
  · `POST /api/auth/logout` · `GET /api/auth/me`
- `GET /api/courses` (paginated, filterable) · `GET /api/courses/:slug`
- `POST /api/courses` and nested `sections` / `lessons` (instructor/admin)
- `GET/POST/DELETE /api/enrollments`
- `GET/PUT /api/progress/...`
- `GET/PUT/DELETE /api/courses/:courseId/reviews`
- `POST /api/storage/presign-upload` · `GET /api/storage/lessons/:lessonId/playback-url`
  (preview lessons are open; the full video requires enrollment, ownership or admin)

Authentication uses short-lived JWT access tokens plus rotating refresh tokens
(refresh tokens are stored hashed with bcrypt and revoked on rotation/logout, with
reuse detection that revokes the whole token family on replay). Auth endpoints are
rate-limited, and all routes are protected by default unless marked public.

## Cloudflare R2 (video storage)

Lesson videos are uploaded directly from the browser to R2 via a presigned PUT
URL issued by `POST /api/storage/presign-upload`, and played back through either
a public base URL or a presigned GET. Configure the `R2_*` variables in `.env`.

## Continuous integration

GitHub Actions runs **lint → type-check → test → build** on every push and pull
request to `main` (see `.github/workflows/ci.yml`). A Husky `pre-commit` hook
runs `lint-staged` (Prettier) locally.

## License

[MIT](./LICENSE) © Ali Mert Başak
