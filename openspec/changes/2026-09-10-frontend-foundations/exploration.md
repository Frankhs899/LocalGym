# Exploration: Frontend Foundations (Laying UI/Design Foundations)

## Confirmed Design Direction (user brief)

The user has confirmed the following visual/branding direction. This brief supersedes any default or speculative design choices and is the authoritative source for all UI design decisions in this exploration and subsequent phases.

- **Style**: Dark Fitness / Athletic Premium
- **Palette**: Black and dark tones dominant, contrasted with a vibrant lime-yellow accent (`#D4FF3F` or similar) as the sole accent color
- **Feel**: Energy, intensity, controlled aggression
- **Positioning**: NOT a generic neighborhood gym — positioned as premium, motivational, results-oriented
- **References**: Brands like Gymshark, Nike Training, boutique crossfit/HIIT studios. "Boutique gym" / "performance brand"

**Note on the dark+neon direction**: The frontend-design skill identifies the "near-black background with a single bright acid-green or vermilion accent" as one of five common AI-generated tells. The user has explicitly opted into this aesthetic. This is a legitimate, intentional choice — but it means execution must avoid the *other* templated tells (all-caps eyebrows, middle-dot meta strings, monospace small labels, trailing arrows on links/buttons, soft-grey `rgba(0,0,0,.1)` card shadows). The dark+neon look must be earned through distinctive typography, deliberate layout, and purposeful motion — not defaulted into via utility-class stacking.

## Current State

The LocalGym frontend is a React 19 + Vite 8 + Tailwind 4 + react-router 8 SPA with plain JavaScript (no TypeScript). It ships four pages (`Login`, `MembersList`, `MemberForm`, `NewUser`) built during the completed `member-management` change. The auth layer (`AuthContext`, `useAuth`, `RequireAuth`, `api.js`) provides session-based auth with CSRF handling.

**How Tailwind is used:** `index.css` contains only `@import 'tailwindcss';`. There is no `tailwind.config.js`, no `@theme` block, no custom CSS beyond that import. Tailwind runs at its defaults — the `zinc` grayscale palette, the default sans-serif font, no custom colors, no spacing scale customization, no font-family declarations. All visual customization is done via inline Tailwind utility classes in JSX components.

**Visual identity today:** Dark theme throughout (`bg-zinc-950`, `text-white`, `text-zinc-300`), `emerald-600` as the sole accent color for primary actions, `zinc-800`/`zinc-900` for card/input backgrounds. Every page is a standalone `<main>` element centered with flexbox — no shared layout shell, no navigation bar, no sidebar, no header component.

**Shared component pattern:** Zero shared components exist. Every form field is written inline with the same repeated class string: `rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white`. Buttons follow two patterns (emerald-600 primary, zinc-800 secondary). Status badges use hardcoded color classes (`text-emerald-400`, `text-red-400`, `text-zinc-400`).

**Routing/navigation:** `App.jsx` defines 5 routes with `RequireAuth` guarding all except `/login`. No navigation component exists — links are scattered inline in each page. The home page (`/`) has a simple heading + links. There is no navbar, no breadcrumbs, no page layout wrapper.

### Affected Areas

- `frontend/src/index.css` — Only `@import 'tailwindcss';`; no `@theme`, no custom styles, no design-token declarations
- `frontend/src/App.jsx` — Router shell; each route renders a standalone page with no layout wrapper
- `frontend/src/pages/*.jsx` (Login, MembersList, MemberForm, NewUser) — All contain duplicated layout patterns, duplicated form-field markup, duplicated button patterns
- `frontend/src/auth/RequireAuth.jsx` — Loading state renders a bare `<main>` with "Cargando..."; no skeleton or spinner
- `frontend/package.json` — Tailwind 4 + `@tailwindcss/vite` plugin; no design-system dependencies
- `frontend/vite.config.js` — Standard Vite + Tailwind v4 setup; no custom configuration
- `frontend/src/auth/api.js` — API client; relevant for future data-fetching patterns in shared components
- `frontend/public/favicon.svg` — Purple gradient (`#863bff`) logo; does not match the confirmed lime accent direction

