/**
 * Inline failure notice for forms and failed loads.
 *
 * Always renders with `role="alert"` so assistive tech announces it
 * immediately. Uses the `danger` token tint on the `surface` background
 * with a hairline `line` border.
 *
 * @param {object} props
 * @param {string} props.message Error text (Spanish UI copy).
 * @param {string} [props.className=""] Extra classes appended after the kit classes.
 */
export default function ErrorMessage({ message, className = "" }) {
  return (
    <p
      role="alert"
      className={[
        "rounded-field border border-line bg-danger/15 px-3 py-2 text-body-md text-danger",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {message}
    </p>
  );
}
