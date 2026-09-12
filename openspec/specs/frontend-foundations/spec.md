# Frontend Foundations Specification

## Purpose

Design-token layer, in-house component kit, typography, brand coherence, and accessibility contract for the Dark Fitness / Athletic Premium identity (near-black surfaces, lime `#D4FF3F` accent). Every future screen MUST inherit tokens and kit instead of re-implementing them.

## Requirements

### Requirement: Design Token Foundation

The system MUST define the approved palette via a Tailwind 4 CSS-first `@theme` block in `frontend/src/index.css` (no `tailwind.config.js`): neutrals bg `#0A0A0C`, surface `#141417`, surface-raised `#1D1D21`, border `#6E6E79`, text `#F5F5F7`, text-muted `#9A9AA3`; lime accent `#D4FF3F`, hover `#C4F02E`, active `#AADB1F`, ink `#0A0A0C`, muted `#B8C96E`; semantics success `#4ADE80`, warning `#FBBF24`, danger `#F87171`. The legacy emerald-600 accent MUST be retired from components and pages.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Tokens resolve | frontend builds with Tailwind 4 | `@theme` block present in index.css | all palette tokens resolve as utilities (bg, text, surface, accent) |
| Emerald retired | pages/components present | codebase scanned for emerald-600 | no remaining emerald-600 references |

### Requirement: Component Library

The system MUST provide 9 in-house components in `src/components/` — Button, Field, Card, Table, Badge, Modal, LoadingSkeleton, EmptyState, ErrorMessage — as plain JavaScript with JSDoc contracts. The library MUST NOT add shadcn/ui or any new component dependency.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Kit available | the frontend repo | components imported by pages | each component renders with documented props |
| No new dependencies | lockfile before the change | pnpm install runs | lockfile gains no UI dependency |

### Requirement: Pages Consume the Kit

Existing screens (Login, NewUser, MemberForm, MembersList) MUST render through the kit with behavior identical to today. The system MUST NOT duplicate form-field or button class strings across pages.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Behavior-identical refactor | working pages | pages refactored through kit | identical behavior; `pnpm lint` and `pnpm build` green |
| No duplication | any two pages with form fields | codebase scanned | field/button class strings live only inside the kit |

### Requirement: Design Token Usage Rules

Lime MUST be reserved for primary actions, active states, and key metrics, and MUST NOT be used as body text. Lime surfaces MUST pair with ink `#0A0A0C` text. Surfaces MUST use hairline borders; soft grey shadows MUST NOT be used.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Accent discipline | a screen with a lime CTA | screen renders | lime only on CTA/active/key number; body text uses text or text-muted |
| Readable lime | a primary button | it renders | ink text on lime background |

### Requirement: Typography Identity

The system MUST implement the confirmed direction — condensed athletic display typeface + clean neutral body (concrete families settled at design) — with fonts self-hosted for offline-first operation. Display MUST be used for headings and key metrics; body font for content.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Athletic display | a headline renders | dashboard/landing renders | heading uses condensed display face; body uses clean sans |

### Requirement: Accessibility Contract

Interactive elements MUST show visible keyboard focus. Motion MUST respect `prefers-reduced-motion`. All lime/text and semantic color pairs MUST pass WCAG AA (≥ 4.5:1 normal text, ≥ 3:1 large text/UI), verified by a programmatic contrast check committed before token values are locked.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Contrast gate | candidate palette in `@theme` | programmatic AA check runs | every pair passes; failing pairs adjusted before lock |
| Keyboard focus | a Button or Field receives Tab focus | focus lands | visible focus indicator renders |
| Reduced motion | OS prefers-reduced-motion | motion-triggering screen renders | non-essential motion suppressed |

### Requirement: Brand Coherence

The favicon MUST be reworked from purple `#863bff` to the lime identity, and `public/icons.svg` MUST drop template social leftovers.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Lime favicon | browser opens the app | favicon loads | favicon uses lime/dark palette; no `#863bff` |
| Cleaned icons | public/icons.svg | file reviewed | no social-media icons remain |