### Approaches

1. **Design-token/theme foundation + Tailwind theme config only**
   - Pros: Single source of truth for colors, spacing, typography; minimal runtime overhead; Tailwind 4's `@theme` directive integrates cleanly into CSS; all existing components automatically inherit tokens; no new dependencies
   - Cons: Doesn't address the component-layer problem — every page still duplicates form-field, button, and table markup; no shared empty/error/loading states; doesn't solve the layout shell gap
   - Effort: Low (1-2 days)

2. **Token foundation + small in-house shared component library (Button, Input/Field, Card, Table, Badge, Modal)**
   - Pros: Eliminates duplication across all pages; creates a consistent component API; enables empty/error/loading state variants; shared components can enforce accessibility patterns (keyboard focus, reduced motion); the design-token layer composes naturally into components; gives full control over the dark+lime identity without depending on external component libraries
   - Cons: Initial effort is higher than tokens alone; requires discipline to route all pages through shared components; component API design needs upfront thought; plain-JS project means no TypeScript enforcement of component contracts
   - Effort: Medium (3-5 days)

3. **Adopt an existing component library (shadcn/ui or similar)**
   - Pros: Rich pre-built components; good accessibility built-in; active community
   - Cons: shadcn/ui relies on TypeScript and `class-variance-authority`/`clsx` patterns that add complexity to a plain-JS project; Tailwind 4 compatibility is still maturing; adds bundle weight and dependency churn; introduces an opinionated component API that may conflict with the project's simple, direct-JSX approach; the premium dark+fitness identity would still need customization on top — and the library's default styling would fight the bold accent direction
   - Effort: Medium-High (setup + adaptation + customization), high ongoing maintenance friction
   - Additional risks: `@radix-ui` primitives dependency tree; TypeScript-adjacent patterns bleeding into plain JS; the project explicitly avoids TS — adding type-heavy tooling contradicts that decision

4. **Full layout/navigation shell rebuild**
   - Pros: Solves the missing nav/layout gap completely; can incorporate design tokens and components together
   - Cons: Highest effort; most disruptive; risks reworking already-functional pages; premature without first establishing the design language
   - Effort: High (5-7+ days)

### Recommendation

**Combine approaches 1 and 2**, with the confirmed design direction as the driving constraint:

1. Establish a design-token foundation (Tailwind `@theme` in `index.css`) configured specifically for the **Dark Fitness / Athletic Premium** identity: black/dark dominant palette (`black`, `zinc-950`, `zinc-900`), lime-yellow accent (`#D4FF3F`) for primary actions, CTAs, active states, and key highlights; text colors that ensure readability on dark surfaces; typography scale with a bold, athletic typeface that has character (not Inter/Roboto).
2. Build a small in-house shared component library (`Button`, `Field`, `Card`, `Table`, `Badge`, `LoadingSkeleton`, `EmptyState`, `ErrorMessage`) that implements the dark+lime identity consistently and avoids the templated tells.

**Why not shadcn/ui:** The project is plain JavaScript with no TypeScript, no `clsx`/`cva` in the lockfile. Adding shadcn introduces a dependency tree (`class-variance-authority`, `clsx`, `@radix-ui` primitives) that contradicts the minimal setup. Additionally, shadcn's component styling would fight the bold dark+lime direction rather than serve it.

**Why not full shell rebuild:** Without first defining the visual language (tokens, typography, spacing), a shell rebuild would just replicate generic patterns at larger scale. The token + component approach gives the design language meaning before adding layout complexity.

**Design execution principles (per the confirmed brief + frontend-design skill):**
- The dark+neon look is **intentional, not a default** — it must be executed with deliberate typography, not utility-class stacking
- Avoid the other AI-generated tells: all-caps eyebrows, middle-dot meta strings, monospace small labels, trailing arrows on links/buttons, soft-grey card shadows
- Typography carries the personality: one bold typeface with character (think athletic/performance), a clear type scale following typographic principles
- Line lengths under 80 characters; serif body gets more line-height if serif is chosen
- Non-user-triggered motion used sparingly — one orchestrated page-load moment, not scattered entrance animations
- Motion that answers the user's action (opening, expanding, confirming) is welcome
- UI copy remains Spanish; SPA routes remain English; code identifiers remain English
- Single memorable element, everything else quiet and disciplined

