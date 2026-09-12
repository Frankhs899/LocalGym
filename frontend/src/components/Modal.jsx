import { useEffect, useId, useRef } from "react";

/**
 * Dialog overlay for confirmations and short forms.
 *
 * While `open`, the dialog traps no tab order but owns attention: the
 * close button receives focus on open, `Escape` calls `onClose`, and focus
 * returns to the previously focused element on close. The panel exposes
 * `role="dialog"` with `aria-modal="true"` and labels itself from `title`.
 * Clicking the backdrop also calls `onClose`. Renders nothing while closed.
 *
 * @param {object} props
 * @param {boolean} props.open Whether the dialog is visible.
 * @param {() => void} props.onClose Close handler (Escape, backdrop, close button).
 * @param {string} props.title Dialog heading (Spanish UI copy).
 * @param {import("react").ReactNode} props.children Dialog body content.
 * @param {string} [props.className=""] Extra classes appended after the panel kit classes.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
}) {
  const titleId = useId();
  const closeRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    previousFocusRef.current = document.activeElement;
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          "w-full max-w-md rounded-card border border-line bg-surface p-5",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className="font-display text-display-sm font-semibold tracking-tight text-paper"
          >
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-field px-2 py-1 text-body-md text-fog hover:bg-raised hover:text-paper"
          >
            {"\u00D7"}
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
