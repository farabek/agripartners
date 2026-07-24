const { execFileSync } = require('child_process');
const path = require('path');

const repoRoot = path.join(__dirname, '..', '..');
// Audit-checkpoint verification only: this intentionally requires the complete
// Slice 2 Git history and is not a permanent unrestricted branch policy.
const originalBaseline = 'd29efa54e6aa9a34995a00e44fef5f8e6c94a39c';
const correctionBaseline = 'd43823d0389af42ad7ebdad831736168a7c71a36';
const originalFiles = [
  'backend/src/db/migrations/017_project_expense_accounting_foundation.sql',
  'backend/tests/projectExpenseAccountingMigration.test.js',
  'backend/tests/projectExpenseAccountingRuntime.test.js',
];
const correctionFiles = [
  'backend/tests/disposablePostgresHarness.test.js',
  'backend/tests/helpers/disposablePostgresHarness.js',
  'backend/tests/projectExpenseAccountingMigration.test.js',
  'backend/tests/projectExpenseAccountingRuntime.test.js',
  'backend/tests/slice2CommitScope.test.js',
];

function git(args) {
  try {
    return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch (error) {
    throw new Error(
      `Slice 2 audit-checkpoint verification requires Git and full history ` +
      `(including ${originalBaseline} and ${correctionBaseline}). ` +
      `Shallow or incomplete clones are unsupported. Git command failed: ${error.message}`
    );
  }
}

function lines(value) {
  return value ? value.split(/\r?\n/).filter(Boolean) : [];
}

test('original Slice 2 implementation commit changed exactly the approved three files', () => {
  git(['cat-file', '-e', `${originalBaseline}^{commit}`]);
  git(['cat-file', '-e', `${correctionBaseline}^{commit}`]);
  expect(lines(git(['diff', '--name-only', `${originalBaseline}..${correctionBaseline}`])).sort())
    .toEqual([...originalFiles].sort());
});

test('audit correction scope contains test infrastructure only', () => {
  const tracked = lines(git(['diff', '--name-only', correctionBaseline]));
  const untracked = lines(git(['ls-files', '--others', '--exclude-standard']));
  const changed = [...new Set([...tracked, ...untracked])].sort();
  for (const file of changed) {
    expect(correctionFiles).toContain(file);
    expect(file).not.toMatch(/(^|\/)(src|routes|services|frontend)\//);
    expect(file).not.toMatch(/\.(env|pem|key|p12)$/i);
  }
  expect(changed).toContain('backend/tests/slice2CommitScope.test.js');
});
