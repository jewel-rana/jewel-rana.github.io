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

  const getSavedPreference = () => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark" || saved === "system") {
        return saved;
      }
    } catch {
      // Fall through to system preference.
    }
    return "system";
  };

  const resolveTheme = (preference) => {
    if (preference === "light" || preference === "dark") return preference;
    return systemTheme.matches ? "dark" : "light";
  };

  const applyTheme = (preference) => {
    const resolved = resolveTheme(preference);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;

    try {
      localStorage.setItem("theme", preference);
    } catch {
      // The selected theme still applies for the current page.
    }

    const preferenceLabel =
      preference === "system"
        ? `System · ${resolved === "dark" ? "Dark" : "Light"}`
        : preference[0].toUpperCase() + preference.slice(1);

    if (themeLabel) themeLabel.textContent = preferenceLabel;
    if (themeIcon) themeIcon.textContent = icons[preference];
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", `Theme: ${preferenceLabel}`);
      themeToggle.title =
        preference === "system"
          ? `Following your device setting (currently ${resolved}). Click for Light.`
          : `Theme: ${preferenceLabel}. Click to change.`;
    }
  };

  let activePreference = getSavedPreference();
  applyTheme(activePreference);

  themeToggle?.addEventListener("click", () => {
    const nextIndex = (themes.indexOf(activePreference) + 1) % themes.length;
    activePreference = themes[nextIndex];
    applyTheme(activePreference);
  });

  const syncSystemTheme = () => {
    if (activePreference === "system") applyTheme("system");
  };

  if (typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", syncSystemTheme);
  } else if (typeof systemTheme.addListener === "function") {
    systemTheme.addListener(syncSystemTheme);
  }

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
      el.classList.add("reveal-pending");
      observer.observe(el);
    });

    const style = document.createElement("style");
    style.textContent = `
      [data-reveal].reveal-pending {
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.45s ease, transform 0.45s ease;
      }
      [data-reveal].is-visible {
        opacity: 1 !important;
        transform: none !important;
      }
      .hero-grid > [data-reveal].reveal-pending {
        transform: none;
      }
    `;
    document.head.appendChild(style);
  }
});
