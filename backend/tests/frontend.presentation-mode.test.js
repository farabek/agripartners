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

function loadPresentationRuntime(localStorageMock = { getItem: jest.fn(), setItem: jest.fn() }) {
  const start = appJs.indexOf('const PRESENTATION_SETTINGS_KEY');
  const end = appJs.indexOf('function showInvestorPresentation');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const source = `
    ${appJs.slice(start, end)}
    module.exports = {
      PRESENTATION_PROFILES,
      PRESENTATION_STEP_DETAILS,
      DEFAULT_PRESENTATION_SETTINGS,
      loadPresentationSettings,
      savePresentationSettings,
      presentationProfile,
      presentationFlow,
      enrichedPresentationStep,
      presentationProgress,
      presentationStepStatus,
    };
  `;
  const module = { exports: {} };
  Function('module', 'localStorage', source)(module, localStorageMock);
  return module.exports;
}

test('presentation route and view container exist', () => {
  expect(indexHtml).toContain('id="view-presentation"');
  expect(appJs).toContain("'view-presentation'");
  expect(appJs).toContain("hash.match(/^#demo\\/presentation\\/(investor|near|accelerator|enterprise)$/)");
  expect(appJs).toContain('showInvestorPresentation(0, presentationMatch[1])');
});

test('all four presentation routes and profiles are supported', () => {
  const profiles = loadPresentationProfile();
  expect(Object.keys(profiles).sort()).toEqual(['accelerator', 'enterprise', 'investor', 'near']);
  for (const profileId of ['investor', 'near', 'accelerator', 'enterprise']) {
    expect(appJs).toContain(profileId);
    expect(profiles[profileId]).toEqual(expect.objectContaining({
      title: expect.any(String),
      description: expect.any(String),
      audience: expect.any(String),
      objective: expect.any(String),
      estimatedDuration: expect.any(String),
      defaultFlow: 'quickDemo',
    }));
  }
});

