const router = require('express').Router();
const dealService = require('../services/dealService');
const nearService = require('../services/nearService');

function accountId(req) {
  return req.wallet.account_id;
}

async function getOwnedFarmerDeal(req, res) {
  const deal = await dealService.getDealById(req.params.dealId);
  if (!deal) {
    res.status(404).json({ error: 'Deal not found' });
    return null;
  }
  if (deal.farmer !== accountId(req)) {
    res.status(403).json({ error: 'Only deal farmer can access this deal' });
    return null;
  }
  return deal;
}

function activeCycleId(cycles, status) {
  if (status?.current_cycle) return Number(status.current_cycle);
  if (!cycles.length) return null;
  return cycles[cycles.length - 1].id;
}

function normalizeDeal(deal, status, cycles) {
  return {
    id: deal.id,
    farmer: deal.farmer,
    investor: deal.investor,
    amount: deal.investment_amount,
    investment_amount: deal.investment_amount,
    status: status?.status || 'Unknown',
    activeCycleId: activeCycleId(cycles, status),
    contract_address: deal.contract_address,
    deal_type: deal.deal_type,
    total_cycles: deal.total_cycles,
    cycle_duration_days: deal.cycle_duration_days,
  };
}

function hasFundingSent(cycle) {
  return ['funding_sent', 'reported'].includes(cycle.status);
}

router.get('/deals', async (req, res) => {
  try {
    const deals = await dealService.getFarmerDeals(accountId(req));
    const enriched = await Promise.all(deals.map(async (deal) => {
      const [status, cycles] = await Promise.all([
        nearService.getContractStatus(deal.contract_address).catch(() => null),
        dealService.getFarmerDealCycles(deal.id),
      ]);
      return normalizeDeal(deal, status, cycles);
    }));
    res.json({ ok: true, farmer: accountId(req), deals: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:dealId', async (req, res) => {
  try {
    const deal = await getOwnedFarmerDeal(req, res);
    if (!deal) return;
    const [status, cycles] = await Promise.all([
      nearService.getContractStatus(deal.contract_address).catch(() => null),
      dealService.getFarmerDealCycles(deal.id),
    ]);
    res.json({ ok: true, deal: normalizeDeal(deal, status, cycles), raw: deal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:dealId/cycles', async (req, res) => {
  try {
    const deal = await getOwnedFarmerDeal(req, res);
    if (!deal) return;
    const cycles = await dealService.getFarmerDealCycles(deal.id);
    res.json({ ok: true, dealId: deal.id, cycles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:dealId/confirm-funding', async (req, res) => {
  try {
    const deal = await getOwnedFarmerDeal(req, res);
    if (!deal) return;

    const cycleId = Number(req.body.cycleId);
    if (!Number.isInteger(cycleId) || cycleId < 1) {
      return res.status(400).json({ error: 'cycleId is required' });
    }

    const cycles = await dealService.getFarmerDealCycles(deal.id);
    const cycle = cycles.find((item) => item.id === cycleId);
    if (!cycle) return res.status(404).json({ error: 'Cycle not found' });
    if (!hasFundingSent(cycle)) {
      return res.status(409).json({ error: 'Funding has not been sent for this cycle' });
    }
    if (cycle.fundingReceived) {
      return res.status(409).json({ error: 'Funding already confirmed' });
    }

    await dealService.confirmFarmerFunding(deal.id, cycleId);
    await dealService.addEvent({
      deal_id: deal.id,
      event_type: 'farmer_funding_confirmed',
      cycle_num: cycleId,
    });

    res.json({ ok: true, dealId: deal.id, cycleId, status: 'funding_received_confirmed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:dealId/cycles/:cycleId/report', async (req, res) => {
  try {
    const deal = await getOwnedFarmerDeal(req, res);
    if (!deal) return;

    const cycleId = Number(req.params.cycleId);
    if (!Number.isInteger(cycleId) || cycleId < 1) {
      return res.status(400).json({ error: 'Invalid cycle id' });
    }

    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    const cycles = await dealService.getFarmerDealCycles(deal.id);
    const cycle = cycles.find((item) => item.id === cycleId);
    if (!cycle) return res.status(404).json({ error: 'Cycle not found' });
    if (!cycle.fundingReceived) {
      return res.status(409).json({ error: 'Funding must be confirmed before submitting report' });
    }
    if (cycle.reportStatus === 'submitted') {
      return res.status(409).json({ error: 'Report already submitted for this cycle' });
    }

    const report = await dealService.submitFarmerCycleReport(deal.id, cycleId, accountId(req), {
      title,
      description,
      amountUsed: req.body.amountUsed,
      evidenceUrl: req.body.evidenceUrl,
    });
    await dealService.addEvent({
      deal_id: deal.id,
      event_type: 'farmer_cycle_report_submitted',
      cycle_num: cycleId,
    });

    res.json({
      ok: true,
      dealId: deal.id,
      cycleId,
      report: {
        status: 'submitted',
        id: report.id,
        title: report.title,
        description: report.description,
        amountUsed: report.amount_used,
        evidenceUrl: report.evidence_url,
        farmerWallet: report.farmer_wallet,
        submittedAt: report.submitted_at,
      },
    });
  } catch (err) {
    const status = err.code === '23505' ? 409 : 500;
    res.status(status).json({ error: status === 409 ? 'Report already submitted for this cycle' : err.message });
  }
});

module.exports = router;
