import { Card } from "../components/index.js";

const METRICS = [
  { title: "Ingresos del mes", value: "$ 0" },
  { title: "Miembros activos", value: "0" },
  { title: "Membresías vencidas", value: "0" },
];

/**
 * Dashboard home at `/dashboard`.
 *
 * Shows hardcoded placeholder metric cards only — zero API calls. Real
 * metrics arrive with the memberships/payments backend in a later change.
 */
export default function Dashboard() {
  return (
    <div>
      <h1 className="font-display text-display-md font-semibold tracking-tight text-paper">
        Panel
      </h1>
      <p className="mt-1 text-body-md text-fog">
        Resumen del gimnasio de un vistazo.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {METRICS.map((metric) => (
          <Card key={metric.title} title={metric.title}>
            <p className="font-display text-display-xl font-semibold tracking-tight text-accent">
              {metric.value}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
