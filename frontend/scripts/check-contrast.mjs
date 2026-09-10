// WCAG 2.x contrast gate for the Frontend Foundations token palette.
// Computes relative-luminance contrast ratios for every meaningful
// foreground/background token pair and exits non-zero on any failure.
// Run: `node scripts/check-contrast.mjs` from `frontend/`.
//
// Tiers:
// - text pairs must reach >= 4.5:1 (normal text, WCAG AA)
// - large/UI pairs must reach >= 3:1 (large text / non-text UI, WCAG AA)
//
// accent-muted is intentionally gated as a large/UI-only token: it is
// allowed for large text, key numbers and UI accents, never for body text.

const TOKENS = {
  base: "#0a0a0c",
  surface: "#141417",
  raised: "#1d1d21",
  paper: "#f5f5f7",
  fog: "#9a9aa3",
  accent: "#d4ff3f",
  "accent-hover": "#c4f02e",
  "accent-active": "#aadb1f",
  "accent-ink": "#0a0a0c",
  "accent-muted": "#b8c96e",
  success: "#4ade80",
  warning: "#fbbf24",
  danger: "#f87171",
};

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
  // Large text / UI-only accents (>= 3:1)
  ["accent", "base", 3, "large lime accent on app background"],
  ["accent", "surface", 3, "large lime accent on surface"],
  ["accent-muted", "base", 3, "muted accent UI on app background"],
  ["accent-muted", "surface", 3, "muted accent UI on surface"],
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
