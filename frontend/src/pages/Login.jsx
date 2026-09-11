import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { useAuth } from "../auth/useAuth.js";
import { Button, ErrorMessage, Field } from "../components/index.js";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
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
