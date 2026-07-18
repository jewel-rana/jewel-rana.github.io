import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  AlignmentType,
  BorderStyle,
} from "docx";
import { resume } from "../data/resume.js";

function paragraph(text, options = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...options,
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: options.size || 20,
        bold: options.bold || false,
        color: options.color || "0F172A",
        italics: options.italics || false,
      }),
    ],
  });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    border:
      level === HeadingLevel.HEADING_1
        ? {
            bottom: {
              color: "CBD5E1",
              space: 4,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          }
        : undefined,
    children: [
      new TextRun({
        text,
        bold: true,
        font: "Calibri",
        size: level === HeadingLevel.HEADING_1 ? 24 : 22,
        color: "0F172A",
      }),
    ],
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 360 },
    children: [
      new TextRun({
        text: `• ${text}`,
        font: "Calibri",
        size: 20,
        color: "334155",
      }),
    ],
  });
}

function linkParagraph(label, url) {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: label,
            font: "Calibri",
            size: 18,
            color: "0F766E",
            underline: {},
          }),
        ],
        link: url,
      }),
    ],
  });
}

export async function renderDocx(data = resume) {
  const children = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: data.basics.name,
          bold: true,
          font: "Calibri",
          size: 36,
          color: "0F172A",
        }),
      ],
    }),
    paragraph(data.basics.label, { bold: true, color: "0F766E", size: 22 }),
    paragraph(
      [
        data.basics.location,
        data.basics.email,
        data.basics.phone,
        data.basics.website,
      ].join("  |  "),
      { size: 18, color: "475569" },
    ),
    paragraph(data.basics.availability, { size: 18, color: "475569" }),
    heading("Professional Summary"),
    ...data.basics.summary.map((text) => paragraph(text)),
    heading("Key Strengths"),
    ...data.highlights.map((item) => bullet(item)),
    heading("Technical Skills"),
    ...data.skills.map((group) =>
      paragraph(`${group.category}: ${group.items.join(", ")}`),
    ),
    heading("Professional Experience"),
  ];

  for (const job of data.experience) {
    children.push(
      heading(`${job.position} | ${job.company}`, HeadingLevel.HEADING_2),
      paragraph(`${job.location}  |  ${job.startDate} – ${job.endDate}`, {
        size: 18,
        color: "475569",
      }),
      paragraph(job.summary),
      ...job.highlights.map((item) => bullet(item)),
    );

    if (job.technologies?.length) {
      children.push(
        paragraph(`Technologies: ${job.technologies.join(", ")}`, {
          size: 18,
          color: "475569",
        }),
      );
    }
  }

  children.push(heading("Selected Projects & Case Studies"));

  for (const project of data.projects) {
    children.push(
      heading(`${project.name}`, HeadingLevel.HEADING_2),
      paragraph(`${project.role}  |  ${project.status}`, {
        size: 18,
        color: "475569",
      }),
      paragraph(project.description),
      ...project.highlights.map((item) => bullet(item)),
      paragraph(`Technologies: ${project.technologies.join(", ")}`, {
        size: 18,
        color: "475569",
      }),
    );

    for (const link of project.links || []) {
      children.push(linkParagraph(link.label, link.url));
    }
  }

  children.push(heading("Open Source & Public Work"));
  for (const repo of data.openSource) {
    children.push(
      paragraph(`${repo.name} (${repo.language}) — ${repo.description}`),
      linkParagraph(repo.url, repo.url),
    );
  }

  children.push(heading("Education"));
  for (const edu of data.education) {
    children.push(
      heading(`${edu.studyType} — ${edu.institution}`, HeadingLevel.HEADING_2),
      paragraph(
        `${edu.location}  |  ${edu.startDate} – ${edu.endDate}${
          edu.area ? `  |  ${edu.area}` : ""
        }`,
        { size: 18, color: "475569" },
      ),
    );
    if (edu.score) children.push(paragraph(edu.score));
  }

  children.push(heading("Selected Courses"));
  children.push(...data.courses.map((course) => bullet(course)));

  const doc = new Document({
    creator: data.basics.name,
    title: data.meta.title,
    description: data.meta.description,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
