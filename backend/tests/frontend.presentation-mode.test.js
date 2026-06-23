const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(
  path.join(__dirname, '..', '..', 'frontend', 'app.js'),
  'utf8'
);
const indexHtml = fs.readFileSync(
  path.join(__dirname, '..', '..', 'frontend', 'index.html'),
  'utf8'
);

function loadPresentationProfile() {
  const start = appJs.indexOf('const PRESENTATION_PROFILES');
  const end = appJs.indexOf('let activePresentationStepIndex');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const source = `
    ${appJs.slice(start, end)}
    module.exports = { PRESENTATION_PROFILES };
  `;
  const module = { exports: {} };
  Function('module', source)(module);
  return module.exports.PRESENTATION_PROFILES;
}

test('presentation route and view container exist', () => {
  expect(indexHtml).toContain('id="view-presentation"');
  expect(appJs).toContain("'view-presentation'");
  expect(appJs).toContain("hash === '#demo/presentation/investor'");
  expect(appJs).toContain('showInvestorPresentation(0)');
});

test('Investor Quick Demo renders with demo-safe banner and progress shell', () => {
  expect(appJs).toContain('function showInvestorPresentation');
  expect(appJs).toContain('function renderInvestorPresentationShell');
  expect(appJs).toContain('Investor Quick Demo · Alpha v1.1 · NEAR Testnet · Demo-safe');
  expect(appJs).toContain('data-presentation-progress');
  expect(appJs).toContain('Step ${stepIndex + 1} of ${flow.steps.length}');
});

test('Investor Quick Demo includes all eight required presentation steps', () => {
  const profiles = loadPresentationProfile();
  const steps = profiles.investor.flows.quickDemo.steps;
  expect(steps.map(step => step.title)).toEqual([
    'Welcome',
    'Opportunity',
    'Investment Terms',
    'Farmer Progress',
    'Returns Recorded',
    'Treasury Transparency',
    'Withdrawal Readiness',
    'Summary / Next Steps',
  ]);
});

test('presentation step data includes required reusable fields and topics', () => {
  const profiles = loadPresentationProfile();
  const steps = profiles.investor.flows.quickDemo.steps;
  for (const step of steps) {
    expect(step).toEqual(expect.objectContaining({
      title: expect.any(String),
      audienceQuestion: expect.any(String),
      keyMessage: expect.any(String),
      targetRoute: expect.any(String),
      presenterNote: expect.any(String),
      nextLabel: expect.any(String),
      topics: expect.any(Array),
    }));
    expect(step.title.length).toBeGreaterThan(0);
    expect(step.audienceQuestion.length).toBeGreaterThan(0);
    expect(step.keyMessage.length).toBeGreaterThan(0);
    expect(step.presenterNote.length).toBeGreaterThan(0);
    expect(step.topics.length).toBeGreaterThan(0);
  }
});

test('guided navigation controls and jump stepper render', () => {
  expect(appJs).toContain('id="presentation-prev"');
  expect(appJs).toContain('id="presentation-next"');
  expect(appJs).toContain('data-presentation-stepper');
  expect(appJs).toContain('data-presentation-jump');
  expect(appJs).toContain('bindPresentationControls(flow)');
});

test('presentation flow reuses existing demo and portal routes', () => {
  const profiles = loadPresentationProfile();
  const routes = profiles.investor.flows.quickDemo.steps.map(step => step.targetRoute);
  expect(routes).toEqual(expect.arrayContaining([
    '#home',
    '#/marketplace',
    '#/investor/pilots/hissar',
    '#farmer/pilots/hissar',
    '#/investor/pilots/fidlot',
    '#admin/treasury',
    '#investor',
  ]));
});

test('normal app and existing demo routes remain preserved', () => {
  for (const routeSource of [
    "hash === '#home'",
    "hash === '#/marketplace'",
    "hash === '#marketplace'",
    "hash === '#investor'",
    "hash === '#farmer'",
    "hash === '#admin'",
    "hash === '#/admin'",
    "hash === '#admin/treasury'",
    "hash.match(/^#\\/?investor\\/pilots\\/([a-z0-9-]+)$/)",
    "hash.match(/^#farmer\\/pilots\\/([a-z0-9-]+)$/)",
  ]) {
    expect(appJs).toContain(routeSource);
  }
});

test('basic presentation shell does not require backend API calls', () => {
  const start = appJs.indexOf('function showInvestorPresentation');
  const end = appJs.indexOf('async function redirectAuthenticatedUser');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const presentationSource = appJs.slice(start, end);
  expect(presentationSource).not.toContain('fetch(');
  expect(presentationSource).not.toContain('fetchAdminJson');
  expect(presentationSource).not.toContain('API_BASE');
});

