const pool = require('../db/index');

async function getAllDeals() {
  const { rows } = await pool.query(
    'SELECT * FROM deals ORDER BY created_at DESC'
  );
  return rows;
}

async function getDealById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM deals WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function createDeal(deal) {
  const { rows } = await pool.query(
    `INSERT INTO deals (
      contract_address, deal_type, farmer, investor, admin, platform,
      investment_amount, farmer_split_pct, investor_split_pct, escrow_pct,
      performance_fee_pct, cycle_duration_days, total_cycles, capital_return_near
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *`,
    [
      deal.contract_address, deal.deal_type, deal.farmer, deal.investor,
      deal.admin, deal.platform, deal.investment_amount,
      deal.farmer_split_pct, deal.investor_split_pct, deal.escrow_pct,
      deal.performance_fee_pct, deal.cycle_duration_days, deal.total_cycles,
      deal.capital_return_near
    ]
  );
  return rows[0];
}

async function addEvent(event) {
  await pool.query(
    `INSERT INTO events (deal_id, event_type, cycle_num, profit_near, losses_near, tx_hash)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      event.deal_id, event.event_type, event.cycle_num ?? null,
      event.profit_near ?? null, event.losses_near ?? null,
      event.tx_hash ?? null
    ]
  );
}

async function getDealEvents(dealId) {
  const { rows } = await pool.query(
    'SELECT * FROM events WHERE deal_id = $1 ORDER BY created_at ASC',
    [dealId]
  );
  return rows;
}

async function getDealsByUser(near_account, role) {
  if (near_account && role === 'farmer') {
    const { rows } = await pool.query(
      'SELECT * FROM deals WHERE farmer = $1 ORDER BY created_at DESC',
      [near_account]
    );
    return rows;
  }
  if (near_account && role === 'investor') {
    const { rows } = await pool.query(
      'SELECT * FROM deals WHERE investor = $1 ORDER BY created_at DESC',
      [near_account]
    );
    return rows;
  }
  const { rows } = await pool.query('SELECT * FROM deals ORDER BY created_at DESC');
  return rows;
}

module.exports = { getAllDeals, getDealById, createDeal, addEvent, getDealEvents, getDealsByUser };
