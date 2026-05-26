const router = require('express').Router();
const dealService = require('../services/dealService');

router.get('/deals', async (req, res) => {
  try {
    const { near_account, role } = req.user;
    const deals = await dealService.getDealsByUser(near_account, role);
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
