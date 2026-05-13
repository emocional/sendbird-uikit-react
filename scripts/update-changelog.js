/**
 * CHANGELOG update script.
 *
 * Prepends or replaces the contents of `CHANGELOG_DRAFT.md` into the top of
 * `CHANGELOG.md` for the current version. The operation is idempotent:
 *   - If a section for the same version already exists, it is replaced.
 *   - Otherwise a new section is inserted right after the first header line
 *     (`# Changelog - vN`).
 *
 * Required env vars: VERSION (e.g. 3.18.0), DATE (e.g. APR 28 2026).
 *
 * Used by:
 *   - .github/workflows/prepare-changelog.yml: body sync on release branch push
 *   - .github/workflows/release-workflow.yml: date finalization at release time
 */

/* eslint-disable no-console, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, global-require */
// @ts-nocheck
const fs = require('fs');

const version = process.env.VERSION;
const date = process.env.DATE;

if (!version || !date) {
  console.error('Required env vars: VERSION, DATE');
  process.exit(1);
}

const draftPath = 'CHANGELOG_DRAFT.md';
const changelogPath = 'CHANGELOG.md';

const draft = fs.readFileSync(draftPath, 'utf8').replace(/\s+$/, '');
const lines = fs.readFileSync(changelogPath, 'utf8').split('\n');

const versionHeader = `## [v${version}]`;

let removeStart = -1;
let removeEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith(versionHeader)) {
    removeStart = i;
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].startsWith('## [v')) {
        removeEnd = j;
        break;
      }
    }
    if (removeEnd === -1) removeEnd = lines.length;
    break;
  }
}

if (removeStart >= 0) {
  lines.splice(removeStart, removeEnd - removeStart);
  console.log(`Replaced existing section for v${version}`);
} else {
  console.log(`No existing section for v${version}; prepending`);
}

const major = version.split('.')[0];
const targetHeader = `# Changelog - v${major}`;
let headerIndex = lines.findIndex((line) => line === targetHeader);
if (headerIndex < 0) {
  headerIndex = lines.findIndex((line) => line.startsWith('# '));
}

let insertAt;
if (headerIndex < 0) {
  insertAt = 0;
} else {
  insertAt = headerIndex + 1;
  if (lines[insertAt] === '') {
    insertAt += 1;
  }
}

const newSection = [
  `## [v${version}] (${date})`,
  ...draft.split('\n'),
  '',
];
lines.splice(insertAt, 0, ...newSection);

let result = lines.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '');
if (!result.endsWith('\n')) result += '\n';
fs.writeFileSync(changelogPath, result);
console.log(`Updated ${changelogPath} for v${version} (${date})`);
