const pool = require('../db');

function requiredText(value, name, max = 500) {
  const text = String(value ?? '').trim();
  if (!text) throw Object.assign(new Error(`${name} is required`), { status: 400, expose: true });
  if (text.length > max) throw Object.assign(new Error(`${name} is too long`), { status: 400, expose: true });
  return text;
}

function amount(value, name) {
  const text = String(value ?? '').trim();
  if (!/^\d+(\.\d{1,8})?$/.test(text) || Number(text) <= 0) {
    throw Object.assign(new Error(`${name} must be a positive amount with at most 8 decimals`), { status: 400, expose: true });
  }
  return text;
}

async function listCategories() {
  const { rows } = await pool.query(
    `SELECT id, code, display_name, description
       FROM expense_categories WHERE is_active = TRUE ORDER BY code`
  );
  return rows;
}

async function listForDeal(dealId) {
  const { rows } = await pool.query(
    `SELECT pe.*, ec.code AS category_code, ec.display_name AS category_name,
            fwb.budget_amount
       FROM project_expenses pe
       JOIN expense_categories ec ON ec.id = pe.category_id
       JOIN financial_workflow_budgets fwb ON fwb.id = pe.budget_id
      WHERE pe.deal_id = $1 ORDER BY pe.created_at DESC, pe.id DESC`,
    [dealId]
  );
  return rows;
}

async function getById(expenseId, client = pool) {
  const { rows } = await client.query(
    `SELECT pe.*, ec.code AS category_code, ec.display_name AS category_name
       FROM project_expenses pe
       JOIN expense_categories ec ON ec.id = pe.category_id
      WHERE pe.id = $1`,
    [expenseId]
  );
  return rows[0] || null;
}

async function createExpense(input, actor) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const idempotencyKey = requiredText(input.idempotency_key, 'idempotency_key', 200);
    const existing = await client.query('SELECT id FROM project_expenses WHERE idempotency_key = $1', [idempotencyKey]);
    if (existing.rows[0]) {
      await client.query('ROLLBACK');
      return getById(existing.rows[0].id);
    }
    const context = await client.query(
      `SELECT fw.id AS workflow_id, fw.deal_id, fw.operator_id,
              b.id AS budget_id, b.category_id, b.currency
         FROM financial_workflows fw
         JOIN expense_categories c ON c.code = $2 AND c.is_active = TRUE
         JOIN financial_workflow_budgets b
           ON b.workflow_id = fw.id AND b.category_id = c.id AND b.is_closed = FALSE
        WHERE fw.deal_id = $1
        FOR UPDATE OF b`,
      [input.deal_id, requiredText(input.category_code, 'category_code', 80).toUpperCase()]
    );
    if (!context.rows[0]) {
      throw Object.assign(new Error('Open Project budget was not found for this deal and category'), { status: 404, expose: true });
    }
    const ctx = context.rows[0];
    const requestedAmount = amount(input.requested_amount, 'requested_amount');
    const inserted = await client.query(
      `INSERT INTO project_expenses
         (workflow_id, deal_id, operator_id, budget_id, category_id, purpose,
          description, supplier_reference, currency, requested_amount, created_by,
          idempotency_key, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [ctx.workflow_id, ctx.deal_id, ctx.operator_id, ctx.budget_id, ctx.category_id,
       requiredText(input.purpose, 'purpose'), input.description || null,
       input.supplier_reference || null, ctx.currency, requestedAmount, actor,
       idempotencyKey, input.metadata || {}]
    );
    await client.query(
      `INSERT INTO project_expense_state_events
         (expense_id, from_state, to_state, requested_amount, actor_id, actor_role,
          idempotency_key, metadata)
       VALUES ($1, NULL, 'REQUESTED', $2, $3, 'EXPENSE_REQUESTER', $4, $5)`,
      [inserted.rows[0].id, requestedAmount, actor, `${idempotencyKey}:requested`, input.metadata || {}]
    );
    await client.query('COMMIT');
    return getById(inserted.rows[0].id);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

const TRANSITIONS = {
  approve: { to: 'APPROVED', role: 'EXPENSE_APPROVER' },
  reject: { to: 'REJECTED', role: 'EXPENSE_REJECTOR' },
  cancel: { to: 'CANCELLED', role: 'EXPENSE_CANCELLER' },
  markPaid: { to: 'PAID', role: 'EXPENSE_PAYER' },
};

async function transition(expenseId, action, input, actor) {
  const config = TRANSITIONS[action];
  if (!config) throw Object.assign(new Error('Unsupported expense transition'), { status: 400, expose: true });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const currentResult = await client.query('SELECT * FROM project_expenses WHERE id = $1 FOR UPDATE', [expenseId]);
    const current = currentResult.rows[0];
    if (!current) throw Object.assign(new Error('Project Expense not found'), { status: 404, expose: true });
    const idempotencyKey = requiredText(input.idempotency_key, 'idempotency_key', 200);
    const approved = action === 'approve'
      ? amount(input.approved_amount, 'approved_amount')
      : current.approved_amount;
    const paid = action === 'markPaid' ? current.approved_amount : null;
    await client.query(
      `INSERT INTO project_expense_state_events
         (expense_id, from_state, to_state, requested_amount, approved_amount,
          paid_amount, actor_id, actor_role, idempotency_key, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (idempotency_key) DO NOTHING`,
      [expenseId, current.current_state, config.to, current.requested_amount, approved,
       paid, actor, config.role, idempotencyKey, input.metadata || {}]
    );
    await client.query('COMMIT');
    return getById(expenseId);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function addEvidence(expenseId, input, actor) {
  const idempotencyKey = requiredText(input.idempotency_key, 'idempotency_key', 200);
  const existing = await pool.query(
    'SELECT * FROM project_expense_evidence WHERE idempotency_key = $1',
    [idempotencyKey]
  );
  if (existing.rows[0]) return existing.rows[0];
  const { rows } = await pool.query(
    `INSERT INTO project_expense_evidence
       (expense_id, evidence_type, evidence_authority, evidence_role,
        evidence_reference, recorded_by, supplementary_onchain_reference,
        metadata, idempotency_key)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (idempotency_key) DO NOTHING
     RETURNING *`,
    [expenseId, requiredText(input.evidence_type, 'evidence_type', 80).toUpperCase(),
     requiredText(input.evidence_authority, 'evidence_authority', 80).toUpperCase(),
     requiredText(input.evidence_role, 'evidence_role', 80).toUpperCase(),
     requiredText(input.evidence_reference, 'evidence_reference', 500), actor,
     input.supplementary_onchain_reference || null, input.metadata || {}, idempotencyKey]
  );
  if (rows[0]) return rows[0];
  const concurrent = await pool.query(
    'SELECT * FROM project_expense_evidence WHERE idempotency_key = $1',
    [idempotencyKey]
  );
  return concurrent.rows[0];
}

module.exports = { listCategories, listForDeal, getById, createExpense, transition, addEvidence };
