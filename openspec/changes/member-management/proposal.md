# Proposal: Member Management (Gestión de Socios)

## Intent

Members are LocalGym's core entity, yet no member data exists today — gyms still track socios in paper or spreadsheets. This change delivers end-to-end Member management: a tested Django API (slice 1) plus Spanish frontend pages (slice 2), so staff can register, search, edit, and deactivate members. It also unblocks the future membership/payment features, which depend on the Member base.

## Context

- **Current state**: no models beyond auth; auth-setup established the patterns (explicit `APIView` classes, strict TDD, ~400-line PR budget, chained delivery).
- **Member is standalone**: a pure data record, no link to system `User` accounts; members cannot log in.
- **Removal = soft deactivation** (`is_active` flag) instead of hard delete — preserves membership history and data integrity.

## Scope

### In Scope

- `members` Django app: `Member` model with fields `document_type` (CC/TI/CE/PA/RC), `document_number`, `first_name`, `last_name`, `birth_date`, `phone`, `email` (optional), `address` (optional), `emergency_contact_name`, `emergency_contact_phone`, `medical_conditions`, `notes` (optional), `is_active` (soft deactivation flag), audit fields `created_at`, `created_by`, `updated_at`, `updated_by` (set from the authenticated `User`)
- Member API: list (paginated, 20/page) w/ search (name AND document), retrieve, create, update, deactivate
- Unique `(document_type, document_number)` table-wide; document types normalized (uppercase, validated choices CC/TI/CE/PA/RC)
- Frontend: member list w/ search + pagination, create/edit form, deactivate action; English SPA routes, Spanish UI copy, English identifiers
- Route migration: `/usuarios/nuevo` → `/users/new`; AGENTS.md documents the English SPA route convention
- Backend TDD suite (strict TDD mode); `pnpm lint` clean

### Out of Scope / Non-goals

- Memberships, payments, access control — separate changes
- Hard delete; member `User` accounts / login
- Import/export of members; photo upload (deferred by ideas.md)
- Wiring `django-filter` — search via explicit query params

## Capabilities

### New Capabilities

- `member-management`: Member entity, CRUD API, name/document search, soft deactivation, audit fields

### Modified Capabilities

- None — `user-auth` requirements unchanged; member views reuse `IsAuthenticated`

## Approach

**Slice 1 — backend** (explicit `APIView` classes per auth-setup convention):

- `MemberListView` (GET list + POST create), `MemberDetailView` (GET/PUT/PATCH), `MemberDeactivateView` (POST deactivate)
- List: DRF pagination, 20 members per page; case-insensitive substring search on first/last name + document_number
- Deactivate: idempotent `is_active=False`; audit fields written from `request.user`
- Strict TDD first; sized to stay under the 400-line budget → chained PR

**Slice 2 — frontend:**

- Routes `/members`, `/members/new`, `/members/:id/edit`; API client functions in `src/auth/api.js`
- Migrate `/usuarios/nuevo` → `/users/new`; update AGENTS.md (SPA routes English, UI copy Spanish, API endpoints + code identifiers English)
- List: 3-state status filter (Active default / Inactive / All), paginated 20/page; deactivate with an inline confirmation; reactivate from the Inactive view

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/config/settings.py` | Modified | add `members` to `INSTALLED_APPS` |
| `backend/config/urls.py` | Modified | mount `api/members/` |
| `backend/members/` | New | model, serializer, views, urls, tests, migration |
| `frontend/src/App.jsx` | Modified | member routes; migrate `/usuarios/nuevo` → `/users/new` |
| `frontend/src/pages/` | New + Modified | MembersList, MemberForm; NewUser re-routed |
| `frontend/src/auth/api.js` | Modified | member API functions |
| `AGENTS.md` | Modified | document English SPA route convention |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Slice exceeds 400-line review budget | Med | Thin views; chained PRs keep slices autonomous |
| Deactivation does NOT free the member's document pair — operator may expect re-registration to work | Med | Unique `(document_type, document_number)` applies table-wide: same pair ALWAYS rejected (active or inactive); different pairs always allowed. Recovery path: reactivate the original row (`is_active=True`) |
| CSRF failure on member writes | Low | Reuse existing `api.js` CSRF handler pattern |

## Rollback Plan

Revert slice commits — auth is untouched. Remove `members` from `INSTALLED_APPS`/URLs and reverse the migration; no dependent features exist yet, so no data-loss risk beyond member rows themselves.

## Dependencies

- auth-setup (done): SessionAuthentication + IsAuthenticated, 401-for-anonymous handler
- `ideas.md` §3.A: authoritative field definitions and business rules

## Success Criteria

- [ ] `backend/venv/Scripts/python.exe manage.py test` green for `members` (CRUD, search, uniqueness, deactivate, audit fields)
- [ ] Create, edit, deactivate, and search a member works end-to-end in the UI

## Proposal question round (assumptions needing review)

1. **Inactive member keeps blocking its document** from re-registration; recovery is reactivation (edit sets `is_active=True`). Rationale: table-wide uniqueness is the only defense against duplicate member records.
2. **Decided — list status filter**: visible 3-state filter in the member table (Active default / Inactive / All). Rationale: daily work shows active members; the Inactive view doubles as the reactivation entry point — no hidden opt-in flag needed.
3. **Decided — pagination**: DRF list pagination, 20 members per page. Rationale: bounded responses keep the UI snappy on modest LAN hardware while staying usable beyond the 50–800-member v1 range.