# Tasks: Member Management (Gestión de Socios)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~850–900 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 backend → PR 2 frontend |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend `members` app: model, migration, full CRUD API, TDD suite | PR 1 | Verify: `manage.py test`; ~500 lines |
| 2 | Frontend: member client, pages, routes; `/usuarios/nuevo`→`/users/new`; AGENTS.md | PR 2 | Verify: `pnpm lint` + `pnpm build` + manual checklist; bases on PR 1's API contract |

Commit boundaries: RED→GREEN pairs commit together (tests with code) — `feat(members): model+migration` · `feat(members): list/retrieve` · `feat(members): create/update/deactivate/reactivate` · `feat(frontend): member client+routes` · `feat(frontend): members list page` · `feat(frontend): member form` · `refactor(frontend): /usuarios/nuevo → /users/new` · `docs: SPA route conventions`.

## Phase 1: Backend foundation — `members` app [S1]

- [x] 1.1 RED: `backend/members/tests.py` model tests — doc_type uppercased on save; CC-123 rejected when active AND when inactive; TI-123 vs CC-123 allowed. [Model, Unique]
- [x] 1.2 GREEN: `backend/members/{__init__|apps|models}.py` — `Member` + `DocumentType(TextChoices)`, `save().upper()`, `UniqueConstraint(document_type, document_number)`, db indexes; tests green.
- [x] 1.3 `makemigrations members` → `0001_initial` (new table, no data move).
- [x] 1.4 `backend/config/settings.py` += `members` in `INSTALLED_APPS`; `backend/config/urls.py` mount `path("api/members/", include("members.urls"))`.

## Phase 2: Backend API — TDD [S1]

- [x] 2.1 RED: list/retrieve tests — 25 members→20 + `count=25` + `next`; search=juan (name); search=12345 (document); status active/inactive/all; anonymous 401; retrieve 200 / 404. [List, Retrieve]
- [x] 2.2 GREEN: `serializers.py` + `views.py` `MemberListView`(GET) / `MemberDetailView`(GET) — `PageNumberPagination`(20), `Q` icontains ×3, `status` filter, `ordering=-created_at,id`; `members/urls.py` `""` + `"<int:pk>/"`.
- [x] 2.3 RED: write tests — create 201 + audit (`created_by`/`updated_by`=user) + lowercase `"cc"`→`"CC"`; 400 invalid doc_type; 400 duplicate active AND inactive pair; PUT full / PATCH partial / 400 unique / audit-B (`updated_by`=B, `created_by`=A); deactivate 200 + idempotent 200 + 401; reactivate PATCH `is_active=True` 200. [Create, Update, Deactivate, Reactivate]
- [x] 2.4 GREEN: add POST/PUT/PATCH to serializers+views (`is_active` read-only on create, `created_*` read-only), `MemberDeactivateView`; full suite green: `backend/venv/Scripts/python.exe manage.py test`.

## Phase 3: Frontend member client + routes [S2]

- [x] 3.1 `frontend/src/auth/api.js`: generalize `request()` (full path, drop `API_BASE` prefix); add `listMembers({search,status,page})` via `URLSearchParams` (omit empty search), `getMember`, `createMember`, `updateMember`, `deactivateMember` — CSRF pattern unchanged.
- [x] 3.2 `frontend/src/App.jsx`: add `/members`, `/members/new`, `/members/:id/edit` under `RequireAuth`.

## Phase 4: Frontend pages [S2]

- [x] 4.1 `frontend/src/pages/MembersList.jsx`: search input, 3-state filter (Active default → `status` query), paginated table, inline deactivate confirm/cancel, reactivate link via edit.
- [x] 4.2 `frontend/src/pages/MemberForm.jsx`: create/edit form, Spanish copy; `is_active` checkbox only on edit.

## Phase 5: Route migration, docs, verification [S2]

- [x] 5.1 `frontend/src/App.jsx` + Home link: replace `/usuarios/nuevo` with `/users/new` (old route gone).
- [x] 5.2 `AGENTS.md`: document SPA routes English, UI copy Spanish, identifiers + API English.
- [x] 5.3 Verify: `pnpm lint` + `pnpm build`; manual checklist — anon→/login, Active default / Inactive / All switch, deactivate confirm/cancel, `/users/new` renders, `/usuarios/nuevo` gone.