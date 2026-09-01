const router = require('express').Router();
const service = require('../services/projectExpenseService');
const { assertProjectExpensePermission } = require('../services/projectExpenseAuthorization');

function actor(req) {
  return req.user?.account_id || req.user?.near_account || req.user?.username || `user:${req.user?.id}`;
}

function handler(action, fn) {
  return async (req, res, next) => {
    try {
      assertProjectExpensePermission(req.user, action);
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };
}

router.get('/categories', handler('read', async (req, res) => {
  res.json({ ok: true, categories: await service.listCategories() });
}));

router.get('/deals/:dealId', handler('read', async (req, res) => {
  res.json({ ok: true, expenses: await service.listForDeal(req.params.dealId) });
}));

router.post('/', handler('create', async (req, res) => {
  const expense = await service.createExpense(req.body, actor(req));
  res.status(201).json({ ok: true, expense });
}));

for (const [endpoint, action] of [['approve', 'approve'], ['reject', 'reject'], ['cancel', 'cancel'], ['mark-paid', 'markPaid']]) {
  router.post(`/:expenseId/${endpoint}`, handler(action, async (req, res) => {
    const expense = await service.transition(req.params.expenseId, action, req.body, actor(req));
    res.json({ ok: true, expense });
  }));
}

router.post('/:expenseId/evidence', handler('addEvidence', async (req, res) => {
  const evidence = await service.addEvidence(req.params.expenseId, req.body, actor(req));
  res.status(201).json({ ok: true, evidence });
}));

module.exports = router;
