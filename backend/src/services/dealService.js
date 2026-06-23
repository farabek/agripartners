const pool = require('../db/index');
const {
  parseNearToYocto,
  formatYoctoToNear,
  calculateDealFinancialSummary,
  calculatePortfolioFinancialSummary,
} = require('./financialService');

function normalizeReturnAmount(value) {
  const amountYocto = parseNearToYocto(value);
  if (amountYocto <= 0n) throw new Error('amount_near must be positive');
  return formatYoctoToNear(amountYocto);
}

const RETURN_ENTRY_TYPES = new Set(['principal', 'profit', 'fee']);
const RETURN_PAYMENT_STATUSES = new Set(['recorded', 'approved', 'paid', 'reconciled']);
const CLIENT_PROTECTED_RETURN_FIELDS = [
  'payment_status',
  'currency',
  'recorded_by',
  'transaction_hash',
  'reconciled_at',
  'reconciled_by',
  'reconciliation_metadata',
];

function normalizeReturnEntryType(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const entryType = String(value).trim().toLowerCase();
  if (entryType === 'correction') {
    throw new Error('entry_type correction is not supported');
  }
  if (!RETURN_ENTRY_TYPES.has(entryType)) {
    throw new Error('entry_type must be principal, profit, or fee');
  }
  return entryType;
}

function normalizeReturnPaymentStatus(value, fieldName) {
  if (value === null || value === undefined || String(value).trim() === '') {
    if (fieldName === 'from_status') return null;
    throw new Error(`${fieldName} is required`);
  }
  const status = String(value).trim().toLowerCase();
  if (!RETURN_PAYMENT_STATUSES.has(status)) {
    throw new Error(`${fieldName} must be recorded, approved, paid, or reconciled`);
  }
  return status;
}

function toReturnDto(row) {
  const entryType = row.entry_type ?? null;
  return {
    ...row,
    entry_type: entryType,
    legacyUntyped: entryType === null,
    payment_status: row.payment_status ?? 'recorded',
    currency: row.currency ?? 'NEAR',
    recorded_by: row.recorded_by ?? null,
    transaction_hash: row.transaction_hash ?? null,
    reconciled_at: row.reconciled_at ?? null,
    reconciled_by: row.reconciled_by ?? null,
    reconciliation_metadata: row.reconciliation_metadata ?? null,
  };
}

async function getAllDeals() {
  const { rows } = await pool.query(
    'SELECT * FROM deals ORDER BY created_at DESC'
  );
  return rows;
}

async function getDealById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM deals WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function getInvestorDeals(accountId) {
  const { rows } = await pool.query(
    'SELECT * FROM deals WHERE investor = $1 ORDER BY created_at DESC',
    [accountId]
  );
  return rows;
}

async function getInvestorDealById(accountId, dealId) {
  const { rows } = await pool.query(
    'SELECT * FROM deals WHERE id = $1 AND investor = $2',
    [dealId, accountId]
  );
  return rows[0] || null;
}

async function getFarmerDeals(accountId) {
  const { rows } = await pool.query(
    'SELECT * FROM deals WHERE farmer = $1 ORDER BY created_at DESC',
    [accountId]
  );
  return rows;
}

async function getFarmerDealById(accountId, dealId) {
  const { rows } = await pool.query(
    'SELECT * FROM deals WHERE id = $1 AND farmer = $2',
    [dealId, accountId]
  );
  return rows[0] || null;
}

async function createDeal(deal) {
  const { rows } = await pool.query(
    `INSERT INTO deals (
      contract_address, deal_type, title, description, farmer, investor, admin, platform,
      investment_amount, farmer_split_pct, investor_split_pct, escrow_pct,
      performance_fee_pct, cycle_duration_days, total_cycles, capital_return_near
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    RETURNING *`,
    [
      deal.contract_address, deal.deal_type, deal.title ?? null, deal.description ?? null,
      deal.farmer, deal.investor,
      deal.admin, deal.platform, deal.investment_amount,
      deal.farmer_split_pct, deal.investor_split_pct, deal.escrow_pct,
      deal.performance_fee_pct, deal.cycle_duration_days, deal.total_cycles,
      deal.capital_return_near
    ]
  );
  return rows[0];
}

