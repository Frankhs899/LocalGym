# Verify Report: auth-setup

**Change**: auth-setup
**Spec version**: user-auth (canonical `openspec/specs/user-auth/spec.md`, on-disk authoritative — no delta spec exists; dispatcher false negative)
**Mode**: Strict TDD (backend runner present; frontend no test runner — `pnpm lint` + `pnpm build`)
**Branch**: feature/auth-setup-02-frontend (backend slice 1 + frontend slice 2 commits; 19/19 tasks checked — 5.2 confirmed by user 2026-09-05; working tree clean)
**Date**: 2026-09-05

## Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 19 |
| Tasks complete | 19 |
| Tasks incomplete | 0 |

## Build & Tests Execution

**Build (frontend)**: ✅ Passed — `pnpm build` (vite v8.2.2, 82 modules, dist/ emitted, exit 0)

**Lint (frontend)**: ✅ Passed — `pnpm lint` (oxlint, zero warnings, exit 0)

**System check (backend)**: ✅ Passed — `manage.py check`: "System check identified no issues (0 silenced)" (exit 0)

**Tests (backend)**: ✅ 25 passed / 0 failed / 0 skipped

```text
Found 25 test(s).
System check identified no issues (0 silenced).
.........................
Ran 25 tests in 100.048s
OK
=== EXIT: 0 ===
```

**Coverage**: ➖ Not available — `python -m coverage` reports "No module named coverage" (not a failure; tooling gap only). Skipped per Strict TDD module.

## Spec Compliance Matrix (R1–R8, 17 scenarios)

Backend scenarios proven by runtime evidence (real `manage.py test` execution). Frontend scenarios (R7–R8) verified by source inspection + lint/build, plus the user's manual browser checklist (task 5.2, confirmed 2026-09-05).

