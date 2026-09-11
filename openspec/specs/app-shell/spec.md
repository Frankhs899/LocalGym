# App Shell Specification

## Purpose

Public-facing and authenticated shell: a public landing + login for anonymous visitors, and a protected dashboard shell hosting all authenticated routes via react-router nested routes. Offline-first, Spanish UI copy, hardcoded placeholders only — no metrics backend.

## Requirements

### Requirement: Public Landing

`/` MUST render a public landing without authentication: header with LocalGym logo and an "Iniciar sesión" link, an informational section, and a footer with reserved-rights text plus an offline-operation note. Anonymous visitors MUST NOT be redirected.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Anonymous landing | no session | user visits `/` | landing renders; no redirect; "Iniciar sesión" link visible |
| Offline-operation note | landing renders | footer visible | reserved-rights text AND offline-operation note displayed |
| Authenticated at `/` | an authenticated session | user visits `/` | landing still renders; no redirect |

### Requirement: Login Page

`/login` MUST render a centered card with "Usuario" and "Contraseña" fields and a prominent "Ingresar" button, keeping the existing session + CSRF flow untouched.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Login card | anonymous user | user visits `/login` | card with Usuario/Contraseña/Ingresar renders |
| Session flow unchanged | valid credentials | user submits the form | POST /api/auth/login succeeds; session and CSRF cookies set |

### Requirement: Dashboard Shell

The authenticated subtree MUST live under `/dashboard` inside a shell with lateral nav (Gestión de Usuarios, Miembros, Membresías, Pagos, Cerrar sesión) and a modular main area driven by nested routes with an `<Outlet/>`. `/members*` and `/users/new` MUST render inside the shell. The dashboard home MUST show hardcoded placeholder metric cards "Ingresos del mes", "Miembros activos", "Membresías vencidas" with no backend call.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Shell renders | authenticated session | user visits `/dashboard` | sidebar and main area render; metric cards show placeholders |
| Nested route | authenticated session | user navigates to `/members` | MembersList renders inside the shell; sidebar persists |
| No backend call | dashboard home | it mounts | no API request; values are hardcoded placeholders |

### Requirement: Disabled Nav Items (No Dead Routes)

Membresías and Pagos nav items MUST render disabled with a "Próximamente" badge; activating them MUST NOT navigate or change the route.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Membresías disabled | dashboard shell renders | user activates Membresías | no navigation; "Próximamente" badge visible; no route rendered |
| Pagos disabled | dashboard shell renders | user activates Pagos | no navigation; "Próximamente" badge visible; no route rendered |

### Requirement: Logout from Shell

The shell MUST expose a "Cerrar sesión" control that triggers the existing logout flow and lands on `/login`.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Logout | authenticated session | user activates Cerrar sesión | session destroyed; user redirected to `/login` |