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
      projectWorkspaceLocation,
      projectWorkspaceHeaderFields,
      projectWorkspaceTimelineIndex,
      projectWorkspaceFormatDate,
      projectWorkspaceStageDates,
      projectWorkspaceStageContext,
      projectWorkspaceCurrentCycle,
      projectWorkspaceNextMilestone,
      projectWorkspaceRoleDetails,
      projectFinancialOverviewItems,
      renderProjectFinancialOverview,
      projectActivityItems,
      renderProjectActivityFeed,
      projectDocumentCatalog,
      renderProjectDocuments,
      renderInvestorWorkspaceTabs,
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
      location: 'Samarkand, Uzbekistan',
      display_amount: '$50,000',
      projected_roi_pct: 63.3,
      apr_pct: 21.1,
    },
  });

  expect(html).toContain('data-project-workspace-header');
  expect(html).toContain('Hissar Sheep Pilot');
  expect(html).toContain('Hissar Sheep v1.0');
  expect(html).toContain('In progress');
  expect(html).toContain('data-project-header-fields');
  expect(html).toContain('data-header-role="investor"');
  for (const [label, value] of [
    ['Farmer', 'Hissar Pilot Farm'],
    ['Country', 'Samarkand, Uzbekistan'],
  ]) {
    expect(html).toContain(`data-header-field="${label}"`);
    expect(html).toContain(value);
  }
  for (const [label, value] of [
    ['Investment', '$50,000'],
    ['ROI', '63.3%'],
    ['APR', '21.1%'],
  ]) {
    expect(html).toContain(`data-financial-field="${label}"`);
    expect(html).toContain(value);
  }
  expect(html).toContain('workspace-identity-grid');
  for (const stage of ['Funding', 'Farmer Confirmation', 'Production', 'Reports', 'Settlement', 'Completed']) {
    expect(html).toContain(`data-project-stage="${stage}"`);
  }
  expect(html).toContain('Current');
  expect(html).toContain('data-stage-state="upcoming"');
  expect(html).toContain('Completion recorded');
  expect(html).toContain('In progress');
  expect(html).toContain('Starts after Production');
  expect(html).toContain('data-financial-field="Current Cycle"');
  expect(html).toContain('data-investor-timeline');
});

