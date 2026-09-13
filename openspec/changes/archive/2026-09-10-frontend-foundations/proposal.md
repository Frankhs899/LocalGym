# Proposal: Frontend Foundations (Identity, Tokens, Components, Shell)

## Intent

Frontend sits on Tailwind defaults: no design tokens, no shared components, no nav shell; every page duplicates field/button class strings and `/` is a bare auth-gated link list behind a login wall. The confirmed Dark Fitness / Athletic Premium brief (near-black surfaces, lime `#D4FF3F` accent, boutique-gym positioning) needs a token layer, an in-house component kit, and a public + protected shell so every future screen inherits the identity instead of re-implementing it.

## Scope

### In Scope
- Tailwind 4 `@theme` token foundation in `frontend/src/index.css` (verified CSS-first syntax: `--color-*`, `--font-*`, `--radius-*`, `--ease-*`; no `tailwind.config.js`). Palette per `design/frontend-palette`: bg `#0A0A0C`, surface `#141417`, surface-raised `#1D1D21`, border `#2A2A30`, text `#F5F5F7`, muted `#9A9AA3`; lime `#D4FF3F` (hover `#C4F02E`, active `#AADB1F`, ink `#0A0A0C`, muted `#B8C96E`); success `#4ADE80`, warning `#FBBF24`, danger `#F87171`
- 9 in-house components in `src/components/` (Button, Field, Card, Table, Badge, Modal, LoadingSkeleton, EmptyState, ErrorMessage), plain JS + JSDoc contracts. **Not** shadcn/ui
- Public Landing `/`: header (logo + "Iniciar sesión"), informational section, footer with reserved-rights + offline-operation note
- Login `/login`: centered card (Usuario, Contraseña, "Ingresar"); session+CSRF flow untouched
- Dashboard shell: hardcoded metric cards ("Ingresos del mes", "Miembros activos", "Membresías vencidas"), sidebar nav (Gestión de Usuarios, Miembros, Membresías, Pagos, Cerrar sesión), react-router nested routes + `<Outlet/>`; Membresías/Pagos links disabled with "Próximamente" badge — no dead routes
- Routing split: public group (`/`, `/login`) vs protected subtree; dashboard home at `/dashboard`; `/members*` + `/users/new` move under the shell
- Brand coherence: replace purple `public/favicon.svg` (`#863bff`), clean social-leftover icons from `public/icons.svg`
- Accessibility: programmatic WCAG AA contrast check before locking tokens; visible keyboard focus; `prefers-reduced-motion`

### Out of Scope
- Real metrics backend; memberships/payments features; English UI copy; shadcn/ui or any new component dependency; logo redesign beyond favicon

## Capabilities

### New Capabilities
- `frontend-foundations`: design tokens, component library, a11y contract
- `app-shell`: public landing, login card, protected dashboard shell + navigation

### Modified Capabilities
- `user-auth`: **Frontend Route Guarding** — `/` becomes public (no redirect); authenticated-at-`/login` redirects to `/dashboard`; protected subtree still redirects anonymous → `/login`. **Spanish UI Copy** extended with shell nav labels

## Approach

- `@theme` block in `frontend/src/index.css`; existing utility classes migrate to tokens
- Typography — **user picks 1 of 3 at design**: (1) condensed athletic display + clean body (two-family); (2) single expanded athletic grotesque (e.g. Archivo / Space Grotesk); (3) full-range condensed streetwear (Barlow Condensed + Barlow). Avoid templated tells: no all-caps eyebrows, middle-dot metas, mono small labels, trailing arrows, soft card shadows — dark+neon earned via deliberate type/layout
- Lime reserved for CTAs, active states, key highlights; toned variant for text-on-dark AA pairing; single memorable element per screen
- Refactor Login, NewUser, MemberForm, MembersList through the kit — behavior-identical
- Fonts self-hosted (offline-first)
- **Size forecast**: exceeds the 400-line review budget → chained PRs expected (tokens → components+refactor → shell+routes → brand/a11y polish)

## Affected Areas

| Area | Impact | Change |
|------|--------|--------|
| `frontend/src/index.css` | Modified | `@theme` tokens, brand fonts |
| `frontend/src/App.jsx` | Modified | public/protected route split |
| `frontend/src/pages/*.jsx` | Modified | refactor via component kit |
| `frontend/src/auth/RequireAuth.jsx` | Modified | loading state, redirect target |
| `frontend/src/components/*` | New | 9-component library |
| `frontend/src/layouts/AppShell.jsx` | New | dashboard shell + sidebar |
| `frontend/src/pages/Landing.jsx`, `Dashboard.jsx` | New | public landing; placeholder metrics |
| `frontend/public/favicon.svg`, `icons.svg` | Modified | lime identity, cleanup |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Lime fatigue ("arcade" feel) | Med | accent only on CTAs/active; quiet discipline elsewhere |
| Lime-on-dark contrast fails AA | Med | programmatic check before token lock; adjust hover/active |
| No frontend test runner | High (known) | `pnpm lint` + `pnpm build` gates; manual verify per slice |
| Refactor regression on working pages | Med | behavior-identical slices; chained PRs protect review |
| Routing-guard regression | Med | user-auth delta scenarios as manual checklist |

## Rollback Plan

Frontend-only, commit-reversible. Revert per-PR on the feature chain; delete `@theme` block to drop tokens; restore old `App.jsx` (single commit) to undo the routing split. No data or migrations touched.

## Dependencies

- None new — Tailwind 4 + react-router 8 already installed. Web fonts self-hosted (Google Fonts as dev fallback)

## Success Criteria

- [ ] `/` renders public landing unauthenticated; `/login` flow intact; authed-at-login → `/dashboard`
- [ ] All pages consume kit; no duplicated field/button class strings
- [ ] Lime/text pairs pass WCAG AA (programmatic check committed)
- [ ] Membresías/Pagos render disabled links with badge, no dead routes
- [ ] favicon + icons lime-coherent; `pnpm lint` + `pnpm build` green