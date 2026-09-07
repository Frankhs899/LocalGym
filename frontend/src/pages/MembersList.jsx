import { useEffect, useState } from "react";
import { Link } from "react-router";

import { deactivateMember, listMembers } from "../auth/api.js";

const STATUS_OPTIONS = [
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "all", label: "Todos" },
];

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [search, setSearch] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchMembers() {
      try {
        const data = await listMembers({ search: committedSearch, status, page });
        if (cancelled) {
          return;
        }
        setMembers(data.results ?? []);
        setCount(data.count ?? 0);
        setHasNext(Boolean(data.next));
        setHasPrevious(Boolean(data.previous));
      } catch {
        if (!cancelled) {
          setError("No se pudieron cargar los socios. Inténtalo de nuevo.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchMembers();
    return () => {
      cancelled = true;
    };
  }, [committedSearch, status, page, refreshKey]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPage(1);
    setCommittedSearch(search);
  }

  function handleStatusChange(value) {
    setLoading(true);
    setError(null);
    setStatus(value);
    setPage(1);
  }

  async function handleDeactivate(member) {
    const confirmed = window.confirm(
      `¿Desactivar a ${member.first_name} ${member.last_name}? Dejará de aparecer en la vista de activos.`,
    );
    if (!confirmed) {
      return;
    }
    setDeactivatingId(member.id);
    setLoading(true);
    setError(null);
    try {
      await deactivateMember(member.id);
      setRefreshKey((current) => current + 1);
    } catch {
      setError("No se pudo desactivar el socio. Inténtalo de nuevo.");
      setLoading(false);
    } finally {
      setDeactivatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Socios</h1>
          <Link
            to="/members/new"
            className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
          >
            Nuevo socio
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o documento"
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
          />
          <button
            type="submit"
            className="rounded bg-zinc-800 px-3 py-2 text-sm font-medium text-white"
          >
            Buscar
          </button>
        </form>

        <div className="mt-4 flex gap-2" role="group" aria-label="Filtro por estado">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleStatusChange(option.value)}
              aria-pressed={status === option.value}
              className={`rounded px-3 py-1 text-sm font-medium ${
                status === option.value
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-6 text-zinc-400">Cargando socios...</p>
        ) : members.length === 0 ? (
          <p className="mt-6 text-zinc-400">No hay socios para mostrar.</p>
        ) : (
          <>
            <div className="mt-6 overflow-x-auto rounded border border-zinc-800">
              <table className="w-full text-left text-sm text-zinc-200">
                <thead className="bg-zinc-900 text-xs uppercase text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Documento</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-t border-zinc-800">
                      <td className="px-4 py-3">
                        {member.document_type}-{member.document_number}
                      </td>
                      <td className="px-4 py-3">
                        {member.first_name} {member.last_name}
                      </td>
                      <td className="px-4 py-3">{member.phone}</td>
                      <td className="px-4 py-3">
                        {member.is_active ? "Activo" : "Inactivo"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex gap-3">
                          <Link
                            to={`/members/${member.id}/edit`}
                            className="text-emerald-400 underline"
                          >
                            Editar
                          </Link>
                          {member.is_active ? (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(member)}
                              disabled={deactivatingId === member.id}
                              className="text-red-400 underline disabled:opacity-50"
                            >
                              {deactivatingId === member.id ? "Desactivando..." : "Desactivar"}
                            </button>
                          ) : null}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
              <p>
                {members.length} de {count} socios
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={!hasPrevious}
                  className="rounded bg-zinc-800 px-3 py-1 font-medium text-white disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={!hasNext}
                  className="rounded bg-zinc-800 px-3 py-1 font-medium text-white disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
