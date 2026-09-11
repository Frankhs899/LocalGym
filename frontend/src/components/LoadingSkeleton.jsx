/**
 * Placeholder shown while remote content loads (lists, cards, guards).
 *
 * Renders `lines` pulsing bars on the `raised` token. The block exposes
 * `role="status"` with a Spanish loading label; the animated bars are
 * decorative and hidden from assistive tech.
 *
 * @param {object} props
 * @param {number} [props.lines=3] Number of placeholder bars.
 * @param {string} [props.label="Cargando\u2026"] Accessible loading label.
 * @param {string} [props.className=""] Extra classes appended after the kit classes.
 */
export default function LoadingSkeleton({
  lines = 3,
  label = "Cargando\u2026",
  className = "",
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={["flex flex-col gap-2", className].filter(Boolean).join(" ")}
    >
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-4 animate-pulse rounded-field bg-raised"
        />
      ))}
    </div>
  );
}
