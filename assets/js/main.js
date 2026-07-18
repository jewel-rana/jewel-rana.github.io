document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const themeIcon = document.querySelector("[data-theme-icon]");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const themes = ["system", "light", "dark"];
  const icons = { system: "◐", light: "☀", dark: "☾" };

  const getSavedTheme = () => {
    try {
      const saved = localStorage.getItem("theme");
      return saved === "light" || saved === "dark" ? saved : "system";
    } catch {
      return "system";
    }
  };

  const applyTheme = (theme) => {
    if (theme === "system") {
      delete document.documentElement.dataset.theme;
      try {
        localStorage.removeItem("theme");
      } catch {
        // The system preference still works when storage is unavailable.
      }
    } else {
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem("theme", theme);
      } catch {
        // The selected theme still applies for the current page.
      }
    }

    const effectiveTheme =
      theme === "system" ? (systemTheme.matches ? "dark" : "light") : theme;
    const label = theme[0].toUpperCase() + theme.slice(1);
    if (themeLabel) themeLabel.textContent = label;
    if (themeIcon) themeIcon.textContent = icons[theme];
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", `Theme: ${label}`);
      themeToggle.title = `Theme: ${label} (${effectiveTheme})`;
    }
  };

  let activeTheme = getSavedTheme();
  applyTheme(activeTheme);

  themeToggle?.addEventListener("click", () => {
    const nextIndex = (themes.indexOf(activeTheme) + 1) % themes.length;
    activeTheme = themes[nextIndex];
    applyTheme(activeTheme);
  });

  systemTheme.addEventListener("change", () => {
    if (activeTheme === "system") applyTheme("system");
  });

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(12px)";
      el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
      observer.observe(el);
    });

    const style = document.createElement("style");
    style.textContent = `
      [data-reveal].is-visible {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }
});
