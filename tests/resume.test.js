import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resume } from "../src/data/resume.js";
import { renderMarkdown } from "../src/renderers/markdown.js";
import { renderHtml } from "../src/renderers/html.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distCv = path.join(root, "dist", "cv");

const DEAD_LINK_PATTERNS = [
  /bit\.ly/i,
  /app\.jolzatra\.com/i,
  /merchant\.jolzatra\.com/i,
  /rajtika\.com/i,
];

test("resume has required remote-focused fields", () => {
  assert.equal(resume.basics.name, "Md Jewel Rana");
  assert.match(resume.basics.label, /Backend/i);
  assert.ok(resume.basics.summary.join(" ").includes("10+"));
  assert.ok(resume.experience.some((job) => job.company.includes("Newroz")));
  assert.ok(resume.projects.some((project) => /Kartat/i.test(project.name)));
  assert.ok(resume.projects.some((project) => /FastPay/i.test(project.name)));
  assert.ok(
    resume.projects.some(
      (project) => /Durpalla/i.test(project.name) && /Ongoing/i.test(project.status),
    ),
  );
  assert.ok(
    resume.projects.some(
      (project) => /iFix/i.test(project.name) && /Node\.js/i.test(project.role),
    ),
  );
  assert.ok(resume.profiles.some((profile) => profile.network === "GitHub"));
});

test("markdown and html renderers include core sections", () => {
  const markdown = renderMarkdown(resume);
  const html = renderHtml(resume, { inlineCss: true });

  for (const content of [markdown, html]) {
    assert.match(content, /Professional Summary/i);
    assert.match(content, /Technical Skills|Capabilities/i);
    assert.match(content, /Professional Experience/i);
    assert.match(content, /Kartat/i);
    assert.match(content, /FastPay/i);
    assert.match(content, /Newroz Technologies/i);
  }

  assert.doesNotMatch(markdown, /REFERENCES/i);
  assert.doesNotMatch(html, /Barontek|Cantonment/i);
});

test("generated artifacts exist after build", () => {
  const required = [
    "Jewel-Rana-CV.md",
    "Jewel-Rana-CV.html",
    "Jewel-Rana-CV.pdf",
    "Jewel-Rana-CV.docx",
  ];

  for (const file of required) {
    const fullPath = path.join(distCv, file);
    assert.ok(existsSync(fullPath), `missing ${file}`);
    assert.ok(statSync(fullPath).size > 500, `${file} looks empty`);
  }

  assert.ok(existsSync(path.join(root, "dist", "index.html")));
  assert.ok(existsSync(path.join(root, "dist", "assets", "css", "styles.css")));
});

test("site and cv avoid known dead project demo links", () => {
  const filesToScan = [
    path.join(root, "dist", "index.html"),
    path.join(distCv, "Jewel-Rana-CV.md"),
    path.join(distCv, "Jewel-Rana-CV.html"),
    path.join(root, "src", "data", "resume.js"),
  ];

  for (const file of filesToScan) {
    const content = readFileSync(file, "utf8");
    for (const pattern of DEAD_LINK_PATTERNS) {
      assert.doesNotMatch(content, pattern, `${file} contains ${pattern}`);
    }
  }
});

test("experience timeline keeps Newroz as present role", () => {
  const current = resume.experience[0];
  assert.equal(current.company, "Newroz Technologies Limited");
  assert.equal(current.endDate, "Present");
  assert.match(current.highlights.join(" "), /Kartat|FastPay/i);
});

test("open source work includes Node.js real-time chat projects", () => {
  const chatProjects = resume.openSource.filter(
    (project) =>
      project.language === "Node.js" &&
      /chat|support/i.test(`${project.name} ${project.description}`),
  );

  assert.ok(chatProjects.length >= 2);
  assert.ok(
    chatProjects.some((project) =>
      project.url.includes("nodejs-chat-with-socket.io"),
    ),
  );
});

test("portfolio supports system, light, and dark themes", () => {
  const site = readFileSync(path.join(root, "dist", "index.html"), "utf8");
  const css = readFileSync(
    path.join(root, "dist", "assets", "css", "styles.css"),
    "utf8",
  );
  const js = readFileSync(
    path.join(root, "dist", "assets", "js", "main.js"),
    "utf8",
  );

  assert.match(site, /data-theme-toggle/);
  assert.match(site, /assets\/images\/profile\.jpg/);
  assert.ok(
    existsSync(path.join(root, "dist", "assets", "images", "profile.jpg")),
  );
  assert.match(css, /prefers-color-scheme:\s*dark/);
  assert.match(css, /\[data-theme="light"\]/);
  assert.match(css, /\[data-theme="dark"\]/);
  assert.match(js, /\["system", "light", "dark"\]/);
  assert.match(js, /resolveTheme|System ·/);
});

test("tooling includes macOS and GitHub Actions CI/CD", () => {
  const tooling = resume.skills.find(
    (group) => group.category === "DevOps & Tooling",
  );

  assert.ok(tooling);
  assert.ok(tooling.items.includes("macOS"));
  assert.ok(tooling.items.includes("GitHub Actions CI/CD"));
});

test("fintech case studies demonstrate production-pressure handling", () => {
  const productionProjects = resume.projects.filter((project) =>
    /Kartat|FastPay/i.test(project.name),
  );

  assert.equal(productionProjects.length, 2);
  for (const project of productionProjects) {
    assert.match(project.highlights.join(" "), /production|pressure|incident/i);
  }
});