test('Investor Quick Demo renders with demo-safe banner and progress shell', () => {
  expect(appJs).toContain('function showInvestorPresentation');
  expect(appJs).toContain('function renderInvestorPresentationShell');
  expect(appJs).toContain('Investor Quick Demo | Alpha v1.1 | NEAR Testnet | Demo-safe');
  expect(appJs).toContain('data-presentation-progress');
  expect(appJs).toContain('data-presentation-percent');
  expect(appJs).toContain('data-presentation-remaining');
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

test('profile-specific metadata overrides fallback step metadata', () => {
  const runtime = loadPresentationRuntime();
  const baseStep = runtime.PRESENTATION_PROFILES.investor.flows.quickDemo.steps
    .find(step => step.title === 'Treasury Transparency');
  expect(runtime.enrichedPresentationStep(baseStep, 'near').keyMessage)
    .toContain('blockchain evidence');
  expect(runtime.enrichedPresentationStep(baseStep, 'enterprise').audienceQuestion)
    .toContain('auditability');
  expect(runtime.enrichedPresentationStep(baseStep, 'investor').keyMessage)
    .toContain('append-only accounting trail');
});

test('presentation flow reuses the same engine while switching audience copy', () => {
  const runtime = loadPresentationRuntime();
  expect(runtime.presentationFlow('near').title).toBe('NEAR Foundation Quick Demo');
  expect(runtime.presentationFlow('accelerator').duration).toBe('~6 minutes');
  expect(runtime.presentationFlow('enterprise').steps).toBe(runtime.PRESENTATION_PROFILES.investor.flows.quickDemo.steps);
});

test('guided timeline renders status, icon, title, and description', () => {
  expect(appJs).toContain('function renderPresentationTimeline');
  expect(appJs).toContain('data-presentation-timeline');
  expect(appJs).toContain('data-presentation-status');
  expect(appJs).toContain('presentation-timeline-icon');
  expect(appJs).toContain('presentation-timeline-title');
  expect(appJs).toContain('presentation-timeline-description');
  expect(appJs).toContain("return 'completed'");
  expect(appJs).toContain("return 'current'");
  expect(appJs).toContain("return 'upcoming'");
});

test('progress indicator includes percent and estimated remaining time', () => {
  const runtime = loadPresentationRuntime();
  const flow = runtime.PRESENTATION_PROFILES.investor.flows.quickDemo;
  expect(runtime.presentationProgress(flow, 2)).toEqual(expect.objectContaining({
    label: 'Step 3 of 8',
    completionPercent: 38,
  }));
  expect(runtime.presentationProgress(flow, 2).remainingLabel).toContain('minutes remaining');
});

test('guided navigation controls, jump stepper, and keyboard navigation render', () => {
  expect(appJs).toContain('id="presentation-prev"');
  expect(appJs).toContain('id="presentation-next"');
  expect(appJs).toContain('data-presentation-stepper');
  expect(appJs).toContain('data-presentation-jump');
  expect(appJs).toContain('bindPresentationControls(flow)');
  expect(appJs).toContain('handlePresentationKeyboardNavigation');
  expect(appJs).toContain("event.key === 'ArrowRight'");
  expect(appJs).toContain("event.key !== 'ArrowLeft'");
});

test('audience selector and audience summary render', () => {
  expect(appJs).toContain('data-presentation-audience-selector');
  expect(appJs).toContain('Presentation Audience');
  expect(appJs).toContain('name="presentation-profile"');
  expect(appJs).toContain('data-presentation-audience-summary');
  expect(appJs).toContain("Today's focus");
  expect(appJs).toContain('PRESENTATION_PROFILE_ORDER.map');
});

test('step cards render why it matters, transition text, metrics, and presenter notes', () => {
  expect(appJs).toContain('Why it matters');
  expect(appJs).toContain('What comes next');
  expect(appJs).toContain('data-presentation-metrics');
  expect(appJs).toContain('function renderPresenterNotesPanel');
  expect(appJs).toContain('data-presenter-notes');
});

test('presenter information includes audience, duration, and objective', () => {
  expect(appJs).toContain('Current audience');
  expect(appJs).toContain('Estimated total duration');
  expect(appJs).toContain('Profile objective');
  expect(appJs).toContain('profile.objective');
});

test('presenter notes are gated by Presenter Mode', () => {
  expect(appJs).toContain('presentationSettings.presenterMode ? renderPresenterNotesPanel(step) :');
  expect(appJs).toContain("renderPresentationSettingToggle('presenterMode', 'Presenter Mode', settings.presenterMode)");
});

test('viewer mode hides presenter notes through local settings', () => {
  const runtime = loadPresentationRuntime({
    getItem: jest.fn(() => JSON.stringify({ presenterMode: false })),
    setItem: jest.fn(),
  });
  expect(runtime.loadPresentationSettings().presenterMode).toBe(false);
});

test('presentation settings persist locally', () => {
  const localStorageMock = { getItem: jest.fn(), setItem: jest.fn() };
  const runtime = loadPresentationRuntime(localStorageMock);
  runtime.savePresentationSettings({ presenterMode: false, showTimeline: false, showProgress: true });
  expect(localStorageMock.setItem).toHaveBeenCalledWith(
    'ap_presentation_settings',
    JSON.stringify({ presenterMode: false, showTimeline: false, showProgress: true })
  );
});

test('profile switching updates the presentation profile without duplicating the engine', () => {
  expect(appJs).toContain('presentationProfileUrl(profileId)');
  expect(appJs).toContain('showInvestorPresentation(0, profileId)');
  expect(appJs).toContain('activePresentationProfileId = profile.id');
  expect((appJs.match(/function renderInvestorPresentationShell/g) || []).length).toBe(1);
});

test('highlighted metrics use concise demo-safe language', () => {
  const runtime = loadPresentationRuntime();
  expect(runtime.PRESENTATION_STEP_DETAILS['Investment Terms'].metrics).toEqual(expect.arrayContaining([
    '$50,000 Investment',
    '6 Cycles',
    '63.3% Projected Return',
  ]));
  expect(runtime.PRESENTATION_STEP_DETAILS['Returns Recorded'].metrics).toEqual(expect.arrayContaining([
    '$82,000 Recorded Return',
    '7 Cycles',
  ]));
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
    "hash.match(/^#demo\\/presentation\\/(investor|near|accelerator|enterprise)$/)",
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
