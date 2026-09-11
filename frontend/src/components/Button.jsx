/**
 * Primary action button for the LocalGym kit.
 *
 * Variants map to design tokens only (see `src/index.css` `@theme`):
 * - `primary`: lime background (`accent`) with ink text (`accent-ink`).
 * - `secondary`: surface background with hairline `line` border.
 * - `ghost`: transparent, for tertiary actions.
 * - `danger`: semantic `danger` background with ink text.
 *
 * When `loading` is true the button is disabled, exposes `aria-busy`,
 * and shows a spinner ahead of its children.
 *
 * @typedef {"primary" | "secondary" | "ghost" | "danger"} ButtonVariant
 * @typedef {"sm" | "md"} ButtonSize
 *
 * @param {object} props
 * @param {ButtonVariant} [props.variant="primary"] Visual variant.
 * @param {ButtonSize} [props.size="md"] Size.
 * @param {boolean} [props.loading=false] Loading state; disables the button.
 * @param {import("react").ReactNode} props.children Button label or content.
 * @param {string} [props.className=""] Extra classes appended after the kit classes.
 * @param {import("react").ButtonHTMLAttributes<HTMLButtonElement>} [props.rest] Native button props (`type`, `onClick`, `disabled`, ...).
 */
const VARIANT_CLASSES = {
  primary:
    "bg-accent text-accent-ink hover:bg-accent-hover active:bg-accent-active",
  secondary:
    "border border-line bg-surface text-paper hover:bg-raised active:bg-raised",
  ghost: "bg-transparent text-paper hover:bg-raised active:bg-raised",
  danger: "bg-danger text-accent-ink hover:brightness-110 active:brightness-95",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-body-sm",
  md: "px-4 py-2 text-body-md",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  ...rest
}) {
  const { disabled, type = "button", ...buttonProps } = rest;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? "true" : undefined}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-field font-medium",
        "transition-colors duration-150 ease-app",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...buttonProps}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}
