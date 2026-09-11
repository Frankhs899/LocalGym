import { buttonClasses } from "./buttonStyles.js";

/**
 * Primary action button for the LocalGym kit.
 *
 * Variants map to design tokens only (see `src/index.css` `@theme`):
 * - `primary`: lime background (`accent`) with ink text (`accent-ink`).
 * - `secondary`: surface background with hairline `line` border.
 * - `ghost`: transparent, for tertiary actions.
 * - `danger`: semantic `danger` background with ink text.
 *
 * Variant/size classes live in `buttonStyles.js`, shared with `LinkButton`.
 *
 * When `loading` is true the button is disabled, exposes `aria-busy`,
 * and shows a spinner ahead of its children.
 *
 * @typedef {import("./buttonStyles.js").ButtonVariant} ButtonVariant
 * @typedef {import("./buttonStyles.js").ButtonSize} ButtonSize
 *
 * @param {object} props
 * @param {ButtonVariant} [props.variant="primary"] Visual variant.
 * @param {ButtonSize} [props.size="md"] Size.
 * @param {boolean} [props.loading=false] Loading state; disables the button.
 * @param {import("react").ReactNode} props.children Button label or content.
 * @param {string} [props.className=""] Extra classes appended after the kit classes.
 * @param {import("react").ButtonHTMLAttributes<HTMLButtonElement>} [props.rest] Native button props (`type`, `onClick`, `disabled`, ...).
 */

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
      className={buttonClasses({ variant, size, className })}
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
