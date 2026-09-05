# Archive Report: auth-setup

**Change**: auth-setup
**Archived**: 2026-09-05
**Branch**: feature/auth-setup-02-frontend (unpushed, no PR chain)
**Mode**: hybrid (OpenSpec filesystem + Engram)

## Change Summary

Added session-based auth to LocalGym: Django session login/logout, current-user endpoint, superuser-only user creation, React SPA route guarding with Spanish UI. New `accounts` Django app; no new models (native `User` + `is_superuser`). No migrations.

## Final Artifact Inventory

| Artifact | Location | Status |
|----------|----------|--------|
| proposal.md | `archive/2026-09-05-auth-setup/proposal.md` | ✅ Complete |
| design.md | `archive/2026-09-05-auth-setup/design.md` | ✅ Complete |
| tasks.md | `archive/2026-09-05-auth-setup/tasks.md` | ✅ 19/19 tasks complete |
| verify-report.md | `archive/2026-09-05-auth-setup/verify-report.md` | ✅ PASS |
| canonical spec | `openspec/specs/user-auth/spec.md` | ✅ Final spec (8 requirements, 17 scenarios) |

### Engram Observation IDs (traceability)

| Artifact | Engram ID | Topic Key |
|----------|-----------|-----------|
| proposal | #228 | sdd/auth-setup/proposal |
| specs | #229 | sdd/auth-setup/specs |
| design | #231 | sdd/auth-setup/design |
| tasks | #232 | sdd/auth-setup/tasks |
| apply-progress | #235 | sdd/auth-setup/apply-progress |
| verify-report | #240 | sdd/auth-setup/verify-report |
| archive-report | (this) | sdd/auth-setup/archive-report |

## Spec Sync Action

**No delta sync needed.** This is a NEW capability — the canonical spec `openspec/specs/user-auth/spec.md` was created directly during the spec phase (no delta spec exists; dispatcher "specs missing" is a known false negative). The canonical spec IS the final spec and was already the source of truth during implementation and verification.

## Verification State

- **Verdict**: PASS (verify-report.md, on-disk and Engram #240)
- **Backend**: 25/25 tests green, `manage.py check` clean, 17/17 spec scenarios COMPLIANT
- **Frontend**: `pnpm lint` zero warnings, `pnpm build` success (82 modules), manual browser checklist (task 5.2) confirmed by user 2026-09-05
- **TDD**: 5/5 strict TDD checks passed
- **CRITICAL issues**: None
- **WARNING**: None (5.2 was resolved by user confirmation)

## Task Completion Gate

All 19 implementation tasks checked in persisted `tasks.md`. No stale unchecked tasks. Gate passed without reconciliation.

## Known Follow-ups

1. **PR chain deferred** — branch `feature/auth-setup-02-frontend` is unpushed (no git remote configured). When remote exists: PR1 backend (472+ lines, size:exception), PR2 frontend (398 lines, inside 400 budget), chained targeting.
2. **Environment/secret hardening** — `SECRET_KEY` hardcoded, `DEBUG=True`, `ALLOWED_HOSTS=[]`, `CSRF_TRUSTED_ORIGINS` dev-only. Separate change needed for production readiness.
3. **MD5 test hasher** — backend suite takes ~100s for 25 tests due to PBKDF2. An `MD5PasswordHasher` override in test settings would speed up the suite.
4. **Coverage dependency** — `coverage` not installed in `backend/requirements.txt`. Adding it enables changed-file coverage reporting.
5. **Frontend automated tests** — R7/R8 route-guarding and Spanish UI have no automated tests (no test runner). Consider Vitest + React Testing Library if guard logic grows.

## Residual Risks

- Combined diff vs `dev` is ~852+/32- (exceeds 400-line budget), mitigated via chained PR split.
- `CSRF_TRUSTED_ORIGINS` is localhost-only — production deployment requires env-based config.
- No automated E2E or integration tests for frontend auth flows.

## Status Transition

Change `auth-setup` is now **closed/archived**. The SDD cycle is complete: planned → designed → implemented → verified → archived.
