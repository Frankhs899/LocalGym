/**
 * Content panel for grouped information (forms, metrics, lists).
 *
 * Uses the `surface` token with a hairline `line` border and the card
 * radius. Soft grey shadows are never used (FF-DU). An optional string
 * `title` renders as a display-face heading with supporting `description`
 * text; pass rich nodes via `children`, and header actions via `action`.
 *
 * @param {object} props
 * @param {string} [props.title] Card heading (Spanish UI copy).
 * @param {string} [props.description] Supporting text below the heading.
 * @param {import("react").ReactNode} [props.action] Header slot, e.g. a Button or Badge.
 * @param {import("react").ReactNode} props.children Card body content.
 * @param {string} [props.className=""] Extra classes appended after the kit classes.
 */
export default function Card({
  title,
  description,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={[
        "rounded-card border border-line bg-surface p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title || action ? (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? (
              <h2 className="font-display text-display-sm font-semibold tracking-tight text-paper">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-body-md text-fog">{description}</p>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}
