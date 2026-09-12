import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

import { useAuth } from "../auth/useAuth.js";
import { Button, ErrorMessage, Field, LoadingSkeleton } from "../components/index.js";

/**
 * Resolve the post-login redirect target from `RequireAuth`'s `state.from`.
 *
 * Falls back to `/dashboard` for direct visits and rejects anything that is
 * not a same-origin path, so a forged location state can never turn the
 * login form into an open redirect.
 *
 * @param {unknown} from Raw `location.state?.from` value.
 * @returns {string} Safe redirect target.
 */
function resolveRedirectTarget(from) {
  if (typeof from === "string" && from.startsWith("/") && !from.startsWith("//")) {
    return from;
  }
  return "/dashboard";
}

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = resolveRedirectTarget(location.state?.from);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base px-4">
        <div className="w-full max-w-sm">
          <LoadingSkeleton lines={3} label="Cargando..." />
        </div>
      </main>
    );
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(redirectTo, { replace: true });
    } catch {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-base px-4">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-sm flex-col gap-4">
        <Field label="Usuario" name="username">
          <input
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </Field>
        <Field label="Contraseña" name="password">
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>
        {error ? <ErrorMessage message={error} /> : null}
        <Button type="submit" loading={submitting}>
          {submitting ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </main>
  );
}
