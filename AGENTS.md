# AGENTS.md

Monorepo for LocalGym, a free, offline-first gym management system for small/medium Colombian gyms. `ideas.md` is the authoritative source for v1 scope and architectural decisions — read it before starting feature work.

## Structure

- `backend/` — Django 5.2 + Django REST Framework, SQLite. Monolithic single process. No Django apps created yet (still the `startproject` scaffold).
- `frontend/` — React 19 + Vite + Tailwind 4, plain JavaScript (NO TypeScript). SPA.
- `ideas.md` — product vision, domain model, and v1 scope/decisions (Spanish).

## Backend (Django)

- Environment is isolated in a **venv at `backend/venv`** — never install into global Python.
- Always run Django commands from `backend/`, activating the venv first:
  ```pwsh
  cd backend; .\venv\Scripts\Activate.ps1
  python manage.py runserver
  ```
- Deps pinned in `backend/requirements.txt`. Planned for v1: `djangorestframework`, `django-environ`, `whitenoise`, `django-filter` (DRF is listed in requirements but NOT yet in `INSTALLED_APPS`).
- `config/settings.py` is still the dev scaffold: insecure hardcoded `SECRET_KEY`, `DEBUG=True`, `ALLOWED_HOSTS=[]`. `django-environ` is not wired up yet — production config via `.env` is future work.

## Frontend (React)

- **pnpm**, not npm — use `pnpm install`, `pnpm dev`, `pnpm build`.
- `pnpm lint` = oxlint (config in `frontend/.oxlintrc.json`; enables `react/rules-of-hooks`).
- Vite dev proxy to the Django backend is NOT configured yet.

## Domain conventions

- Domain model lives in `ideas.md`: `Member`, `MembershipType`, `Membership`, `Payment`. Code/entity identifiers are English; UI copy is Spanish.
- Key rules to preserve: `end_date` is a persisted (not derived) value, frozen at creation as `start_date + duration_days`; no two `Membership` of the same type may overlap; same `document_type + document_number` unique per `Member`. "Is member active today?" is derived from persisted date ranges.

## Git

- Branch `dev` is the working branch. Conventional commits (e.g. `feat(backend):`, `docs:`) — no AI attribution.
- Never commit `backend/venv`, `backend/db.sqlite3`, `backend/staticfiles/`, `frontend/node_modules`, or `.env` (excluded via nested `.gitignore` files).