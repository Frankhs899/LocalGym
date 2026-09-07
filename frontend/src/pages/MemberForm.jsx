import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { createMember, getMember, updateMember } from "../auth/api.js";

const DOCUMENT_TYPES = ["CC", "TI", "CE", "PA", "RC"];

const EMPTY_FORM = {
  document_type: "CC",
  document_number: "",
  first_name: "",
  last_name: "",
  birth_date: "",
  phone: "",
  email: "",
  address: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  medical_conditions: "",
  notes: "",
};

function fieldError(data, fallback) {
  if (!data || typeof data !== "object") {
    return fallback;
  }
  const firstKey = Object.keys(data)[0];
  const messages = firstKey ? data[firstKey] : null;
  if (Array.isArray(messages) && messages.length > 0) {
    return String(messages[0]);
  }
  return fallback;
}

export default function MemberForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) {
      return;
    }
    let cancelled = false;
    async function loadMember() {
      setLoading(true);
      setError(null);
      try {
        const member = await getMember(id);
        if (cancelled) {
          return;
        }
        setForm({
          document_type: member.document_type ?? "CC",
          document_number: member.document_number ?? "",
          first_name: member.first_name ?? "",
          last_name: member.last_name ?? "",
          birth_date: member.birth_date ?? "",
          phone: member.phone ?? "",
          email: member.email ?? "",
          address: member.address ?? "",
          emergency_contact_name: member.emergency_contact_name ?? "",
          emergency_contact_phone: member.emergency_contact_phone ?? "",
          medical_conditions: member.medical_conditions ?? "",
          notes: member.notes ?? "",
        });
        setIsActive(Boolean(member.is_active));
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.status === 404
              ? "El socio no existe."
              : "No se pudo cargar el socio. Inténtalo de nuevo.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadMember();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateMember(id, { ...form, is_active: isActive }, { partial: true });
      } else {
        await createMember(form);
      }
      navigate("/members", { replace: true });
    } catch (err) {
      if (err?.status === 400) {
        const detail = fieldError(err?.data, null);
        if (detail && /unique|already|exists|duplicado/i.test(detail)) {
          setError("Ya existe un socio con ese tipo y número de documento.");
        } else {
          setError(detail ?? "Revisa los datos ingresados.");
        }
      } else {
        setError("No se pudo guardar el socio. Inténtalo de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-lg text-zinc-400">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {isEdit ? "Editar socio" : "Nuevo socio"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
              Tipo de documento
              <select
                name="document_type"
                value={form.document_type}
                onChange={handleChange}
                required
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
              Número de documento
              <input
                name="document_number"
                type="text"
                autoComplete="off"
                value={form.document_number}
                onChange={handleChange}
                required
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
              Nombres
              <input
                name="first_name"
                type="text"
                autoComplete="off"
                value={form.first_name}
                onChange={handleChange}
                required
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
              Apellidos
              <input
                name="last_name"
                type="text"
                autoComplete="off"
                value={form.last_name}
                onChange={handleChange}
                required
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
              Fecha de nacimiento
              <input
                name="birth_date"
                type="date"
                value={form.birth_date}
                onChange={handleChange}
                required
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
              Teléfono
              <input
                name="phone"
                type="tel"
                autoComplete="off"
                value={form.phone}
                onChange={handleChange}
                required
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
              Correo electrónico (opcional)
              <input
                name="email"
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={handleChange}
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
              Dirección (opcional)
              <input
                name="address"
                type="text"
                autoComplete="off"
                value={form.address}
                onChange={handleChange}
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
              Contacto de emergencia
              <input
                name="emergency_contact_name"
                type="text"
                autoComplete="off"
                value={form.emergency_contact_name}
                onChange={handleChange}
                required
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
              Teléfono de emergencia
              <input
                name="emergency_contact_phone"
                type="tel"
                autoComplete="off"
                value={form.emergency_contact_phone}
                onChange={handleChange}
                required
                className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
            Condiciones médicas
            <textarea
              name="medical_conditions"
              value={form.medical_conditions}
              onChange={handleChange}
              rows={3}
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>

          <label className="flex flex-col gap-1 text-left text-sm text-zinc-300">
            Notas (opcional)
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            />
          </label>

          {isEdit ? (
            <label className="flex items-center gap-2 text-left text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Socio activo
            </label>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-emerald-600 px-3 py-2 font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear socio"}
            </button>
            <Link
              to="/members"
              className="rounded bg-zinc-800 px-3 py-2 text-sm font-medium text-white"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