| Req | Scenario | Covering test (runtime evidence) | Result |
|-----|----------|----------------------------------|--------|
| R1 Session Login | Valid credentials → 200, session + `csrftoken` cookies, no password | `accounts/tests.py > LoginTests.test_valid_credentials_return_200_with_public_fields`, `.test_valid_login_sets_session_and_csrf_cookies` | ✅ COMPLIANT |
| R1 | Invalid credentials → 400, message reveals nothing | `.test_invalid_credentials_return_400_with_identical_generic_message` (identical bodies asserted) | ✅ COMPLIANT |
| R1 | Inactive user → 400, no session | `.test_inactive_user_returns_400_and_no_session` | ✅ COMPLIANT |
| R1 | (extra) Anonymous POST CSRF-exempt + cookie set | `.test_anonymous_post_is_csrf_exempt_and_sets_csrf_cookie` (`enforce_csrf_checks` client) | ✅ COMPLIANT |
| R2 Session Logout | Clears session; cookie cleared; me → 401 | `LogoutTests.test_logout_clears_session_and_me_returns_401` (with `X-CSRFToken`) | ✅ COMPLIANT |
| R2 | Anonymous logout → 401 | `.test_anonymous_logout_returns_401` | ✅ COMPLIANT |
| R2 | (extra) Missing CSRF token → 403 | `.test_logout_without_csrf_token_returns_403` | ✅ COMPLIANT |
| R3 Current User | Authenticated 200 `{id, username, is_superuser}`, no password | `CurrentUserTests.test_authenticated_me_returns_public_fields` (exact dict asserted) | ✅ COMPLIANT |
| R3 | Anonymous → 401 | `.test_anonymous_me_returns_401` | ✅ COMPLIANT |
| R4 User Creation | Superuser creates 201, public fields, `is_superuser=False`, no password | `CreateUserTests.test_superuser_creates_regular_user` (DB hash + `check_password` asserted; payload included `is_superuser: True` → forced False) | ✅ COMPLIANT |
| R4 | Non-superuser → 403 | `.test_non_superuser_gets_403` (+ `.test_staff_non_superuser_gets_403` locks `is_superuser`, not `is_staff`) | ✅ COMPLIANT |
| R4 | Duplicate username → 400 | `.test_duplicate_username_returns_400` | ✅ COMPLIANT |
| R4 | (extra) Anonymous → 401; missing CSRF → 403 | `.test_anonymous_gets_401`, `.test_create_user_without_csrf_token_returns_403` | ✅ COMPLIANT |
| R5 Public Health | No session → 200 `{"status":"ok"}` | `HealthTests.test_health_is_public` (exact JSON body) | ✅ COMPLIANT |
| R6 Browser-close session | Sessions expire on close; cookie carries no persistent expiry | `SessionExpiryTests.test_session_expires_on_browser_close` + `.test_login_session_cookie_carries_no_persistent_expiry` (cookie `expires` attribute absent — design-approved behavioral test, deviation #4) | ✅ COMPLIANT |
| R7 Route Guarding | Anonymous → /login | Static: `RequireAuth.jsx` `<Navigate to="/login">` when `!user`; lint+build pass. User browser pass (5.2) confirmed 2026-09-05 | ✅ COMPLIANT |
| R7 | Authed renders protected routes | Static: `RequireAuth` renders children when `user`; App.jsx wraps `/` and `/usuarios/nuevo`. User browser pass (5.2) confirmed 2026-09-05 | ✅ COMPLIANT |
| R7 | Authed at /login → / | Static: `Login.jsx` `<Navigate to="/" replace>` when authed. User browser pass (5.2) confirmed 2026-09-05 | ✅ COMPLIANT |
| R7 | Reload flicker — loading gate | Static: `AuthContext` `me()` on mount + `loading` state; `RequireAuth` renders "Cargando..." and blocks redirect. User browser pass (5.2) confirmed 2026-09-05 | ✅ COMPLIANT |
| R8 Spanish UI | Login page, "Nuevo usuario", "Cerrar sesión" | Static: all copy in Spanish (`Login.jsx`, `NewUser.jsx`, `App.jsx`); generic login error "Usuario o contraseña incorrectos.". User browser pass (5.2) confirmed 2026-09-05 | ✅ COMPLIANT |

**Compliance summary**: 17/17 spec scenarios COMPLIANT (R1–R8; R7×4 + R8×1 confirmed via user browser pass, task 5.2, 2026-09-05), 0 PARTIAL, 0 UNTESTED-without-designated-path, 0 FAILING. (5 additional contract-lock tests — CSRF 403s, cookie expiry, 405s, generic-400 edges, staff-403 — pass as extras beyond the 17 scenarios.)

Supplementary runtime evidence (recorded in apply-progress, slice 2): live-server smoke test — login 200 `{id,username,is_superuser}` + `csrftoken`/`sessionid` cookies; me 200; users 201 `is_superuser:false` with `X-CSRFToken`; logout 200; me → 401. This covers the API-level equivalents of the 5.2 checklist.

## Correctness (Static Evidence)

| Requirement | Status | Notes |
|-------------|--------|-------|
| R1 Session Login | ✅ Implemented | `LoginView` AllowAny + `@ensure_csrf_cookie`; manual `authenticate()` returns 400 with single generic message; never raises `AuthenticationFailed` (per design risk note); reuses `MeSerializer` |
| R2 Session Logout | ✅ Implemented | `LogoutView`; global `IsAuthenticated` default → anonymous 401; CSRF enforced for authed POSTs |
| R3 Current User | ✅ Implemented | `MeView` + `MeSerializer` exposing only `id, username, is_superuser` |
| R4 User Creation | ✅ Implemented | `CreateUserView` (IsSuperUser) + `CreateUserSerializer`: password write-only, `is_superuser` forced False in `create()` |
| R5 Public Health | ✅ Implemented | `health_check` plain Django view — public by construction, untouched by DRF defaults |
| R6 Browser-close expiry | ✅ Implemented | `SESSION_EXPIRE_AT_BROWSER_CLOSE=True` (settings.py:57) |
| R7 Route Guarding | ✅ Implemented (static) | `RequireAuth` loading gate + redirect; `Login` authed redirect; `AuthProvider.me()` on mount with cancellation guard |
| R8 Spanish UI | ✅ Implemented (static) | "Iniciar sesión", "Usuario", "Contraseña", "Ingresar", "Nuevo usuario", "Cerrar sesión", "Cargando...", generic errors — all Spanish |

## Coherence (Design)

| Design Decision | Followed? | Notes |
|-----------------|-----------|-------|
| Session auth via DRF `SessionAuthentication` (no JWT) | ✅ Yes | settings.py `DEFAULT_AUTHENTICATION_CLASSES` |
| `accounts` app (not `auth`/config views) | ✅ Yes | `backend/accounts/` shell + files |
| `APIView` classes, permission per view | ✅ Yes | 4 views in `views.py`; `permission_classes` explicit |
| CSRF: DRF session-auth flow + `@ensure_csrf_cookie`; authed POSTs need `X-CSRFToken` | ✅ Yes | Login CSRF-exempt (tested with `enforce_csrf_checks`), logout/users 403 without token (tested) |
| Single generic login-failure message | ✅ Yes | `INVALID_CREDENTIALS_MESSAGE`; identical 400 bodies asserted across wrong-password/unknown/inactive/malformed |
| `IsSuperUser` on `is_superuser` (not `is_staff`) | ✅ Yes | `permissions.py`; staff-403 contract test |
| `force_401_for_unauthenticated` exception handler; CSRF stays 403 | ✅ Yes | `exceptions.py` + `EXCEPTION_HANDLER`; 401 tests + CSRF-403 tests both pass |
| Status contract table (200/201/400/401/403/405) | ✅ Yes | Locked by `MethodNotAllowedTests` (405s) + all status tests |
| `AuthContext.jsx` public API `{user, loading, error, login, logout}` | ✅ Yes | Structural micro-deviation: split into `auth-context.js` + `useAuth.js` + `AuthContext.jsx` (deviation #3) — same public API, zero-warning oxlint fast-refresh |
| Session cookie runtime-only, no persistent expiry | ✅ Yes | Tested (cookie `expires` absent) |
| Size-budget chain (PR1 backend 472+ size:exception; PR2 frontend 398) | ✅ Yes | Combined diff 852+/32-; slice split respects budget; PR creation deferred (branch unpushed) |

## Issues Found

**CRITICAL**: None.

**WARNING**: None. (The single warning — task 5.2 manual browser checklist — was resolved: user confirmed completion on 2026-09-05; tasks.md now 19/19.)

**SUGGESTION**:
1. **Backend suite wall time ~100s for 25 tests** — PBKDF2 hashing across many `create_user`/login calls dominates; consider an MD5/crypt test hasher override in a dev-only settings module or test runner config.
2. **`coverage` not installed** in `backend/requirements.txt` — adding it enables changed-file coverage reporting in future verify runs (informational; never a failure).
3. **Apply-progress SAFETY NET labeling (process)** — tasks 2.3/2.5 show "➖ None needed" in the SAFETY NET column while `tests.py` was extended; the pretest baselines ("7 pass"/"11 pass") are recorded in the RED column and satisfy the intent, but explicit labeling would make future audits unambiguous.
4. **Frontend R7/R8 have no automated tests** (no test runner installed). Acceptable for this change per project config (manual checklist designated). If route-guard logic grows, a Vitest + React Testing Library layer would remove the recurring manual-evidence gap.

## Verdict

**PASS** — backend fully verified by runtime evidence (25/25 tests, spec scenarios R1–R6 COMPLIANT, design coherent, all 19 tasks confirmed real); frontend verified statically with lint/build green plus the user's manual browser checklist (5.2, confirmed 2026-09-05) covering R7/R8.

---

### TDD Compliance (Strict TDD)

| Check | Result | Details |
|-------|--------|---------|
| TDD Evidence reported | ✅ | apply-progress #235 contains full TDD Cycle Evidence table (slice 1) |
| All tasks have tests | ✅ 4/4 TDD-cycle tasks | 2.1, 2.3, 2.5, 2.8 → `accounts/tests.py` (frontend has no runner by design) |
| RED confirmed (tests exist) | ✅ 4/4 | `backend/accounts/tests.py` exists (294 lines); RED column consistent (pre-route 404, pre-view failures) |
| GREEN confirmed (tests pass) | ✅ 25/25 | Re-ran `manage.py test`: OK, exit 0 |
| Triangulation adequate | ✅ 4/4 | 2.1: 5 cases; 2.3: 6 cases; 2.5: 4 cases (+2 in 2.8); 2.8: 10 contract-lock cases; no single-case tasks |
| Safety Net for modified files | ✅ (with note) | 2.1 N/A-new correct; 2.3/2.5 labeled "➖ None needed" but RED column records pretest baselines "7 pass"/"11 pass"; 2.8 baseline "24 pass" |

**TDD Compliance**: 5/5 checks passed (safety-net labeling nit → SUGGESTION #3)

### Test Layer Distribution

| Layer | Tests | Files | Tools |
|-------|-------|-------|-------|
| Unit | 0 | 0 | — |
| Integration | 25 | 1 | `manage.py test` / `APIClient` (Django `TestCase`, real routing + DB + CSRF enforcement) |
| E2E | 0 | 0 | — (frontend has no test runner; manual checklist designated) |
| **Total** | **25** | **1** | |

### Changed File Coverage

**Coverage analysis skipped — no coverage tool detected** (`coverage` not installed in venv). Not a failure.

### Assertion Quality (Step 5f audit of `accounts/tests.py`)

Scanned all 25 tests: no tautologies, no ghost loops, no type-only assertions, no empty-collection-only assertions, no smoke tests, no implementation-detail CSS/mock-call coupling. Every test drives a real HTTP request through `APIClient` and asserts status + body behavior; duplicates/leaks are proven by DB queries (`User.objects.filter(...).exists()`, `check_password`). The session-expiry config assertion (`settings.SESSION_EXPIRE_AT_BROWSER_CLOSE is True`) is paired with the behavioral cookie-attribute test in the same class — acceptable pairing.

**Assertion quality**: ✅ All assertions verify real behavior

### Quality Metrics

**Linter**: ✅ oxlint — zero warnings, exit 0 (frontend). Backend linter: ➖ not installed in project.
**Type Checker**: ➖ Not available (plain JS frontend, no TS; Django runtime checks via `manage.py check` ✅)