const router = require('express').Router();
const dealService = require('../services/dealService');
const nearService = require('../services/nearService');

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

router.post('/deals', async (req, res) => {
  const { deal_type, farmer, investor, investment_amount, farmer_split_pct,
    investor_split_pct, escrow_pct, performance_fee_pct,
    total_cycles, cycle_duration_days, capital_return_near } = req.body;

  if (!deal_type || !farmer || !investor || !investment_amount) {
    return res.status(400).json({ error: 'Missing required fields: deal_type, farmer, investor, investment_amount' });
  }

  try {
    const { contractId, txHash } = await nearService.deployContract({
      deal_type, farmer, investor, investment_amount,
      farmer_split_pct: farmer_split_pct ?? 60,
      investor_split_pct: investor_split_pct ?? 40,
      escrow_pct: escrow_pct ?? 44,
      performance_fee_pct: performance_fee_pct ?? 20,
      total_cycles, cycle_duration_days, capital_return_near
    });

    const deal = await dealService.createDeal({
      contract_address: contractId,
      deal_type, farmer, investor,
      admin: process.env.NEAR_ADMIN_ACCOUNT,
      platform: process.env.NEAR_ADMIN_ACCOUNT,
      investment_amount,
      farmer_split_pct: farmer_split_pct ?? 60,
      investor_split_pct: investor_split_pct ?? 40,
      escrow_pct: escrow_pct ?? 44,
      performance_fee_pct: performance_fee_pct ?? 20,
      cycle_duration_days, total_cycles, capital_return_near
    });

    await dealService.addEvent({ deal_id: deal.id, event_type: 'deployed', tx_hash: txHash });
    res.status(201).json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const { txHash } = await nearService.withdrawContractAs(account_id, deal.contract_address);
    await dealService.addEvent({ deal_id: deal.id, event_type: 'withdrawn', tx_hash: txHash });
    res.json({ success: true, tx_hash: txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
