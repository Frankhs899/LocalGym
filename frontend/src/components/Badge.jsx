/**
 * Small status or metadata label (e.g. membership state, "Próximamente").
 *
 * Tones map to design tokens only:
 * - `lime`: accent background with ink text, for active/featured states.
 * - `red`: danger tint, for expired/overdue states.
 * - `zinc`: raised surface with hairline border, for neutral metadata.
 * - `amber`: warning tint, for pending/expiring states.
 *
 * @typedef {"lime" | "red" | "zinc" | "amber"} BadgeTone
 *
 * @param {object} props
 * @param {BadgeTone} [props.tone="zinc"] Visual tone.
 * @param {import("react").ReactNode} props.children Badge text (Spanish UI copy).
 * @param {string} [props.className=""] Extra classes appended after the kit classes.
 */
const TONE_CLASSES = {
  lime: "bg-accent text-accent-ink",
  red: "bg-danger/15 text-danger",
  zinc: "border border-line bg-raised text-fog",
  amber: "bg-warning/15 text-warning",
};

export default function Badge({ tone = "zinc", children, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-body-sm font-medium",
        TONE_CLASSES[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
