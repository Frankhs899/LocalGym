# Tasks: Auth Setup

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700–750 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 backend → PR 2 frontend |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend auth API: settings + `accounts` app + full TDD suite (R1–R6) | PR 1 | Verify: `manage.py test`; ~400 lines |
| 2 | Frontend auth module, pages, router (R7–R8) | PR 2 | Verify: `pnpm lint` + `pnpm build`; bases on PR 1's API contract |

## Phase 1: Foundation (app shell + config)

- [ ] 1.1 Create `backend/accounts/` app shell (`__init__.py`, `apps.py`).
- [ ] 1.2 `backend/config/settings.py`: add `rest_framework` + `accounts` to `INSTALLED_APPS`; `REST_FRAMEWORK` defaults (SessionAuthentication, IsAuthenticated); `SESSION_EXPIRE_AT_BROWSER_CLOSE=True`; dev `CSRF_TRUSTED_ORIGINS` incl. `http://localhost:5173`. [R5, R6]
- [ ] 1.3 `backend/config/urls.py`: mount `path("api/auth/", include("accounts.urls"))`; leave `/api/health/` untouched. [R5]

## Phase 2: Backend endpoints (TDD: RED → GREEN)

- [ ] 2.1 RED: write failing `accounts/tests.py` login tests — valid 200 + session/`csrftoken` cookies + no password; invalid 400 generic; inactive 400; anonymous POST CSRF-exempt + cookie set (`enforce_csrf_checks` client). [R1]
- [ ] 2.2 GREEN: `accounts/serializers.py` `LoginSerializer` + `accounts/views.py` `LoginView` (AllowAny, manual 400 via `authenticate()`, `@ensure_csrf_cookie`) until green. [R1]
- [ ] 2.3 RED: failing tests — logout clears session + `me`→401, anonymous logout 401 [R2]; `me` 200 `{id, username, is_superuser}` no password, anonymous 401 [R3]; health public 200 [R5]; `SESSION_EXPIRE_AT_BROWSER_CLOSE` is True [R6].
- [ ] 2.4 GREEN: `LogoutView` + `MeView` in `views.py`, `MeSerializer` in `serializers.py`, routes in `accounts/urls.py`; tests pass. [R2, R3, R5]
- [ ] 2.5 RED: write failing tests — superuser creates user 201, no password, `is_superuser=False`; 403 non-superuser; 401 anonymous; 400 duplicate username. [R4]
- [ ] 2.6 GREEN: `CreateUserView` (IsAdminUser) + `CreateUserSerializer` (password write-only, force `is_superuser=False`) until green. [R4]
- [ ] 2.7 Full backend suite green: `backend/venv/Scripts/python.exe manage.py test`. [R1–R6]

## Phase 3: Frontend auth module

- [ ] 3.1 `frontend/src/auth/api.js`: `login`/`me`/`logout`/`createUser` fetch wrappers, `credentials:"include"`, `getCsrfToken()` cookie helper, `X-CSRFToken` header on logout/users. [R2]
- [ ] 3.2 `frontend/src/auth/AuthContext.jsx`: `{user, loading, error, login, logout}`; `me()` on mount. [R7]
- [ ] 3.3 `frontend/src/auth/RequireAuth.jsx`: render loading state; `<Navigate to="/login">` when anonymous. [R7]

## Phase 4: Frontend pages & router

- [ ] 4.1 `frontend/src/pages/Login.jsx`: Spanish form, generic error message, redirect to `/` if already authed. [R7, R8]
- [ ] 4.2 `frontend/src/pages/NewUser.jsx`: Spanish "Nuevo usuario" screen (superuser-only). [R4, R8]
- [ ] 4.3 `frontend/src/App.jsx` + `main.jsx`: `BrowserRouter`, protected routes, "Cerrar sesión" button → `logout()` + navigate `/login`. [R7, R8]

## Phase 5: Final verification

- [ ] 5.1 `pnpm lint` (oxlint) + `pnpm build` pass. [R7, R8]
- [ ] 5.2 Manual browser checklist: anonymous→`/login`; authed at `/login`→`/`; reload shows loading (no flash); superuser creates user; "Cerrar sesión"→`/login`; generic Spanish error. [R7, R8]