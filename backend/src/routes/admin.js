const router = require('express').Router();
const dealService = require('../services/dealService');
const nearService = require('../services/nearService');
const profileService = require('../services/profileService');
const treasuryService = require('../services/treasuryService');

const YOCTO_PER_NEAR = BigInt('1000000000000000000000000');

function requireNonProduction(req, res) {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'This endpoint is only available outside production' });
    return false;
  }
  return true;
}

function validateDealAccount(deal, accountId, allowedFields) {
  if (!accountId) return 'account_id is required';
  const allowedAccounts = allowedFields.map((field) => deal[field]).filter(Boolean);
  if (!allowedAccounts.includes(accountId)) {
    return `account_id must match one of: ${allowedFields.join(', ')}`;
  }
  return null;
}

function getWithdrawTarget(deal, accountId) {
  if (accountId === deal.farmer) return { role: 'farmer', receiver: deal.farmer };
  if (accountId === deal.investor) return { role: 'investor', receiver: deal.investor };
  if (accountId === deal.platform) return { role: 'platform', receiver: deal.platform };
  return { role: 'unknown', receiver: accountId };
}

function logWithdrawAttempt({ deal, targetRole, receiverAccount }) {
  console.info('[admin.withdraw]', {
    deal_id: deal.id,
    contract_address: deal.contract_address,
    withdraw_target_role: targetRole,
    receiver_account: receiverAccount,
    signer_account: process.env.NEAR_ADMIN_ACCOUNT,
  });
}

function getInvestorWithdrawSignerAccountId() {
  const accountId = process.env.NEAR_INVESTOR_SIGNER_ACCOUNT_ID || process.env.NEAR_ADMIN_ACCOUNT;
  if (!accountId) {
    throw new Error('NEAR_ADMIN_ACCOUNT is required for contract investor withdraw signer');
  }
  return accountId;
}

function normalizeNearAmount(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  if (!/^\d+(\.\d{1,24})?$/.test(raw)) {
    throw new Error('amount must be a valid NEAR amount');
  }
  if (!raw.includes('.') && raw.length > 18) return raw;

  const [whole, fraction = ''] = raw.split('.');
  return (BigInt(whole) * YOCTO_PER_NEAR + BigInt(fraction.padEnd(24, '0'))).toString();
}

function normalizeRequiredString(value, fieldName, maxLength) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new Error(`${fieldName} is required`);
  if (normalized.length > maxLength) throw new Error(`${fieldName} must be ${maxLength} characters or fewer`);
  return normalized;
}

function normalizePercentage(value, fieldName) {
  const normalized = String(value ?? '').trim();
  if (!/^\d+$/.test(normalized)) {
    throw new Error(`${fieldName} must be a whole number from 0 to 100`);
  }
  const percentage = Number(normalized);
  if (percentage < 0 || percentage > 100) {
    throw new Error(`${fieldName} must be a whole number from 0 to 100`);
  }
  return percentage;
}

function confirmedReserveRateForModel(dealType) {
  const normalized = String(dealType ?? '').trim().toLowerCase();
  if (normalized.includes('fidlot') || normalized.includes('feedlot')) return 44;
  if (normalized.includes('hissar') || normalized.includes('variantb')) return 53;
  return null;
}

function resolveReserveRate(dealType, requestedRate) {
  if (requestedRate !== undefined && requestedRate !== null && String(requestedRate).trim() !== '') {
    return normalizePercentage(requestedRate, 'escrow_pct');
  }
  const confirmedRate = confirmedReserveRateForModel(dealType);
  if (confirmedRate !== null) return confirmedRate;
  throw new Error('escrow_pct is required because reserve rates are model-specific');
}

function getRequestActor(req) {
  return req.user?.account_id || req.user?.near_account || req.user?.username || null;
}

function getTransitionPayload(req) {
  return {
    changedBy: getRequestActor(req),
    note: String(req.body?.note ?? '').trim() || null,
    evidenceMetadata: Object.prototype.hasOwnProperty.call(req.body || {}, 'evidence_metadata')
      ? req.body.evidence_metadata
      : null,
  };
}

function transitionErrorStatus(message) {
  if (message === 'Return not found') return 404;
  if (/Invalid return status transition|_status must be|to_status is required/.test(message)) return 409;
  return 500;
}

