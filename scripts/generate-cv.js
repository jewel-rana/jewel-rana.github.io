import { existsSync } from "node:fs";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer";
import { resume } from "../src/data/resume.js";
import { renderMarkdown } from "../src/renderers/markdown.js";
import { renderHtml } from "../src/renderers/html.js";
import { renderDocx } from "../src/renderers/docx.js";
import {
  renderEuropeDocx,
  renderEuropeHtml,
  renderEuropeMarkdown,
} from "../src/renderers/europe.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist", "cv");
const assetsCssDir = path.join(root, "dist", "assets", "css");

const files = {
  md: path.join(outDir, "Jewel-Rana-CV.md"),
  html: path.join(outDir, "Jewel-Rana-CV.html"),
  pdf: path.join(outDir, "Jewel-Rana-CV.pdf"),
  docx: path.join(outDir, "Jewel-Rana-CV.docx"),
  europeMd: path.join(outDir, "Jewel-Rana-CV-Europe-2-Page.md"),
  europeHtml: path.join(outDir, "Jewel-Rana-CV-Europe-2-Page.html"),
  europePdf: path.join(outDir, "Jewel-Rana-CV-Europe-2-Page.pdf"),
  europeDocx: path.join(outDir, "Jewel-Rana-CV-Europe-2-Page.docx"),
  css: path.join(assetsCssDir, "cv.css"),
};

function resolveChromePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const candidates = [
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/snap/bin/chromium",
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  for (const binary of [
    "google-chrome-stable",
    "google-chrome",
    "chromium-browser",
    "chromium",
  ]) {
    try {
      return execFileSync("which", [binary], { encoding: "utf8" }).trim();
    } catch {
      // Keep looking.
    }
  }

  return undefined;
}

async function generatePdf(htmlPath, pdfPath, options = {}) {
  const executablePath = resolveChromePath();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const fileUrl = `file://${htmlPath}`;
    await page.goto(fileUrl, { waitUntil: "networkidle0" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: options.margin ?? "14mm",
        right: options.margin ?? "12mm",
        bottom: options.margin ?? "14mm",
        left: options.margin ?? "12mm",
      },
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await mkdir(assetsCssDir, { recursive: true });

  const markdown = renderMarkdown(resume);
  const html = renderHtml(resume, { inlineCss: true });
  const docxBuffer = await renderDocx(resume);
  const europeMarkdown = renderEuropeMarkdown(resume);
  const europeHtml = renderEuropeHtml(resume);
  const europeDocxBuffer = await renderEuropeDocx(resume);

  await writeFile(files.md, markdown, "utf8");
  await writeFile(files.html, html, "utf8");
  await writeFile(files.docx, docxBuffer);
  await writeFile(files.europeMd, europeMarkdown, "utf8");
  await writeFile(files.europeHtml, europeHtml, "utf8");
  await writeFile(files.europeDocx, europeDocxBuffer);
  await copyFile(
    path.join(root, "src", "templates", "cv.css"),
    files.css,
  );

  // Standalone HTML that references dist CSS for site downloads page consistency
  const linkedHtml = renderHtml(resume, {
    inlineCss: false,
    cssHref: "../assets/css/cv.css",
  });
  await writeFile(
    path.join(outDir, "Jewel-Rana-CV.linked.html"),
    linkedHtml,
    "utf8",
  );

  await generatePdf(files.html, files.pdf);
  await generatePdf(files.europeHtml, files.europePdf, { margin: "0" });

  // Keep a root-level Markdown CV for convenience / ATS sharing
  await writeFile(path.join(root, "Jewel-Rana-CV.md"), markdown, "utf8");

  console.log("Generated CV artifacts:");
  for (const [type, filePath] of Object.entries(files)) {
    console.log(`  - ${type.toUpperCase()}: ${path.relative(root, filePath)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
