# Tasks: Frontend Foundations (Identity, Tokens, Components, Shell)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,210 total (design estimates; slices 80–300 each) |
| 400-line budget risk | High overall / Low per slice |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 6 (S1, S2a, S2b, S2c, S3, S4) |
| Delivery strategy | ask-always |
| Chain strategy | pending (FBC proposed in design; user decides) |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| S1 | Tokens, fonts, contrast gate (~180) | PR 1 | Base: `feature/frontend-foundations` tracker branch |
| S2a | Kit core: Button/Field/Card/Badge (~200) | PR 2 | Base: PR 1 branch |
| S2b | Kit data/feedback: 5 components (~250) | PR 3 | Base: PR 2 branch |
| S2c | Page refactor, net deletions (~200) | PR 4 | Base: PR 3 branch; waits S2a+S2b |
| S3 | Shell+routes+landing/dashboard (~300) | PR 5 | Base: PR 4 branch; waits S2 |
| S4 | Favicon+icons+emerald purge (~80) | PR 6 | Base: PR 5 branch |

Commit per work unit (conventional commits); keep lint/build/manual check with the behavior it verifies. Each slice's diff must show only its own work — retarget/rebase otherwise.

## Phase 1: S1 Tokens, Fonts, Contrast Gate

- [x] 1.1 Add `@fontsource-variable/oswald` + `@fontsource-variable/inter` to `frontend/package.json` — FF-TY self-hosted fonts
- [x] 1.2 Write `@theme` block in `frontend/src/index.css` (semantic colors per FF-DT: base/surface/raised/line/paper/fog/accent/accent-hover/accent-active/accent-ink/accent-muted/success/warning/danger; font/radius/ease vars; focus-visible ring; prefers-reduced-motion base) — FF-DT, FF-AC
- [x] 1.3 Import both fontsource CSS files in `frontend/src/main.jsx` before `index.css`; verify open item: main.jsx as CSS entry — `pnpm build` must resolve the imports
- [x] 1.4 Create `frontend/scripts/check-contrast.mjs` (relative-luminance WCAG ratios, exit≠0); run it — FF-AC gate; open item: if `accent-muted #B8C96E` fails 4.5:1, restrict to large/UI use (≥3:1) before locking tokens
- [x] 1.5 Verify: `pnpm lint` + `pnpm build` green

## Phase 2: S2a Kit Core

- [ ] 2.1 Create `frontend/src/components/Button.jsx` (primary lime bg + ink text, secondary, ghost, danger; sm/md; loading) — FF-CL, FF-DU scenarios
- [ ] 2.2 Create `frontend/src/components/Field.jsx` (`label`/`name`/`error`/`hint`, aria-invalid + aria-describedby) — FF-CL, FF-AC
- [ ] 2.3 Create `Card.jsx`, `Badge.jsx` (tone lime/red/zinc/amber) + barrel `index.js` — FF-CL
- [ ] 2.4 Verify: `pnpm lint` + `pnpm build`

## Phase 3: S2b Kit Data & Feedback

- [ ] 3.1 Create `Table.jsx` (`columns`/`rows`/`keyOf`), `Modal.jsx` (open/onClose/title; Esc closes, focus on close, aria-modal) — FF-CL, FF-AC
- [ ] 3.2 Create `LoadingSkeleton.jsx`, `EmptyState.jsx` (`title`/`hint`/`action`), `ErrorMessage.jsx` (`role="alert"`); extend barrel — FF-CL
- [ ] 3.3 Verify: `pnpm lint` + `pnpm build`; no new dep in lockfile (FF-CL "No new dependencies")

## Phase 4: S2c Behavior-Identical Refactor

- [ ] 4.1 Refactor `frontend/src/pages/Login.jsx`, `NewUser.jsx`, `MemberForm.jsx`, `MembersList.jsx` through the kit; purge emerald-600 (incl. `accent-emerald-600` checkbox) — FF-PK, FF-DT
- [ ] 4.2 Manual regression (UA-RG, pre-split): `/members`, `/members/new`, `/members/:id/edit`, `/users/new` still render; anonymous redirect to `/login` unchanged
- [ ] 4.3 Verify: `pnpm lint` + `pnpm build`

## Phase 5: S3 Shell, Routes, Public Pages

- [ ] 5.1 Create `frontend/src/layouts/AppShell.jsx`: lateral nav (Gestión de Usuarios, Miembros, Membresías/Pagos disabled + Badge "Próximamente", Cerrar sesión → logout → `/login`) + `<Outlet/>` — AS-DS, AS-DN, AS-LO, UA-CP
- [ ] 5.2 Create `frontend/src/pages/Landing.jsx` (logo + "Iniciar sesión" link, informational section, footer reserved-rights + offline note; no redirect anon or authed) — AS-PL
- [ ] 5.3 Create `frontend/src/pages/Dashboard.jsx` (hardcoded cards "Ingresos del mes", "Miembros activos", "Membresías vencidas"; zero API calls) — AS-DS
- [ ] 5.4 Rewrite `frontend/src/App.jsx`: remove Home; pathless `<Route element={<RequireAuth><AppShell/>}>` with children `dashboard`, `members*`, `users/new` — UA-RG
- [ ] 5.5 Swap `RequireAuth.jsx` loading for `LoadingSkeleton`; change `Login.jsx` redirects "/"→"/dashboard" (pre-login guard and post-login navigate) — UA-RG
- [ ] 5.6 Full UA-RG walkthrough: anon at protected route → `/login`; anon at `/` → landing; reload authed → skeleton, no flicker; authed at `/login` → `/dashboard`; logout → `/login`
- [ ] 5.7 Verify: `pnpm lint` + `pnpm build`

## Phase 6: S4 Brand & A11y Polish

- [ ] 6.1 Rework `frontend/public/favicon.svg` to lime/dark identity; no `#863bff` — FF-BC
- [ ] 6.2 Strip social leftovers from `frontend/public/icons.svg` (bluesky, discord, github, x, social, documentation symbols) — FF-BC
- [ ] 6.3 Grep `emerald` across `frontend/` → 0 hits — FF-DT "Emerald retired"
- [ ] 6.4 Verify: `pnpm lint` + `pnpm build`; favicon loads lime; icons.svg clean