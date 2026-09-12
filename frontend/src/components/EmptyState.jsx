/**
 * Zero-data placeholder for lists and search results.
 *
 * Shows a display-face `title`, an optional supporting `hint`, and an
 * optional `action` slot (usually a Button that creates the first item or
 * clears the search).
 *
 * @param {object} props
 * @param {string} props.title Headline (Spanish UI copy).
 * @param {string} [props.hint] Supporting text below the headline.
 * @param {import("react").ReactNode} [props.action] Action slot, e.g. a Button.
 * @param {string} [props.className=""] Extra classes appended after the kit classes.
 */
export default function EmptyState({ title, hint, action, className = "" }) {
  return (
    <div
      className={[
        "flex flex-col items-center gap-2 rounded-card border border-line bg-surface px-6 py-10 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="font-display text-display-sm font-semibold tracking-tight text-paper">
        {title}
      </p>
      {hint ? <p className="text-body-md text-fog">{hint}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
