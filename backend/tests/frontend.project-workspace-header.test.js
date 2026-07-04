const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'app.js'), 'utf8');

function loadProjectWorkspaceHeaderHelpers() {
  const start = appJs.indexOf('function projectWorkspaceValue');
  const end = appJs.indexOf('function renderAdminDemoDealCard');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const source = `
    function escapeHtml(value) {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
    }
    ${appJs.slice(start, end)}
    module.exports = {
      projectWorkspaceStatus,
      projectWorkspaceFarmer,
      projectWorkspaceTimelineIndex,
      projectWorkspaceFormatDate,
      projectWorkspaceStageDates,
      projectWorkspaceCurrentCycle,
      projectWorkspaceNextMilestone,
      projectWorkspaceRoleDetails,
      projectFinancialOverviewItems,
      renderProjectFinancialOverview,
      renderProjectWorkspaceHeader,
    };
  `;
  const module = { exports: {} };
  Function('module', source)(module);
  return module.exports;
}

test('shared Project Workspace Header renders required project identity fields and timeline stages', () => {
  const { renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectWorkspaceHeader({
    deal: {
      id: 7,
      title: 'Hissar Sheep Pilot',
      deal_type: 'Hissar Sheep v1.0',
      status: 'Active',
      farmer_name: 'Hissar Pilot Farm',
    },
  });

  expect(html).toContain('data-project-workspace-header');
  expect(html).toContain('Hissar Sheep Pilot');
  expect(html).toContain('Hissar Sheep v1.0');
  expect(html).toContain('Project Status');
  expect(html).toContain('Active');
  expect(html).toContain('Project Operator');
  expect(html).toContain('AgriPartners');
  expect(html).toContain('Farmer');
  expect(html).toContain('Hissar Pilot Farm');
  expect(html).toContain('sm:grid-cols-2 lg:grid-cols-4');
  for (const stage of ['Funding', 'Farmer Confirmation', 'Production', 'Reports', 'Settlement', 'Completed']) {
    expect(html).toContain(`data-project-stage="${stage}"`);
  }
  expect(html).toContain('Current');
  expect(html).toContain('Upcoming');
  expect(html).toContain('Completion:');
  expect(html).toContain('Current cycle:');
  expect(html).toContain('data-timeline-role="investor"');
});

test('shared Project Workspace Header uses placeholders when project data is unavailable', () => {
  const { renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectWorkspaceHeader();

  expect(html).toContain('Project name unavailable');
  expect(html).toContain('Investment Model unavailable');
  expect(html).toContain('Status unavailable');
  expect(html).toContain('Assigned Farmer');
  expect(html).toContain('Completion: Not available');
  expect(html).toContain('Milestone unavailable');
  expect(html).not.toContain('undefined');
  expect(html).not.toContain('null');
});

test('shared Project Workspace Header derives completed, current and upcoming timeline states from existing data', () => {
  const { renderProjectWorkspaceHeader, projectWorkspaceTimelineIndex } = loadProjectWorkspaceHeaderHelpers();
  const activeHtml = renderProjectWorkspaceHeader({
    deal: { status: 'Active', fundingStatus: 'Funding Confirmed' },
    cycles: [{ fundingReceived: true }],
  });
  const completedHtml = renderProjectWorkspaceHeader({
    deal: { status: 'Completed' },
  });

  expect(projectWorkspaceTimelineIndex({ deal: { status: 'Active' } })).toBe(2);
  expect(activeHtml).toContain('data-project-stage="Production" data-stage-state="current"');
  expect(activeHtml).toContain('data-project-stage="Settlement" data-stage-state="upcoming"');
  expect(completedHtml.match(/data-stage-state="completed"/g)).toHaveLength(6);
  expect(completedHtml).toContain('Completed · Current stage');
  expect(completedHtml).toContain('ring-2 ring-green-400');
  expect(completedHtml).toContain('aria-current="step"');
});

test('shared timeline displays existing completion dates, current cycle and next milestone for Investor', () => {
  const { renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectWorkspaceHeader({
    role: 'investor',
    deal: { title: 'Hissar Pilot', status: 'Active' },
    status: { status: 'CycleActive', current_cycle: 2 },
    cycles: [{ id: 2, status: 'active', funding_received_at: '2026-07-02T00:00:00Z' }],
    events: [{ event_type: 'Funding Confirmed', created_at: '2026-07-01T00:00:00Z' }],
  });

  expect(html).toContain('Completion: Jul 1, 2026');
  expect(html).toContain('Current cycle: 2');
  expect(html).toContain('Current stage');
  expect(html).toContain('Production');
  expect(html).toContain('Next milestone');
  expect(html).toContain('Reports');
});

test('Farmer timeline displays next required action and due information', () => {
  const { renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectWorkspaceHeader({
    role: 'farmer',
    deal: { title: 'Feedlot Pilot', status: 'CycleActive' },
    cycles: [{
      id: 1,
      status: 'active',
      fundingReceived: true,
      report_due_at: '2026-07-15T00:00:00Z',
    }],
  });

  expect(html).toContain('data-timeline-role="farmer"');
  expect(html).toContain('Next required action');
  expect(html).toContain('Submit the next Project Report');
  expect(html).toContain('Due information');
  expect(html).toContain('Due Jul 15, 2026');
});

test('Operator timeline displays operational attention and pending review information', () => {
  const { renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectWorkspaceHeader({
    role: 'operator',
    deal: {
      title: 'Feedlot Pilot',
      status: 'CycleActive',
      attention_items: ['Late evidence', 'Payment variance'],
    },
    reports: [{ status: 'submitted' }],
  });

  expect(html).toContain('data-timeline-role="operator"');
  expect(html).toContain('Operational attention');
  expect(html).toContain('2 attention items');
  expect(html).toContain('Pending confirmations / reviews');
  expect(html).toContain('Report review pending');
});

test('shared Project Workspace Header reuses Farmer names, profiles and account identifiers', () => {
  const { projectWorkspaceFarmer, renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();

  expect(projectWorkspaceFarmer({ farmer_name: 'Named Farm', farmer: 'farmer.testnet' })).toBe('Named Farm');
  expect(projectWorkspaceFarmer({
    farmer_profile: { displayName: 'Profile Farm' },
    farmer: 'farmer.testnet',
  })).toBe('Profile Farm');
  expect(projectWorkspaceFarmer({ farmer: 'farmer.testnet' })).toBe('farmer.testnet');
  expect(projectWorkspaceFarmer()).toBe('Assigned Farmer');

  const escapedHtml = renderProjectWorkspaceHeader({ deal: { farmer: '<farmer.testnet>' } });
  expect(escapedHtml).toContain('&lt;farmer.testnet&gt;');
  expect(escapedHtml).not.toContain('<farmer.testnet>');
});

test('shared Project Workspace Header is view-only for every role', () => {
  const { renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectWorkspaceHeader({
    deal: { title: 'Feedlot Pilot 001', deal_type: 'Feedlot Livestock', status: 'Funding' },
  });

  expect(html).toContain('Feedlot Pilot 001');
  expect(html).toContain('Feedlot Livestock');
  expect(html).not.toMatch(/<(button|input|select|textarea)\b/);
});

test('Investor Project Financial Overview displays the required financial fields', () => {
  const { renderProjectFinancialOverview } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectFinancialOverview({
    role: 'investor',
    deal: {
      display_amount: '$75,000',
      fundingStatus: 'Funding Confirmed',
      projected_roi_pct: 18.5,
      display_expected_return: '$88,875',
      returnStatus: 'partial',
      status: 'Active',
      currentCycle: 2,
    },
  });

  expect(html).toContain('data-financial-role="investor"');
  for (const field of [
    'Investment Amount',
    'Funding Status',
    'Current Project Stage',
    'Current Production Cycle',
    'Projected ROI',
    'Projected Return',
    'Settlement Status',
  ]) {
    expect(html).toContain(`data-financial-field="${field}"`);
  }
  expect(html).toContain('$75,000');
  expect(html).toContain('18.5%');
  expect(html).toContain('$88,875');
  expect(html).toContain('Partially settled');
});

test('Farmer Project Financial Overview hides investor metrics and uses a budget placeholder', () => {
  const { renderProjectFinancialOverview } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectFinancialOverview({
    role: 'farmer',
    deal: {
      fundingStatus: 'Funding Confirmed',
      projected_roi_pct: 18.5,
      expected_return: 88875,
      status: 'Active',
      currentCycle: 1,
    },
  });

  expect(html).toContain('data-financial-role="farmer"');
  expect(html).toContain('Funding Status');
  expect(html).toContain('Current Production Cycle');
  expect(html).toContain('Project Budget');
  expect(html).toContain('Not available');
  expect(html).toContain('Next Required Action');
  expect(html).not.toContain('Projected ROI');
  expect(html).not.toContain('Projected Return');
  expect(html).not.toContain('Investment Amount');
  expect(html).not.toContain('APR');
});

test('Operator Project Financial Overview displays operational finance and attention fields', () => {
  const { renderProjectFinancialOverview } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectFinancialOverview({
    role: 'operator',
    deal: {
      funding: '$80,000',
      fundingStatus: 'Funding Confirmed',
      returnStatus: 'recorded',
      attention_items: ['Late evidence'],
      status: 'CycleActive',
      currentCycle: 3,
    },
    cycles: [{ fundingReceived: true, reportStatus: 'due' }],
  });

  expect(html).toContain('data-financial-role="operator"');
  for (const field of [
    'Investment Amount',
    'Funding Status',
    'Farmer Funding Confirmation',
    'Current Cycle',
    'Pending Reports',
    'Settlement Status',
    'Operational Attention',
  ]) {
    expect(html).toContain(`data-financial-field="${field}"`);
  }
  expect(html).toContain('1 pending report');
  expect(html).toContain('1 attention item');
  expect(html).not.toContain('Projected ROI');
});

test('Project Financial Overview is responsive, read-only and included in the shared workspace', () => {
  const { renderProjectFinancialOverview, renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const overview = renderProjectFinancialOverview();
  const workspace = renderProjectWorkspaceHeader();

  expect(overview).toContain('sm:grid-cols-2 lg:grid-cols-4');
  expect(overview).not.toMatch(/<(button|input|select|textarea)\b/);
  expect(workspace).toContain('data-project-financial-overview');
});

test('all Admin, Farmer and Investor project detail variants use the shared header', () => {
  const renderers = [
    'renderAdminDemoDealDetail',
    'renderFarmerDemoDealDetail',
    'renderFarmerDealDetail',
    'renderInvestorDemoDealDetail',
    'renderInvestorDealDetail',
    'renderDealDetail',
  ];

  for (const [index, renderer] of renderers.entries()) {
    const start = appJs.indexOf(`function ${renderer}`);
    const nextStart = index + 1 < renderers.length
      ? appJs.indexOf(`function ${renderers[index + 1]}`)
      : appJs.length;
    expect(start).toBeGreaterThanOrEqual(0);
    expect(appJs.slice(start, nextStart)).toContain('renderProjectWorkspaceHeader({');
  }
  expect(appJs.match(/role: 'investor'/g).length).toBeGreaterThanOrEqual(3);
  expect(appJs.match(/role: 'farmer'/g).length).toBeGreaterThanOrEqual(2);
  expect(appJs.match(/role: 'operator'/g).length).toBeGreaterThanOrEqual(2);
});
