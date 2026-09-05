# AGENTS.md

Monorepo for LocalGym, a free, offline-first gym management system for small/medium Colombian gyms. `ideas.md` is the authoritative source for v1 scope and architectural decisions (Spanish) — read it before starting feature work.

## Structure

- `backend/` — Django 5.2 + Django REST Framework, SQLite. `accounts` app provides session-based auth; no models or migrations exist yet (auth uses native `django.contrib.auth.User`).
- `frontend/` — React 19 + Vite + Tailwind 4, plain JavaScript (NO TypeScript), `react-router` v8. SPA.
- `openspec/` — SDD artifacts. Canonical specs live in `openspec/specs/` (see `user-auth/spec.md`); completed changes are archived under `openspec/changes/archive/`. Keep specs in sync when changing covered behavior.
- `.atl/` — local tooling cache, gitignored. Never commit it.

## Backend (Django)

- Environment is isolated in a **venv at `backend/venv`** — never install into global Python.
- Always run Django commands from `backend/`, activating the venv first:
  ```pwsh
  cd backend; .\venv\Scripts\Activate.ps1
  python manage.py runserver
  ```
- Deps pinned in `backend/requirements.txt`. DRF **is wired**: `INSTALLED_APPS` includes `rest_framework` + `accounts`; defaults are `SessionAuthentication` + `IsAuthenticated`, with a custom exception handler (`accounts.exceptions.force_401_for_unauthenticated`) that returns 401 instead of 403 for anonymous callers.
- Session auth flow: `POST /api/auth/login/` sets session + CSRF cookies (`ensure_csrf_cookie`); logout/me/users under `/api/auth/`; `/api/health/` for health checks. User creation is superuser-only (`accounts.permissions.IsSuperUser`). Frontend must send CSRF cookie for state-changing requests.
- `django-environ`, `whitenoise`, `django-filter` are pinned but **NOT wired** (no env loading, not in `INSTALLED_APPS`).
- `config/settings.py` is still the dev scaffold: hardcoded `SECRET_KEY`, `DEBUG=True`, `ALLOWED_HOSTS=[]`, `CSRF_TRUSTED_ORIGINS=['http://localhost:5173']` (dev-only). Production config is future work.
- Tests: `python manage.py test` (no pytest). `accounts/tests.py` uses DRF `APIClient` + plain asserts. Focused run: `python manage.py test accounts.tests.LoginTests`. Suite takes ~100s (PBKDF2 hashing) — slow is normal, don't optimize mid-task.

## Frontend (React)

- **pnpm**, not npm — use `pnpm install`, `pnpm dev`, `pnpm build`.
- `pnpm lint` = oxlint (`frontend/.oxlintrc.json`): `react/rules-of-hooks` is error, `react/only-export-components` is warn. Keep hook and component files separate (see `src/auth/useAuth.js` vs `AuthContext.jsx`) or lint fails.
- Vite dev proxy **is configured**: `/api` → `http://127.0.0.1:8000`. Run Django + `pnpm dev` together for API calls to work.
- Auth layer in `src/auth/`: `AuthContext.jsx`, `useAuth.js`, `RequireAuth.jsx`, `api.js` (CSRF handling). `RequireAuth` guards `/` and `/usuarios/nuevo`.
- **No test runner configured** (no Vitest) — do not invent frontend test commands.
- Convention: SPA routes and UI copy are Spanish (`/login`, `/usuarios/nuevo`); API endpoints and code identifiers are English.

## Domain conventions

- Domain model lives in `ideas.md`: `Member`, `MembershipType`, `Membership`, `Payment`. Code/entity identifiers are English; UI copy is Spanish.
- Key rules to preserve: `end_date` is a persisted (not derived) value, frozen at creation as `start_date + duration_days` and read-only; no two `Membership` of the same type may overlap; different types may run in parallel; manual sequential stacking for renewals; same `document_type + document_number` unique per `Member`; "is member active today?" is derived from persisted date ranges.
- v1 auth model: superuser creates users (via `is_superuser` flag); only authenticated users access the system; no granular roles.

## Git

- Branch `dev` is the working branch (tracks `origin/dev` at `github.com/Frankhs899/LocalGym.git`). Conventional commits (e.g. `feat(backend):`, `docs:`) — no AI attribution.
- No CI pipeline configured.
- Never commit `backend/venv`, `backend/db.sqlite3`, `backend/staticfiles/`, `frontend/node_modules`, `.env`, or `.atl/` (excluded via nested `.gitignore` files).