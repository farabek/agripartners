const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'target']);

function listProjectFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirs.has(entry.name)) return [];
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listProjectFiles(fullPath);
    return [fullPath];
  });
}

test('project does not use deprecated NEAR testnet RPC endpoint', () => {
  const deprecatedRpcUrl = `https://rpc.${'testnet'}.near.org`;
  const offenders = listProjectFiles(root).filter((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(deprecatedRpcUrl);
  });

  expect(offenders).toEqual([]);
});
