import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";

import { useAuth } from "../auth/useAuth.js";
import { Badge, Button, ErrorMessage } from "../components/index.js";

const NAV_LINK_BASE =
  "flex items-center justify-between gap-2 rounded-field px-3 py-2 text-body-md font-medium transition-colors duration-150 ease-app";

const NAV_LINK_TONES = {
  active: "bg-accent text-accent-ink",
  idle: "text-fog hover:bg-raised hover:text-paper",
};

/**
 * Authenticated shell: lateral nav + nested-route main area.
 *
 * Renders inside the pathless `RequireAuth` route in `App.jsx`, so every
 * child (`/dashboard`, `/members*`, `/users/new`) shares the sidebar.
 * `Membresías` and `Pagos` are disabled placeholders (no route registered);
 * "Cerrar sesión" runs the existing logout flow and lands on `/login`.
 */
export default function AppShell() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState(null);

  async function handleLogout() {
    setLogoutError(null);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="flex min-h-screen bg-base text-paper">
      <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-surface">
        <p className="px-5 pt-6 font-display text-display-md font-semibold tracking-tight">
          LocalGym
        </p>
        <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-1 p-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              [NAV_LINK_BASE, isActive ? NAV_LINK_TONES.active : NAV_LINK_TONES.idle].join(" ")
            }
          >
            Panel
          </NavLink>
          <NavLink
            to="/members"
            className={({ isActive }) =>
              [NAV_LINK_BASE, isActive ? NAV_LINK_TONES.active : NAV_LINK_TONES.idle].join(" ")
            }
          >
            Miembros
          </NavLink>
          <NavLink
            to="/users/new"
            className={({ isActive }) =>
              [NAV_LINK_BASE, isActive ? NAV_LINK_TONES.active : NAV_LINK_TONES.idle].join(" ")
            }
          >
            Gestión de Usuarios
          </NavLink>
          <button
            type="button"
            disabled
            className={`${NAV_LINK_BASE} cursor-not-allowed opacity-60`}
          >
            Membresías
            <Badge tone="zinc">Próximamente</Badge>
          </button>
          <button
            type="button"
            disabled
            className={`${NAV_LINK_BASE} cursor-not-allowed opacity-60`}
          >
            Pagos
            <Badge tone="zinc">Próximamente</Badge>
          </button>
        </nav>
        <div className="flex flex-col gap-2 border-t border-line p-4">
          {logoutError ? <ErrorMessage message={logoutError} /> : null}
          <Button variant="ghost" onClick={handleLogout} className="w-full">
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
