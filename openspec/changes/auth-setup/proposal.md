# Proposal: Auth Setup (auth-setup)

## Intent
LocalGym v1 has no auth: SPA open, DRF installed but disabled. Add session-based auth (native Django `User` + `is_superuser`, ideas.md §4) with login, logout, current-user, superuser-only user creation.

## Context
- Middleware active; DRF needs INSTALLED_APPS + config only.
- react-router installed, unused; no FE test runner (oxlint + build).
- CLI createsuperuser, no wizard; non-superusers: full member access except user creation/backup.

## Scope
### In Scope (Goals)
- Backend: login, logout, me, create-user (superuser-only); session expiry on close.
- Frontend: login page, logout button, route guard, Nuevo usuario screen (Spanish UI).
- Backend TDD (DRF APIClient); FE oxlint + build.
### Out of Scope (Non-Goals)
- Password reset/change; custom user model; granular roles; JWT; backup export; user edit/delete; env/secret hardening (separate changes).

## Capabilities
### New Capabilities
- user-auth: session login/logout, current user, superuser-only user creation → openspec/specs/user-auth/spec.md.
### Modified Capabilities
- None (no specs exist yet).

## Approach
Backend — new app backend/accounts/:
- settings.py: DRF INSTALLED_APPS; SessionAuthentication + IsAuthenticated; SESSION_EXPIRE_AT_BROWSER_CLOSE=True.
- /api/auth/: login (AllowAny, @ensure_csrf_cookie), logout, me (401 anonymous), users (superuser-only, never echoes password).
- /api/health/ stays public (AllowAny).
- CSRF: enforced only for authenticated sessions → login needs no token; response sets csrftoken cookie; frontend sends X-CSRFToken on logout/users.
- Vite dev: CSRF_TRUSTED_ORIGINS localhost:5173 entry.

Frontend:
- api.js, AuthContext (me on mount), RequireAuth guard; Login.jsx, NewUser.jsx; routes in App.jsx.

## Edge Cases & Decisions
- Anonymous me/ → 401; /login while authed → redirect /
- Failed login → generic message; inactive user rejected
- First login POST has no CSRF token; cookie set on response
- Dev origin ≠ Django host → CSRF_TRUSTED_ORIGINS entry
- Open questions: none — resolved as decisions above

## Affected Areas
- backend/config/settings.py — Modified: DRF + session/CSRF
- backend/config/urls.py — Modified: mount /api/auth/
- backend/accounts/ (new) — New: views, serializers, tests
- frontend/src/App.jsx — Modified: router + guards
- frontend/src/pages/ — New: Login.jsx, NewUser.jsx
- frontend/src/auth/ — New: api.js, AuthContext, RequireAuth

## Risks
- CSRF misconfig blocks dev login — Med: cookie helper; test POSTs after login
- Auth flicker on reload — Med: me() on mount; guard waits
- Health/login locked; session survives close — Low: AllowAny + tests

## Rollback Plan
Git revert; no new migrations; session cookie runtime-only. Low risk.

## Dependencies
None — DRF 3.18 + react-router 8 already installed.

## Success Criteria
- [ ] Backend tests green (auth endpoints, 401s, 403s, health public)
- [ ] Superuser creates non-superuser; non-superuser gets 403
- [ ] Anonymous → /login; logout clears cookie → login
- [ ] pnpm lint + build pass