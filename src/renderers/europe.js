import {
  BorderStyle,
  Document,
  ExternalHyperlink,
  PageBreak,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { resume } from "../data/resume.js";

const ACCENT = "1D4ED8";
const INK = "172033";
const MUTED = "526070";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function compactSkills(data) {
  return data.skills.map((group) => ({
    category: group.category.replace(" (supporting)", ""),
    items: group.items.join(", "),
  }));
}

function selectedProjects(data) {
  return ["Durpalla", "Kartat", "FastPay"].map((name) =>
    data.projects.find((project) => project.name.includes(name)),
  );
}

function renderJob(job, bulletLimit = 3) {
  return `
    <article class="eu-job">
      <div class="eu-row">
        <h3>${escapeHtml(job.position)} · ${escapeHtml(job.company)}</h3>
        <span>${escapeHtml(job.startDate)} – ${escapeHtml(job.endDate)}</span>
      </div>
      <p class="eu-meta">${escapeHtml(job.location)} · ${job.technologies
        .slice(0, 6)
        .map(escapeHtml)
        .join(", ")}</p>
      <ul>${job.highlights
        .slice(0, bulletLimit)
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul>
    </article>`;
}

function renderProject(project) {
  return `
    <article class="eu-project">
      <div class="eu-row">
        <h3>${escapeHtml(project.name)}</h3>
        <span>${escapeHtml(project.status)}</span>
      </div>
      <p>${escapeHtml(project.description)}</p>
      <p class="eu-meta">${project.technologies.map(escapeHtml).join(", ")}</p>
    </article>`;
}

export function renderEuropeHtml(data = resume) {
  const skills = compactSkills(data);
  const projects = selectedProjects(data);
  const github = data.profiles.find((profile) => profile.network === "GitHub");
  const linkedin = data.profiles.find((profile) => profile.network === "LinkedIn");
  const summary = [
    data.basics.summary[0],
    "Experienced in distributed remote collaboration, technical ownership, mentoring, production incident handling, and delivery from requirements through deployment.",
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.basics.name)} — European CV</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      color: #172033;
      background: #e5e7eb;
      font: 9.2pt/1.32 Arial, Helvetica, sans-serif;
    }
    .eu-page {
      width: 210mm;
      height: 297mm;
      padding: 12mm 14mm 11mm;
      margin: 0 auto 8mm;
      overflow: hidden;
      background: #fff;
      page-break-after: always;
    }
    .eu-page:last-child { page-break-after: auto; }
    .eu-header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8mm;
      padding-bottom: 4mm;
      border-bottom: 2px solid #1d4ed8;
    }
    h1 {
      margin: 0 0 1mm;
      font-size: 24pt;
      line-height: 1;
      letter-spacing: -0.5pt;
    }
    .eu-role { margin: 0; color: #1d4ed8; font-size: 12pt; font-weight: 700; }
    .eu-contact { text-align: right; font-size: 8.2pt; line-height: 1.55; }
    .eu-contact a { color: #172033; text-decoration: none; }
    section { margin-top: 4mm; }
    h2 {
      margin: 0 0 2mm;
      padding-bottom: 1mm;
      border-bottom: 0.5pt solid #cbd5e1;
      color: #1d4ed8;
      font-size: 11pt;
      letter-spacing: 0.4pt;
      text-transform: uppercase;
    }
    h3 { margin: 0; font-size: 9.5pt; }
    p { margin: 0 0 1.5mm; }
    ul { margin: 1mm 0 0; padding-left: 4.5mm; }
    li { margin-bottom: 0.7mm; }
    .eu-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
    .eu-summary p { color: #334155; }
    .eu-skills {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5mm 6mm;
    }
    .eu-skill { display: grid; grid-template-columns: 34mm 1fr; gap: 2mm; }
    .eu-skill strong { color: #172033; }
    .eu-skill span { color: #475569; }
    .eu-job { margin-bottom: 3mm; break-inside: avoid; }
    .eu-row { display: flex; justify-content: space-between; gap: 5mm; align-items: baseline; }
    .eu-row > span { color: #475569; font-size: 8.3pt; white-space: nowrap; }
    .eu-meta { margin: 0.5mm 0 0; color: #64748b; font-size: 8.1pt; }
    .eu-project-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 5mm; }
    .eu-project { break-inside: avoid; }
    .eu-project:first-child { grid-column: 1 / -1; }
    .eu-project p { color: #334155; }
    .eu-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm; }
    .eu-compact { margin: 0; padding-left: 4.5mm; }
    .eu-links a { color: #1d4ed8; text-decoration: none; }
    .eu-note { color: #64748b; font-size: 8pt; }
    @media screen {
      body { padding: 8mm 0; }
      .eu-page { box-shadow: 0 12px 35px rgba(15, 23, 42, 0.18); }
    }
    @media print {
      body { background: #fff; }
      .eu-page { margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <main>
    <div class="eu-page" data-eu-page="1">
      <header class="eu-header">
        <div>
          <h1>${escapeHtml(data.basics.name)}</h1>
          <p class="eu-role">Senior Laravel Backend &amp; Full-Stack Developer</p>
        </div>
        <div class="eu-contact">
          ${escapeHtml(data.basics.location)} · Remote worldwide<br>
          <a href="mailto:${escapeHtml(data.basics.email)}">${escapeHtml(data.basics.email)}</a> · ${escapeHtml(data.basics.phone)}<br>
          <a href="${escapeHtml(linkedin.url)}">LinkedIn</a> ·
          <a href="${escapeHtml(github.url)}">GitHub</a> ·
          <a href="${escapeHtml(data.basics.website)}">Portfolio</a>
        </div>
      </header>

      <section>
        <h2>Professional Profile</h2>
        <div class="eu-summary">${summary
          .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
          .join("")}</div>
      </section>

      <section>
        <h2>Core Competencies</h2>
        <div class="eu-skills">${skills
          .map(
            (skill) =>
              `<div class="eu-skill"><strong>${escapeHtml(skill.category)}</strong><span>${escapeHtml(skill.items)}</span></div>`,
          )
          .join("")}</div>
      </section>

      <section>
        <h2>Professional Experience</h2>
        ${renderJob(data.experience[0], 4)}
        ${renderJob(data.experience[1], 3)}
      </section>

      <section>
        <h2>Selected Impact</h2>
        <ul>
          ${data.highlights
            .slice(0, 4)
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}
        </ul>
      </section>
    </div>

    <div class="eu-page" data-eu-page="2">
      <section style="margin-top:0">
        <h2>Earlier Experience</h2>
        ${renderJob(data.experience[2], 3)}
        ${renderJob(data.experience[3], 2)}
        ${renderJob(data.experience[4], 2)}
      </section>

      <section>
        <h2>Selected Projects</h2>
        <div class="eu-project-grid">${projects.map(renderProject).join("")}</div>
      </section>

      <div class="eu-bottom-grid">
        <section>
          <h2>Education</h2>
          <p><strong>${escapeHtml(data.education[0].studyType)}</strong><br>
          ${escapeHtml(data.education[0].institution)}, ${escapeHtml(data.education[0].location)}<br>
          <span class="eu-note">${escapeHtml(data.education[0].startDate)} – ${escapeHtml(data.education[0].endDate)}</span></p>
        </section>
        <section>
          <h2>Open Source</h2>
          <ul class="eu-compact eu-links">
            ${data.openSource
              .slice(0, 4)
              .map(
                (repo) =>
                  `<li><a href="${escapeHtml(repo.url)}">${escapeHtml(repo.name)}</a> · ${escapeHtml(repo.language)}</li>`,
              )
              .join("")}
          </ul>
        </section>
      </div>

      <section>
        <h2>Additional Information</h2>
        <p class="eu-note">Available for remote employment and international collaboration. References available on request. Prepared in a concise, privacy-conscious format for modern European recruitment.</p>
      </section>
    </div>
  </main>
</body>
</html>`;
}

export function renderEuropeMarkdown(data = resume) {
  const projects = selectedProjects(data);
  const skills = compactSkills(data);
  return `# ${data.basics.name}

**Senior Laravel Backend & Full-Stack Developer**

${data.basics.location} · Remote worldwide · ${data.basics.email} · ${data.basics.phone}

[LinkedIn](${data.profiles.find((profile) => profile.network === "LinkedIn").url}) · [GitHub](${data.profiles.find((profile) => profile.network === "GitHub").url}) · [Portfolio](${data.basics.website})

## Professional Profile

${data.basics.summary[0]}

Experienced in distributed remote collaboration, technical ownership, mentoring, production incident handling, and delivery from requirements through deployment.

## Core Competencies

${skills.map((skill) => `- **${skill.category}:** ${skill.items}`).join("\n")}

## Professional Experience

${data.experience
  .map(
    (job) => `### ${job.position} · ${job.company} | ${job.startDate} – ${job.endDate}
${job.location}

${job.highlights
  .slice(0, job === data.experience[0] ? 4 : 2)
  .map((item) => `- ${item}`)
  .join("\n")}`,
  )
  .join("\n\n")}

<!-- PAGE 2 IN THE PDF/DOCX VERSION -->

## Selected Projects

${projects
  .map(
    (project) => `### ${project.name} · ${project.status}
${project.description}

**Technologies:** ${project.technologies.join(", ")}`,
  )
  .join("\n\n")}

## Education

**${data.education[0].studyType}**, ${data.education[0].institution} · ${data.education[0].startDate}–${data.education[0].endDate}

## Open Source

${data.openSource
  .slice(0, 4)
  .map((repo) => `- [${repo.name}](${repo.url}) · ${repo.language}`)
  .join("\n")}

## Additional Information

Available for remote employment and international collaboration. References available on request.
`;
}

function docParagraph(text, options = {}) {
  return new Paragraph({
    spacing: { after: options.after ?? 60, before: options.before ?? 0 },
    keepNext: options.keepNext,
    border: options.border,
    children: [
      new TextRun({
        text,
        font: "Arial",
        size: options.size ?? 18,
        bold: options.bold,
        color: options.color ?? INK,
      }),
    ],
  });
}

function docHeading(text) {
  return docParagraph(text.toUpperCase(), {
    size: 20,
    bold: true,
    color: ACCENT,
    before: 130,
    after: 60,
    keepNext: true,
    border: {
      bottom: {
        color: "CBD5E1",
        style: BorderStyle.SINGLE,
        size: 4,
        space: 3,
      },
    },
  });
}

function docBullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 25 },
    children: [
      new TextRun({ text, font: "Arial", size: 17, color: MUTED }),
    ],
  });
}

function docJob(job, bulletLimit) {
  return [
    docParagraph(
      `${job.position} · ${job.company}                                      ${job.startDate} – ${job.endDate}`,
      { bold: true, size: 18, before: 75, after: 25, keepNext: true },
    ),
    docParagraph(
      `${job.location} · ${job.technologies.slice(0, 6).join(", ")}`,
      { size: 16, color: MUTED, after: 35 },
    ),
    ...job.highlights.slice(0, bulletLimit).map(docBullet),
  ];
}

export async function renderEuropeDocx(data = resume) {
  const skills = compactSkills(data);
  const projects = selectedProjects(data);
  const linkedin = data.profiles.find((profile) => profile.network === "LinkedIn");
  const github = data.profiles.find((profile) => profile.network === "GitHub");

  const children = [
    docParagraph(data.basics.name, { size: 34, bold: true, after: 20 }),
    docParagraph("Senior Laravel Backend & Full-Stack Developer", {
      size: 21,
      bold: true,
      color: ACCENT,
      after: 30,
    }),
    docParagraph(
      `${data.basics.location} · Remote worldwide · ${data.basics.email} · ${data.basics.phone}`,
      { size: 16, color: MUTED, after: 20 },
    ),
    new Paragraph({
      spacing: { after: 70 },
      children: [
        new ExternalHyperlink({
          link: linkedin.url,
          children: [new TextRun({ text: "LinkedIn", color: ACCENT, size: 16 })],
        }),
        new TextRun({ text: "  ·  ", color: MUTED, size: 16 }),
        new ExternalHyperlink({
          link: github.url,
          children: [new TextRun({ text: "GitHub", color: ACCENT, size: 16 })],
        }),
        new TextRun({ text: "  ·  ", color: MUTED, size: 16 }),
        new ExternalHyperlink({
          link: data.basics.website,
          children: [new TextRun({ text: "Portfolio", color: ACCENT, size: 16 })],
        }),
      ],
    }),
    docHeading("Professional Profile"),
    docParagraph(data.basics.summary[0], { size: 17 }),
    docParagraph(
      "Experienced in distributed remote collaboration, technical ownership, mentoring, production incident handling, and delivery from requirements through deployment.",
      { size: 17 },
    ),
    docHeading("Core Competencies"),
    ...skills.map((skill) =>
      docParagraph(`${skill.category}: ${skill.items}`, {
        size: 16,
        after: 30,
      }),
    ),
    docHeading("Professional Experience"),
    ...docJob(data.experience[0], 4),
    ...docJob(data.experience[1], 3),
    new Paragraph({ children: [new PageBreak()] }),
    docHeading("Earlier Experience"),
    ...docJob(data.experience[2], 3),
    ...docJob(data.experience[3], 2),
    ...docJob(data.experience[4], 2),
    docHeading("Selected Projects"),
    ...projects.flatMap((project) => [
      docParagraph(`${project.name} · ${project.status}`, {
        bold: true,
        size: 18,
        before: 60,
        after: 25,
        keepNext: true,
      }),
      docParagraph(project.description, { size: 16, after: 25 }),
      docParagraph(`Technologies: ${project.technologies.join(", ")}`, {
        size: 15,
        color: MUTED,
        after: 35,
      }),
    ]),
    docHeading("Education & Additional Information"),
    docParagraph(
      `${data.education[0].studyType} · ${data.education[0].institution} · ${data.education[0].startDate}–${data.education[0].endDate}`,
      { size: 16 },
    ),
    docParagraph(
      "Available for remote employment and international collaboration. References available on request.",
      { size: 16, color: MUTED },
    ),
  ];

  const document = new Document({
    creator: data.basics.name,
    title: `${data.basics.name} — European Two-Page CV`,
    description: "Concise two-page CV for European remote opportunities",
    sections: [
      {
        properties: {
          page: {
            margin: { top: 620, right: 700, bottom: 620, left: 700 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(document);
}
