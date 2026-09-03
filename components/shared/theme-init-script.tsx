// Runs synchronously before the rest of <body> paints, so an explicit
// light/dark choice (stored from a previous visit) applies immediately
// instead of flashing the system-default theme first. When no explicit
// choice is stored, this does nothing — the CSS `prefers-color-scheme`
// media query in globals.css handles system dark mode with zero JS.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("sevasetu-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

export function ThemeInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