async function addEvent(event) {
  await pool.query(
    `INSERT INTO events (deal_id, event_type, cycle_num, profit_near, losses_near, tx_hash)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      event.deal_id, event.event_type, event.cycle_num ?? null,
      event.profit_near ?? null, event.losses_near ?? null,
      event.tx_hash ?? null
    ]
  );
}

async function getDealEvents(dealId) {
  const { rows } = await pool.query(
    'SELECT * FROM events WHERE deal_id = $1 ORDER BY created_at ASC',
    [dealId]
  );
  return rows;
}

async function getFarmerCycleUpdates(dealId) {
  const { rows } = await pool.query(
    'SELECT * FROM farmer_cycle_updates WHERE deal_id = $1 ORDER BY cycle_num ASC',
    [dealId]
  );
  return rows;
}

async function getFarmerReports(dealId) {
  const { rows } = await pool.query(
    'SELECT * FROM reports WHERE deal_id = $1 ORDER BY cycle_id ASC, created_at ASC',
    [dealId]
  );
  return rows;
}

async function getDealReturns(dealId) {
  const { rows } = await pool.query(
    'SELECT * FROM deal_returns WHERE deal_id = $1 ORDER BY created_at ASC',
    [dealId]
  );
  return rows.map(toReturnDto);
}

async function createReturnStatusEvent({
  returnId,
  fromStatus = null,
  toStatus,
  changedBy = null,
  note = null,
  evidenceMetadata = null,
}) {
  const normalizedFromStatus = normalizeReturnPaymentStatus(fromStatus, 'from_status');
  const normalizedToStatus = normalizeReturnPaymentStatus(toStatus, 'to_status');
  const { rows } = await pool.query(
    `INSERT INTO return_status_events (
       return_id, from_status, to_status, changed_by, note, evidence_metadata
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      returnId,
      normalizedFromStatus,
      normalizedToStatus,
      changedBy,
      note,
      evidenceMetadata,
    ]
  );
  return rows[0];
}

async function getReturnStatusEvents(returnId) {
  const { rows } = await pool.query(
    'SELECT * FROM return_status_events WHERE return_id = $1 ORDER BY changed_at ASC, id ASC',
    [returnId]
  );
  return rows;
}

async function createDealReturn(dealId, repayment, recordedBy = null) {
  const protectedField = CLIENT_PROTECTED_RETURN_FIELDS.find(
    (field) => Object.prototype.hasOwnProperty.call(repayment, field)
  );
  if (protectedField) throw new Error(`${protectedField} cannot be set by client`);

  const amountNear = normalizeReturnAmount(repayment.amount_near);
  const note = String(repayment.note ?? '').trim() || null;
  const entryType = normalizeReturnEntryType(repayment.entry_type);
  const { rows } = await pool.query(
    `INSERT INTO deal_returns (
       deal_id, amount_near, note, entry_type, payment_status, currency, recorded_by
     )
     VALUES ($1, $2, $3, $4, 'recorded', 'NEAR', $5)
     RETURNING *`,
    [dealId, amountNear, note, entryType, recordedBy]
  );
  const repaymentDto = toReturnDto(rows[0]);
  await createReturnStatusEvent({
    returnId: repaymentDto.id,
    fromStatus: null,
    toStatus: 'recorded',
    changedBy: repaymentDto.recorded_by,
    note: 'Return recorded',
  });
  return repaymentDto;
}

async function getDealReturnSummary(deal) {
  const returns = await getDealReturns(deal.id);
  const financialSummary = calculateDealFinancialSummary({
    investmentAmountYocto: deal.investment_amount,
    projectedRoiPct: deal.projected_roi_pct,
    returns,
  });

  return {
    amount: financialSummary.investmentAmount,
    invested_amount: financialSummary.investmentAmount,
    projected_roi_pct: financialSummary.projectedRoi,
    expected_return: financialSummary.projectedTotalPayout,
    returned_amount: financialSummary.recordedReturns,
    outstanding_amount: financialSummary.projectedOutstanding,
    return_status: financialSummary.returnStatus,
    roi_percent: financialSummary.projectedRoi,
    ...financialSummary,
  };
}

async function getInvestorPortfolioFinancialSummary(accountId) {
  const deals = await getInvestorDeals(accountId);
  const summaries = await Promise.all(deals.map((deal) => getDealReturnSummary(deal)));
  return calculatePortfolioFinancialSummary(summaries);
}

async function enrichDealWithReturnSummary(deal) {
  if (!deal) return null;
  return {
    ...deal,
    ...(await getDealReturnSummary(deal)),
  };
}

function eventCycleNumbers(events) {
  return events
    .filter((event) => ['cycle_started', 'cycle_reported'].includes(event.event_type))
    .map((event) => Number(event.cycle_num))
    .filter((cycleNum) => Number.isInteger(cycleNum) && cycleNum > 0);
}

