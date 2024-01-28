const { exec } = require('child_process');
const fs = require('fs');

exec('pnpm run lint', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }

    const warningRegex = /warning/g;
    const warningCount = (stdout.match(warningRegex) || []).length;

    console.log(`Number of warnings : ${warningCount}`);

    const badgeColor = warningCount > 10 ? 'red' : (warningCount > 3 ? 'yellow' : 'green');
    const badgeUrl = `https://img.shields.io/badge/lint--warnings-${warningCount}-${badgeColor}`;
    
    const readmeContent = fs.readFileSync('README.md', 'utf8');
    const updatedReadme = readmeContent.replace(/!\[Lint Warnings Badge\]\(.*\)/, `![Lint Warnings Badge](${badgeUrl})`);

    fs.writeFileSync('README.md', updatedReadme);
});
