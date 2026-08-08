# RENISINFRA

Premium real estate marketing website with a full Admin CMS and Lead CRM.

## 1. Project Overview

RENISINFRA is a two-part application:

- **Public website** — a marketing site for a real estate developer (home, projects, project detail, gallery, about, contact) with an enquiry / "Schedule a Visit" flow that submits real leads to the backend.
- **Admin CMS** — a role-gated back office (`/admin`) for managing properties, gallery, blogs, team, testimonials, FAQs, amenities, media, site settings, and inbound leads (a Lead CRM with status workflow, assignment, follow-ups, and a status-change timeline).

The frontend is a single Next.js app; the backend is a separate Express + PostgreSQL API. They are two independent Node projects in one repository, run and deployed separately.

## 2. Tech Stack

**Frontend**
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- Framer Motion (animation)
- lucide-react (icons)
- TanStack React Query v5 (server state / caching)
- React Hook Form + Zod (forms & validation)

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication (access + refresh tokens), bcryptjs password hashing
- Zod (request validation)
- Multer + Sharp (file upload handling and image thumbnailing)
- Helmet, CORS, express-rate-limit (security middleware)

## 3. Architecture

**Backend** follows a layered architecture:

```
Route → Middleware (auth/validate) → Controller → Service → Repository → Prisma → PostgreSQL
```

- **Routes** (`src/routes`) wire URLs to controllers and attach guards (`authenticate`, `authorize`).
- **Controllers** (`src/controllers`) parse the request and call a service; most simple resources share a generic `createCrudRouter` + `createCrudController` pair, while resources with extra behavior (auth, media uploads, leads, users) have dedicated controllers/services.
- **Services** (`src/services`) hold business logic; simple resources reuse a generic `BaseService`.
- **Repositories** (`src/repositories`) are the only layer that talks to Prisma, mapping DB rows to typed DTOs.
- **Storage** (`src/storage`) abstracts file storage behind a `StorageProvider` interface, currently implemented by `LocalStorageProvider` (disk storage under `backend/uploads`, served at `/uploads`).

**Authorization** is role-based (`SUPER_ADMIN`, `ADMIN`, `EDITOR`) with a single permission matrix in `backend/src/types/auth.ts` covering resources: properties, gallery, blogs, team, testimonials, faqs, amenities, inquiries, settings, users, media. Public website reads (and the contact/visit-request POST) are unauthenticated; writes and the CRM/media/user-directory endpoints require a valid access token and role permission.

**Frontend** is a single Next.js app split into two route groups:
- `src/app/(site)` — the public website (shares `Navbar`/`Footer` layout).
- `src/app/admin` — the Admin CMS, wrapped in `AuthProvider` + `AuthGate`, which handles session bootstrap, forced password change, and per-route permission checks before rendering `AdminShell`.

The frontend never talks to PostgreSQL directly — all data comes from the backend REST API via `NEXT_PUBLIC_API_URL`, through a thin fetch client (`src/lib/api/client.ts` for the public site, `src/lib/admin/authClient.ts` for the admin app, which adds the bearer token and transparent refresh-on-401).

## 4. Folder Structure

```
RENISINFRA/
├── src/                        # Frontend (Next.js App Router)
│   ├── app/
│   │   ├── (site)/             # Public pages: home, projects, gallery, about, contact
│   │   └── admin/              # Admin CMS pages (properties, gallery, blogs, team,
│   │                           # testimonials, faqs, amenities, media, inquiries, settings,
│   │                           # login, change-password)
│   ├── components/             # Shared UI, admin-only components (components/admin),
│   │                           # public UI primitives (components/ui)
│   ├── lib/
│   │   ├── api/                # Public-site API clients (properties, blogs, contact, …)
│   │   ├── admin/              # Admin API clients, React Query hooks, auth client, schemas
│   │   └── query/              # React Query provider, query keys, public-site hooks
│   ├── sections/                # Homepage sections (Hero, Amenities, Testimonials, …)
│   ├── config/                  # Static config (navigation, company info, filters)
│   └── types/                   # Public-facing domain types (Property, Blog, …)
├── backend/                     # Backend (Express API)
│   ├── src/
│   │   ├── routes/              # Express routers per resource
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic
│   │   ├── repositories/        # Prisma data access
│   │   ├── middleware/          # authenticate, authorize, validate, rateLimit, upload, ...
│   │   ├── storage/             # StorageProvider interface + LocalStorageProvider
│   │   ├── types/                # Zod schemas + inferred types per model
│   │   ├── utils/                # ApiError, ApiResponse, logger, pagination, tokens, ...
│   │   ├── config/                # Env loading & validation
│   │   ├── lib/                   # Prisma client singleton
│   │   ├── app.ts                 # Express app assembly (middleware, routes)
│   │   └── index.ts                # Server entrypoint
│   ├── prisma/
│   │   ├── schema.prisma          # Data model
│   │   ├── migrations/            # SQL migrations
│   │   └── seed.ts                # Seed script (sample content + default admin)
│   └── uploads/                   # Local media storage (gitignored, created at runtime)
├── public/                        # Static frontend assets
├── .env.example                   # Frontend environment template
└── backend/.env.example           # Backend environment template
```

