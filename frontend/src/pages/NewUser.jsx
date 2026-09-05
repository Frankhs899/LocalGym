import { useState } from "react";

import { createUser } from "../auth/api.js";
import { useAuth } from "../auth/useAuth.js";

export default function NewUser() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user?.is_superuser) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Nuevo usuario</h1>
        <p className="mt-2 text-lg text-red-400">No tienes permiso para crear usuarios.</p>
      </main>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const created = await createUser(username, password);
      setSuccess(`Usuario "${created.username}" creado correctamente.`);
      setUsername("");
      setPassword("");
    } catch (err) {
      if (err?.status === 400 && err?.data?.username) {
        setError("Ese nombre de usuario ya está en uso.");
      } else {
        setError("No se pudo crear el usuario. Inténtalo de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Nuevo usuario</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-sm flex-col gap-4">
        <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
          Usuario
          <input
            type="text"
            autoComplete="off"
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
            autoComplete="new-password"
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
        {success ? (
          <p role="status" className="text-sm text-emerald-400">
            {success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-emerald-600 px-3 py-2 font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Creando..." : "Crear usuario"}
        </button>
      </form>
    </main>
  );
}
