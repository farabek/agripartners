const fs = require('fs');
const path = require('path');
const {
  createDisposableDatabase,
  destroyDisposableDatabase,
} = require('./helpers/disposablePostgresHarness');

const runtimeUrl = process.env.TEST_DATABASE_URL;
const destructiveOptIn = process.env.AGRIPARTNERS_ALLOW_DESTRUCTIVE_TEST_DB;
const describeRuntime = runtimeUrl || destructiveOptIn ? describe : describe.skip;
const migrationsDir = path.join(__dirname, '..', 'src', 'db', 'migrations');

function migrationSql(filename) {
  return fs.readFileSync(path.join(migrationsDir, filename), 'utf8');
}

describeRuntime('Migration 017 disposable PostgreSQL runtime verification', () => {
  let pool;
  let sequence = 0;
  let historicalEventId;
  let slice2Applied = false;
  let databaseHarness;

  function key(prefix) {
    sequence += 1;
    return `${prefix}-${Date.now()}-${sequence}`;
  }

  async function expectReject(promise, pattern) {
    await expect(promise).rejects.toThrow(pattern);
  }

  async function applyMigrations(from, to) {
    const files = fs.readdirSync(migrationsDir)
      .filter((name) => name.endsWith('.sql'))
      .sort()
      .slice(from - 1, to);
    for (const filename of files) {
      await pool.query(migrationSql(filename));
    }
  }

  async function createWorkflow({ advanceToConfirmed = false } = {}) {
    const suffix = key('workflow');
    const deal = (await pool.query(
      `INSERT INTO deals (
         contract_address, deal_type, farmer, investor, admin, platform,
         investment_amount, farmer_split_pct, investor_split_pct, escrow_pct,
         performance_fee_pct, cycle_duration_days, total_cycles, capital_return_near
       ) VALUES ($1, 'feedlot', $2, $3, $4, $4, '1000000000000000000000000',
         60, 40, 10, 20, 30, 1, '1000000000000000000000000')
       RETURNING *`,
      [`${suffix}.testnet`, `farmer-${suffix}.testnet`, `investor-${suffix}.testnet`, `admin-${suffix}.testnet`]
    )).rows[0];

    const operator = (await pool.query(
      `INSERT INTO uzbekistan_feedlot_operators (
         legal_name, operator_agreement_reference, created_by
       ) VALUES ($1, $2, 'admin')
       RETURNING *`,
      [`Operator ${suffix}`, `agreement-${suffix}`]
    )).rows[0];

    await pool.query(
      `INSERT INTO operator_farmer_assignments (
         operator_id, deal_id, assigned_by
       ) VALUES ($1, $2, 'admin')`,
      [operator.id, deal.id]
    );

    const workflow = (await pool.query(
      `INSERT INTO financial_workflows (
         deal_id, operator_id, idempotency_key, created_by
       ) VALUES ($1, $2, $3, 'admin')
       RETURNING *`,
      [deal.id, operator.id, `workflow:${suffix}`]
    )).rows[0];

    if (advanceToConfirmed) {
      await insertFinancialEvent(workflow.id, null, 'INVESTOR_FUNDING_RECEIVED');
      await insertFinancialEvent(workflow.id, 'INVESTOR_FUNDING_RECEIVED', 'FIAT_CLEARED', {
        currency: 'USD',
        amount: '100.00',
        bankReference: `clear-${suffix}`,
      });
      await insertFinancialEvent(workflow.id, 'FIAT_CLEARED', 'OPERATOR_DISBURSEMENT_APPROVED', {
        authorizedBy: `approver-${suffix}`,
      });
      await insertFinancialEvent(
        workflow.id,
        'OPERATOR_DISBURSEMENT_APPROVED',
        'OPERATOR_DISBURSEMENT_SENT',
        {
          currency: 'USD',
          amount: '100.00',
          bankReference: `send-${suffix}`,
        }
      );
      await insertFinancialEvent(
        workflow.id,
        'OPERATOR_DISBURSEMENT_SENT',
        'OPERATOR_DISBURSEMENT_CONFIRMED',
        { currency: 'USD', amount: '100.00' }
      );
    }

    return { deal, operator, workflow };
  }

  async function insertFinancialEvent(
    workflowId,
    fromState,
    toState,
    {
      currency = null,
      amount = null,
      bankReference = null,
      authorizedBy = null,
      projectExpenseId = null,
      queryable = pool,
    } = {}
  ) {
    if (!slice2Applied) {
      return (await pool.query(
        `INSERT INTO financial_state_events (
           workflow_id, from_state, to_state, currency, amount,
           bank_payment_reference, supporting_evidence_reference,
           evidence_authority, actor_id, actor_role, authorized_by,
           idempotency_key
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7,
           'ACCOUNTING', $8, 'FINANCE_INITIATOR', $9, $10
         )
         RETURNING *`,
        [
          workflowId,
          fromState,
          toState,
          currency,
          amount,
          bankReference,
          key('financial-evidence'),
          key('financial-actor'),
          authorizedBy,
          key('financial-event'),
        ]
      )).rows[0];
    }

    return (await queryable.query(
      `INSERT INTO financial_state_events (
         workflow_id, from_state, to_state, currency, amount,
         bank_payment_reference, supporting_evidence_reference,
         evidence_authority, actor_id, actor_role, authorized_by,
         idempotency_key, project_expense_id
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         'ACCOUNTING', $8, 'FINANCE_INITIATOR', $9, $10, $11
       )
       RETURNING *`,
      [
        workflowId,
        fromState,
        toState,
        currency,
        amount,
        bankReference,
        key('financial-evidence'),
        key('financial-actor'),
        authorizedBy,
        key('financial-event'),
        projectExpenseId,
      ]
    )).rows[0];
  }

  async function createContext({ budgetAmount = '100.00', advanceToConfirmed = false } = {}) {
    const base = await createWorkflow({ advanceToConfirmed });
    const category = (await pool.query(
      "SELECT * FROM expense_categories WHERE code = 'FEED'"
    )).rows[0];
    const budget = (await pool.query(
      `INSERT INTO financial_workflow_budgets (
         workflow_id, category_id, currency, budget_amount, created_by, idempotency_key
       ) VALUES ($1, $2, 'USD', $3, 'budget-admin', $4)
       RETURNING *`,
      [base.workflow.id, category.id, budgetAmount, key('budget')]
    )).rows[0];
    return { ...base, category, budget };
  }

  async function createExpense(context, amount = '40.00', actor = 'requester', occurredAt = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const expense = (await client.query(
        `INSERT INTO project_expenses (
           workflow_id, deal_id, operator_id, budget_id, category_id,
           purpose, currency, requested_amount, created_by, idempotency_key
         ) VALUES ($1, $2, $3, $4, $5, 'Feed purchase', 'USD', $6, $7, $8)
         RETURNING *`,
        [
          context.workflow.id,
          context.deal.id,
          context.operator.id,
          context.budget.id,
          context.category.id,
          amount,
          actor,
          key('expense'),
        ]
      )).rows[0];
      await client.query(
        `INSERT INTO project_expense_state_events (
           expense_id, from_state, to_state, requested_amount,
           actor_id, actor_role, idempotency_key,
           occurred_at
         ) VALUES ($1, NULL, 'REQUESTED', $2, $3, 'EXPENSE_REQUESTER', $4, COALESCE($5, clock_timestamp()))`,
        [expense.id, amount, actor, key('expense-event'), occurredAt]
      );
      await client.query('COMMIT');
      return (await pool.query('SELECT * FROM project_expenses WHERE id = $1', [expense.id])).rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async function transitionExpense(expense, toState, {
    actor = 'approver',
    role = 'EXPENSE_APPROVER',
    approvedAmount = null,
    paidAmount = null,
    idempotencyKey = key('expense-event'),
    occurredAt = null,
    queryable = pool,
  } = {}) {
    return (await queryable.query(
      `INSERT INTO project_expense_state_events (
         expense_id, from_state, to_state, requested_amount,
         approved_amount, paid_amount, actor_id, actor_role, idempotency_key, occurred_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, clock_timestamp()))
       RETURNING *`,
      [
        expense.id,
        expense.current_state,
        toState,
        expense.requested_amount,
        approvedAmount,
        paidAmount,
        actor,
        role,
        idempotencyKey,
        occurredAt,
      ]
    )).rows[0];
  }

  async function reloadExpense(id) {
    return (await pool.query('SELECT * FROM project_expenses WHERE id = $1', [id])).rows[0];
  }

  async function approveExpense(expense, amount = expense.requested_amount, actor = 'approver') {
    await transitionExpense(expense, 'APPROVED', {
      actor,
      role: 'EXPENSE_APPROVER',
      approvedAmount: amount,
    });
    return reloadExpense(expense.id);
  }

  async function addAuthoritativeEvidence(expense, actor = 'accountant') {
    return (await pool.query(
      `INSERT INTO project_expense_evidence (
         expense_id, evidence_type, evidence_authority, evidence_role,
         evidence_reference, recorded_by, idempotency_key
       ) VALUES (
         $1, 'BANK_PAYMENT_RECORD', 'BANK', 'AUTHORITATIVE_PAYMENT',
         $2, $3, $4
       )
       RETURNING *`,
      [expense.id, key('bank-record'), actor, key('expense-evidence')]
    )).rows[0];
  }

  async function payExpense(expense, payer = 'payer') {
    await transitionExpense(expense, 'PAID', {
      actor: payer,
      role: 'EXPENSE_PAYER',
      approvedAmount: expense.approved_amount,
      paidAmount: expense.approved_amount,
    });
    return reloadExpense(expense.id);
  }

  async function beginClient() {
    const client = await pool.connect();
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '8s'");
    await client.query("SET LOCAL statement_timeout = '12s'");
    return client;
  }

  async function waitUntilBlocked(client, label, timeoutMs = 5000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const result = await pool.query(
        `SELECT wait_event_type, cardinality(pg_blocking_pids($1)) AS blocker_count
           FROM pg_stat_activity WHERE pid = $1`,
        [client.processID]
      );
      if (result.rows[0]?.wait_event_type === 'Lock' && Number(result.rows[0].blocker_count) > 0) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    throw new Error(`${label} did not reach the expected PostgreSQL lock barrier`);
  }

  async function rollbackAndRelease(client) {
    if (!client) return;
    await client.query('ROLLBACK').catch(() => {});
    client.release();
  }

  async function withTwoTransactionalClients(callback) {
    let first;
    let second;
    try {
      first = await beginClient();
      second = await beginClient();
      return await callback(first, second);
    } finally {
      await rollbackAndRelease(second);
      await rollbackAndRelease(first);
    }
  }

  beforeAll(async () => {
    databaseHarness = await createDisposableDatabase({
      adminUrl: runtimeUrl,
      optIn: destructiveOptIn,
    });
    pool = databaseHarness.pool;
    await pool.query("SET TIME ZONE 'UTC'");
    try {
      await applyMigrations(1, 16);
      const historical = await createWorkflow({ advanceToConfirmed: true });
      const historicalEvent = await insertFinancialEvent(
        historical.workflow.id,
        'OPERATOR_DISBURSEMENT_CONFIRMED',
        'PROJECT_EXPENSE_RECORDED'
      );
      historicalEventId = historicalEvent.id;
      await applyMigrations(17, 17);
      slice2Applied = true;
      await pool.query(migrationSql('017_project_expense_accounting_foundation.sql'));
    } catch (error) {
      await destroyDisposableDatabase(databaseHarness);
      databaseHarness = null;
      pool = null;
      throw error;
    }
  }, 120000);

  afterAll(async () => {
    if (databaseHarness) await destroyDisposableDatabase(databaseHarness);
  });

  test('full upgrade preserves historical null linkage and repeat-run-safe seeds', async () => {
    const historical = (await pool.query(
      'SELECT project_expense_id FROM financial_state_events WHERE id = $1',
      [historicalEventId]
    )).rows[0];
    expect(historical.project_expense_id).toBeNull();
    const categories = await pool.query('SELECT code FROM expense_categories ORDER BY code');
    expect(categories.rowCount).toBe(8);
  });

  test('Expense must initialize through a REQUESTED event in the same transaction', async () => {
    const context = await createContext();
    const expense = await createExpense(context);
    expect(expense.current_state).toBe('REQUESTED');
    expect(expense.current_state_event_id).not.toBeNull();

    await expectReject(
      pool.query(
        `INSERT INTO project_expenses (
           workflow_id, deal_id, operator_id, budget_id, category_id,
           purpose, currency, requested_amount, created_by, idempotency_key
         ) VALUES ($1,$2,$3,$4,$5,'Orphan','USD',1,'requester',$6)`,
        [
          context.workflow.id,
          context.deal.id,
          context.operator.id,
          context.budget.id,
          context.category.id,
          key('orphan'),
        ]
      ),
      /initialized by a REQUESTED event/
    );
  });

  test('Option B and budget ownership reject cross-identity Expenses', async () => {
    const first = await createContext();
    const second = await createContext();
    const otherCategory = (await pool.query(
      "SELECT * FROM expense_categories WHERE code = 'VETERINARY'"
    )).rows[0];

    await expectReject(
      pool.query(
        `INSERT INTO project_expenses (
           workflow_id, deal_id, operator_id, budget_id, category_id,
           purpose, currency, requested_amount, created_by, idempotency_key
         ) VALUES ($1,$2,$3,$4,$5,'Invalid','USD',1,'requester',$6)`,
        [
          first.workflow.id,
          second.deal.id,
          first.operator.id,
          first.budget.id,
          first.category.id,
          key('bad-deal'),
        ]
      ),
      /project_expenses_workflow_identity_fkey/
    );

    await expectReject(
      pool.query(
        `INSERT INTO project_expenses (
           workflow_id, deal_id, operator_id, budget_id, category_id,
           purpose, currency, requested_amount, created_by, idempotency_key
         ) VALUES ($1,$2,$3,$4,$5,'Invalid','USD',1,'requester',$6)`,
        [
          first.workflow.id,
          first.deal.id,
          second.operator.id,
          first.budget.id,
          first.category.id,
          key('bad-operator'),
        ]
      ),
      /project_expenses_workflow_identity_fkey/
    );

    await expectReject(
      pool.query(
        `INSERT INTO project_expenses (
           workflow_id, deal_id, operator_id, budget_id, category_id,
           purpose, currency, requested_amount, created_by, idempotency_key
         ) VALUES ($1,$2,$3,$4,$5,'Invalid','USD',1,'requester',$6)`,
        [
          first.workflow.id,
          first.deal.id,
          first.operator.id,
          second.budget.id,
          first.category.id,
          key('bad-budget'),
        ]
      ),
      /project_expenses_budget_ownership_fkey/
    );

    await expectReject(
      pool.query(
        `INSERT INTO project_expenses (
           workflow_id, deal_id, operator_id, budget_id, category_id,
           purpose, currency, requested_amount, created_by, idempotency_key
         ) VALUES ($1,$2,$3,$4,$5,'Invalid','USD',1,'requester',$6)`,
        [
          first.workflow.id,
          first.deal.id,
          first.operator.id,
          first.budget.id,
          otherCategory.id,
          key('bad-category'),
        ]
      ),
      /project_expenses_budget_ownership_fkey/
    );

    await expectReject(
      pool.query(
        `INSERT INTO project_expenses (
           workflow_id, deal_id, operator_id, budget_id, category_id,
           purpose, currency, requested_amount, created_by, idempotency_key
         ) VALUES ($1,$2,$3,$4,$5,'Invalid','EUR',1,'requester',$6)`,
        [
          first.workflow.id,
          first.deal.id,
          first.operator.id,
          first.budget.id,
          first.category.id,
          key('bad-currency'),
        ]
      ),
      /project_expenses_budget_ownership_fkey/
    );
  });

  test('valid approval and payment preserve one reservation and terminal immutability', async () => {
    const context = await createContext();
    let expense = await createExpense(context, '40.00');
    expense = await approveExpense(expense, '35.00');
    expect(expense.current_state).toBe('APPROVED');
    expect(expense.approved_amount).toBe('35.00000000');

    await addAuthoritativeEvidence(expense);
    expense = await payExpense(expense);
    expect(expense.current_state).toBe('PAID');
    expect(expense.paid_amount).toBe(expense.approved_amount);

    const reserved = (await pool.query(
      `SELECT COALESCE(SUM(approved_amount), 0) AS amount
       FROM project_expenses
       WHERE budget_id = $1 AND current_state IN ('APPROVED', 'PAID')`,
      [context.budget.id]
    )).rows[0];
    expect(reserved.amount).toBe('35.00000000');

    await expectReject(
      pool.query("UPDATE project_expenses SET description = 'changed' WHERE id = $1", [expense.id]),
      /Terminal Project Expense records are immutable/
    );
  });

  test('rejection and both cancellation paths enforce monetary history and reservations', async () => {
    const context = await createContext();
    let rejected = await createExpense(context, '10.00', 'requester-a');
    await transitionExpense(rejected, 'REJECTED', {
      actor: 'reviewer-a',
      role: 'EXPENSE_REJECTOR',
    });
    rejected = await reloadExpense(rejected.id);
    expect(rejected.approved_amount).toBeNull();
    expect(rejected.paid_amount).toBeNull();

    let preApprovalCancelled = await createExpense(context, '11.00', 'requester-b');
    await transitionExpense(preApprovalCancelled, 'CANCELLED', {
      actor: 'canceller-b',
      role: 'EXPENSE_CANCELLER',
    });
    preApprovalCancelled = await reloadExpense(preApprovalCancelled.id);
    expect(preApprovalCancelled.approved_amount).toBeNull();

    let approvedCancelled = await createExpense(context, '12.00', 'requester-c');
    approvedCancelled = await approveExpense(approvedCancelled, '12.00', 'approver-c');
    await transitionExpense(approvedCancelled, 'CANCELLED', {
      actor: 'canceller-c',
      role: 'EXPENSE_CANCELLER',
      approvedAmount: approvedCancelled.approved_amount,
    });
    approvedCancelled = await reloadExpense(approvedCancelled.id);
    expect(approvedCancelled.approved_amount).toBe('12.00000000');

    const reserved = (await pool.query(
      `SELECT COALESCE(SUM(approved_amount), 0) AS amount
       FROM project_expenses
       WHERE budget_id = $1 AND current_state IN ('APPROVED', 'PAID')`,
      [context.budget.id]
    )).rows[0];
    expect(reserved.amount).toBe('0');
  });

  test('invalid, stale, and partial-payment transitions are rejected without projection drift', async () => {
    const context = await createContext();
    let expense = await createExpense(context, '20.00');

    await expectReject(
      transitionExpense(expense, 'PAID', {
        actor: 'payer',
        role: 'EXPENSE_PAYER',
        approvedAmount: '20.00',
        paidAmount: '20.00',
      }),
      /Invalid Project Expense transition/
    );

    await expectReject(
      transitionExpense(expense, 'APPROVED', {
        actor: 'requester',
        role: 'EXPENSE_APPROVER',
        approvedAmount: '20.00',
      }),
      /approver must differ from requester/
    );

    expense = await approveExpense(expense, '20.00');
    await addAuthoritativeEvidence(expense);

    await expectReject(
      transitionExpense(expense, 'PAID', {
        actor: 'payer',
        role: 'EXPENSE_PAYER',
        approvedAmount: '20.00',
        paidAmount: '10.00',
      }),
      /project_expense_state_events_snapshot_check|Paid amount/
    );

    const stale = { ...expense, current_state: 'REQUESTED' };
    await expectReject(
      transitionExpense(stale, 'REJECTED', {
        actor: 'reviewer',
        role: 'EXPENSE_REJECTOR',
      }),
      /transition expected from/
    );
    expect((await reloadExpense(expense.id)).current_state).toBe('APPROVED');
  });

  test('every transition outside the approved matrix is rejected', async () => {
    const context = await createContext({ budgetAmount: '1000.00' });
    const roleForTarget = {
      REQUESTED: 'EXPENSE_REQUESTER',
      APPROVED: 'EXPENSE_APPROVER',
      REJECTED: 'EXPENSE_REJECTOR',
      CANCELLED: 'EXPENSE_CANCELLER',
      PAID: 'EXPENSE_PAYER',
    };
    const allowedTargets = {
      REQUESTED: new Set(['APPROVED', 'REJECTED', 'CANCELLED']),
      APPROVED: new Set(['PAID', 'CANCELLED']),
      REJECTED: new Set(),
      CANCELLED: new Set(),
      PAID: new Set(),
    };

    const byState = {};
    byState.REQUESTED = await createExpense(context, '9.00', 'matrix-requested');

    byState.APPROVED = await createExpense(context, '9.00', 'matrix-approved-requester');
    byState.APPROVED = await approveExpense(
      byState.APPROVED,
      '9.00',
      'matrix-approved-approver'
    );

    byState.REJECTED = await createExpense(context, '9.00', 'matrix-rejected-requester');
    await transitionExpense(byState.REJECTED, 'REJECTED', {
      actor: 'matrix-rejector',
      role: 'EXPENSE_REJECTOR',
    });
    byState.REJECTED = await reloadExpense(byState.REJECTED.id);

    byState.CANCELLED = await createExpense(context, '9.00', 'matrix-cancelled-requester');
    await transitionExpense(byState.CANCELLED, 'CANCELLED', {
      actor: 'matrix-canceller',
      role: 'EXPENSE_CANCELLER',
    });
    byState.CANCELLED = await reloadExpense(byState.CANCELLED.id);

    byState.PAID = await createExpense(context, '9.00', 'matrix-paid-requester');
    byState.PAID = await approveExpense(byState.PAID, '9.00', 'matrix-paid-approver');
    await addAuthoritativeEvidence(byState.PAID);
    byState.PAID = await payExpense(byState.PAID, 'matrix-paid-payer');

    for (const [fromState, expense] of Object.entries(byState)) {
      for (const targetState of ['REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'PAID']) {
        if (allowedTargets[fromState].has(targetState)) continue;
        const approvedAmount = ['APPROVED', 'PAID'].includes(targetState)
          ? '9.00000000'
          : (targetState === 'CANCELLED' && fromState === 'APPROVED' ? '9.00000000' : null);
        const paidAmount = targetState === 'PAID' ? '9.00000000' : null;
        await expectReject(
          transitionExpense(expense, targetState, {
            actor: `matrix-${fromState}-${targetState}`,
            role: roleForTarget[targetState],
            approvedAmount,
            paidAmount,
          }),
          /Invalid Project Expense transition|Terminal Project Expense|transition expected/
        );
      }
    }
  });

  test('direct projection manipulation and event mutation are rejected', async () => {
    const context = await createContext();
    const expense = await createExpense(context);
    const eventId = expense.current_state_event_id;

    await expectReject(
      pool.query(
        "UPDATE project_expenses SET current_state = 'REJECTED' WHERE id = $1",
        [expense.id]
      ),
      /projection fields may advance only through an event|projection event from_state is stale/
    );
    await expectReject(
      pool.query(
        "UPDATE project_expense_state_events SET metadata = '{\"changed\":true}' WHERE id = $1",
        [eventId]
      ),
      /state history is immutable/
    );
    await expectReject(
      pool.query('DELETE FROM project_expense_state_events WHERE id = $1', [eventId]),
      /state history is immutable/
    );
  });

  test('budget capacity, reductions, closure, and reopening are enforced', async () => {
    const context = await createContext({ budgetAmount: '50.00' });
    let first = await createExpense(context, '40.00', 'requester-first');
    first = await approveExpense(first, '40.00', 'approver-first');
    const second = await createExpense(context, '20.00', 'requester-second');

    await expectReject(
      approveExpense(second, '20.00', 'approver-second'),
      /exceeds available budget/
    );
    await expectReject(
      pool.query(
        'UPDATE financial_workflow_budgets SET budget_amount = 39 WHERE id = $1',
        [context.budget.id]
      ),
      /below current reservations/
    );
    await pool.query(
      'UPDATE financial_workflow_budgets SET budget_amount = 60, is_closed = TRUE WHERE id = $1',
      [context.budget.id]
    );
    await expectReject(
      approveExpense(second, '20.00', 'approver-second'),
      /Closed financial workflow budget/
    );
    await expectReject(
      pool.query(
        'UPDATE financial_workflow_budgets SET is_closed = FALSE WHERE id = $1',
        [context.budget.id]
      ),
      /cannot be reopened/
    );
  });

  test('evidence rules distinguish authoritative payment from supplementary evidence', async () => {
    const context = await createContext();
    let expense = await createExpense(context, '30.00');

    await pool.query(
      `INSERT INTO project_expense_evidence (
         expense_id, evidence_type, evidence_authority, evidence_role,
         evidence_reference, recorded_by, supplementary_onchain_reference, idempotency_key
       ) VALUES ($1, 'RECEIPT', 'SUPPLIER', 'SUPPLEMENTARY', $2, 'farmer', 'near:hash', $3)`,
      [expense.id, key('receipt'), key('evidence')]
    );

    await expectReject(
      addAuthoritativeEvidence(expense),
      /only for an approved Expense/
    );

    expense = await approveExpense(expense, '30.00');
    await expectReject(
      payExpense(expense),
      /requires authoritative fiat payment evidence/
    );

    const evidence = await addAuthoritativeEvidence(expense);
    await expectReject(
      addAuthoritativeEvidence(expense, 'second-accountant'),
      /project_expense_evidence_authoritative_unique/
    );
    await expectReject(
      pool.query('UPDATE project_expense_evidence SET metadata = $2 WHERE id = $1', [
        evidence.id,
        { changed: true },
      ]),
      /evidence is immutable/
    );

    expense = await payExpense(expense);
    await pool.query(
      `INSERT INTO project_expense_evidence (
         expense_id, evidence_type, evidence_authority, evidence_role,
         evidence_reference, recorded_by, supplementary_onchain_reference, idempotency_key
       ) VALUES ($1, 'SUPPLIER_CONFIRMATION', 'SUPPLIER', 'SUPPLEMENTARY', $2, 'farmer', 'near:later', $3)`,
      [expense.id, key('confirmation'), key('evidence')]
    );
  });

  test('PROJECT_EXPENSE_RECORDED requires one paid same-workflow Expense', async () => {
    const context = await createContext({ advanceToConfirmed: true });
    let unpaid = await createExpense(context, '20.00', 'requester-unpaid');

    await expectReject(
      insertFinancialEvent(
        context.workflow.id,
        'OPERATOR_DISBURSEMENT_CONFIRMED',
        'PROJECT_EXPENSE_RECORDED',
        { projectExpenseId: unpaid.id }
      ),
      /requires a paid Expense/
    );
    await expectReject(
      insertFinancialEvent(
        context.workflow.id,
        'OPERATOR_DISBURSEMENT_CONFIRMED',
        'PROJECT_EXPENSE_RECORDED'
      ),
      /linked paid Expense|project_expense_link_check/
    );

    unpaid = await approveExpense(unpaid, '20.00', 'approver-unpaid');
    await addAuthoritativeEvidence(unpaid);
    const firstPaid = await payExpense(unpaid, 'payer-unpaid');
    await insertFinancialEvent(
      context.workflow.id,
      'OPERATOR_DISBURSEMENT_CONFIRMED',
      'PROJECT_EXPENSE_RECORDED',
      { projectExpenseId: firstPaid.id }
    );

    await expectReject(
      insertFinancialEvent(
        context.workflow.id,
        'PROJECT_EXPENSE_RECORDED',
        'PROJECT_EXPENSE_RECORDED',
        { projectExpenseId: firstPaid.id }
      ),
      /financial_state_events_project_expense_unique/
    );

    let secondPaid = await createExpense(context, '10.00', 'requester-second-paid');
    secondPaid = await approveExpense(secondPaid, '10.00', 'approver-second-paid');
    await addAuthoritativeEvidence(secondPaid);
    secondPaid = await payExpense(secondPaid, 'payer-second-paid');
    await insertFinancialEvent(
      context.workflow.id,
      'PROJECT_EXPENSE_RECORDED',
      'PROJECT_EXPENSE_RECORDED',
      { projectExpenseId: secondPaid.id }
    );

    let crossWorkflowExpense = await createExpense(context, '5.00', 'requester-cross-workflow');
    crossWorkflowExpense = await approveExpense(
      crossWorkflowExpense,
      '5.00',
      'approver-cross-workflow'
    );
    await addAuthoritativeEvidence(crossWorkflowExpense);
    crossWorkflowExpense = await payExpense(crossWorkflowExpense, 'payer-cross-workflow');

    const other = await createContext({ advanceToConfirmed: true });
    await expectReject(
      insertFinancialEvent(
        other.workflow.id,
        'OPERATOR_DISBURSEMENT_CONFIRMED',
        'PROJECT_EXPENSE_RECORDED',
        { projectExpenseId: crossWorkflowExpense.id }
      ),
      /project_expense_workflow_fkey|same workflow/
    );

    await expectReject(
      insertFinancialEvent(
        context.workflow.id,
        'PROJECT_EXPENSE_RECORDED',
        'FIAT_PROCEEDS_RECEIVED',
        {
          projectExpenseId: secondPaid.id,
          currency: 'USD',
          amount: '10.00',
          bankReference: key('return'),
        }
      ),
      /project_expense_link_check|Only PROJECT_EXPENSE_RECORDED/
    );
  });

  test('projection pointer cannot move backward to the initial event', async () => {
    const context = await createContext();
    let expense = await createExpense(context, '18.00', 'pointer-requester');
    const requestedEventId = expense.current_state_event_id;
    expense = await approveExpense(expense, '18.00', 'pointer-approver');
    const approvedEventId = expense.current_state_event_id;
    const before = await reloadExpense(expense.id);
    const eventCountBefore = (await pool.query(
      'SELECT count(*)::int AS count FROM project_expense_state_events WHERE expense_id = $1',
      [expense.id]
    )).rows[0].count;
    await expectReject(
      pool.query(
        `UPDATE project_expenses
            SET current_state = 'REQUESTED', current_state_event_id = $2
          WHERE id = $1`,
        [expense.id, requestedEventId]
      ),
      /projection fields may advance only through an event|projection event from_state is stale/
    );
    const unchanged = await reloadExpense(expense.id);
    expect(unchanged).toEqual(before);
    expect(unchanged.current_state_event_id).toBe(approvedEventId);
    expect(unchanged.approved_amount).toBe('18.00000000');
    expect(unchanged.paid_amount).toBeNull();
    expect((await pool.query(
      'SELECT count(*)::int AS count FROM project_expense_state_events WHERE expense_id = $1',
      [expense.id]
    )).rows[0].count).toBe(eventCountBefore);
  });

  test('projection pointer cannot select a same-Expense event that is not latest', async () => {
    const context = await createContext();
    let expense = await createExpense(context, '19.00', 'nonlatest-requester');
    expense = await approveExpense(expense, '19.00', 'nonlatest-approver');
    // Build two constraint-valid owned candidates while deliberately bypassing
    // only the event triggers. This isolates the projection's latest-event
    // guard; ordinary lifecycle inserts could never create this adversarial
    // history because the first candidate would advance the projection.
    const fixtureClient = await pool.connect();
    let nonLatestEventId;
    try {
      await fixtureClient.query("SET session_replication_role = 'replica'");
      nonLatestEventId = (await fixtureClient.query(
        `INSERT INTO project_expense_state_events (
           expense_id, from_state, to_state, requested_amount, approved_amount,
           actor_id, actor_role, idempotency_key
         ) VALUES ($1, 'APPROVED', 'CANCELLED', $2, $3, 'fixture-a',
                   'EXPENSE_CANCELLER', $4)
         RETURNING id`,
        [expense.id, expense.requested_amount, expense.approved_amount, key('nonlatest-fixture')]
      )).rows[0].id;
      await fixtureClient.query(
        `INSERT INTO project_expense_state_events (
           expense_id, from_state, to_state, requested_amount, approved_amount,
           actor_id, actor_role, idempotency_key
         ) VALUES ($1, 'APPROVED', 'CANCELLED', $2, $3, 'fixture-b',
                   'EXPENSE_CANCELLER', $4)`,
        [expense.id, expense.requested_amount, expense.approved_amount, key('latest-fixture')]
      );
    } finally {
      await fixtureClient.query("SET session_replication_role = 'origin'").catch(() => {});
      fixtureClient.release();
    }
    const before = { ...expense };
    const countBefore = (await pool.query(
      'SELECT count(*)::int AS count FROM project_expense_state_events WHERE expense_id = $1',
      [expense.id]
    )).rows[0].count;
    await expectReject(
      pool.query(
        `UPDATE project_expenses
            SET current_state = 'CANCELLED', current_state_event_id = $2,
                paid_amount = NULL
          WHERE id = $1`,
        [expense.id, nonLatestEventId]
      ),
      /latest authoritative event/
    );
    expect(await reloadExpense(expense.id)).toEqual(before);
    expect((await pool.query(
      'SELECT count(*)::int AS count FROM project_expense_state_events WHERE expense_id = $1',
      [expense.id]
    )).rows[0].count).toBe(countBefore);
  });

  test('evidence history rejects timestamp updates and deletes', async () => {
    const context = await createContext();
    let expense = await createExpense(context);
    const supplementary = (await pool.query(
      `INSERT INTO project_expense_evidence (
         expense_id, evidence_type, evidence_authority, evidence_role,
         evidence_reference, recorded_by, idempotency_key
       ) VALUES ($1, 'RECEIPT', 'SUPPLIER', 'SUPPLEMENTARY', $2, 'supplier', $3)
       RETURNING *`,
      [expense.id, key('supplementary'), key('supplementary-evidence')]
    )).rows[0];
    expense = await approveExpense(expense);
    const evidence = await addAuthoritativeEvidence(expense);
    const evidenceBefore = (await pool.query(
      'SELECT * FROM project_expense_evidence WHERE expense_id = $1 ORDER BY id', [expense.id]
    )).rows;
    const eventBefore = (await pool.query(
      'SELECT * FROM project_expense_state_events WHERE id = $1', [expense.current_state_event_id]
    )).rows[0];
    await expectReject(
      pool.query('UPDATE project_expense_evidence SET recorded_at = recorded_at + interval \'1 second\' WHERE id = $1', [evidence.id]),
      /evidence is immutable/
    );
    await expectReject(
      pool.query('DELETE FROM project_expense_evidence WHERE id = $1', [evidence.id]),
      /evidence is immutable/
    );
    await expectReject(
      pool.query('DELETE FROM project_expense_evidence WHERE id = $1', [supplementary.id]),
      /evidence is immutable/
    );
    await expectReject(
      pool.query('UPDATE project_expense_state_events SET occurred_at = occurred_at + interval \'1 second\' WHERE id = $1', [expense.current_state_event_id]),
      /state history is immutable/
    );
    expect((await pool.query(
      'SELECT * FROM project_expense_evidence WHERE expense_id = $1 ORDER BY id', [expense.id]
    )).rows).toEqual(evidenceBefore);
    expect((await pool.query(
      'SELECT * FROM project_expense_state_events WHERE id = $1', [expense.current_state_event_id]
    )).rows[0]).toEqual(eventBefore);
  });

  test('category, budget, and Expense ownership records cannot be deleted', async () => {
    const context = await createContext();
    const expense = await createExpense(context);
    const categoryBefore = { ...context.category };
    const budgetBefore = { ...context.budget };
    const expenseBefore = await reloadExpense(expense.id);
    const expenseHistoryBefore = (await pool.query(
      'SELECT * FROM project_expense_state_events WHERE expense_id = $1 ORDER BY id', [expense.id]
    )).rows;
    await expectReject(pool.query('DELETE FROM project_expenses WHERE id = $1', [expense.id]), /cannot be deleted/);
    let terminal = await createExpense(context, '5.00', 'delete-terminal-requester');
    await transitionExpense(terminal, 'REJECTED', { actor: 'delete-terminal-rejector', role: 'EXPENSE_REJECTOR' });
    terminal = await reloadExpense(terminal.id);
    const terminalBefore = { ...terminal };
    await expectReject(pool.query('DELETE FROM project_expenses WHERE id = $1', [terminal.id]), /cannot be deleted/);
    await expectReject(pool.query('DELETE FROM financial_workflow_budgets WHERE id = $1', [context.budget.id]), /violates foreign key|cannot be deleted/i);
    await expectReject(pool.query('DELETE FROM expense_categories WHERE id = $1', [context.category.id]), /violates foreign key|cannot be deleted/i);
    expect((await pool.query('SELECT * FROM expense_categories WHERE id = $1', [context.category.id])).rows[0]).toEqual(categoryBefore);
    expect((await pool.query('SELECT * FROM financial_workflow_budgets WHERE id = $1', [context.budget.id])).rows[0]).toEqual(budgetBefore);
    expect(await reloadExpense(expense.id)).toEqual(expenseBefore);
    expect(await reloadExpense(terminal.id)).toEqual(terminalBefore);
    expect((await pool.query(
      'SELECT * FROM project_expense_state_events WHERE expense_id = $1 ORDER BY id', [expense.id]
    )).rows).toEqual(expenseHistoryBefore);
  });

  test('category, Budget, and Expense identity fields are immutable', async () => {
    const context = await createContext();
    const expense = await createExpense(context, '22.00');
    const categoryBefore = { ...context.category };
    for (const [column, value] of [['id', context.category.id + 999999], ['code', 'CHANGED'], ['created_at', new Date(0)]]) {
      await expectReject(
        pool.query(`UPDATE expense_categories SET ${column} = $2 WHERE id = $1`, [context.category.id, value]),
        /category identity is immutable/i
      );
      expect((await pool.query(
        'SELECT * FROM expense_categories WHERE id = $1', [context.category.id]
      )).rows[0]).toEqual(categoryBefore);
    }
    const budgetBefore = (await pool.query(
      'SELECT * FROM financial_workflow_budgets WHERE id = $1', [context.budget.id]
    )).rows[0];
    const budgetMutations = [
      ['workflow_id', context.workflow.id + 999999], ['category_id', context.category.id + 999999],
      ['currency_type', 'CRYPTO'], ['currency', 'EUR'], ['created_by', 'changed'],
      ['idempotency_key', key('changed-budget')], ['created_at', new Date(0)],
    ];
    for (const [column, value] of budgetMutations) {
      await expectReject(
        pool.query(`UPDATE financial_workflow_budgets SET ${column} = $2 WHERE id = $1`, [context.budget.id, value]),
        /budget identity is immutable/i
      );
      expect((await pool.query(
        'SELECT * FROM financial_workflow_budgets WHERE id = $1', [context.budget.id]
      )).rows[0]).toEqual(budgetBefore);
    }
    const expenseBefore = await reloadExpense(expense.id);
    const mutations = [
      ['workflow_id', context.workflow.id + 999999],
      ['deal_id', context.deal.id + 999999],
      ['operator_id', context.operator.id + 999999],
      ['budget_id', context.budget.id + 999999],
      ['category_id', context.category.id + 999999],
      ['currency_type', 'CRYPTO'],
      ['currency', 'EUR'],
      ['requested_amount', '23.00'],
      ['created_by', 'someone-else'],
      ['idempotency_key', key('changed')],
      ['created_at', new Date(0)],
    ];
    for (const [column, value] of mutations) {
      await expectReject(
        pool.query(`UPDATE project_expenses SET ${column} = $2 WHERE id = $1`, [expense.id, value]),
        /immutable|foreign key|ownership/i
      );
      expect(await reloadExpense(expense.id)).toEqual(expenseBefore);
    }
  });

  test('terminal PAID, REJECTED, and CANCELLED rows reject descriptive changes', async () => {
    const context = await createContext({ budgetAmount: '200.00' });
    let paid = await createExpense(context, '10.00', 'terminal-paid-requester');
    paid = await approveExpense(paid, '10.00', 'terminal-paid-approver');
    await addAuthoritativeEvidence(paid);
    paid = await payExpense(paid, 'terminal-paid-payer');
    let rejected = await createExpense(context, '10.00', 'terminal-rejected-requester');
    await transitionExpense(rejected, 'REJECTED', { actor: 'terminal-rejector', role: 'EXPENSE_REJECTOR' });
    rejected = await reloadExpense(rejected.id);
    let cancelled = await createExpense(context, '10.00', 'terminal-cancelled-requester');
    await transitionExpense(cancelled, 'CANCELLED', { actor: 'terminal-canceller', role: 'EXPENSE_CANCELLER' });
    cancelled = await reloadExpense(cancelled.id);
    for (const terminal of [paid, rejected, cancelled]) {
      const before = await reloadExpense(terminal.id);
      for (const [column, expression] of [
        ['purpose', "purpose || ' changed'"],
        ['description', "'changed'"],
        ['supplier_reference', "'changed'"],
        ['metadata', `'{"changed":true}'::jsonb`],
      ]) {
        await expectReject(
          pool.query(`UPDATE project_expenses SET ${column} = ${expression} WHERE id = $1`, [terminal.id]),
          /Terminal Project Expense records are immutable/
        );
        expect(await reloadExpense(terminal.id)).toEqual(before);
      }
    }
  });

  test('failed transitions roll back event and projection changes', async () => {
    const context = await createContext({ budgetAmount: '10.00' });
    const expense = await createExpense(context, '20.00');
    const before = await pool.query('SELECT count(*)::int AS count FROM project_expense_state_events WHERE expense_id = $1', [expense.id]);
    const pointerBefore = expense.current_state_event_id;
    await expectReject(approveExpense(expense, '20.00'), /exceeds available budget/);
    const after = await pool.query('SELECT count(*)::int AS count FROM project_expense_state_events WHERE expense_id = $1', [expense.id]);
    expect(after.rows[0].count).toBe(before.rows[0].count);
    const unchanged = await reloadExpense(expense.id);
    expect(unchanged.current_state).toBe('REQUESTED');
    expect(unchanged.current_state_event_id).toBe(pointerBefore);
    expect(unchanged.approved_amount).toBeNull();
    const reserved = await pool.query(
      `SELECT COALESCE(SUM(approved_amount), 0) AS amount FROM project_expenses
        WHERE budget_id = $1 AND current_state IN ('APPROVED', 'PAID')`,
      [context.budget.id]
    );
    expect(reserved.rows[0].amount).toBe('0');
  });

  test('failed PAID and workflow linkage attempts leave no partial state', async () => {
    const context = await createContext({ advanceToConfirmed: true });
    let expense = await createExpense(context, '16.00');
    expense = await approveExpense(expense, '16.00');
    const expenseEventsBefore = await pool.query('SELECT count(*)::int AS count FROM project_expense_state_events WHERE expense_id = $1', [expense.id]);
    const expensePointer = expense.current_state_event_id;
    const reservationBefore = (await pool.query(
      `SELECT COALESCE(SUM(approved_amount), 0) AS amount FROM project_expenses
        WHERE budget_id = $1 AND current_state IN ('APPROVED', 'PAID')`,
      [context.budget.id]
    )).rows[0].amount;
    const evidenceBefore = (await pool.query(
      'SELECT count(*)::int AS count FROM project_expense_evidence WHERE expense_id = $1',
      [expense.id]
    )).rows[0].count;
    await expectReject(payExpense(expense), /requires authoritative fiat payment evidence/);
    await expectReject(
      transitionExpense(expense, 'PAID', {
        actor: 'invalid-snapshot-payer',
        role: 'EXPENSE_PAYER',
        approvedAmount: expense.approved_amount,
        paidAmount: '1.00',
      }),
      /snapshot_check|Paid amount/
    );
    const expenseAfter = await reloadExpense(expense.id);
    expect(expenseAfter.current_state).toBe('APPROVED');
    expect(expenseAfter.current_state_event_id).toBe(expensePointer);
    expect(expenseAfter.paid_amount).toBeNull();
    expect(expenseAfter.approved_amount).toBe(expense.approved_amount);
    expect((await pool.query('SELECT count(*)::int AS count FROM project_expense_state_events WHERE expense_id = $1', [expense.id])).rows[0].count)
      .toBe(expenseEventsBefore.rows[0].count);
    expect((await pool.query(
      `SELECT COALESCE(SUM(approved_amount), 0) AS amount FROM project_expenses
        WHERE budget_id = $1 AND current_state IN ('APPROVED', 'PAID')`,
      [context.budget.id]
    )).rows[0].amount).toBe(reservationBefore);
    expect((await pool.query(
      'SELECT count(*)::int AS count FROM project_expense_evidence WHERE expense_id = $1',
      [expense.id]
    )).rows[0].count).toBe(evidenceBefore);

    const workflowBefore = (await pool.query('SELECT current_state, current_state_event_id FROM financial_workflows WHERE id = $1', [context.workflow.id])).rows[0];
    const workflowEventCount = (await pool.query('SELECT count(*)::int AS count FROM financial_state_events WHERE workflow_id = $1', [context.workflow.id])).rows[0].count;
    await expectReject(
      insertFinancialEvent(context.workflow.id, 'OPERATOR_DISBURSEMENT_CONFIRMED', 'PROJECT_EXPENSE_RECORDED', { projectExpenseId: expense.id }),
      /requires a paid Expense/
    );
    const workflowAfter = (await pool.query('SELECT current_state, current_state_event_id FROM financial_workflows WHERE id = $1', [context.workflow.id])).rows[0];
    expect(workflowAfter).toEqual(workflowBefore);
    expect((await pool.query('SELECT count(*)::int AS count FROM financial_state_events WHERE workflow_id = $1', [context.workflow.id])).rows[0].count)
      .toBe(workflowEventCount);
  });

  test('all failed workflow linkage variants preserve workflow and Expense state', async () => {
    const primary = await createContext({ advanceToConfirmed: true });
    let paid = await createExpense(primary, '8.00', 'linkage-paid-requester');
    paid = await approveExpense(paid, '8.00', 'linkage-paid-approver');
    await addAuthoritativeEvidence(paid);
    paid = await payExpense(paid, 'linkage-paid-payer');
    const unpaid = await createExpense(primary, '7.00', 'linkage-unpaid-requester');
    const other = await createContext({ advanceToConfirmed: true });

    async function workflowSnapshot(workflowId) {
      const workflow = (await pool.query(
        'SELECT current_state, current_state_event_id FROM financial_workflows WHERE id = $1',
        [workflowId]
      )).rows[0];
      const count = (await pool.query(
        'SELECT count(*)::int AS count FROM financial_state_events WHERE workflow_id = $1',
        [workflowId]
      )).rows[0].count;
      return { workflow, count };
    }

    async function expectLinkageRollback(context, attempt, pattern, expenseIds) {
      const before = await workflowSnapshot(context.workflow.id);
      const expensesBefore = [];
      for (const id of expenseIds) expensesBefore.push(await reloadExpense(id));
      await expectReject(attempt(), pattern);
      expect(await workflowSnapshot(context.workflow.id)).toEqual(before);
      for (let index = 0; index < expenseIds.length; index += 1) {
        expect(await reloadExpense(expenseIds[index])).toEqual(expensesBefore[index]);
      }
    }

    await expectLinkageRollback(
      primary,
      () => insertFinancialEvent(
        primary.workflow.id, 'OPERATOR_DISBURSEMENT_CONFIRMED', 'PROJECT_EXPENSE_RECORDED'
      ),
      /linked paid Expense|project_expense_link_check/,
      [paid.id]
    );
    await expectLinkageRollback(
      primary,
      () => insertFinancialEvent(
        primary.workflow.id, 'OPERATOR_DISBURSEMENT_CONFIRMED', 'PROJECT_EXPENSE_RECORDED',
        { projectExpenseId: unpaid.id }
      ),
      /requires a paid Expense/,
      [unpaid.id]
    );
    await expectLinkageRollback(
      other,
      () => insertFinancialEvent(
        other.workflow.id, 'OPERATOR_DISBURSEMENT_CONFIRMED', 'PROJECT_EXPENSE_RECORDED',
        { projectExpenseId: paid.id }
      ),
      /project_expense_workflow_fkey|same workflow/,
      [paid.id]
    );

    const accepted = await insertFinancialEvent(
      primary.workflow.id, 'OPERATOR_DISBURSEMENT_CONFIRMED', 'PROJECT_EXPENSE_RECORDED',
      { projectExpenseId: paid.id }
    );
    await expectLinkageRollback(
      primary,
      () => insertFinancialEvent(
        primary.workflow.id, 'PROJECT_EXPENSE_RECORDED', 'PROJECT_EXPENSE_RECORDED',
        { projectExpenseId: paid.id }
      ),
      /financial_state_events_project_expense_unique/,
      [paid.id]
    );
    const links = await pool.query(
      'SELECT * FROM financial_state_events WHERE project_expense_id = $1', [paid.id]
    );
    expect(links.rows).toHaveLength(1);
    expect(links.rows[0].id).toBe(accepted.id);
  });

  test('equal event timestamps still order projection by immutable event id', async () => {
    const context = await createContext();
    const timestamp = '2025-01-01T00:00:00.000Z';
    let expense = await createExpense(context, '12.00', 'same-time-requester', timestamp);
    const requestedId = expense.current_state_event_id;
    await transitionExpense(expense, 'APPROVED', {
      actor: 'same-time-approver',
      role: 'EXPENSE_APPROVER',
      approvedAmount: '12.00',
      occurredAt: timestamp,
    });
    expense = await reloadExpense(expense.id);
    expect(expense.current_state).toBe('APPROVED');
    expect(BigInt(expense.current_state_event_id)).toBeGreaterThan(BigInt(requestedId));
  });

  test('concurrent approvals deterministically serialize on one budget', async () => {
    const context = await createContext({ budgetAmount: '100.00' });
    const first = await createExpense(context, '60.00', 'requester-concurrent-1');
    const second = await createExpense(context, '60.00', 'requester-concurrent-2');
    const firstRequestedPointer = first.current_state_event_id;
    const secondRequestedPointer = second.current_state_event_id;
    await withTwoTransactionalClients(async (winner, loser) => {
      await winner.query('SELECT id FROM financial_workflow_budgets WHERE id = $1 FOR UPDATE', [context.budget.id]);
      const blocked = transitionExpense(second, 'APPROVED', {
        actor: 'approver-concurrent-2', role: 'EXPENSE_APPROVER', approvedAmount: '60.00', queryable: loser,
      }).then(() => null, (error) => error);
      await waitUntilBlocked(loser, 'competing budget approval');
      await transitionExpense(first, 'APPROVED', {
        actor: 'approver-concurrent-1', role: 'EXPENSE_APPROVER', approvedAmount: '60.00', queryable: winner,
      });
      await winner.query('COMMIT');
      expect((await blocked).message).toMatch(/exceeds available budget/);
      await loser.query('ROLLBACK');
    });
    const finalExpenses = (await pool.query(
      'SELECT * FROM project_expenses WHERE id = ANY($1::bigint[]) ORDER BY id',
      [[first.id, second.id]]
    )).rows;
    const approved = finalExpenses.filter((row) => row.current_state === 'APPROVED');
    const requested = finalExpenses.filter((row) => row.current_state === 'REQUESTED');
    expect(approved).toHaveLength(1);
    expect(requested).toHaveLength(1);
    const approvalEvents = (await pool.query(
      `SELECT * FROM project_expense_state_events
        WHERE expense_id = ANY($1::bigint[]) AND to_state = 'APPROVED'`,
      [[first.id, second.id]]
    )).rows;
    expect(approvalEvents).toHaveLength(1);
    expect(approved[0].current_state_event_id).toBe(approvalEvents[0].id);
    expect(requested[0].current_state_event_id).toBe(
      requested[0].id === first.id ? firstRequestedPointer : secondRequestedPointer
    );
    expect(requested[0].approved_amount).toBeNull();
    const capacity = (await pool.query(
      `SELECT b.budget_amount,
              COALESCE(SUM(e.approved_amount) FILTER (
                WHERE e.current_state IN ('APPROVED', 'PAID')
              ), 0) AS reserved
         FROM financial_workflow_budgets b
         LEFT JOIN project_expenses e ON e.budget_id = b.id
        WHERE b.id = $1 GROUP BY b.id`,
      [context.budget.id]
    )).rows[0];
    expect(capacity.reserved).toBe('60.00000000');
    expect(Number(capacity.reserved)).toBeLessThanOrEqual(Number(capacity.budget_amount));
  });

  test('approval concurrent with budget reduction preserves capacity', async () => {
    const context = await createContext({ budgetAmount: '100.00' });
    const expense = await createExpense(context, '60.00', 'requester-reduction');
    const requestedPointer = expense.current_state_event_id;
    await withTwoTransactionalClients(async (budgetClient, approvalClient) => {
      await budgetClient.query(
        'UPDATE financial_workflow_budgets SET budget_amount = 50 WHERE id = $1',
        [context.budget.id]
      );
      const approval = transitionExpense(expense, 'APPROVED', {
        actor: 'approver-reduction',
        role: 'EXPENSE_APPROVER',
        approvedAmount: '60.00',
        queryable: approvalClient,
      }).then(() => null, (error) => error);
      await waitUntilBlocked(approvalClient, 'approval behind budget reduction');
      await budgetClient.query('COMMIT');
      expect((await approval).message).toMatch(/exceeds available budget/);
      await approvalClient.query('ROLLBACK');
    });
    const finalBudget = (await pool.query(
      'SELECT * FROM financial_workflow_budgets WHERE id = $1', [context.budget.id]
    )).rows[0];
    const finalExpense = await reloadExpense(expense.id);
    const history = await pool.query(
      'SELECT * FROM project_expense_state_events WHERE expense_id = $1 ORDER BY id', [expense.id]
    );
    expect(finalBudget.budget_amount).toBe('50.00000000');
    expect(finalExpense.current_state).toBe('REQUESTED');
    expect(finalExpense.current_state_event_id).toBe(requestedPointer);
    expect(finalExpense.approved_amount).toBeNull();
    expect(history.rows).toHaveLength(1);
    const reserved = (await pool.query(
      `SELECT COALESCE(SUM(approved_amount), 0) AS amount FROM project_expenses
        WHERE budget_id = $1 AND current_state IN ('APPROVED', 'PAID')`,
      [context.budget.id]
    )).rows[0].amount;
    expect(reserved).toBe('0');
    expect(Number(finalBudget.budget_amount)).toBeGreaterThanOrEqual(Number(reserved));
  });

  test('competing transitions and duplicate PAID attempts use deterministic row-lock barriers', async () => {
    const context = await createContext();
    let expense = await createExpense(context, '25.00', 'requester-race');
    await withTwoTransactionalClients(async (winner, loser) => {
      await winner.query('SELECT id FROM project_expenses WHERE id = $1 FOR UPDATE', [expense.id]);
      const blocked = transitionExpense(expense, 'REJECTED', {
        actor: 'rejector-race', role: 'EXPENSE_REJECTOR', queryable: loser,
      }).then(() => null, (error) => error);
      await waitUntilBlocked(loser, 'competing Expense transition');
      await transitionExpense(expense, 'APPROVED', {
        actor: 'approver-race-1', role: 'EXPENSE_APPROVER', approvedAmount: '25.00', queryable: winner,
      });
      await winner.query('COMMIT');
      expect((await blocked).message).toMatch(/transition expected from/);
      await loser.query('ROLLBACK');
    });
    expense = await reloadExpense(expense.id);
    const competingEvents = (await pool.query(
      `SELECT * FROM project_expense_state_events
        WHERE expense_id = $1 AND to_state IN ('APPROVED', 'REJECTED')`, [expense.id]
    )).rows;
    expect(competingEvents).toHaveLength(1);
    expect(competingEvents[0].to_state).toBe('APPROVED');
    expect(expense.current_state).toBe('APPROVED');
    expect(expense.current_state_event_id).toBe(competingEvents[0].id);
    expect(expense.approved_amount).toBe('25.00000000');
    expect((await pool.query(
      `SELECT COALESCE(SUM(approved_amount), 0) AS amount FROM project_expenses
        WHERE budget_id = $1 AND current_state IN ('APPROVED', 'PAID')`,
      [context.budget.id]
    )).rows[0].amount).toBe('25.00000000');
    await addAuthoritativeEvidence(expense);
    await withTwoTransactionalClients(async (winner, loser) => {
      await winner.query('SELECT id FROM project_expenses WHERE id = $1 FOR UPDATE', [expense.id]);
      const blocked = transitionExpense(expense, 'PAID', {
        actor: 'payer-race-2', role: 'EXPENSE_PAYER', approvedAmount: expense.approved_amount,
        paidAmount: expense.approved_amount, queryable: loser,
      }).then(() => null, (error) => error);
      await waitUntilBlocked(loser, 'duplicate PAID transition');
      await transitionExpense(expense, 'PAID', {
        actor: 'payer-race-1', role: 'EXPENSE_PAYER', approvedAmount: expense.approved_amount,
        paidAmount: expense.approved_amount, queryable: winner,
      });
      await winner.query('COMMIT');
      expect((await blocked).message).toMatch(/transition expected from|Terminal Project Expense/);
      await loser.query('ROLLBACK');
    });
    const finalExpense = await reloadExpense(expense.id);
    const paidEvents = (await pool.query(
      "SELECT * FROM project_expense_state_events WHERE expense_id = $1 AND to_state = 'PAID'",
      [expense.id]
    )).rows;
    expect(paidEvents).toHaveLength(1);
    expect(finalExpense.current_state).toBe('PAID');
    expect(finalExpense.current_state_event_id).toBe(paidEvents[0].id);
    expect(finalExpense.paid_amount).toBe(finalExpense.approved_amount);
    expect((await pool.query(
      "SELECT count(*)::int AS count FROM project_expense_evidence WHERE expense_id = $1 AND evidence_role = 'AUTHORITATIVE_PAYMENT'",
      [expense.id]
    )).rows[0].count).toBe(1);
    expect((await pool.query(
      `SELECT COALESCE(SUM(approved_amount), 0) AS amount FROM project_expenses
        WHERE budget_id = $1 AND current_state IN ('APPROVED', 'PAID')`,
      [context.budget.id]
    )).rows[0].amount).toBe('25.00000000');
  });

  test('workflow, budget, Expense, and evidence lock hierarchy completes without deadlock', async () => {
    const context = await createContext({ advanceToConfirmed: true });
    let expense = await createExpense(context, '14.00', 'lock-order-requester');
    expense = await approveExpense(expense, '14.00', 'lock-order-approver');
    const evidence = await addAuthoritativeEvidence(expense);
    expense = await payExpense(expense, 'lock-order-payer');
    const evidenceCountBefore = (await pool.query(
      'SELECT count(*)::int AS count FROM project_expense_evidence WHERE expense_id = $1',
      [expense.id]
    )).rows[0].count;
    let acceptedEvent;
    await withTwoTransactionalClients(async (holder, contender) => {
      await holder.query('SELECT id FROM financial_workflows WHERE id = $1 FOR UPDATE', [context.workflow.id]);
      await holder.query('SELECT id FROM financial_workflow_budgets WHERE id = $1 FOR UPDATE', [context.budget.id]);
      await holder.query('SELECT id FROM project_expenses WHERE id = $1 FOR UPDATE', [expense.id]);
      await holder.query('SELECT id FROM project_expense_evidence WHERE id = $1 FOR UPDATE', [evidence.id]);
      const blocked = insertFinancialEvent(
        context.workflow.id, 'OPERATOR_DISBURSEMENT_CONFIRMED', 'PROJECT_EXPENSE_RECORDED',
        { projectExpenseId: expense.id, queryable: contender }
      ).then((event) => ({ event }), (error) => ({ error }));
      await waitUntilBlocked(contender, 'full accounting lock hierarchy');
      await holder.query('COMMIT');
      const outcome = await blocked;
      expect(outcome.error).toBeUndefined();
      expect(outcome.event.project_expense_id).toBe(expense.id);
      acceptedEvent = outcome.event;
      await contender.query('COMMIT');
    });
    const workflow = (await pool.query(
      'SELECT * FROM financial_workflows WHERE id = $1', [context.workflow.id]
    )).rows[0];
    const finalExpense = await reloadExpense(expense.id);
    expect(workflow.current_state).toBe('PROJECT_EXPENSE_RECORDED');
    expect(workflow.current_state_event_id).toBe(acceptedEvent.id);
    expect(finalExpense.current_state).toBe('PAID');
    expect((await pool.query(
      'SELECT expense_id FROM project_expense_state_events WHERE id = $1',
      [finalExpense.current_state_event_id]
    )).rows[0].expense_id).toBe(expense.id);
    expect((await pool.query(
      'SELECT count(*)::int AS count FROM project_expense_evidence WHERE expense_id = $1',
      [expense.id]
    )).rows[0].count).toBe(evidenceCountBefore);
    expect((await pool.query(
      `SELECT COALESCE(SUM(approved_amount), 0) AS amount FROM project_expenses
        WHERE budget_id = $1 AND current_state IN ('APPROVED', 'PAID')`,
      [context.budget.id]
    )).rows[0].amount).toBe('14.00000000');
  });

  test('concurrent duplicate workflow recording commits only once without deadlock', async () => {
    const context = await createContext({ advanceToConfirmed: true });
    let expense = await createExpense(context, '15.00', 'requester-workflow-race');
    expense = await approveExpense(expense, '15.00', 'approver-workflow-race');
    await addAuthoritativeEvidence(expense);
    expense = await payExpense(expense, 'payer-workflow-race');

    const workflowBefore = (await pool.query(
      'SELECT current_state_event_id FROM financial_workflows WHERE id = $1', [context.workflow.id]
    )).rows[0];
    const countBefore = (await pool.query(
      'SELECT count(*)::int AS count FROM financial_state_events WHERE workflow_id = $1',
      [context.workflow.id]
    )).rows[0].count;
    let acceptedEvent;
    await withTwoTransactionalClients(async (winner, loser) => {
      acceptedEvent = await insertFinancialEvent(
        context.workflow.id, 'OPERATOR_DISBURSEMENT_CONFIRMED', 'PROJECT_EXPENSE_RECORDED',
        { projectExpenseId: expense.id, queryable: winner }
      );
      const blocked = insertFinancialEvent(
        context.workflow.id, 'OPERATOR_DISBURSEMENT_CONFIRMED', 'PROJECT_EXPENSE_RECORDED',
        { projectExpenseId: expense.id, queryable: loser }
      ).then(() => null, (error) => error);
      await waitUntilBlocked(loser, 'duplicate workflow recording');
      await winner.query('COMMIT');
      expect((await blocked).message).toMatch(/transition expected from|unique|duplicate/i);
      await loser.query('ROLLBACK');
      const links = await pool.query(
        'SELECT count(*)::int AS count FROM financial_state_events WHERE project_expense_id = $1',
        [expense.id]
      );
      expect(links.rows[0].count).toBe(1);
    });
    const workflow = (await pool.query(
      'SELECT * FROM financial_workflows WHERE id = $1', [context.workflow.id]
    )).rows[0];
    const events = await pool.query(
      'SELECT * FROM financial_state_events WHERE workflow_id = $1 ORDER BY id',
      [context.workflow.id]
    );
    expect(events.rowCount).toBe(countBefore + 1);
    expect(workflow.current_state_event_id).not.toBe(workflowBefore.current_state_event_id);
    expect(workflow.current_state_event_id).toBe(acceptedEvent.id);
    expect(events.rows.filter((row) => row.project_expense_id === expense.id)).toHaveLength(1);
  });

  test('two-client failure path releases transactions and checked-out clients', async () => {
    const beforeWaiting = pool.waitingCount;
    await expect(withTwoTransactionalClients(async (_first, second) => {
      await waitUntilBlocked(second, 'deliberately absent barrier', 50);
    })).rejects.toThrow(/did not reach the expected PostgreSQL lock barrier/);
    expect(pool.waitingCount).toBe(beforeWaiting);
    expect(pool.idleCount).toBe(pool.totalCount);
  });
});
