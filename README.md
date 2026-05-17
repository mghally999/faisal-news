# Faisal News — Fullstack News Application

A production-quality fullstack news application built with **Next.js 15** (App Router) on the frontend and **Express + Prisma + Postgres** on the backend. Magazine-grade editorial design, JWT auth with refresh-token rotation, NewsAPI proxy with LRU caching, and a personal "saved articles" library with notes.

This repository ships with no TypeScript, no Tailwind, and no client-side token storage. All styling uses CSS Modules. The four DSA building blocks (LRU cache, trie, token bucket, virtualized list) are hand-rolled.

---

## Stack

**Frontend**
- Next.js 15 (App Router, server components by default)
- React 19, plain JavaScript only
- CSS Modules + global tokens
- `lucide-react`, `date-fns`
- Fonts: Playfair Display (display) + Inter (body) via `next/font/google`

**Backend**
- Express 4
- Prisma 5 + Postgres
- `bcrypt`, `jsonwebtoken`, `cookie-parser`, `cors`, `zod`, `dotenv`
- Native Node `fetch` (no `axios`)
- `nodemon` for dev

---

## Prerequisites

- Node **20+**
- npm **10+**
- A Postgres database — local or remote (Railway works)
- A NewsAPI key from <https://newsapi.org>

---

## Setup

From the repo root:

```bash
npm run setup
```

This runs `bootstrap.sh`, which:

1. Copies `.env.example` files into `.env` / `.env.local` if missing
2. Installs backend dependencies and runs `prisma generate`
3. Installs frontend dependencies
4. Installs root dependencies

After setup, fill in your env vars and run the initial migration:

```bash
cd backend && npx prisma migrate dev --name init
```

Then from the repo root:

```bash
npm run dev
```

Backend boots on `:4000`, frontend on `:3001`. (Port 3001 is used to avoid colliding with other Next.js dev servers commonly bound to 3000. Change `frontend/package.json`'s `dev` script if you'd rather use 3000.)

---

## Environment variables

### `backend/.env`

| Var                 | Required | Description |
| ------------------- | -------- | ----------- |
| `DATABASE_URL`      | yes      | Full Postgres connection string. |
| `JWT_ACCESS_SECRET` | yes      | At least 16 chars. Used to sign 15-min access tokens. |
| `NEWSAPI_KEY`       | yes      | NewsAPI.org key (free tier works). |
| `FRONTEND_ORIGIN`   | yes      | The exact URL the frontend runs on, used for CORS. |
| `PORT`              | no       | Defaults to `4000`. |
| `NODE_ENV`          | no       | `development` / `production` / `test`. |

The backend validates these with zod on boot and exits with a clear error if any are missing or malformed.

### `frontend/.env.local`

| Var                    | Required | Description |
| ---------------------- | -------- | ----------- |
| `NEXT_PUBLIC_API_URL`  | yes      | URL of the backend, e.g. `http://localhost:4000`. |
| `NEXT_PUBLIC_SITE_URL` | no       | Public URL of the site, used for sitemap/OG/canonical tags. |

---

## Scripts

Root `package.json`:

- `npm run setup` — bootstrap installs and Prisma generate
- `npm run dev` — runs both backend and frontend concurrently
- `npm run dev:be` — backend only
- `npm run dev:fe` — frontend only
- `npm run build` — production build for both
- `npm run start` — production start for both

---

## API surface

All responses use `{ data: ... }` on success and `{ error: { code, message } }` on failure.

### Auth — `/api/auth`
| Method | Path        | Description |
| ------ | ----------- | ----------- |
| POST   | `/register` | `{ email, password, name? }` → `{ user, accessToken }` and refresh cookie. |
| POST   | `/login`    | `{ email, password }` → same shape. |
| POST   | `/refresh`  | Uses httpOnly cookie → new access token, rotates refresh. |
| POST   | `/logout`   | Revokes refresh, clears cookie. |
| GET    | `/me`       | Auth required. Returns the current user. |

### News — `/api/news` (public)
| Method | Path         | Notes |
| ------ | ------------ | ----- |
| GET    | `/headlines` | `?country=us&category=&page=1&pageSize=20` |
| GET    | `/search`    | `?q=&from=&to=&sortBy=publishedAt&page=1&pageSize=20` |
| GET    | `/sources`   | `?category=&country=` |

### Saved — `/api/saved` (auth required)
| Method | Path     | Notes |
| ------ | -------- | ----- |
| GET    | `/`      | Paginated list of the user's saved articles. |
| POST   | `/`      | `{ articleUrl, title, description?, imageUrl?, source?, publishedAt?, notes? }` |
| GET    | `/:id`   | One article (must be owned). |
| PATCH  | `/:id`   | `{ notes? }` |
| DELETE | `/:id`   | 204 on success. |

---

## Architecture overview