function normalizeDealPayload(body) {
  const isPortalPayload = Boolean(body.farmer_wallet || body.investor_wallet || body.amount || body.title);
  if (!isPortalPayload) {
    return {
      deal: {
        deal_type: body.deal_type,
        title: body.title,
        description: body.description,
        farmer: body.farmer,
        investor: body.investor,
        investment_amount: body.investment_amount,
        farmer_split_pct: body.farmer_split_pct,
        investor_split_pct: body.investor_split_pct,
        escrow_pct: body.escrow_pct,
        performance_fee_pct: body.performance_fee_pct,
        total_cycles: body.total_cycles,
        cycle_duration_days: body.cycle_duration_days,
        capital_return_near: body.capital_return_near,
      },
      portalPayload: false,
    };
  }

  const title = normalizeRequiredString(body.title, 'title', 120);
  const description = normalizeRequiredString(body.description, 'description', 1000);
  const farmer = normalizeRequiredString(body.farmer_wallet, 'farmer_wallet', 120);
  const investor = normalizeRequiredString(body.investor_wallet, 'investor_wallet', 120);
  const investmentAmount = normalizeNearAmount(body.amount);
  if (!investmentAmount) throw new Error('amount is required');

  return {
    deal: {
      deal_type: title,
      title,
      description,
      farmer,
      investor,
      investment_amount: investmentAmount,
      farmer_split_pct: 60,
      investor_split_pct: 40,
      escrow_pct: body.escrow_pct,
      performance_fee_pct: 20,
      total_cycles: body.total_cycles ?? 1,
      cycle_duration_days: body.cycle_duration_days ?? 150,
      capital_return_near: investmentAmount,
    },
    portalPayload: true,
  };
}

