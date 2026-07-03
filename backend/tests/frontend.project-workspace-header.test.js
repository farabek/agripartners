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
});

test('shared Project Workspace Header uses placeholders when project data is unavailable', () => {
  const { renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectWorkspaceHeader();

  expect(html).toContain('Project name unavailable');
  expect(html).toContain('Investment Model unavailable');
  expect(html).toContain('Status unavailable');
  expect(html).toContain('Assigned Farmer');
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
});
