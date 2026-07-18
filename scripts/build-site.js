import { mkdir, writeFile, cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resume } from "../src/data/resume.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderSkills(skills) {
  return skills
    .map(
      (group) => `
      <div class="skill-group">
        <h3>${escapeHtml(group.category)}</h3>
        <ul class="chip-list">
          ${group.items
            .map((item) => `<li class="chip">${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </div>
    `,
    )
    .join("");
}

function renderExperience(experience) {
  return experience
    .map(
      (job) => `
      <article class="entry">
        <div class="entry-head">
          <h3>${escapeHtml(job.position)}</h3>
          <span class="entry-date">${escapeHtml(job.startDate)} – ${escapeHtml(job.endDate)}</span>
        </div>
        <p class="entry-meta">${escapeHtml(job.company)} · ${escapeHtml(job.location)}</p>
        <p>${escapeHtml(job.summary)}</p>
        <ul>
          ${job.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
    `,
    )
    .join("");
}

function renderProjects(projects) {
  return projects
    .map(
      (project) => `
      <article class="entry">
        <div class="entry-head">
          <h3>${escapeHtml(project.name)}</h3>
          <span class="entry-date">${escapeHtml(project.status)}</span>
        </div>
        <p class="entry-meta">${escapeHtml(project.role)}</p>
        <p>${escapeHtml(project.description)}</p>
        <ul>
          ${project.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
        <ul class="chip-list">
          ${project.technologies
            .map((item) => `<li class="chip">${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
        ${
          project.links?.length
            ? `<p class="entry-links">${project.links
                .map(
                  (link) =>
                    `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`,
                )
                .join(" · ")}</p>`
            : ""
        }
      </article>
    `,
    )
    .join("");
}

function renderOpenSource(repos) {
  return `
    <ul class="repo-list">
      ${repos
        .map(
          (repo) => `
        <li>
          <a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a>
          <span class="repo-lang">${escapeHtml(repo.language)}</span>
          <p>${escapeHtml(repo.description)}</p>
        </li>
      `,
        )
        .join("")}
    </ul>
  `;
}

function renderDownloads(downloads) {
  return downloads
    .map(
      (item) =>
        `<a class="button ${item.type === "pdf" && item.label.includes("European") ? "button-primary" : "button-secondary"}" href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`,
    )
    .join("");
}

function renderProfileIcons(profiles) {
  return profiles
    .map(
      (profile) => `
      <a class="social-link" href="${escapeHtml(profile.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(profile.network)}">${escapeHtml(profile.network)}</a>
    `,
    )
    .join("");
}

function renderSite(data) {
  const summary = data.basics.summary
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
  const highlights = data.highlights
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.meta.title)}</title>
  <meta name="description" content="${escapeHtml(data.meta.description)}">
  <meta name="keywords" content="${escapeHtml(data.meta.keywords)}">
  <meta name="author" content="${escapeHtml(data.basics.name)}">
  <link rel="canonical" href="${escapeHtml(data.meta.siteUrl)}/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(data.meta.title)}">
  <meta property="og:description" content="${escapeHtml(data.meta.description)}">
  <meta property="og:url" content="${escapeHtml(data.meta.siteUrl)}/">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(data.meta.title)}">
  <meta name="twitter:description" content="${escapeHtml(data.meta.description)}">
  <script>
    (() => {
      try {
        const preference = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        let resolved = "light";
        if (preference === "dark") resolved = "dark";
        else if (preference === "light") resolved = "light";
        else resolved = prefersDark ? "dark" : "light";
        document.documentElement.dataset.theme = resolved;
        document.documentElement.style.colorScheme = resolved;
      } catch {
        document.documentElement.dataset.theme = "light";
      }
    })();
  </script>
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
  <div class="page-shell">
    <aside class="sidebar" data-reveal>
      <div class="sidebar-card">
        <div class="sidebar-top">
          <button class="theme-toggle" type="button" data-theme-toggle aria-label="Theme: system" title="Theme: system">
            <span aria-hidden="true" data-theme-icon>◐</span>
            <span class="theme-label" data-theme-label>System</span>
          </button>
          <img
            class="profile-photo"
            src="assets/images/profile.jpg"
            alt="Portrait of ${escapeHtml(data.basics.name)}"
          >
        </div>

        <p class="eyebrow">Remote · Backend · Full Stack</p>
        <h1>${escapeHtml(data.basics.name)}</h1>
        <p class="role">${escapeHtml(data.basics.label)}</p>
        <p class="sidebar-email"><a href="mailto:${escapeHtml(data.basics.email)}">${escapeHtml(data.basics.email)}</a></p>
        <p class="sidebar-location">${escapeHtml(data.basics.location)}</p>

        <div class="social-row">${renderProfileIcons(data.profiles)}</div>

        <div class="sidebar-actions">
          <a class="button button-primary" href="cv/Jewel-Rana-CV-Europe-2-Page.pdf" target="_blank" rel="noopener noreferrer">European CV</a>
          <a class="button button-secondary" href="cv/Jewel-Rana-CV.pdf" target="_blank" rel="noopener noreferrer">Download CV</a>
        </div>

        <div class="glance">
          <h2>At a glance</h2>
          <ul class="meta-list">
            <li><strong>Experience</strong><span>8+ years</span></li>
            <li><strong>Focus</strong><span>Laravel · Node.js</span></li>
            <li><strong>Availability</strong><span>Remote</span></li>
            <li><strong>Current</strong><span>Newroz Technologies</span></li>
            <li><strong>Phone</strong><span><a href="tel:${escapeHtml(data.basics.phone.replace(/\s+/g, ""))}">${escapeHtml(data.basics.phone)}</a></span></li>
          </ul>
        </div>

        <nav class="sidebar-nav" aria-label="Sections">
          <a href="#about">Summary</a>
          <a href="#skills">Skills</a>
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#open-source">Open Source</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </aside>

    <main class="content" id="top">
      <section class="card" id="about" data-reveal>
        <h2>Professional Summary</h2>
        ${summary}
        <h3>Key strengths</h3>
        <ul class="strengths">${highlights}</ul>
        <div class="actions">${renderDownloads(data.downloads)}</div>
      </section>

      <section class="card" id="skills" data-reveal>
        <h2>Capabilities</h2>
        <p class="section-intro">Deep Laravel/PHP backend ownership with Node.js, Vue.js, and Livewire experience for shipping complete products.</p>
        <div class="skills-grid">${renderSkills(data.skills)}</div>
      </section>

      <section class="card" id="experience" data-reveal>
        <h2>Experience</h2>
        <p class="section-intro">Wallet systems, card-selling platforms, API integrations, and mentoring backend teams.</p>
        <div class="entry-list">${renderExperience(data.experience)}</div>
      </section>

      <section class="card" id="projects" data-reveal>
        <h2>Selected Case Studies</h2>
        <p class="section-intro">Private or offline client systems are summarized as case studies without dead demo links.</p>
        <div class="entry-list">${renderProjects(data.projects)}</div>
      </section>

      <section class="card" id="open-source" data-reveal>
        <h2>Open Source &amp; Public Work</h2>
        <p class="section-intro">
          Selected from
          <a href="https://github.com/jewel-rana" target="_blank" rel="noopener noreferrer">github.com/jewel-rana</a>.
        </p>
        ${renderOpenSource(data.openSource)}
      </section>

      <section class="card" id="contact" data-reveal>
        <h2>Contact</h2>
        <p class="section-intro">Available for remote senior backend roles across payment platforms, API-heavy products, and Laravel/Node delivery.</p>
        <ul class="contact-grid">
          <li><strong>Email</strong><a href="mailto:${escapeHtml(data.basics.email)}">${escapeHtml(data.basics.email)}</a></li>
          <li><strong>Phone</strong><a href="tel:${escapeHtml(data.basics.phone.replace(/\s+/g, ""))}">${escapeHtml(data.basics.phone)}</a></li>
          <li><strong>GitHub</strong><a href="https://github.com/jewel-rana" target="_blank" rel="noopener noreferrer">jewel-rana</a></li>
          <li><strong>LinkedIn</strong><a href="https://www.linkedin.com/in/mdjewelrana/" target="_blank" rel="noopener noreferrer">mdjewelrana</a></li>
        </ul>
      </section>

      <footer class="site-footer">
        <div>© <span data-year></span> ${escapeHtml(data.basics.name)}. All rights reserved.</div>
        <div>Last Update ${escapeHtml(data.meta.lastUpdated)}</div>
      </footer>
    </main>
  </div>

  <script src="assets/js/main.js" defer></script>
</body>
</html>`;
}

async function main() {
  await mkdir(dist, { recursive: true });
  await mkdir(path.join(dist, "assets", "css"), { recursive: true });
  await mkdir(path.join(dist, "assets", "js"), { recursive: true });
  await mkdir(path.join(dist, "assets", "images"), { recursive: true });
  await mkdir(path.join(root, "assets", "images"), { recursive: true });

  const html = renderSite(resume);
  await writeFile(path.join(dist, "index.html"), html, "utf8");
  await writeFile(path.join(root, "index.html"), html, "utf8");

  await cp(
    path.join(root, "assets", "css", "styles.css"),
    path.join(dist, "assets", "css", "styles.css"),
  );
  await cp(
    path.join(root, "assets", "js", "main.js"),
    path.join(dist, "assets", "js", "main.js"),
  );
  await cp(
    path.join(root, "images", "md-jewel-rana.jpg"),
    path.join(root, "assets", "images", "profile.jpg"),
  );
  await cp(
    path.join(root, "images", "md-jewel-rana.jpg"),
    path.join(dist, "assets", "images", "profile.jpg"),
  );
  await cp(
    path.join(root, "src", "templates", "cv.css"),
    path.join(dist, "assets", "css", "cv.css"),
  );

  await writeFile(path.join(dist, ".nojekyll"), "", "utf8");
  await writeFile(path.join(root, ".nojekyll"), "", "utf8");

  try {
    await cp(path.join(dist, "cv"), path.join(root, "cv"), { recursive: true });
  } catch {
    // CV generation may run after/before; ignore if missing
  }

  console.log(`Built site -> ${path.relative(root, path.join(dist, "index.html"))}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
