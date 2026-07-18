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
      <article class="card" data-reveal>
        <h3>${escapeHtml(group.category)}</h3>
        <ul class="chip-list">
          ${group.items
            .map((item) => `<li class="chip">${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </article>
    `,
    )
    .join("");
}

function renderExperience(experience) {
  return experience
    .map(
      (job) => `
      <article class="card timeline-item" data-reveal>
        <h3>${escapeHtml(job.position)}</h3>
        <div class="job-meta">
          <span class="tag">${escapeHtml(job.company)}</span>
          <span>${escapeHtml(job.location)}</span>
          <span>${escapeHtml(job.startDate)} – ${escapeHtml(job.endDate)}</span>
        </div>
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
      <article class="card" data-reveal>
        <h3>${escapeHtml(project.name)}</h3>
        <div class="project-meta">
          <span class="tag">${escapeHtml(project.role)}</span>
          <span>${escapeHtml(project.status)}</span>
        </div>
        <p>${escapeHtml(project.description)}</p>
        <ul>
          ${project.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
        <ul class="chip-list" style="margin-top:1rem">
          ${project.technologies
            .map((item) => `<li class="chip">${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
        ${
          project.links?.length
            ? `<p style="margin-top:1rem">${project.links
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
  return repos
    .map(
      (repo) => `
      <article class="card" data-reveal>
        <h3><a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a></h3>
        <div class="project-meta"><span class="tag">${escapeHtml(repo.language)}</span></div>
        <p>${escapeHtml(repo.description)}</p>
      </article>
    `,
    )
    .join("");
}

function renderDownloads(downloads) {
  return downloads
    .map(
      (item) =>
        `<a class="button button-secondary" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`,
    )
    .join("");
}

function renderProfiles(profiles) {
  return profiles
    .map(
      (profile) => `
      <li>
        <strong>${escapeHtml(profile.network)}</strong>
        <a href="${escapeHtml(profile.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(profile.username)}</a>
      </li>
    `,
    )
    .join("");
}

function renderSite(data) {
  const summary = data.basics.summary.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
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
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="#top">${escapeHtml(data.basics.name)}</a>
      <nav aria-label="Primary">
        <ul class="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#experience">Experience</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#open-source">Open Source</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="cv/Jewel-Rana-CV-Europe-2-Page.pdf">EU CV</a></li>
          <li><a href="cv/Jewel-Rana-CV.pdf">Full CV</a></li>
        </ul>
      </nav>
      <button class="theme-toggle" type="button" data-theme-toggle aria-label="Theme: system" title="Theme: system">
        <span aria-hidden="true" data-theme-icon>◐</span>
        <span class="theme-label" data-theme-label>System</span>
      </button>
    </div>
  </header>

  <main id="top">
    <section class="hero">
      <div class="container hero-grid">
        <div class="panel" data-reveal>
          <p class="eyebrow">Remote-ready Laravel engineer</p>
          <h1>${escapeHtml(data.basics.name)}</h1>
          <p class="role">${escapeHtml(data.basics.label)}</p>
          <p class="lede">${escapeHtml(data.basics.summary[0])}</p>
          <div class="actions">
            <a class="button button-primary" href="cv/Jewel-Rana-CV-Europe-2-Page.pdf">European CV (2-page)</a>
            <a class="button button-secondary" href="cv/Jewel-Rana-CV.pdf">Full CV PDF</a>
            <a class="button button-secondary" href="https://github.com/jewel-rana" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a class="button button-secondary" href="mailto:${escapeHtml(data.basics.email)}">Email</a>
          </div>
        </div>
        <aside class="panel meta-card" data-reveal>
          <h2>At a glance</h2>
          <ul class="meta-list">
            <li><strong>Experience</strong><span>10+ years</span></li>
            <li><strong>Focus</strong><span>Laravel / Backend / Full Stack</span></li>
            <li><strong>Location</strong><span>${escapeHtml(data.basics.location)}</span></li>
            <li><strong>Availability</strong><span>Remote</span></li>
            <li><strong>Current</strong><span>Newroz Technologies</span></li>
            <li><strong>Email</strong><span><a href="mailto:${escapeHtml(data.basics.email)}">${escapeHtml(data.basics.email)}</a></span></li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="section" id="about">
      <div class="container">
        <h2>Professional Summary</h2>
        <div class="panel" data-reveal>
          ${summary}
          <h3 style="margin-top:1.4rem">Key strengths</h3>
          <ul>${highlights}</ul>
          <div class="actions" style="margin-top:1.4rem">
            ${renderDownloads(data.downloads)}
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="skills">
      <div class="container">
        <h2>Capabilities</h2>
        <p class="section-intro">
          Deep Laravel/PHP backend ownership with practical Vue.js, JavaScript, and Livewire experience for delivering complete products across the stack.
        </p>
        <div class="grid-2">${renderSkills(data.skills)}</div>
      </div>
    </section>

    <section class="section" id="experience">
      <div class="container">
        <h2>Experience</h2>
        <p class="section-intro">
          Recent work emphasizes wallet systems, card-selling platforms, API integrations, and mentoring backend teams.
        </p>
        <div class="timeline">${renderExperience(data.experience)}</div>
      </div>
    </section>

    <section class="section" id="projects">
      <div class="container">
        <h2>Selected Case Studies</h2>
        <p class="section-intro">
          Several client systems are private or no longer publicly deployed. These case studies summarize impact without linking to offline demos.
        </p>
        <div class="grid-2">${renderProjects(data.projects)}</div>
      </div>
    </section>

    <section class="section" id="open-source">
      <div class="container">
        <h2>Open Source &amp; Public Work</h2>
        <p class="section-intro">
          Laravel packages, backend integrations, and Node.js real-time chat applications selected from
          <a href="https://github.com/jewel-rana" target="_blank" rel="noopener noreferrer">github.com/jewel-rana</a>.
        </p>
        <div class="grid-3">${renderOpenSource(data.openSource)}</div>
      </div>
    </section>

    <section class="section" id="contact">
      <div class="container">
        <h2>Contact</h2>
        <div class="panel" data-reveal>
          <p class="section-intro" style="margin-bottom:1rem">
            Available for remote senior backend roles. Let’s talk about payment platforms, API-heavy products, and Laravel/Node delivery.
          </p>
          <ul class="contact-list">
            <li>
              <strong>Email</strong>
              <a href="mailto:${escapeHtml(data.basics.email)}">${escapeHtml(data.basics.email)}</a>
            </li>
            <li>
              <strong>Phone</strong>
              <a href="tel:${escapeHtml(data.basics.phone.replace(/\s+/g, ""))}">${escapeHtml(data.basics.phone)}</a>
            </li>
            ${renderProfiles(data.profiles)}
          </ul>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div>© <span data-year></span> ${escapeHtml(data.basics.name)}. All rights reserved.</div>
      <div>Updated ${escapeHtml(data.meta.lastUpdated)} · Built from a single résumé data source.</div>
    </div>
  </footer>

  <script src="assets/js/main.js" defer></script>
</body>
</html>`;
}

async function main() {
  await mkdir(dist, { recursive: true });
  await mkdir(path.join(dist, "assets", "css"), { recursive: true });
  await mkdir(path.join(dist, "assets", "js"), { recursive: true });
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
    path.join(root, "src", "templates", "cv.css"),
    path.join(dist, "assets", "css", "cv.css"),
  );

  // Ensure empty .nojekyll for GitHub Pages
  await writeFile(path.join(dist, ".nojekyll"), "", "utf8");
  await writeFile(path.join(root, ".nojekyll"), "", "utf8");

  // Copy CV artifacts into root for convenience if present
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
