import { mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { resume } from "../src/data/resume.js";
import { renderMarkdown } from "../src/renderers/markdown.js";
import { renderHtml } from "../src/renderers/html.js";
import { renderDocx } from "../src/renderers/docx.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist", "cv");
const assetsCssDir = path.join(root, "dist", "assets", "css");

const files = {
  md: path.join(outDir, "Jewel-Rana-CV.md"),
  html: path.join(outDir, "Jewel-Rana-CV.html"),
  pdf: path.join(outDir, "Jewel-Rana-CV.pdf"),
  docx: path.join(outDir, "Jewel-Rana-CV.docx"),
  css: path.join(assetsCssDir, "cv.css"),
};

async function generatePdf(htmlPath, pdfPath) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
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
        top: "14mm",
        right: "12mm",
        bottom: "14mm",
        left: "12mm",
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

  await writeFile(files.md, markdown, "utf8");
  await writeFile(files.html, html, "utf8");
  await writeFile(files.docx, docxBuffer);
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