```
news-app-fullstack/
├── frontend/   Next.js 15 — App Router, plain JS, CSS Modules
│   ├── app/        routes + layout + metadata + sitemap/robots/OG
│   ├── components/ PascalCase folders with .jsx + .module.css
│   ├── lib/        api client (auto-refresh), auth context, trie, LRU
│   ├── hooks/      useDebounce, useAuth, useToast, useVirtualList
│   └── middleware.js  protects /saved/*
└── backend/    Express + Prisma
    ├── prisma/   schema.prisma + migrations
    └── src/
        ├── config/      env (zod), prisma singleton
        ├── models/      thin Prisma wrappers
        ├── controllers/ HTTP layer, asyncHandler wrapped
        ├── services/    business logic (auth, news, tokens)
        ├── routes/      Express routers
        ├── middleware/  auth, validate, rate-limit, error
        ├── schemas/     zod validators
        └── utils/       LRU, token bucket, logger, asyncHandler
```

### Auth flow

- Access tokens (JWT) live in memory only and expire after **15 minutes**.
- Refresh tokens are 64 bytes of random hex, stored on the backend as SHA-256 hashes and delivered to the browser only as an `httpOnly` cookie scoped to `/api/auth`.
- Every successful `/refresh` rotates the refresh token (marks the old one revoked).
- The frontend's `lib/api.js` wrapper transparently refreshes on a 401 and retries the original request once. On a second 401, it clears in-memory state and the auth context redirects to `/login`.
- `middleware.js` checks for the presence of the refresh cookie on `/saved/*` and redirects unauthenticated visitors to `/login?next=…`.

### Caching

- Backend wraps NewsAPI calls in a hand-rolled `LRUCache` (capacity 200, 5-minute TTL) keyed by the full query string.
- Frontend `lib/clientCache.js` provides an in-memory LRU (capacity 50) for repeated search responses across navigations.

### Rate limiting

`utils/tokenBucket.js` is a per-key token bucket. The general limiter allows 60 req with 1 req/sec refill per IP. The auth limiter is 5 req with 1 req per 10 sec — applied to register/login.

### DSA showcases

| Piece                 | Where                          | Used for |
| --------------------- | ------------------------------ | -------- |
| LRU Cache (backend)   | `backend/src/utils/lruCache.js` | NewsAPI response cache |
| Token Bucket          | `backend/src/utils/tokenBucket.js` | Rate limiting |
| Trie (frontend)       | `frontend/lib/trie.js`         | SearchBar autocomplete |
| Client LRU            | `frontend/lib/clientCache.js`  | Repeated search responses |
| Virtualized list hook | `frontend/hooks/useVirtualList.js` | ArticleGrid above 30 items |

---

## Deployment (Railway)

1. **Create a Railway project.** From the dashboard, "New Project" → "Empty Project."
2. **Add a Postgres database.** Click "New" → "Database" → "Add PostgreSQL." Copy its `DATABASE_URL` from the "Variables" tab.
3. **Create the backend service.** "New" → "GitHub Repo" → pick this repo. Under **Settings → Source**, set the **Root Directory** to `backend`. Railway will auto-detect `railway.json` and use Nixpacks.
4. **Set backend env vars.** Under the backend service's **Variables** tab, add:
   - `DATABASE_URL` (paste from the Postgres service)
   - `JWT_ACCESS_SECRET` (any 32+ random chars; e.g. `openssl rand -hex 32`)
   - `NEWSAPI_KEY`
   - `FRONTEND_ORIGIN` (you'll fill this after step 6)
   - `NODE_ENV=production`
5. **Generate the backend's public domain.** Settings → Networking → "Generate Domain." Note the URL (e.g. `news-be-production.up.railway.app`).
6. **Create the frontend service.** "New" → "GitHub Repo" → same repo. Set Root Directory to `frontend`.
7. **Set frontend env vars.**
   - `NEXT_PUBLIC_API_URL=https://<your-backend-domain>`
   - `NEXT_PUBLIC_SITE_URL=https://<your-frontend-domain>` (generate it after this step)
8. **Generate the frontend's public domain.** Settings → Networking → "Generate Domain." Then go back to the **backend** service and set `FRONTEND_ORIGIN=https://<your-frontend-domain>`.
9. **Trigger redeploys.** Both services should redeploy automatically when env vars change. The backend's `startCommand` runs `prisma migrate deploy` then `node src/server.js`, so migrations apply on every deploy.

---

## SEO

- All pages export `metadata` (or `generateMetadata` for dynamic routes).
- Article pages SSR with `revalidate` set on the server-side fetch and produce real `<title>` and OG tags in the initial HTML.
- `robots.js` and `sitemap.js` are present at the App Router level.
- JSON-LD `NewsArticle` structured data is injected on article detail pages.
- Canonical URLs and proper `<html lang="en">` are set.

---

## Code quality rules (enforced in this repo)

1. No TypeScript anywhere.
2. No Tailwind / styled-components — CSS Modules only.
3. No comments in source code.
4. No `sudo npm install` — fix ownership instead if you hit EACCES.
5. No access tokens in `localStorage`/`sessionStorage` — memory only.
6. The four DSA pieces (LRU, trie, token bucket, virtual list) are hand-rolled with no external libraries.