## 5. Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL 14+ (a local server, or any reachable Postgres instance)

## 6. Installation

From the repository root:

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

## 7. Environment Variables

### Root (`.env.example` → `.env.local`)

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL the frontend uses to reach the backend API | `http://localhost:4000/api` |

### Backend (`backend/.env.example` → `backend/.env`)

| Variable | Description | Default |
| --- | --- | --- |
| `NODE_ENV` | `development` \| `test` \| `production` | `development` |
| `PORT` | Port the API listens on | `4000` |
| `CORS_ORIGIN` | Comma-separated list of allowed origins. Required in production (no wildcard) | `http://localhost:3000` in development |
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error` | `info` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/renisinfra?schema=public` |
| `JWT_ACCESS_SECRET` | Secret used to sign access tokens — **must** be overridden in production | dev placeholder |
| `ACCESS_TOKEN_TTL` | Access token lifetime | `15m` |
| `REFRESH_TOKEN_TTL_DAYS` | Refresh token lifetime, in days | `7` |
| `REFRESH_COOKIE_NAME` | Name of the HttpOnly refresh-token cookie | `renis_refresh` |
| `COOKIE_DOMAIN` | Optional cookie domain (leave unset for `localhost`) | unset |
| `UPLOAD_DIR` | Local directory for uploaded media (served at `/uploads`) | `uploads` |
| `MAX_UPLOAD_SIZE_MB` | Max upload size per file, in MB | `15` |
| `PUBLIC_ASSET_BASE_URL` | Absolute origin used to build public media URLs | `http://localhost:{PORT}` |

Copy the templates before running anything:

```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
```

## 8. Database Setup

Run these from `backend/`:

```bash
# Generate the Prisma client (also runs automatically on `npm run build`)
npm run prisma:generate

# Apply migrations to your local database (development)
npm run prisma:migrate

# Apply migrations without prompting (CI / production)
npm run prisma:deploy

# Seed sample content + the default admin user
npm run db:seed

# Migrate + seed in one step
npm run db:setup

# Browse the database with Prisma Studio
npm run prisma:studio
```

`DATABASE_URL` in `backend/.env` must point at a running PostgreSQL instance before any of the above will work.

## 9. Running the Application

Run the backend and frontend in two terminals.

**Backend** (from `backend/`):

```bash
npm run dev
```

Starts the API on `http://localhost:4000` (or your configured `PORT`), health check at `/health`.

**Frontend** (from the repository root):

```bash
npm run dev
```

Starts the Next.js app on `http://localhost:3000`. Ensure `NEXT_PUBLIC_API_URL` in `.env.local` points at the running backend (`http://localhost:4000/api` by default).

Once both are running, the public site is at `http://localhost:3000` and the admin CMS is at `http://localhost:3000/admin`.

## 10. Default Admin Login

The seed script (`backend/prisma/seed.ts`) creates one Super Admin user if it doesn't already exist:

- **Email:** `admin@renisinfra.com`
- **Password:** `Admin123!`

This account is seeded with `mustChangePassword: true`, so the first login redirects to a forced password-change screen before the CMS becomes accessible.

## 11. Available Scripts

### Root (frontend)

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

### Backend

| Script | Description |
| --- | --- |
| `npm run dev` | Start the API in watch mode (`tsx watch`) |
| `npm run build` | `prisma generate` + TypeScript compile to `dist/` |
| `npm run start` | Run the compiled server (`dist/index.js`) |
| `npm run typecheck` | Type-check without emitting |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:migrate` | Create/apply a migration (development) |
| `npm run prisma:deploy` | Apply pending migrations (no prompts) |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run db:seed` | Run the seed script |
| `npm run db:setup` | `prisma:deploy` + `db:seed` |

## 12. Manual Testing Checklist

There is no automated test suite in this project; verify changes manually.

