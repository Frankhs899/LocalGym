# Design: Frontend Foundations (Identity, Tokens, Components, Shell)

## Technical Approach

CSS-first Tailwind v4 `@theme` tokens in `frontend/src/index.css` (verified syntax — no config file); a 9-component plain-JS kit in `src/components/` with JSDoc contracts; a pathless protected layout (`RequireAuth` + `AppShell` + `<Outlet/>`) keeping existing `/members*` and `/users/new` URLs while adding public `/` landing, `/login` card, and `/dashboard` home with hardcoded placeholders. Existing pages refactor onto the kit behavior-identically. Implements `frontend-foundations`, `app-shell`, and the `user-auth` route-guard delta.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Semantic token names (`base/surface/paper/fog/accent`) vs palette-literal names | Literals leak hex intent; semantics read at call site | Semantic `--color-*`: `base #0A0A0C`, `surface #141417`, `raised #1D1D21`, `line #6E6E79`, `paper #F5F5F7`, `fog #9A9AA3`, `accent #D4FF3F`, `accent-hover #C4F02E`, `accent-active #AADB1F`, `accent-ink #0A0A0C`, `accent-muted #B8C96E`, `success/warning/danger` per spec |
| Display Oswald + body Inter (variable, @fontsource) vs Google CDN vs system stack | CDN breaks offline-first; system stack loses athletic voice | `@fontsource-variable/oswald` (headings, logo, metrics; semibold–bold, tight tracking) + `@fontsource-variable/inter` (labels, tables, descriptions); latin-ext, bundled. Alt: Barlow Condensed + Barlow |
| One file per component + `index.js` barrel vs single `ui.jsx` | Single file blurs contracts, inflates diffs | `src/components/<Name>.jsx` + barrel; JSDoc `@typedef` unions for variants (plain JS, no TS) |
| Pathless protected layout preserving URLs vs moving everything under `/dashboard/*` | URL move breaks bookmarks, riskier diff | Pathless `<Route element={<RequireAuth><AppShell/>}>` with children `dashboard`, `members*`, `users/new`; sidebar links to existing URLs + `/dashboard` |
| Committed Node contrast-gate script vs eyeballing | Eyeballing fails the AA spec gate | `frontend/scripts/check-contrast.mjs` (relative-luminance ratios, exit non-zero); likely adjustments: `accent-muted` restricted to large/UI use, `danger` text checked on `surface` |
| Disabled nav as `<button disabled>` + Badge vs placeholder routes | Placeholder routes are dead routes, fail spec | Disabled button + `Badge` "Próximamente"; no route registered |

Type scale: display 30/24/20, body 16/14/13; `--radius-field .5rem`, `--radius-card .75rem`; hairline `border-line`, no soft shadows; lime only on CTAs, active nav, key numbers; lime surfaces pair `accent-ink` text.

## Data Flow

```
Anon ──→ `/` ──→ `/login` ──→ POST /api/auth/login ──→ `/dashboard`
Authed ──→ pathless layout (RequireAuth→AppShell→Outlet) ──→ Dashboard|Members|NewUser
         └─ Vite `/api` proxy; session + CSRF on writes (unchanged)
```

```mermaid
sequenceDiagram
  Browser->>App: GET /login (authed) | GET /dashboard (anon)
  App->>AuthContext: me() pending → skeleton; resolved?
  AuthContext-->>Browser: authed→/dashboard | anon→/login (no flicker)
  Browser->>API: POST /api/auth/login/ {username, password}
  API-->>Browser: session + CSRF cookies; App navigates /dashboard
```

## File Changes

| File | Action | Description |
|---|---|---|
| `frontend/src/index.css` | Modify | `@theme` tokens, font vars, focus-visible ring, reduced-motion base |
| `frontend/src/main.jsx` | Modify | Import the two fontsource variable CSS files |
| `frontend/package.json` | Modify | Add `@fontsource-variable/oswald`, `@fontsource-variable/inter` |
| `frontend/scripts/check-contrast.mjs` | Create | WCAG AA gate; run before token lock |
| `frontend/src/components/*.jsx` + `index.js` | Create | 9 kit components + barrel (Button, Field, Card, Table, Badge, Modal, LoadingSkeleton, EmptyState, ErrorMessage) |
| `frontend/src/layouts/AppShell.jsx` | Create | Lateral nav + `<Outlet/>` main area |
| `frontend/src/pages/Landing.jsx`, `Dashboard.jsx` | Create | Public landing; hardcoded metric placeholders, no API calls |
| `frontend/src/App.jsx` | Modify | Public/private split; Home removed; pathless protected layout |
| `frontend/src/auth/RequireAuth.jsx` | Modify | LoadingSkeleton state; guard unchanged |
| `frontend/src/pages/Login.jsx` | Modify | Kit card; authed redirect → `/dashboard` |
| `frontend/src/pages/MemberForm.jsx`, `MembersList.jsx`, `NewUser.jsx` | Modify | Behavior-identical kit refactor; emerald purged |
| `frontend/public/favicon.svg`, `icons.svg` | Modify | Lime identity; drop social leftovers |

## Interfaces / Contracts

Button `{variant: primary|secondary|ghost|danger, size: sm|md, loading?, …props}` — primary is lime bg + ink text. Field `{label, name, error?, hint?, children}` renders `<label>` with `aria-invalid`/`aria-describedby`. Table `{columns: [{key, header, render?}], rows, keyOf}`. Badge `{tone: lime|red|zinc|amber}`. Modal `{open, onClose, title}` — focuses close on open, Esc closes, `aria-modal`. Skeleton/EmptyState `{title, hint?, action?}`; ErrorMessage `{message, role: alert}`. UI strings Spanish; routes/identifiers English.

```js
/** @typedef {"primary"|"secondary"|"ghost"|"danger"} ButtonVariant */
/** @param {{variant?: ButtonVariant, size?: "sm"|"md", loading?: boolean} & import("react").ButtonHTMLAttributes<HTMLButtonElement>} props */
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Tokens | All lime/semantic pairs pass AA | `node scripts/check-contrast.mjs` exit 0 before lock |
| Static | No regressions, no emerald | `pnpm lint` + `pnpm build` green per slice; grep emerald → zero hits |
| Manual | Spec scenarios (anon landing, login→dashboard, redirects, skeleton, disabled nav, logout, placeholders, favicon) | Walkthrough checklist per slice (no frontend runner) |

## Migration / Rollout

No migration; frontend-only, chain-reversible. Feature Branch Chain, each slice <400 lines: **S1** tokens+fonts+contrast script (~180) → **S2a** kit Button/Field/Card/Badge (~200) → **S2b** kit Table/Modal/Skeleton/EmptyState/ErrorMessage (~250) → **S2c** page refactor, net deletions (~200) → **S3** shell+routes+landing+dashboard (~300) → **S4** brand/a11y polish + emerald purge (~80). S2c waits for S2a/S2b; S3 waits for S2.

## Open Questions

- None blocking; `accent-muted` final role pending S1 script result.
