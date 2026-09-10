// WCAG 2.x contrast gate for the Frontend Foundations token palette.
// Reads the token hexes from the `@theme` block in `src/index.css` (the
// single source of truth) and checks relative-luminance contrast ratios for
// every meaningful foreground/background token pair. Exits non-zero on any
// failure. Dependency-free (Node built-ins only).
// Run: `pnpm check:contrast` from `frontend/`.
//
// Tiers:
// - text pairs must reach >= 4.5:1 (normal text, WCAG AA)
// - large/UI pairs must reach >= 3:1 (large text and non-text UI such as
//   input boundaries, WCAG AA / 1.4.11)
//
// accent-muted clears 4.5:1 comfortably, so it is graded as a text-tier
// token. Lime-family tokens are still never body text by design usage rule
// (FF-DU): accent stays UI/large-only, accent-muted is for key numbers,
// large text and UI accents.

import { readFileSync } from "node:fs";

const INDEX_CSS = new URL("../src/index.css", import.meta.url);

function loadTokens(cssPath) {
  const css = readFileSync(cssPath, "utf8");
  const theme = css.match(/@theme\s*\{([^}]*)\}/s);
  if (!theme) {
    throw new Error(`No @theme block found in ${cssPath}`);
  }
  const tokens = {};
  for (const [, name, hex] of theme[1].matchAll(
    /--color-([a-z-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g,
  )) {
    tokens[name] = hex.toLowerCase();
  }
  return tokens;
}

const TOKENS = loadTokens(INDEX_CSS);

// [foreground, background, minimum ratio, use]
const PAIRS = [
  // Body text
  ["paper", "base", 4.5, "body text on app background"],
  ["paper", "surface", 4.5, "body text on surface"],
  ["paper", "raised", 4.5, "body text on raised surface"],
  ["fog", "base", 4.5, "muted text on app background"],
  ["fog", "surface", 4.5, "muted text on surface"],
  ["fog", "raised", 4.5, "muted text on raised surface"],
  // Primary CTA: lime surface pairs with ink text
  ["accent-ink", "accent", 4.5, "primary button text"],
  ["accent-ink", "accent-hover", 4.5, "primary button hover text"],
  ["accent-ink", "accent-active", 4.5, "primary button active text"],
  // Semantic text on dark surfaces
  ["success", "surface", 4.5, "success text"],
  ["warning", "surface", 4.5, "warning text"],
  ["danger", "surface", 4.5, "danger text"],
  ["success", "base", 4.5, "success text on app background"],
  ["warning", "base", 4.5, "warning text on app background"],
  ["danger", "base", 4.5, "danger text on app background"],
  // accent-muted clears 4.5:1 — graded as text-tier (key numbers, large text)
  ["accent-muted", "base", 4.5, "muted accent text on app background"],
  ["accent-muted", "surface", 4.5, "muted accent text on surface"],
  // Large text / UI-only accents (>= 3:1)
  ["accent", "base", 3, "large lime accent on app background"],
  ["accent", "surface", 3, "large lime accent on surface"],
  // Input boundaries (WCAG 1.4.11 non-text UI)
  ["line", "base", 3, "hairline border on app background"],
  ["line", "surface", 3, "hairline border on surface"],
  ["line", "raised", 3, "hairline border on raised surface"],
];

function hexToRgb(hex) {
  const v = hex.replace("#", "");
  const full = v.length === 3 ? [...v].map((c) => c + c).join("") : v;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

let failures = 0;
for (const [fgName, bgName, min, use] of PAIRS) {
  if (!(fgName in TOKENS) || !(bgName in TOKENS)) {
    // eslint-disable-next-line no-console
    console.error(`FAIL  missing token: ${fgName} or ${bgName} not in @theme`);
    failures += 1;
    continue;
  }
  const value = ratio(TOKENS[fgName], TOKENS[bgName]);
  const ok = value >= min;
  if (!ok) failures += 1;
  // eslint-disable-next-line no-console
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${value.toFixed(2)}:1  ${fgName} (${TOKENS[fgName]}) on ${bgName} (${TOKENS[bgName]}) [min ${min}:1] — ${use}`,
  );
}

if (failures > 0) {
  // eslint-disable-next-line no-console
  console.error(`\n${failures} contrast pair(s) below WCAG AA. Adjust tokens before locking.`);
  process.exit(1);
}
// eslint-disable-next-line no-console
console.log("\nAll contrast pairs pass WCAG AA.");
