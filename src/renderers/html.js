import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { resume } from "../data/resume.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.resolve(__dirname, "../templates/cv.css");

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function joinList(items) {
  return items.map(escapeHtml).join(", ");
}

function renderSkills(skills) {
  return `
    <dl class="skills-grid">
      ${skills
        .map(
          (group) => `
            <dt>${escapeHtml(group.category)}</dt>
            <dd>${joinList(group.items)}</dd>
          `,
        )
        .join("")}
    </dl>
  `;
}

function renderExperience(experience) {
  return experience
    .map(
      (job) => `
      <article class="job">
        <div class="job-header">
          <h3>${escapeHtml(job.position)}</h3>
          <div class="meta">${escapeHtml(job.startDate)} – ${escapeHtml(job.endDate)}</div>
        </div>
        <p class="company">${escapeHtml(job.company)} · ${escapeHtml(job.location)}</p>
        <p>${escapeHtml(job.summary)}</p>
        <ul class="highlights">
          ${job.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
        ${
          job.technologies?.length
            ? `<p class="tech"><strong>Technologies:</strong> ${joinList(job.technologies)}</p>`
            : ""
        }
      </article>
    `,
    )
    .join("");
}

function renderProjects(projects) {
  return projects
    .map(
      (project) => `
      <article class="project">
        <div class="project-header">
          <h3>${escapeHtml(project.name)}</h3>
          <div class="meta">${escapeHtml(project.status)}</div>
        </div>
        <p class="project-role">${escapeHtml(project.role)}</p>
        <p>${escapeHtml(project.description)}</p>
        <ul class="highlights">
          ${project.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
        <p class="tech"><strong>Technologies:</strong> ${joinList(project.technologies)}</p>
        ${
          project.links?.length
            ? `<ul class="project-links">${project.links
                .map(
                  (link) =>
                    `<li><a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a></li>`,
                )
                .join("")}</ul>`
            : ""
        }
      </article>
    `,
    )
    .join("");
}

function renderOpenSource(repos) {
  return `
    <ul class="highlights">
      ${repos
        .map(
          (repo) => `
            <li>
              <strong><a href="${escapeHtml(repo.url)}">${escapeHtml(repo.name)}</a></strong>
              (${escapeHtml(repo.language)}) — ${escapeHtml(repo.description)}
            </li>
          `,
        )
        .join("")}
    </ul>
  `;
}

function renderEducation(education) {
  return education
    .map(
      (edu) => `
      <article class="education-item">
        <div class="edu-header">
          <h3>${escapeHtml(edu.studyType)} — ${escapeHtml(edu.institution)}</h3>
          <div class="meta">${escapeHtml(edu.startDate)} – ${escapeHtml(edu.endDate)}</div>
        </div>
        <p class="company">${escapeHtml(edu.location)}${edu.area ? ` · ${escapeHtml(edu.area)}` : ""}</p>
        ${edu.score ? `<p>${escapeHtml(edu.score)}</p>` : ""}
      </article>
    `,
    )
    .join("");
}

export function renderHtml(data = resume, options = {}) {
  const css = options.inlineCss
    ? readFileSync(cssPath, "utf8")
    : "";
  const stylesheetLink = options.inlineCss
    ? `<style>${css}</style>`
    : `<link rel="stylesheet" href="${options.cssHref || "../assets/css/cv.css"}">`;

  const contactParts = [
    `<span>${escapeHtml(data.basics.location)}</span>`,
    `<a href="mailto:${escapeHtml(data.basics.email)}">${escapeHtml(data.basics.email)}</a>`,
    `<a href="tel:${escapeHtml(data.basics.phone.replace(/\s+/g, ""))}">${escapeHtml(data.basics.phone)}</a>`,
    `<a href="${escapeHtml(data.basics.website)}">${escapeHtml(data.basics.website.replace(/^https?:\/\//, ""))}</a>`,
    ...data.profiles
      .filter((profile) => profile.network !== "Website")
      .map(
        (profile) =>
          `<a href="${escapeHtml(profile.url)}">${escapeHtml(profile.network)}</a>`,
      ),
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(data.meta.description)}">
  <title>${escapeHtml(data.meta.title)}</title>
  ${stylesheetLink}
</head>
<body>
  <main class="cv-page">
    <header class="cv-header">
      <h1>${escapeHtml(data.basics.name)}</h1>
      <p class="cv-role">${escapeHtml(data.basics.label)}</p>
      <div class="cv-contact">${contactParts.join("")}</div>
      <p class="company" style="margin-top:8px">${escapeHtml(data.basics.availability)}</p>
    </header>

    <section class="summary">
      <h2>Professional Summary</h2>
      ${data.basics.summary.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </section>

    <section>
      <h2>Key Strengths</h2>
      <ul class="highlights">
        ${data.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>

    <section>
      <h2>Technical Skills</h2>
      ${renderSkills(data.skills)}
    </section>

    <section>
      <h2>Professional Experience</h2>
      ${renderExperience(data.experience)}
    </section>

    <section>
      <h2>Selected Projects &amp; Case Studies</h2>
      ${renderProjects(data.projects)}
    </section>

    <section>
      <h2>Open Source &amp; Public Work</h2>
      ${renderOpenSource(data.openSource)}
    </section>

    <section>
      <h2>Education</h2>
      ${renderEducation(data.education)}
    </section>

    <section>
      <h2>Selected Courses</h2>
      <ul class="courses">
        ${data.courses.map((course) => `<li>${escapeHtml(course)}</li>`).join("")}
      </ul>
    </section>
  </main>
</body>
</html>`;
}
