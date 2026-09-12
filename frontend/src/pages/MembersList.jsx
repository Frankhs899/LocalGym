import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { deactivateMember, listMembers } from "../auth/api.js";
import {
  Badge,
  Button,
  EmptyState,
  ErrorMessage,
  Field,
  LoadingSkeleton,
  Table,
} from "../components/index.js";

const STATUS_OPTIONS = [
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "all", label: "Todos" },
];

export default function MembersList() {
  const navigate = useNavigate();
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
    <main className="min-h-screen bg-base px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Socios</h1>
          <Button
            type="button"
            size="sm"
            onClick={() => navigate("/members/new")}
          >
            Nuevo socio
          </Button>
        </div>

        <form onSubmit={handleSearchSubmit} className="mt-6 flex items-end gap-2">
          <div className="w-full">
            <Field label="Buscar" name="search">
              <input
                name="search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o documento"
              />
            </Field>
          </div>
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
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
                  ? "bg-accent text-accent-ink"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorMessage message={error} />
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6">
            <LoadingSkeleton lines={4} label="Cargando socios..." />
          </div>
        ) : members.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No hay socios para mostrar." />
          </div>
        ) : (
          <>
            <div className="mt-6">
              <Table
                caption="Lista de socios"
                columns={[
                  {
                    key: "document",
                    header: "Documento",
                    render: (row) => `${row.document_type}-${row.document_number}`,
                  },
                  {
                    key: "name",
                    header: "Nombre",
                    render: (row) => `${row.first_name} ${row.last_name}`,
                  },
                  { key: "phone", header: "Teléfono" },
                  {
                    key: "status",
                    header: "Estado",
                    render: (row) => (
                      <Badge tone={row.is_active ? "lime" : "zinc"}>
                        {row.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    ),
                  },
                  {
                    key: "actions",
                    header: "Acciones",
                    render: (row) => (
                      <span className="flex gap-3">
                        <Link
                          to={`/members/${row.id}/edit`}
                          className="text-success underline"
                        >
                          Editar
                        </Link>
                        {row.is_active ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(row)}
                            disabled={deactivatingId === row.id}
                            className="text-danger underline disabled:opacity-50"
                          >
                            {deactivatingId === row.id ? "Desactivando..." : "Desactivar"}
                          </button>
                        ) : null}
                      </span>
                    ),
                  },
                ]}
                rows={members}
                keyOf={(row) => row.id}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
              <p>
                {members.length} de {count} socios
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={!hasPrevious}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={!hasNext}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