**Public site**
- [ ] Home, Projects, Project detail, Gallery, About, Contact pages load without errors
- [ ] Contact form submits and shows a confirmation
- [ ] "Schedule a Visit" (Navbar, Gallery/Projects CTA) opens the visit modal and submits successfully
- [ ] Site settings (name, phone, email, address, socials, logo) reflect on the public site

**Admin CMS**
- [ ] Login with the seeded admin succeeds and forces a password change on first login
- [ ] Session persists across a page refresh; logout clears it
- [ ] CRUD works for Properties, Gallery, Blogs, Team, Testimonials, FAQs, Amenities
- [ ] Media Library: upload, search, paginate, rename, replace, delete; picker inserts URLs into forms
- [ ] Inquiries/Leads: status changes, assignment, follow-up date, visit date/time, and notes save correctly; timeline reflects status changes
- [ ] Role restrictions behave as expected (an `EDITOR` cannot access Users/Settings/Inquiries write actions; only `SUPER_ADMIN`/`ADMIN` can)
- [ ] Unauthorized/expired sessions redirect to login instead of erroring

**Backend**
- [ ] `GET /health` returns `200`
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run build` completes successfully

## 13. Git Workflow

- Create a feature branch off `main` for each change (`feature/<short-description>` or `fix/<short-description>`).
- Keep commits focused and descriptive.
- Run `npm run lint` (root) and `npm run typecheck` (backend) before opening a pull request.
- Open a pull request into `main` and request review before merging.
- Never commit `.env`, `.env.local`, or any file containing real secrets.

## 14. Troubleshooting

- **Frontend can't reach the API / CORS errors:** confirm the backend is running and `NEXT_PUBLIC_API_URL` matches its actual URL and port; confirm `CORS_ORIGIN` in `backend/.env` includes the frontend's origin.
- **`CORS_ORIGIN must be set in production`:** the backend refuses to start in `NODE_ENV=production` without an explicit `CORS_ORIGIN`. Set it to your real frontend origin(s), comma-separated.
- **`JWT_ACCESS_SECRET must be set in production`:** the backend refuses to start in production with the default dev secret. Set a strong, unique value.
- **Prisma errors on startup:** ensure `DATABASE_URL` is correct and PostgreSQL is reachable, then run `npm run prisma:migrate` (or `prisma:deploy`) inside `backend/`.
- **Login succeeds but every request 401s:** verify the browser can receive the `renis_refresh` HttpOnly cookie (same-site/CORS settings) and that `credentials: "include"` requests aren't blocked by a mismatched `CORS_ORIGIN`.
- **Uploaded media returns 404:** confirm `backend/uploads` exists and is writable, and that `PUBLIC_ASSET_BASE_URL` (or the default `http://localhost:{PORT}`) matches how you're accessing the API.
- **Port already in use:** change `PORT` in `backend/.env` (and update `NEXT_PUBLIC_API_URL` accordingly), or stop the process occupying it.

## 15. Deployment Notes

- The frontend (`npm run build && npm run start`) and backend (`npm run build && npm run start`) are deployed as two separate Node services; there is no monorepo build/deploy pipeline configured.
- Backend production requirements: set `NODE_ENV=production`, a real `CORS_ORIGIN` (comma-separated allowed origins, no wildcard), a strong `JWT_ACCESS_SECRET`, and a production `DATABASE_URL`. Run `npm run prisma:deploy` before starting the server.
- Local media storage (`UPLOAD_DIR`, served from `backend/uploads`) is disk-based; on a multi-instance or ephemeral-filesystem deployment this will not persist or scale — the storage layer is built behind a `StorageProvider` interface specifically so a different provider (e.g. S3) can be substituted without changing application code, but no such provider currently exists in this codebase.
- No CI/CD configuration currently exists in this repository.

## 16. Contributing

- Match the existing layered pattern on the backend (Route → Controller → Service → Repository) and the existing React Query + React Hook Form + Zod conventions on the frontend.
- Reuse existing shared components (admin `DataTable`, `Modal`, `EntityFormDrawer`, form fields) rather than introducing new ad hoc UI patterns.
- Keep authentication/authorization logic centralized (`backend/src/types/auth.ts` and its frontend mirror `src/lib/admin/permissions.ts`) — do not duplicate permission checks.
- Run `npm run lint` and `npm run build` (frontend) and `npm run typecheck` and `npm run build` (backend) before submitting changes.
- Do not commit `.env`/`.env.local` files or secrets.
# renis-infra
