import { cloneElement, isValidElement } from "react";

/**
 * Form field wrapper: label, control, hint, and error in one place.
 *
 * The control is passed as `children` (usually an `<input>`, `<select>`,
 * or `<textarea>`) and is cloned to wire accessibility attributes:
 * - `id` is set to `name` so the `<label>` associates with the control.
 * - `aria-invalid` is set while `error` is present.
 * - `aria-describedby` points to the rendered hint/error messages.
 *
 * The kit-owned control classes (surface background, hairline `line`
 * border, `danger` border on error) are merged ahead of any caller
 * `className`, so pages inherit token styling without duplicating
 * class strings.
 *
 * @param {object} props
 * @param {string} props.label Visible label text (Spanish UI copy).
 * @param {string} props.name Field name; also used as control `id` and message-id base.
 * @param {string} [props.error] Validation message; renders below the control.
 * @param {string} [props.hint] Help text; renders below the control when there is no error.
 * @param {import("react").ReactElement} props.children The form control element.
 * @param {string} [props.className=""] Extra classes for the wrapper.
 */
const CONTROL_CLASSES =
  "w-full rounded-field border bg-surface px-3 py-2 text-body-md text-paper placeholder:text-fog focus:outline-none focus:border-accent disabled:opacity-50";

export default function Field({
  label,
  name,
  error,
  hint,
  children,
  className = "",
}) {
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;
  const describedBy = [error ? errorId : null, hint && !error ? hintId : null]
    .filter(Boolean)
    .join(" ");

  let control = children;
  if (isValidElement(children)) {
    const existingDescribedBy =
      children.props["aria-describedby"] ?? children.props["ariaDescribedBy"];
    control = cloneElement(children, {
      id: children.props.id ?? name,
      "aria-invalid": error ? "true" : undefined,
      "aria-describedby":
        [existingDescribedBy, describedBy].filter(Boolean).join(" ") ||
        undefined,
      className: [
        CONTROL_CLASSES,
        error ? "border-danger" : "border-line",
        children.props.className,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  return (
    <div className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      <label
        htmlFor={name}
        className="text-body-md font-medium text-fog"
      >
        {label}
      </label>
      {control}
      {error ? (
        <p id={errorId} className="text-body-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-body-sm text-fog">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
