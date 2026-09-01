process.env.NODE_ENV = 'test';

const express = require('express');
const request = require('supertest');

jest.mock('../src/services/projectExpenseService', () => ({
  listCategories: jest.fn().mockResolvedValue([{ code: 'FEED' }]),
  listForDeal: jest.fn().mockResolvedValue([{ id: 7, current_state: 'REQUESTED' }]),
  createExpense: jest.fn().mockResolvedValue({ id: 7, current_state: 'REQUESTED' }),
  transition: jest.fn().mockResolvedValue({ id: 7, current_state: 'APPROVED' }),
  addEvidence: jest.fn().mockResolvedValue({ id: 3, evidence_role: 'SUPPLEMENTARY' }),
}));

const service = require('../src/services/projectExpenseService');
const router = require('../src/routes/projectExpenses');

function appFor(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => { req.user = user; next(); });
  app.use('/expenses', router);
  app.use((err, req, res, next) => res.status(err.status || 500).json({ error: err.message }));
  return app;
}

test('non-admin users cannot read Project Expenses', async () => {
  const response = await request(appFor({ role: 'farmer', username: 'farmer' }))
    .get('/expenses/deals/4');
  expect(response.status).toBe(403);
  expect(service.listForDeal).not.toHaveBeenCalled();
});

test('admin can create a fiat Project Expense request', async () => {
  const response = await request(appFor({ role: 'admin', username: 'admin' }))
    .post('/expenses')
    .send({ deal_id: 4, category_code: 'FEED', requested_amount: '500', purpose: 'Feed', idempotency_key: 'expense-1' });
  expect(response.status).toBe(201);
  expect(response.body.expense.current_state).toBe('REQUESTED');
  expect(service.createExpense).toHaveBeenCalledWith(expect.objectContaining({ category_code: 'FEED' }), 'admin');
});

test('admin transition maps mark-paid to the authorization action and service transition', async () => {
  const response = await request(appFor({ role: 'admin', username: 'payer' }))
    .post('/expenses/7/mark-paid')
    .send({ idempotency_key: 'paid-7' });
  expect(response.status).toBe(200);
  expect(service.transition).toHaveBeenCalledWith('7', 'markPaid', expect.any(Object), 'payer');
});
