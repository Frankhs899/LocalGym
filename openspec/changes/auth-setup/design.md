# Design: Auth Setup

## Technical Approach

New `accounts` Django app exposes four DRF `APIView`s under `/api/auth/` using `SessionAuthentication` with a global `IsAuthenticated` default. No new models — native `User` + `is_superuser`. Settings wire DRF, session expiry, and dev CSRF origins; `/api/health/` stays a plain Django view (public by construction). Frontend adds `src/auth/` (fetch wrappers, context, guard) plus `Login.jsx` / `NewUser.jsx` pages behind react-router. Implements `user-auth` spec; follows proposal approach.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Session cookie vs JWT | JWT needs token storage/refresh logic; session gives httpOnly cookie + Django logout for free | Session auth via DRF `SessionAuthentication` — zero token code, matches offline-first monolith |
| New app `accounts` vs `auth` vs views in `config` | `auth` collides with `django.contrib.auth` imports; `config` mixes project wiring with domain views | `accounts` app — Django convention, no import clash, future home for user management |
| DRF `APIView` classes vs `@api_view` functions | Functions shorter; classes make per-view `permission_classes` explicit and test intent obvious | `APIView` classes — one class per endpoint, permission maps 1:1 to status contract |
| CSRF via DRF `SessionAuthentication` + `@ensure_csrf_cookie` | Manual `csrf_exempt` risks disabling protection on authed endpoints | Rely on DRF: `APIView` is `csrf_exempt` at middleware level; `SessionAuthentication` enforces CSRF only when a session exists, so anonymous login passes and authed POSTs require `X-CSRFToken` |
| Login failure message wording | Specific messages leak user existence | Single generic message for invalid + inactive users |

## Data Flow

Browser ⇄ Vite `/api` proxy ⇄ DRF views ⇄ `django.contrib.auth` (native `User`).

```mermaid
sequenceDiagram
  Browser->>+App: load (any route)
  App->>+API: GET /api/auth/me (cookies)
  API-->>-App: 200 user | 401 anonymous
  App->>App: loading→done; guard redirects if needed
```

```mermaid
sequenceDiagram
  Browser->>API: POST /api/auth/login {u,p}, no CSRF
  API->>API: authenticate(); login() on success
  API-->>Browser: 200 {id,username,is_superuser} + session & csrftoken cookies (400 generic otherwise)
```

```mermaid
sequenceDiagram
  Browser->>API: POST /api/auth/users {u,p} + X-CSRFToken
  API->>API: IsAdminUser check; create with is_superuser=False
  API-->>Browser: 201 public fields (401 anon / 403 non-superuser / 400 duplicate)
```

```mermaid
sequenceDiagram
  Browser->>API: POST /api/auth/logout + X-CSRFToken
  API->>API: django logout()
  API-->>Browser: 200, session cookie cleared; context→null, navigate /login
```

## File Changes

| File | Action | Description |
|---|---|---|
| `backend/accounts/__init__.py`, `apps.py` | Create | New app shell |
| `backend/accounts/serializers.py` | Create | `LoginSerializer`, `MeSerializer`, `CreateUserSerializer` (password write-only, forces `is_superuser=False`) |
| `backend/accounts/views.py` | Create | `LoginView` (AllowAny + ensure_csrf_cookie, manual 400), `LogoutView`, `MeView`, `CreateUserView` (IsAdminUser) |
| `backend/accounts/urls.py` | Create | Routes under `api/auth/` |
| `backend/accounts/tests.py` | Create | TDD matrix (see below) |
| `backend/config/settings.py` | Modify | `rest_framework` + `accounts` apps; `REST_FRAMEWORK` defaults; `SESSION_EXPIRE_AT_BROWSER_CLOSE=True`; dev `CSRF_TRUSTED_ORIGINS` |
| `backend/config/urls.py` | Modify | `include("accounts.urls")`; health untouched |
| `frontend/src/auth/api.js` | Create | `login/me/logout/createUser` fetch wrappers (`credentials:"include"`, CSRF header, `getCsrfToken()` cookie helper) |
| `frontend/src/auth/AuthContext.jsx` | Create | `{user, loading, error, login, logout}`; `me()` on mount |
| `frontend/src/auth/RequireAuth.jsx` | Create | Loading state; `<Navigate to="/login">` when anonymous |
| `frontend/src/pages/Login.jsx` | Create | Spanish form, generic error, redirect to `/` if authed |
| `frontend/src/pages/NewUser.jsx` | Create | Spanish superuser-only form ("Nuevo usuario") |
| `frontend/src/App.jsx`, `main.jsx` | Modify | `BrowserRouter` + protected routes; "Cerrar sesión" button |

## Interfaces / Contracts

`MeSerializer` → `{id, username, is_superuser}` (never password fields). Non-obvious pattern — CSRF cookie helper:

```js
function getCsrfToken() {
  const m = document.cookie.match(/(?:^|; )csrftoken=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : "";
}
```

Status contract (TDD locks these):

| Endpoint | Success | Failures |
|---|---|---|
| `POST /api/auth/login` | 200 + session/`csrftoken` cookies | 400 invalid/inactive (generic message); anonymous POST is CSRF-exempt |
| `POST /api/auth/logout` | 200, cookie cleared, `me`→401 | 401 anonymous |
| `GET /api/auth/me` | 200 `{id, username, is_superuser}` | 401 anonymous |
| `POST /api/auth/users` | 201 public fields, `is_superuser=False` | 401 anonymous; 403 non-superuser; 400 duplicate/validation |
| `GET /api/health/` | 200 `{"status":"ok"}` public | — |

Risk note: DRF `AuthenticationFailed` defaults to 401, so `LoginView` MUST NOT raise it — call `authenticate()` manually inside an `AllowAny` view and return `Response(..., 400)`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Backend | Login 200/400×2, CSRF cookie set, CSRF-exempt anonymous POST; logout 200+clears/401; me 200/401/no-leak; users 201/401/403/400; health public | `manage.py test`, `TestCase` + `APIClient`; `enforce_csrf_checks=True` client for CSRF tests |
| Frontend | Guard redirects, reload flicker, Spanish copy, logout navigation | Manual browser checklist; `pnpm lint` (oxlint) + `pnpm build` |

Manual checklist: anonymous→`/login`; `/login` authed→`/`; reload shows loading; "Cerrar sesión"→`/login`; superuser creates user; error message is generic Spanish.

## Migration / Rollout

No migration — no new models. Rollback: git revert.

## Open Questions

None — all resolved as decisions above.
