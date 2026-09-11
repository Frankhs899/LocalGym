/**
 * Shared class maps for the button-pattern kit components.
 *
 * Single source of truth for `Button` (`Button.jsx`) and `LinkButton`
 * (`LinkButton.jsx`) so navigation styled as a button never drifts from the
 * kit (FF-DU "no button class strings across pages"). Classes use S1
 * `@theme` tokens only (see `src/index.css`).
 *
 * @typedef {"primary" | "secondary" | "ghost" | "danger"} ButtonVariant Visual variant.
 * @typedef {"sm" | "md"} ButtonSize Size.
 */

/** Base classes shared by every button-pattern control. */
export const BUTTON_BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-field font-medium transition-colors duration-150 ease-app disabled:cursor-not-allowed disabled:opacity-50";

/** Variant classes; `primary` is lime background with ink text. */
export const BUTTON_VARIANT_CLASSES = {
  primary:
    "bg-accent text-accent-ink hover:bg-accent-hover active:bg-accent-active",
  secondary:
    "border border-line bg-surface text-paper hover:bg-raised active:bg-raised",
  ghost: "bg-transparent text-paper hover:bg-raised active:bg-raised",
  danger: "bg-danger text-accent-ink hover:brightness-110 active:brightness-95",
};

/** Size classes. */
export const BUTTON_SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-body-sm",
  md: "px-4 py-2 text-body-md",
};

/**
 * Compose the full kit class string for a button-pattern control.
 *
 * @param {object} args
 * @param {ButtonVariant} [args.variant="primary"] Visual variant.
 * @param {ButtonSize} [args.size="md"] Size.
 * @param {string} [args.className=""] Extra classes appended after the kit classes.
 * @returns {string} Class string for the control.
 */
export function buttonClasses({ variant = "primary", size = "md", className = "" }) {
  return [
    BUTTON_BASE_CLASSES,
    BUTTON_VARIANT_CLASSES[variant],
    BUTTON_SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
