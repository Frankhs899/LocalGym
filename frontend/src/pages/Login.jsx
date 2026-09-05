import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { useAuth } from "../auth/AuthContext.jsx";

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
        <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
          Usuario
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-emerald-600 px-3 py-2 font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
