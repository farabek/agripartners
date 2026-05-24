const router = require('express').Router();
const dealService = require('../services/dealService');
const nearService = require('../services/nearService');

router.get('/', (req, res) => {
  res.json(dealService.getAllDeals());
});

router.get('/:id', (req, res) => {
  const deal = dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  res.json(deal);
});

router.get('/:id/status', async (req, res) => {
  const deal = dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  try {
    res.json(await nearService.getContractStatus(deal.contract_address));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/balances', async (req, res) => {
  const deal = dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  try {
    res.json(await nearService.getContractBalances(deal.contract_address));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/events', (req, res) => {
  const deal = dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  res.json(dealService.getDealEvents(req.params.id));
});

module.exports = router;
