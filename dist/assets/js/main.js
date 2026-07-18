document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
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