router.get('/farmers', async (req, res) => {
  try {
    const farmers = await profileService.getProfilesByRole('farmer');
    res.json({ ok: true, farmers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/investors', async (req, res) => {
  try {
    const investors = await profileService.getProfilesByRole('investor');
    res.json({ ok: true, investors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/treasury/accounts', async (req, res) => {
  try {
    res.json({
      ok: true,
      accounts: await treasuryService.listTreasuryAccounts(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/treasury/transactions/:id', async (req, res) => {
  try {
    const transaction = await treasuryService.getTreasuryTransaction(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Treasury transaction not found' });
    return res.json({ ok: true, transaction });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/treasury/ledger', async (req, res) => {
  try {
    res.json({
      ok: true,
      ledgerEntries: await treasuryService.listTreasuryLedgerEntries(req.query),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/returns/:returnId/approve', async (req, res) => {
  try {
    const repayment = await dealService.transitionReturnStatus(
      req.params.returnId,
      'approved',
      getTransitionPayload(req)
    );
    res.json({ ok: true, repayment });
  } catch (err) {
    res.status(transitionErrorStatus(err.message)).json({ error: err.message });
  }
});

router.post('/returns/:returnId/mark-paid', async (req, res) => {
  try {
    const repayment = await dealService.transitionReturnStatus(
      req.params.returnId,
      'paid',
      getTransitionPayload(req)
    );
    res.json({ ok: true, repayment });
  } catch (err) {
    res.status(transitionErrorStatus(err.message)).json({ error: err.message });
  }
});

router.post('/returns/:returnId/reconcile', async (req, res) => {
  try {
    const repayment = await dealService.transitionReturnStatus(
      req.params.returnId,
      'reconciled',
      getTransitionPayload(req)
    );
    res.json({ ok: true, repayment });
  } catch (err) {
    res.status(transitionErrorStatus(err.message)).json({ error: err.message });
  }
});

router.get('/returns/:returnId/status-events', async (req, res) => {
  try {
    res.json({
      ok: true,
      returnId: req.params.returnId,
      statusEvents: await dealService.getReturnStatusEvents(req.params.returnId),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals', async (req, res) => {
  try {
    const { deal: normalized, portalPayload } = normalizeDealPayload(req.body);
    const { deal_type, farmer, investor, investment_amount, farmer_split_pct,
      investor_split_pct, escrow_pct, performance_fee_pct,
      total_cycles, cycle_duration_days, capital_return_near } = normalized;

    if (!deal_type || !farmer || !investor || !investment_amount) {
      return res.status(400).json({ error: 'Missing required fields: deal_type, farmer, investor, investment_amount' });
    }

    const modelReserveRate = resolveReserveRate(deal_type, escrow_pct);
    const investorWithdrawSigner = getInvestorWithdrawSignerAccountId();
    const { contractId, txHash } = await nearService.deployContract({
      deal_type, farmer, investor, investment_amount,
      investor_withdraw_signer: investorWithdrawSigner,
      farmer_split_pct: farmer_split_pct ?? 60,
      investor_split_pct: investor_split_pct ?? 40,
      escrow_pct: modelReserveRate,
      performance_fee_pct: performance_fee_pct ?? 20,
      total_cycles, cycle_duration_days, capital_return_near
    });

    const deal = await dealService.createDeal({
      contract_address: contractId,
      deal_type,
      title: normalized.title,
      description: normalized.description,
      farmer,
      investor,
      admin: process.env.NEAR_ADMIN_ACCOUNT,
      platform: process.env.NEAR_ADMIN_ACCOUNT,
      investment_amount,
      farmer_split_pct: farmer_split_pct ?? 60,
      investor_split_pct: investor_split_pct ?? 40,
      escrow_pct: modelReserveRate,
      performance_fee_pct: performance_fee_pct ?? 20,
      cycle_duration_days, total_cycles, capital_return_near
    });

    await dealService.addEvent({ deal_id: deal.id, event_type: 'deployed', tx_hash: txHash });
    res.status(201).json({
      ...deal,
      ok: true,
      deal_id: deal.id,
      contract_address: deal.contract_address,
      status: 'deployed',
      deployment_status: 'deployed',
      tx_hash: txHash,
      portal_payload: portalPayload,
    });
  } catch (err) {
    const status = /^(amount|title|description|farmer_wallet|investor_wallet|escrow_pct) /.test(err.message) ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

router.post('/deals/:id/start-cycle', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  try {
    const { txHash } = await nearService.startCycle(deal.contract_address);
    const { current_cycle } = await nearService.getContractStatus(deal.contract_address);
    await dealService.addEvent({ deal_id: deal.id, event_type: 'cycle_started', cycle_num: current_cycle, tx_hash: txHash });
    res.json({ success: true, tx_hash: txHash, cycle: current_cycle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/report-cycle', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  const { profit_near, losses_near } = req.body;
  if (profit_near == null) return res.status(400).json({ error: 'profit_near is required' });

  try {
    const { txHash } = await nearService.reportCycle(deal.contract_address, profit_near, losses_near || '0');
    const { status, current_cycle } = await nearService.getContractStatus(deal.contract_address);

    await dealService.addEvent({
      deal_id: deal.id, event_type: 'cycle_reported',
      cycle_num: current_cycle, profit_near,
      losses_near: losses_near || '0', tx_hash: txHash
    });

    if (status === 'Completed' || status === 'Terminated') {
      await dealService.addEvent({ deal_id: deal.id, event_type: status.toLowerCase(), tx_hash: txHash });
    }

    res.json({ success: true, tx_hash: txHash, status, cycle: current_cycle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:id/cycles', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  try {
    res.json({
      ok: true,
      dealId: deal.id,
      cycles: await dealService.getFarmerDealCycles(deal.id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:id/return-summary', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  try {
    res.json({
      ok: true,
      dealId: deal.id,
      summary: await dealService.getDealReturnSummary(deal),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:id/returns', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  try {
    res.json({
      ok: true,
      dealId: deal.id,
      returns: await dealService.getDealReturns(deal.id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/returns', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  try {
    const protectedFields = [
      'payment_status',
      'currency',
      'recorded_by',
      'transaction_hash',
      'reconciled_at',
      'reconciled_by',
      'reconciliation_metadata',
    ];
    const protectedField = protectedFields.find(
      (field) => Object.prototype.hasOwnProperty.call(req.body, field)
    );
    if (protectedField) throw new Error(`${protectedField} cannot be set by client`);

    const recordedBy = getRequestActor(req);
    const repaymentInput = {
      amount_near: req.body.amount_near,
      note: req.body.note,
    };
    if (Object.prototype.hasOwnProperty.call(req.body, 'entry_type')) {
      repaymentInput.entry_type = req.body.entry_type;
    }
    const repayment = await dealService.createDealReturn(deal.id, repaymentInput, recordedBy);
    const summary = await dealService.getDealReturnSummary(deal);
    res.status(201).json({ ok: true, repayment, summary });
  } catch (err) {
    const status = /amount_near|entry_type|cannot be set by client/.test(err.message) ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

router.post('/deals/:id/fund', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  try {
    const { txHash } = await nearService.fundContract(
      deal.contract_address,
      deal.investment_amount
    );
    await dealService.addEvent({ deal_id: deal.id, event_type: 'funded', tx_hash: txHash });
    res.json({ success: true, tx_hash: txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/fund-as', async (req, res) => {
  if (!requireNonProduction(req, res)) return;

  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  const { account_id } = req.body;
  const validationError = validateDealAccount(deal, account_id, ['investor']);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const { txHash } = await nearService.fundContractAs(
      account_id,
      deal.contract_address,
      deal.investment_amount
    );
    await dealService.addEvent({ deal_id: deal.id, event_type: 'funded', tx_hash: txHash });
    res.json({ success: true, tx_hash: txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/withdraw', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  try {
    logWithdrawAttempt({
      deal,
      targetRole: 'platform',
      receiverAccount: deal.platform,
    });
    const { txHash } = await nearService.withdrawContract(deal.contract_address);
    await dealService.addEvent({ deal_id: deal.id, event_type: 'withdrawn', tx_hash: txHash });
    res.json({ success: true, tx_hash: txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/withdraw-as', async (req, res) => {
  if (!requireNonProduction(req, res)) return;

  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  const { account_id } = req.body;
  const validationError = validateDealAccount(deal, account_id, ['farmer', 'investor', 'platform']);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const target = getWithdrawTarget(deal, account_id);
    logWithdrawAttempt({
      deal,
      targetRole: target.role,
      receiverAccount: target.receiver,
    });
    const { txHash } = await nearService.withdrawContractAs(account_id, deal.contract_address);
    await dealService.addEvent({ deal_id: deal.id, event_type: 'withdrawn', tx_hash: txHash });
    res.json({ success: true, tx_hash: txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