**First-slice scope recommendation:**
1. Add `@theme` block in `index.css` defining: color palette (black/dark dominant, lime `#D4FF3F` accent, semantic: lime for success/active, red for error, muted tones for secondary text), typography scale (one font family with character — athletic/performance voice), spacing scale, border-radius tokens
2. Create `src/components/` with: `Button` (primary = lime accent, secondary = dark outline), `Field` (label + input/select/textarea wrapper with error display), `Card` (dark surface, no soft shadow), `Table` (dark header, lime hover states), `Badge` (status indicators in lime/red), `LoadingSkeleton`, `EmptyState`, `ErrorMessage`
3. Refactor `Login` and `NewUser` pages to use `Button` and `Field`
4. Refactor `MemberForm` to use `Field` and `Button`
5. Add a minimal layout shell (`Layout` component) with a top nav bar featuring the lime accent
6. Refactor `MembersList` to use `Table`, `Badge`, `Button`
7. Address the `favicon.svg` purple/identity mismatch (separate decision — the favicon should be updated to match the lime accent direction)

This gives a complete foundation: tokens → components → pages. Each subsequent domain screen (memberships, payments, dashboard) inherits the system.

### Risks

- **Scope creep:** "Foundations" can balloon into a full design system. The first slice must be bounded — tokens + 6-8 core components + refactoring existing 4 pages
- **Plain-JS component patterns:** Without TypeScript, component API contracts rely on convention and documentation. JSDoc type annotations in plain JS can provide some guardrails
- **Tailwind 4 `@theme` syntax:** Tailwind 4 uses a new CSS-first configuration model; the `@theme` directive syntax differs from v3's `tailwind.config.js`. Need to verify the exact CSS-layer configuration approach
- **Refactoring existing working code:** The current pages work and pass `pnpm lint`. Refactoring introduces risk of regressions. Must use `pnpm lint` + `pnpm build` as guardrails
- **No test coverage on frontend:** With no Vitest/Jest, component refactoring relies entirely on manual verification + `pnpm build`. This is a known gap in the project (documented in `openspec/config.yaml`)
- **Contrast/accessibility on dark surfaces:** Lime-yellow (`#D4FF3F`) on pure black may have excessive contrast or color-shift issues at small font sizes. Need to verify WCAG AA contrast ratios for body text and UI elements. The accent may need a toned-down variant (`#B8E830` or similar) for text-on-dark use, with pure lime reserved for large elements (CTAs, borders, icons)
- **Brand coherence with the purple favicon:** The `favicon.svg` uses `#863bff` (purple gradient) which directly conflicts with the confirmed lime direction. This is a broader branding decision that should be resolved in a separate step — the favicon and logo must be updated to match the dark+lime identity
- **`icons.svg` contains unrelated social icons:** The `public/icons.svg` has Bluesky, Discord, GitHub, X icons — leftovers from a template. Should be cleaned or replaced with gym-relevant iconography, but that's out of scope for foundations
- **Lime accent fatigue:** The bold lime-on-black palette is inherently high-contrast and energetic. The design must use the accent sparingly and deliberately (per the frontend-design skill) — overuse of the lime turns "premium performance" into "retro arcade"

### Ready for Proposal

**Yes.** This exploration identifies concrete problems (zero design tokens, zero shared components, no layout shell, duplicated markup, no empty/error/loading states, identity inconsistency between the purple favicon and the confirmed lime direction) and proposes a bounded, phased approach grounded in the user's confirmed design brief. The orchestrator should present this to the user and confirm:

1. The design-token + in-house component approach (vs. adopting a library) — **confirmed by user brief**
2. The first-slice scope (tokens + 8 components + refactoring existing pages + layout shell)
3. Resolution of the favicon/brand identity mismatch (purple favicon vs. lime direction) — recommended as a separate, small follow-up task
4. Accessibility verification of lime-on-dark contrast ratios before proceeding to implementation
