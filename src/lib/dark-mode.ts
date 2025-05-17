interface CustomWindow extends Window {
  _updateTheme?: (theme: string) => void;
}

/**
 * Updates the theme in the document
 *
 * @param theme The theme to apply
 * @reference https://github.com/tailwindlabs/tailwindcss.com/blob/main/src/app/layout.tsx
 */
function updateTheme(theme: string) {
  const classList = document.documentElement.classList;

  classList.remove("ion-palette-dark", "light", "dark", "system");
  document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
    el.remove();
  });
  if (theme === "dark") {
    classList.add("ion-palette-dark", "dark");

    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "oklch(.13 .028 261.692)";
    document.head.appendChild(meta);
  } else if (theme === "light") {
    classList.add("light");

    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "white";
    document.head.appendChild(meta);
  } else {
    classList.add("system");

    const meta1 = document.createElement("meta");
    meta1.name = "theme-color";
    meta1.content = "oklch(.13 .028 261.692)";
    meta1.media = "(prefers-color-scheme: dark)";
    document.head.appendChild(meta1);

    const meta2 = document.createElement("meta");
    meta2.name = "theme-color";
    meta2.content = "white";
    meta2.media = "(prefers-color-scheme: light)";
    document.head.appendChild(meta2);
  }
}

if (!("_updateTheme" in window)) {
  (window as CustomWindow)._updateTheme = updateTheme;

  try {
    const theme = localStorage.getItem("theme");
    if (theme != null) {
      updateTheme(theme);
    }
  } catch {
    // ignore
  }

  try {
    const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
    if (isMac) {
      document.documentElement.classList.add("os-macos");
    }
  } catch {
    // ignore
  }
}
