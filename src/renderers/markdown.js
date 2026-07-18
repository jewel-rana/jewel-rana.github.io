import { resume } from "../data/resume.js";

function joinList(items) {
  return items.join(", ");
}

function renderExperience(job) {
  const lines = [
    `### ${job.position} | ${job.company}`,
    `**${job.location}** · ${job.startDate} – ${job.endDate}`,
    "",
    job.summary,
    "",
    ...job.highlights.map((item) => `- ${item}`),
  ];

  if (job.technologies?.length) {
    lines.push("", `**Technologies:** ${joinList(job.technologies)}`);
  }

  return lines.join("\n");
}

function renderProject(project) {
  const lines = [
    `### ${project.name}`,
    `**${project.role}** · ${project.status}`,
    "",
    project.description,
    "",
    ...project.highlights.map((item) => `- ${item}`),
    "",
    `**Technologies:** ${joinList(project.technologies)}`,
  ];

  if (project.links?.length) {
    lines.push(
      "",
      ...project.links.map((link) => `- [${link.label}](${link.url})`),
    );
  }

  return lines.join("\n");
}

export function renderMarkdown(data = resume) {
  const { basics, profiles, skills, highlights, experience, projects, openSource, education, courses } =
    data;

  const contact = [
    basics.location,
    basics.email,
    basics.phone,
    basics.website,
    basics.availability,
  ].join(" · ");

  const profileLinks = profiles
    .map((profile) => `[${profile.network}](${profile.url})`)
    .join(" · ");

  const skillBlocks = skills
    .map((group) => `- **${group.category}:** ${joinList(group.items)}`)
    .join("\n");

  const educationBlocks = education
    .map((edu) => {
      const score = edu.score ? `\n- ${edu.score}` : "";
      return `### ${edu.studyType} — ${edu.institution}\n**${edu.location}** · ${edu.startDate} – ${edu.endDate}${
        edu.area ? `\n\n${edu.area}` : ""
      }${score}`;
    })
    .join("\n\n");

  const openSourceBlocks = openSource
    .map(
      (repo) =>
        `- **[${repo.name}](${repo.url})** (${repo.language}) — ${repo.description}`,
    )
    .join("\n");

  return `# ${basics.name}

**${basics.label}**

${contact}

${profileLinks}

## Professional Summary

${basics.summary.join("\n\n")}

## Key Strengths

${highlights.map((item) => `- ${item}`).join("\n")}

## Technical Skills

${skillBlocks}

## Professional Experience

${experience.map(renderExperience).join("\n\n")}

## Selected Projects & Case Studies

${projects.map(renderProject).join("\n\n")}

## Open Source & Public Work

${openSourceBlocks}

## Education

${educationBlocks}

## Selected Courses

${courses.map((course) => `- ${course}`).join("\n")}
`;
}
