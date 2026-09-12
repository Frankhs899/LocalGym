import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { createMember, getMember, updateMember } from "../auth/api.js";
import { Button, ErrorMessage, Field, LoadingSkeleton } from "../components/index.js";

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
      <main className="min-h-screen bg-base px-4 py-8">
        <div className="mx-auto w-full max-w-2xl">
          <LoadingSkeleton lines={6} label="Cargando..." />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {isEdit ? "Editar socio" : "Nuevo socio"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo de documento" name="document_type">
              <select
                name="document_type"
                value={form.document_type}
                onChange={handleChange}
                required
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Número de documento" name="document_number">
              <input
                name="document_number"
                type="text"
                autoComplete="off"
                value={form.document_number}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombres" name="first_name">
              <input
                name="first_name"
                type="text"
                autoComplete="off"
                value={form.first_name}
                onChange={handleChange}
                required
              />
            </Field>
            <Field label="Apellidos" name="last_name">
              <input
                name="last_name"
                type="text"
                autoComplete="off"
                value={form.last_name}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha de nacimiento" name="birth_date">
              <input
                name="birth_date"
                type="date"
                value={form.birth_date}
                onChange={handleChange}
                required
              />
            </Field>
            <Field label="Teléfono" name="phone">
              <input
                name="phone"
                type="tel"
                autoComplete="off"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Correo electrónico (opcional)" name="email">
              <input
                name="email"
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={handleChange}
              />
            </Field>
            <Field label="Dirección (opcional)" name="address">
              <input
                name="address"
                type="text"
                autoComplete="off"
                value={form.address}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contacto de emergencia" name="emergency_contact_name">
              <input
                name="emergency_contact_name"
                type="text"
                autoComplete="off"
                value={form.emergency_contact_name}
                onChange={handleChange}
                required
              />
            </Field>
            <Field label="Teléfono de emergencia" name="emergency_contact_phone">
              <input
                name="emergency_contact_phone"
                type="tel"
                autoComplete="off"
                value={form.emergency_contact_phone}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

          <Field label="Condiciones médicas" name="medical_conditions">
            <textarea
              name="medical_conditions"
              value={form.medical_conditions}
              onChange={handleChange}
              rows={3}
            />
          </Field>

          <Field label="Notas (opcional)" name="notes">
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
            />
          </Field>

          {isEdit ? (
            <label className="flex items-center gap-2 text-left text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              Socio activo
            </label>
          ) : null}

          {error ? <ErrorMessage message={error} /> : null}

          <div className="flex gap-2">
            <Button type="submit" loading={submitting}>
              {submitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear socio"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/members")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
