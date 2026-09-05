# User Auth Specification

## Purpose

Session auth for LocalGym: login, logout, current-user, superuser-only user creation, route guarding + Spanish UI. Native Django `User` + `is_superuser`; no JWT. `/api/health/` stays public.

## Requirements

### Requirement: Session Login

`POST /api/auth/login` MUST authenticate valid credentials; invalid and inactive users MUST get 400 (never 200-with-error). Anonymous POSTs MUST be CSRF-exempt; the response MUST set the `csrftoken` cookie.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Valid credentials | a user with valid credentials | POST /api/auth/login | 200 with username, no password; session + `csrftoken` cookies set |
| Invalid credentials | wrong password or unknown username | POST /api/auth/login | 400; message does not reveal whether the user exists |
| Inactive user | a user with `is_active=False` | POST /api/auth/login | 400; no session created |

### Requirement: Session Logout

`POST /api/auth/logout` MUST destroy the session and clear the session cookie for authenticated clients, requiring a valid `X-CSRFToken` header via the `csrftoken` cookie helper.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Clears session | an authenticated session | POST /api/auth/logout with valid `X-CSRFToken` header | 200; cookie cleared; subsequent GET /api/auth/me → 401 |
| Anonymous logout | no session | POST /api/auth/logout | 401 |

### Requirement: Current User

`GET /api/auth/me` MUST return `id`, `username`, `is_superuser` for authenticated users, 401 for anonymous, and MUST NOT expose password hashes or other sensitive fields.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Authenticated | an authenticated session | GET /api/auth/me | 200 with `id`, `username`, `is_superuser`; no password fields |
| Anonymous | no session | GET /api/auth/me | 401 |

### Requirement: Superuser User Creation

`POST /api/auth/users` MUST be restricted to authenticated superusers (403 non-superuser, 401 anonymous) and MUST create users with `is_superuser=False`. Duplicate usernames MUST yield 400; the response MUST NOT echo the password.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Superuser creates | an authenticated superuser | POST /api/auth/users with new unique credentials | 201 with public fields, no password; user created with `is_superuser=False` |
| Non-superuser forbidden | an authenticated non-superuser | POST /api/auth/users | 403 |
| Duplicate username | an existing username | POST /api/auth/users with that username | 400 |

### Requirement: Public Health Endpoint

`GET /api/health/` MUST remain reachable anonymously despite the DRF `IsAuthenticated` default.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Health check | no session | GET /api/health/ | 200 with `{"status": "ok"}` |

### Requirement: Session Expires on Browser Close

Sessions MUST set `SESSION_EXPIRE_AT_BROWSER_CLOSE=True`; the session cookie carries no persistent expiry.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Browser close | a successful login | the browser closes | session discarded; next GET /api/auth/me → 401 |

### Requirement: Frontend Route Guarding

Protected routes MUST redirect unauthenticated users to `/login`; `/login` MUST redirect authenticated users to `/`. Auth state MUST load on mount via AuthContext `me()` with a loading state, so reloads flash neither content nor login page.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Anonymous redirected | no session, protected route | app mounts | redirected to /login |
| Authenticated access | an authenticated session | app mounts, `me()` resolves | protected routes render instead of /login |
| At /login | an authenticated session | user visits /login | redirected to / |
| Reload flicker | authenticated session, reload | app mounts while `me()` pending | loading state; no redirect until `me()` resolves |

### Requirement: Spanish UI Copy

Login and user-creation screens MUST use Spanish UI copy, including a logout button labeled "Cerrar sesión".

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Spanish screens | the frontend app | login page, new-user screen ("Nuevo usuario"), logout button render | their copy is in Spanish |