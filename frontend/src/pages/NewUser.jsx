import { useState } from "react";

import { createUser } from "../auth/api.js";
import { useAuth } from "../auth/useAuth.js";
import { Button, ErrorMessage, Field } from "../components/index.js";

export default function NewUser() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user?.is_superuser) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-base px-4 text-center">
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-base px-4">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Nuevo usuario</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-sm flex-col gap-4">
        <Field label="Usuario" name="username">
          <input
            name="username"
            type="text"
            autoComplete="off"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </Field>
        <Field label="Contraseña" name="password">
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>
        {error ? <ErrorMessage message={error} /> : null}
        {success ? (
          <p role="status" className="text-sm text-success">
            {success}
          </p>
        ) : null}
        <Button type="submit" loading={submitting}>
          {submitting ? "Creando..." : "Crear usuario"}
        </Button>
      </form>
    </main>
  );
}
