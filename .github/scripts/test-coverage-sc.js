const fs = require("fs");

const coverageContent = fs.readFileSync(".artifacts/coverage-report-sc.txt", "utf8");

const coverageRegex = /All files.*?(\d+\.\d+)/;
const match = coverageContent.match(coverageRegex);

if (match && match[1]) {
  const coverageScore = match[1];

  const badgeUrl = `https://img.shields.io/badge/coverage--sc${coverageScore}%25-brightgreen`;

  const readmeContent = fs.readFileSync("README.md", "utf8");
  const updatedReadme = readmeContent.replace(
    /!\[Coverage Badge SC\]\(.*\)/,
    `![Coverage Badge SC](${badgeUrl})`
  );

  fs.writeFileSync("README.md", updatedReadme);
} else {
  console.error("Coverage score not found");
}
