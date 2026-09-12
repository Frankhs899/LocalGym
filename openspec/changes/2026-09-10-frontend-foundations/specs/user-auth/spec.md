# Delta for user-auth

## MODIFIED Requirements

### Requirement: Frontend Route Guarding

Protected routes (`/dashboard` subtree, `/members*`, `/users/new`) MUST redirect unauthenticated users to `/login`; `/login` MUST redirect authenticated users to `/dashboard`. `/` MUST render the public landing for everyone with no redirect. Auth state MUST load on mount via AuthContext `me()` with a loading state, so reloads flash neither content nor login page.
(Previously: `/` was a protected Home; authenticated users at `/login` redirected to `/`)

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Anonymous redirected | no session, protected route | app mounts | redirected to /login |
| Public landing | no session | user visits `/` | public Landing renders; no redirect |
| Authenticated access | an authenticated session | app mounts, `me()` resolves | protected subtree renders instead of /login |
| Authenticated at /login | an authenticated session | user visits /login | redirected to /dashboard |
| Reload flicker | authenticated session, reload | app mounts while `me()` pending | loading state; no redirect until `me()` resolves |

### Requirement: Spanish UI Copy

Login, landing, dashboard shell, and user-creation screens MUST use Spanish UI copy, including logout labeled "Cerrar sesión", shell nav labels ("Gestión de Usuarios", "Miembros", "Membresías", "Pagos"), the "Próximamente" badge, and the "Ingresar" login button.
(Previously: only login and user-creation screens were covered)

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Spanish screens | the frontend app | login page, new-user screen ("Nuevo usuario"), landing, shell nav, badge, "Ingresar" render | their copy is in Spanish |