async function getFarmerDealCycles(dealId) {
  const [events, updates, reports] = await Promise.all([
    getDealEvents(dealId),
    getFarmerCycleUpdates(dealId),
    getFarmerReports(dealId),
  ]);

  const cycleNums = new Set([
    ...eventCycleNumbers(events),
    ...updates.map((update) => Number(update.cycle_num)),
    ...reports.map((report) => Number(report.cycle_id)),
  ]);

  return [...cycleNums].sort((a, b) => a - b).map((cycleNum) => {
    const update = updates.find((item) => Number(item.cycle_num) === cycleNum);
    const report = reports.find((item) => Number(item.cycle_id) === cycleNum);
    const hasCycleStarted = events.some(
      (event) => event.event_type === 'cycle_started' && Number(event.cycle_num) === cycleNum
    );
    const hasAdminReport = events.some(
      (event) => event.event_type === 'cycle_reported' && Number(event.cycle_num) === cycleNum
    );

    return {
      id: cycleNum,
      status: hasAdminReport ? 'reported' : (hasCycleStarted ? 'funding_sent' : 'pending'),
      fundingReceived: Boolean(update?.funding_received_at),
      reportStatus: report ? 'submitted' : 'not_submitted',
      report: report ? {
        id: report.id,
        title: report.title,
        description: report.description,
        amountUsed: report.amount_used,
        evidenceUrl: report.evidence_url,
        submittedAt: report.submitted_at,
        farmerWallet: report.farmer_wallet,
      } : null,
    };
  });
}

async function confirmFarmerFunding(dealId, cycleNum) {
  const { rows } = await pool.query(
    `INSERT INTO farmer_cycle_updates (deal_id, cycle_num, funding_received_at, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW(), NOW())
     ON CONFLICT (deal_id, cycle_num)
     DO UPDATE SET funding_received_at = COALESCE(farmer_cycle_updates.funding_received_at, NOW()),
                   updated_at = NOW()
     RETURNING *`,
    [dealId, cycleNum]
  );
  return rows[0];
}

async function createFarmerReport(dealId, cycleNum, farmerWallet, report) {
  const { rows } = await pool.query(
    `INSERT INTO reports (
       deal_id, cycle_id, farmer_wallet, title, description, amount_used, evidence_url
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      dealId,
      cycleNum,
      farmerWallet,
      report.title,
      report.description,
      report.amountUsed ?? null,
      report.evidenceUrl ?? null,
    ]
  );
  return rows[0];
}

async function syncFarmerCycleReportStatus(dealId, cycleNum, report) {
  const { rows } = await pool.query(
    `INSERT INTO farmer_cycle_updates (
       deal_id, cycle_num, report_title, report_description, report_amount_used,
       report_evidence_url, report_submitted_at, created_at, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
     ON CONFLICT (deal_id, cycle_num)
     DO UPDATE SET report_title = $3,
                   report_description = $4,
                   report_amount_used = $5,
                   report_evidence_url = $6,
                   report_submitted_at = COALESCE(farmer_cycle_updates.report_submitted_at, NOW()),
                   updated_at = NOW()
     RETURNING *`,
    [
      dealId,
      cycleNum,
      report.title,
      report.description,
      report.amountUsed ?? null,
      report.evidenceUrl ?? null,
    ]
  );
  return rows[0];
}

async function submitFarmerCycleReport(dealId, cycleNum, farmerWallet, report) {
  const created = await createFarmerReport(dealId, cycleNum, farmerWallet, report);
  await syncFarmerCycleReportStatus(dealId, cycleNum, report);
  return created;
}

async function getDealsByUser(near_account, role) {
  if (role === 'admin') {
    const { rows } = await pool.query('SELECT * FROM deals ORDER BY created_at DESC');
    return rows;
  }
  if (role === 'farmer' && near_account) {
    const { rows } = await pool.query(
      'SELECT * FROM deals WHERE farmer = $1 ORDER BY created_at DESC',
      [near_account]
    );
    return rows;
  }
  if (role === 'investor' && near_account) {
    const { rows } = await pool.query(
      'SELECT * FROM deals WHERE investor = $1 ORDER BY created_at DESC',
      [near_account]
    );
    return rows;
  }
  throw new Error('Unsupported deal access context');
}

module.exports = {
  getAllDeals,
  getDealById,
  getInvestorDeals,
  getInvestorDealById,
  getFarmerDeals,
  getFarmerDealById,
  createDeal,
  addEvent,
  getDealEvents,
  getFarmerDealCycles,
  getFarmerReports,
  getDealReturns,
  createReturnStatusEvent,
  getReturnStatusEvents,
  createDealReturn,
  getDealReturnSummary,
  getInvestorPortfolioFinancialSummary,
  enrichDealWithReturnSummary,
  createFarmerReport,
  confirmFarmerFunding,
  submitFarmerCycleReport,
  getDealsByUser,
};
