# Member Management Specification

## Purpose

Member management for LocalGym: CRUD API + frontend pages for gym member records. Members are standalone data entities — no link to system `User` accounts; members cannot log in. Soft deactivation preserves data and document uniqueness.

## Requirements

### Requirement: Member Model

The system MUST persist a `Member` entity with fields: `document_type` (choice: CC, TI, CE, PA, RC), `document_number`, `first_name`, `last_name`, `birth_date`, `phone`, `email` (optional), `address` (optional), `emergency_contact_name`, `emergency_contact_phone`, `medical_conditions`, `notes` (optional), `is_active` (boolean, default `True`). Document types MUST be normalized to uppercase on save.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Create member | valid required fields provided | POST /api/members/ | 201; member persisted with all fields; `is_active=True` |
| Optional fields omitted | `email`, `address`, `notes` not provided | POST /api/members/ | 201; those fields are null |
| Invalid document_type | value not in CC/TI/CE/PA/RC | POST /api/members/ | 400 with validation error |
| Lowercase document_type | `"cc"` provided | POST /api/members/ | saved as `"CC"` |

### Requirement: Document Uniqueness

The system MUST enforce a table-wide unique constraint on `(document_type, document_number)`. The same pair MUST be rejected regardless of `is_active` status. Different pairs MUST always be allowed.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Duplicate active member | an active member with CC-123 | POST a new member with CC-123 | 400; unique violation |
| Duplicate inactive member | an inactive member with CC-123 | POST a new member with CC-123 | 400; same pair always rejected |
| Different document type | an active member with CC-123 | POST a new member with TI-123 | 201; different pairs allowed |

### Requirement: Audit Fields

The system MUST auto-populate `created_at`, `created_by`, `updated_at`, `updated_by` from the authenticated `User` on create and update. `created_by` and `created_at` are read-only after creation.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Create audit | authenticated user A | POST /api/members/ | `created_by` = A, `created_at` set, `updated_by` = A, `updated_at` set |
| Update audit | member created by A, edited by B | PUT /api/members/{id}/ | `updated_by` = B, `updated_at` updated; `created_by` unchanged |

### Requirement: Member List API

`GET /api/members/` MUST return a paginated list (20/page default) with case-insensitive substring search on `first_name`, `last_name`, and `document_number`. A `status` query parameter MUST filter by `active` (default), `inactive`, or `all`.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Default list | 25 members exist | GET /api/members/ | 200; 20 members; `count=25`, `next` page link present |
| Search by name | members "Juan Perez" and "Ana Lopez" exist | GET /api/members/?search=juan | 200; results include "Juan Perez" only |
| Search by document | member with CC-12345 exists | GET /api/members/?search=12345 | 200; that member returned |
| Status filter active | active + inactive members exist | GET /api/members/?status=active | 200; only active members |
| Status filter inactive | active + inactive members exist | GET /api/members/?status=inactive | 200; only inactive members |
| Status filter all | active + inactive members exist | GET /api/members/?status=all | 200; all members |
| Anonymous access | no session | GET /api/members/ | 401 |

### Requirement: Member Retrieve API

`GET /api/members/{id}/` MUST return the full member record for authenticated users, 404 for non-existent IDs.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Valid retrieve | an existing member | GET /api/members/{id}/ | 200; full member record |
| Non-existent | no member with that ID | GET /api/members/{id}/ | 404 |

### Requirement: Member Update API

`PUT /api/members/{id}/` and `PATCH /api/members/{id}/` MUST allow updating member fields for authenticated users. `document_type` and `document_number` changes MUST still respect the table-wide uniqueness constraint.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Full update | an existing member | PUT /api/members/{id}/ with all fields | 200; all fields updated |
| Partial update | an existing member | PATCH /api/members/{id}/ with `phone` only | 200; only `phone` changed |
| Duplicate on update | member A has CC-123, member B exists | PUT /api/members/{b}/ with CC-123 | 400; unique violation |

### Requirement: Soft Deactivation

`POST /api/members/{id}/deactivate/` MUST set `is_active=False` idempotently. Deactivated members MUST keep all their data and MUST continue blocking their `(document_type, document_number)` pair. The endpoint MUST require authentication.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Deactivate active | an active member | POST /api/members/{id}/deactivate/ | 200; `is_active=False` |
| Idempotent deactivate | an already inactive member | POST /api/members/{id}/deactivate/ | 200 (no error); `is_active=False` |
| Deactivate anonymous | no session | POST /api/members/{id}/deactivate/ | 401 |

### Requirement: Reactivation

`PATCH /api/members/{id}/` with `is_active=True` MUST reactivate a deactivated member. This is the ONLY recovery path for inactive members whose document pair is blocked.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Reactivate | an inactive member | PATCH /api/members/{id}/ with `is_active=True` | 200; `is_active=True` |

### Requirement: Auth Enforcement

All member API endpoints MUST require an authenticated session via `IsAuthenticated`. No member endpoint MUST be publicly accessible. Reuses existing `SessionAuthentication` and 401-for-anonymous handler from `user-auth`.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Authenticated CRUD | a valid session | any member API call | 200/201/204 as appropriate |
| Anonymous CRUD | no session | any member API call | 401 |

### Requirement: Frontend Member Routes

The frontend MUST serve member pages at `/members` (list), `/members/new` (create form), `/members/:id/edit` (edit form). SPA routes MUST be in English; UI copy MUST be in Spanish.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Member list | authenticated user | navigate to /members | member table rendered |
| Create form | authenticated user | navigate to /members/new | member creation form |
| Edit form | authenticated user, existing member | navigate to /members/{id}/edit | member edit form with pre-filled data |
| Anonymous | no session | navigate to /members | redirected to /login |

### Requirement: Frontend Status Filter

The member list page MUST display a 3-state status filter: Active (default), Inactive, All. The filter MUST query the backend `status` parameter. Deactivated members are shown only in Inactive/All views. Reactivation MUST be available from the Inactive view via edit.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Default view | member list loads | page renders | Active filter selected; only active members shown |
| Switch to Inactive | Active view | user selects Inactive | list shows only inactive members |
| Switch to All | any view | user selects All | list shows all members regardless of status |

### Requirement: Frontend Deactivation with Confirmation

The member list MUST offer a deactivate action per member with an inline confirmation step. Deactivated members MUST disappear from the Active view. Reactivation is done via the edit form (setting `is_active=True`).

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Deactivate confirmation | active member in list | user clicks deactivate | inline confirmation prompt shown |
| Confirm deactivation | confirmation prompt visible | user confirms | member deactivated; removed from Active view |
| Cancel deactivation | confirmation prompt visible | user cancels | no change |

### Requirement: Route Migration

`/usuarios/nuevo` MUST be removed. The user creation route MUST move to `/users/new`. AGENTS.md MUST document that SPA routes are English and UI copy is Spanish.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Old route gone | frontend app | navigate to /usuarios/nuevo | 404 or redirect (route does not exist) |
| New user route | authenticated superuser | navigate to /users/new | user creation form renders |

## Out of Scope

- Memberships, payments, access control — separate changes
- Hard delete of members
- Member User accounts / login
- Import/export of members; photo upload
- `django-filter` wiring — search uses explicit query params
