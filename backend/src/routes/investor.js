const router = require('express').Router();
const dealService = require('../services/dealService');
const investorProfileService = require('../services/investorProfileService');
const nearService = require('../services/nearService');

async function getInvestorDeal(req, res) {
  const deal = await dealService.getInvestorDealById(req.wallet.account_id, req.params.id);
  if (!deal) {
    res.status(404).json({ error: 'Deal not found' });
    return null;
  }

  return deal;
}

router.get('/me', (req, res) => {
  res.json({
    account_id: req.wallet.account_id,
    public_key: req.wallet.public_key,
    network: req.wallet.network,
  });
});

router.get('/profile', async (req, res) => {
  try {
    const profile = await investorProfileService.getOrCreateInvestorProfile(req.wallet.account_id);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const profile = await investorProfileService.updateInvestorProfile(req.wallet.account_id, req.body);
    res.json(profile);
  } catch (err) {
    const status = /cannot be edited|must be|not a valid|payload must/i.test(err.message) ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

router.get('/deals', async (req, res) => {
  try {
    const deals = await dealService.getInvestorDeals(req.wallet.account_id);
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:id', async (req, res) => {
  try {
    const deal = await getInvestorDeal(req, res);
    if (deal) res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:id/status', async (req, res) => {
  try {
    const deal = await getInvestorDeal(req, res);
    if (!deal) return;
    res.json(await nearService.getContractStatus(deal.contract_address));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:id/balances', async (req, res) => {
  try {
    const deal = await getInvestorDeal(req, res);
    if (!deal) return;
    res.json(await nearService.getContractBalances(deal.contract_address));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:id/events', async (req, res) => {
  try {
    const deal = await getInvestorDeal(req, res);
    if (!deal) return;
    res.json(await dealService.getDealEvents(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:id/reports', async (req, res) => {
  try {
    const deal = await getInvestorDeal(req, res);
    if (!deal) return;
    res.json({
      ok: true,
      dealId: deal.id,
      reports: await dealService.getFarmerReports(deal.id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/withdraw', async (req, res) => {
  try {
    const deal = await getInvestorDeal(req, res);
    if (!deal) return;
    const result = await nearService.withdrawContractAs(deal.investor, deal.contract_address);
    await dealService.addEvent({
      deal_id: deal.id,
      event_type: 'InvestorWithdraw',
      tx_hash: result.txHash,
    });
    res.json({ ok: true, tx_hash: result.txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
