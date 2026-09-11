import { Link } from "react-router";

import { buttonClasses } from "./buttonStyles.js";

/**
 * Navigation link styled exactly like the kit `Button`.
 *
 * For true navigation (header links, CTAs that change route) where a
 * `<button>` + `navigate()` would masquerade an action as navigation. Shares
 * the variant/size class maps with `Button.jsx` via `buttonStyles.js`, so the
 * two never drift (FF-DU "no button class strings across pages").
 *
 * @param {object} props
 * @param {string} props.to Router destination (`Link` `to`).
 * @param {import("./buttonStyles.js").ButtonVariant} [props.variant="primary"] Visual variant.
 * @param {import("./buttonStyles.js").ButtonSize} [props.size="md"] Size.
 * @param {import("react").ReactNode} props.children Link label or content.
 * @param {string} [props.className=""] Extra classes appended after the kit classes.
 * @param {import("react-router").LinkProps} [props.rest] Native `Link` props.
 */
export default function LinkButton({
  to,
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...rest
}) {
  return (
    <Link to={to} className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}