test('shared Project Workspace Header hides missing metrics instead of rendering profile placeholders', () => {
  const { renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectWorkspaceHeader();
  const headerTop = html.slice(0, html.indexOf('<div class="mt-5">'));

  expect(headerTop).toContain('Project');
  expect(headerTop).toContain('Pending project update');
  expect(headerTop).not.toContain('data-project-header-fields');
  expect(headerTop).not.toContain('Project name unavailable');
  expect(headerTop).not.toContain('Investment Model unavailable');
  expect(headerTop).not.toContain('Assigned Farmer');
  expect(headerTop).not.toContain('undefined');
  expect(headerTop).not.toContain('null');
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
  expect(activeHtml).toContain('workspace-timeline-stage is-current');
  expect(activeHtml).toContain('workspace-timeline-stage is-upcoming');
  expect(completedHtml.match(/data-stage-state="completed"/g)).toHaveLength(6);
  expect(completedHtml).toContain('workspace-timeline-stage is-completed');
  expect(completedHtml).not.toContain('Completed · Current stage');
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

  expect(html).toContain('Completed Jul 1, 2026');
  expect(html).toContain('data-financial-field="Current Cycle"');
  expect(html).toContain('<dd>2</dd>');
  expect(html).toContain('Production');
  expect(html).toContain('Production Status');
  expect(html).toContain('Farmer Reports');
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
  expect(html).toContain('Workflow status');
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
  expect(projectWorkspaceFarmer()).toBeNull();

  const escapedHtml = renderProjectWorkspaceHeader({ deal: { farmer: '<farmer.testnet>' } });
  expect(escapedHtml).toContain('&lt;farmer.testnet&gt;');
  expect(escapedHtml).not.toContain('<farmer.testnet>');
});

test('canonical header applies role-appropriate fields without changing its card system', () => {
  const { renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const deal = {
    title: 'Orchard Project',
    farmer_name: 'Orchard Farm',
    location: 'Tashkent Region',
    display_amount: '$75,000',
    projected_roi_pct: 18.5,
    apr_pct: 12,
    fundingStatus: 'Funding Confirmed',
  };
  const investor = renderProjectWorkspaceHeader({ role: 'investor', deal });
  const farmer = renderProjectWorkspaceHeader({ role: 'farmer', deal });
  const operator = renderProjectWorkspaceHeader({ role: 'operator', deal });

  for (const html of [farmer, operator]) {
    expect(html).toContain('data-project-header-fields');
    expect(html).toContain('sm:grid-cols-2 xl:grid-cols-5');
    expect(html).toContain('data-header-field="Farmer"');
    expect(html).toContain('data-header-field="Location"');
  }
  expect(investor).toContain('workspace-identity-grid');
  expect(investor).toContain('data-header-field="Farmer"');
  expect(investor).toContain('data-header-field="Country"');
  expect(investor).not.toContain('data-header-field="Investment"');
  expect(investor).toContain('data-financial-field="Investment"');
  expect(investor).toContain('data-financial-field="ROI"');
  expect(investor).toContain('data-financial-field="APR"');
  expect(farmer).toContain('data-header-field="Project Budget"');
  expect(farmer).not.toContain('data-header-field="Projected ROI"');
  expect(farmer).not.toContain('data-header-field="APR"');
  expect(operator).toContain('data-header-field="Investment"');
  expect(operator).not.toContain('data-header-field="Projected ROI"');
  expect(operator).not.toContain('data-header-field="APR"');
});

test('shared Project Workspace Header has accessible tab controls without editable fields', () => {
  const { renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectWorkspaceHeader({
    deal: { title: 'Feedlot Pilot 001', deal_type: 'Feedlot Livestock', status: 'Funding' },
  });

  expect(html).toContain('Feedlot Pilot 001');
  expect(html).toContain('Feedlot Livestock');
  expect(html).not.toMatch(/<(form|input|select|textarea)\b/);
  expect(html.match(/role="tab"/g)).toHaveLength(6);
  expect(html).toContain('aria-selected="true"');
  expect(html).toContain('tabindex="0"');
});

test('Investor Project Financial Overview omits metrics owned by the canonical header', () => {
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
    'Funding Status',
    'Current Project Stage',
    'Current Production Cycle',
    'Projected Return',
    'Settlement Status',
  ]) {
    expect(html).toContain(`data-financial-field="${field}"`);
  }
  expect(html).not.toContain('data-financial-field="Investment Amount"');
  expect(html).not.toContain('data-financial-field="Projected ROI"');
  expect(html).toContain('$88,875');
  expect(html).toContain('Partially settled');
});

test('Farmer Project Financial Overview hides header-owned and investor-only metrics', () => {
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
  expect(html).toContain('Next Required Action');
  expect(html).not.toContain('Project Budget');
  expect(html).not.toContain('Projected ROI');
  expect(html).not.toContain('Projected Return');
  expect(html).not.toContain('Investment Amount');
  expect(html).not.toContain('APR');
});

test('Operator Project Financial Overview displays operational fields without repeating header investment', () => {
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
  expect(html).not.toContain('data-financial-field="Investment Amount"');
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

test('Investor Project Activity Feed shows approved chronological activity and next milestone', () => {
  const { renderProjectActivityFeed } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectActivityFeed({
    role: 'investor',
    deal: { status: 'Active' },
    events: [
      { event_type: 'Funding Confirmed', created_at: '2026-07-01T09:00:00Z' },
      { event_type: 'Production Started', created_at: '2026-07-02T09:00:00Z' },
      { event_type: 'Farmer Report Submitted', created_at: '2026-07-03T09:00:00Z' },
      { event_type: 'Farmer Report Approved', created_at: '2026-07-04T09:00:00Z' },
    ],
  });

  expect(html).toContain('data-activity-role="investor"');
  expect(html).toContain('Next expected milestone');
  expect(html).toContain('Farmer Report Approved');
  expect(html).not.toContain('Farmer Report Submitted');
  expect(html.indexOf('Farmer Report Approved')).toBeLessThan(html.indexOf('Production Started'));
  expect(html).toContain('datetime="2026-07-04T09:00:00Z"');
  expect(html).toContain('Approved');
});

test('Farmer Project Activity Feed shows own reports and actions but hides internal notes', () => {
  const { renderProjectActivityFeed } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectActivityFeed({
    role: 'farmer',
    deal: { status: 'CycleActive' },
    cycles: [{ id: 1, status: 'active', fundingReceived: true }],
    events: [
      { event_type: 'Farmer Report Submitted', created_at: '2026-07-03T09:00:00Z' },
      {
        event_type: 'Internal Risk Review',
        created_at: '2026-07-04T09:00:00Z',
        internal_note: 'Operator-only risk note',
        operator_only: true,
      },
    ],
  });

  expect(html).toContain('data-activity-role="farmer"');
  expect(html).toContain('Farmer Funding Confirmation');
  expect(html).toContain('Production Started');
  expect(html).toContain('Farmer Report Submitted');
  expect(html).toContain('Next required action');
  expect(html).not.toContain('Internal Risk Review');
  expect(html).not.toContain('Operator-only risk note');
});

test('Operator Project Activity Feed shows workflow, pending items and operational alerts', () => {
  const { renderProjectActivityFeed } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectActivityFeed({
    role: 'operator',
    deal: {
      status: 'ReportsPending',
      farmerConfirmed: false,
      attention_items: ['Missing receipt evidence'],
    },
    reports: [{ status: 'submitted', submitted_at: '2026-07-03T09:00:00Z' }],
    events: [{
      event_type: 'Internal Risk Review',
      created_at: '2026-07-04T09:00:00Z',
      internal_note: 'Operator-only risk note',
      operator_only: true,
    }],
  });

  expect(html).toContain('data-activity-role="operator"');
  expect(html).toContain('Pending approvals');
  expect(html).toContain('Pending confirmations');
  expect(html).toContain('Operational alerts');
  expect(html).toContain('Workflow status');
  expect(html).toContain('Farmer Report Submitted');
  expect(html).toContain('Operational Alert');
  expect(html).toContain('Operator-only risk note');
});

test('Project Activity Feed supports an empty state', () => {
  const { renderProjectActivityFeed } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectActivityFeed();

  expect(html).toContain('data-activity-empty');
  expect(html).toContain('No Project activity yet');
  expect(html).not.toContain('<ol');
});

test('Project Activity Feed remains reusable while History owns canonical workspace activity', () => {
  const { renderProjectActivityFeed, renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const feed = renderProjectActivityFeed({
    events: [{ event_type: 'Funding Confirmed' }],
  });
  const workspace = renderProjectWorkspaceHeader();

  expect(feed).toContain('sm:grid-cols-2');
  expect(feed).toContain('sm:flex-row');
  expect(feed).toContain('sm:p-4');
  expect(feed).toContain('Date not yet provided');
  expect(workspace).not.toContain('data-project-activity-feed');
  expect(workspace).toContain('Activity Timeline');
  expect(workspace).toContain('Chronological Event Feed');
});

test('Investor Project Documents displays investor documents and hides farmer-only documents', () => {
  const { renderProjectDocuments } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectDocuments({
    role: 'investor',
    deal: { pilot_key: 'fidlot', settlement_status: 'accepted' },
    reports: [{ status: 'approved', document_url: '/reports/approved-1.pdf' }],
  });

  for (const title of [
    'Project Disclosure Sheet',
    'Investment Participation Agreement',
    'Risk Disclosure',
    'Farmer Reports',
    'Settlement Records',
  ]) {
    expect(html).toContain(`data-document-title="${title}"`);
  }
  for (const status of ['Draft', 'Architecture Draft / Review', 'Accepted', 'Published']) {
    expect(html).toContain(`data-document-status="${status}"`);
  }
  expect(html.match(/workspace-document-action/g).length).toBeGreaterThanOrEqual(5);
  expect(html).toContain('View Document');
  expect(html).toContain('View Reports');
  expect(html).toContain('View Settlement Records');
  expect(html).not.toContain('>Open<');
  expect(html).not.toContain('download');
  expect(html).toContain('&#128203;');
  expect(html).toContain('&#128221;');
  expect(html).toContain('&#9888;');
  expect(html).toContain('&#128202;');
  expect(html).toContain('&#128179;');
  expect(html).not.toContain('Farmer Agreement');
  expect(html).not.toContain('Submitted Reports');
  expect(html).not.toContain('Internal Project Notes');
});

test('Investor Project Documents exposes truthful legal previews without local paths or fake downloads', () => {
  const { renderProjectDocuments } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectDocuments({ role: 'investor' });

  expect(html).toContain('data-document-availability="Draft - Preview Available"');
  expect(html).toContain('data-document-availability="Review - Preview Available"');
  expect(html).toContain('Legal Document Previews');
  expect(html).toContain('docs/legal/PROJECT_DISCLOSURE_SHEET.md');
  expect(html).toContain('docs/legal/INVESTMENT_PARTICIPATION_AGREEMENT.md');
  expect(html).toContain('docs/legal/RISK_DISCLOSURE.md');
  expect(html).toContain('PDF release planned for Legal Package v1.0');
  expect(html).not.toContain('C:\\');
  expect(html).not.toContain('file://');
  expect(html).not.toContain('download');
});

test('Investor Project Documents navigates reports and settlement through workspace tabs', () => {
  const { renderProjectDocuments } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectDocuments({
    role: 'investor',
    deal: { settlement_status: 'accepted' },
    reports: [{ status: 'approved' }],
  });

  expect(html).toContain('data-workspace-tab-target="reports"');
  expect(html).toContain('data-workspace-scroll-target="workspace-panel-reports"');
  expect(html).toContain('data-workspace-tab-target="returns"');
  expect(html).toContain('data-workspace-scroll-target="workspace-panel-returns"');
});

test('Farmer Project Documents displays farmer documents without investor-only documents', () => {
  const { renderProjectDocuments } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectDocuments({
    role: 'farmer',
    cycles: [{
      id: 1,
      reportStatus: 'submitted',
      report: { title: 'Cycle report', submittedAt: '2026-07-04T09:00:00Z' },
    }],
  });

  for (const title of [
    'Project Disclosure Sheet',
    'Farmer Agreement',
    'Submitted Reports',
    'Operating Instructions',
  ]) {
    expect(html).toContain(`data-document-title="${title}"`);
  }
  expect(html).toContain('1 submitted Project Report available.');
  expect(html).not.toContain('Investment Participation Agreement');
  expect(html).not.toContain('Risk Disclosure');
  expect(html).not.toContain('Farmer Reports');
  expect(html).not.toContain('Settlement Records');
});

test('Operator Project Documents displays investor, farmer and internal document groups', () => {
  const { renderProjectDocuments } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectDocuments({
    role: 'operator',
    deal: { pilot_key: 'hissar' },
  });

  for (const title of [
    'Project Disclosure Sheet',
    'Investment Participation Agreement',
    'Risk Disclosure',
    'Farmer Reports',
    'Settlement Records',
    'Farmer Agreement',
    'Submitted Reports',
    'Operating Instructions',
    'Internal Project Notes',
    'Compliance Documents',
    'Settlement Documents',
  ]) {
    expect(html).toContain(`data-document-title="${title}"`);
  }
});

test('Project Documents clearly marks review and draft documents', () => {
  const { renderProjectDocuments } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectDocuments({ role: 'farmer' });

  expect(html).toContain('data-document-title="Farmer Agreement" data-document-status="Review"');
  expect(html).toContain('data-document-title="Operating Instructions" data-document-status="Draft"');
  expect(html).toContain('disabled');
  expect(html).toContain('Not Yet Available');
});

test('Project Documents supports an empty state', () => {
  const { renderProjectDocuments } = loadProjectWorkspaceHeaderHelpers();
  const html = renderProjectDocuments({ documents: [] });

  expect(html).toContain('data-documents-empty');
  expect(html).toContain('Project documents not yet provided');
  expect(html).not.toContain('<article');
});

test('Project Documents is responsive and is the final shared Workspace block', () => {
  const { renderProjectDocuments, renderProjectWorkspaceHeader } = loadProjectWorkspaceHeaderHelpers();
  const documents = renderProjectDocuments();
  const workspace = renderProjectWorkspaceHeader();

  expect(documents).toContain('sm:grid-cols-2 xl:grid-cols-3');
  expect(documents).toContain('workspace-document-action');
  expect(workspace).toContain('data-project-documents');
  expect(workspace.indexOf('data-project-activity-feed'))
    .toBeLessThan(workspace.indexOf('data-project-documents'));
  expect(workspace.indexOf('data-project-documents')).toBeLessThan(workspace.lastIndexOf('</section>'));
});

test('Investor Documents tab panel is isolated from Returns and Settlement content', () => {
  const { renderInvestorWorkspaceTabs } = loadProjectWorkspaceHeaderHelpers();
  const html = renderInvestorWorkspaceTabs({
    deal: { id: 12, settlement_status: 'accepted' },
    returns: [{ amount_near: '1', created_at: '2026-07-01T00:00:00Z' }],
  });
  const start = html.indexOf('id="workspace-panel-documents"');
  const end = html.indexOf('id="workspace-panel-history"');
  const documentsPanel = html.slice(start, end);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  expect(documentsPanel).toContain('data-project-documents');
  expect(documentsPanel).toContain('Document Center');
  expect(documentsPanel).not.toContain('Settlement Action');
  expect(documentsPanel).not.toContain('Returns Ledger');
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
  expect(appJs).not.toContain('${renderAdminDemoProjectProfile(deal)}');
  expect(appJs).not.toContain('${renderFarmerProjectProfile(deal)}');
  expect(appJs).not.toContain('${renderProjectProfile(deal, status)}');
  expect(appJs).not.toContain('${renderProjectProfile(deal, status, resourceErrors.status)}');
});
