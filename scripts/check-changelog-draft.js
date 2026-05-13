/**
 * Pre-release sanity check for CHANGELOG_DRAFT.md.
 *
 * Fails the release if:
 *   1. CHANGELOG_DRAFT.md is the empty placeholder template (never filled in).
 *   2. The current release version (v$VERSION) is not the topmost section in
 *      CHANGELOG.md (means prepare-changelog never ran on the release branch).
 *   3. CHANGELOG_DRAFT.md content is byte-identical to the previous release's
 *      section body (means the developer forgot to update the draft for this
 *      release and the previous release notes would be re-published).
 *
 * Required env vars: VERSION (e.g. 3.18.0).
 *
 * Used by .github/workflows/release-workflow.yml as a gate before finalize/merge.
 */

/* eslint-disable no-console, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, global-require */
// @ts-nocheck
const fs = require('fs');

const TEMPLATE = '### Features\n- Added ...\n\n### Fixes\n- Fixed a bug where ...';

const version = process.env.VERSION;
if (!version) {
  console.error('Required env var: VERSION');
  process.exit(1);
}

const draft = fs.readFileSync('CHANGELOG_DRAFT.md', 'utf8').trim();
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');

if (!draft) {
  console.error('CHANGELOG_DRAFT.md is empty.');
  console.error(`Fill it in with release notes for v${version}.`);
  process.exit(1);
}

if (draft === TEMPLATE) {
  console.error('CHANGELOG_DRAFT.md is the empty placeholder template.');
  console.error(`Fill it in with release notes for v${version}.`);
  process.exit(1);
}

const sections = changelog.split(/(?=^## \[v)/m).filter((s) => s.startsWith('## [v'));

const currentHeader = `## [v${version}]`;
if (sections.length === 0 || !sections[0].startsWith(currentHeader)) {
  console.error(`CHANGELOG.md does not have v${version} as the most recent entry.`);
  console.error('Did prepare-changelog run on the release branch before this workflow?');
  process.exit(1);
}

if (sections.length < 2) {
  console.log('No previous release section found; skipping staleness check.');
  process.exit(0);
}

const previousBody = sections[1].replace(/^## \[v[^\n]*\n/, '').trim();

if (draft === previousBody) {
  console.error('CHANGELOG_DRAFT.md is identical to the previous release section.');
  console.error(`Did you forget to update CHANGELOG_DRAFT.md for v${version}?`);
  process.exit(1);
}

console.log('CHANGELOG_DRAFT.md is fresh (differs from previous release).');
