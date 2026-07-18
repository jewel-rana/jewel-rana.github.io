# Md Jewel Rana — Professional CV & Portfolio

Single-source résumé and GitHub Pages portfolio for remote Senior Backend Developer roles.

Live site: [https://jewel-rana.github.io/](https://jewel-rana.github.io/)

## What this project generates

From [`src/data/resume.js`](src/data/resume.js):

| Output | Path |
| --- | --- |
| Markdown CV | `dist/cv/Jewel-Rana-CV.md` |
| HTML CV | `dist/cv/Jewel-Rana-CV.html` |
| PDF CV | `dist/cv/Jewel-Rana-CV.pdf` |
| DOCX CV | `dist/cv/Jewel-Rana-CV.docx` |
| Portfolio site | `dist/index.html` |

## Quick start

```bash
npm install
npm run verify
```

Useful scripts:

```bash
npm run generate   # Markdown + HTML + PDF + DOCX
npm run build      # Portfolio site into dist/
npm run build:all  # generate + build
npm test           # content and artifact checks
npm run preview    # serve dist locally
```

## Updating content

1. Edit [`src/data/resume.js`](src/data/resume.js).
2. Run `npm run verify`.
3. Commit and push to `main` / `master`.

GitHub Actions (`.github/workflows/pages.yml`) rebuilds all formats and deploys `dist/` to GitHub Pages.

## Content guidelines

- Prefer case studies for private/offline client systems instead of dead demo links.
- Keep the public CV free of street address and referee contact details.
- Highlight FastPay (Iraq wallet work) and Kartat (full card-selling platform ownership).
- Position for remote backend roles with 10+ years of experience.

## Publishing to GitHub Pages

This workspace can be connected to `jewel-rana/jewel-rana.github.io`.

Recommended flow:

```bash
git init
git remote add origin git@github.com:jewel-rana/jewel-rana.github.io.git
git fetch origin
# preserve remote history, then merge/rebase your local work carefully
git add .
git commit -m "Refresh professional CV and portfolio site"
git push -u origin main
```

In the repository settings, set GitHub Pages to deploy via **GitHub Actions**.

## Stack

- Node.js 18+
- `docx` for Word export
- Puppeteer (Chrome) for PDF export
- Static HTML/CSS/JS portfolio
