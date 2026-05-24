const { getDb } = require('../db/index');

function getAllDeals() {
  return getDb().prepare('SELECT * FROM deals ORDER BY created_at DESC').all();
}

function getDealById(id) {
  return getDb().prepare('SELECT * FROM deals WHERE id = ?').get(id) || null;
}

function createDeal(deal) {
  const result = getDb().prepare(`
    INSERT INTO deals (
      contract_address, deal_type, farmer, investor, admin, platform,
      investment_amount, farmer_split_pct, investor_split_pct, escrow_pct,
      performance_fee_pct, cycle_duration_days, total_cycles, capital_return_near, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    deal.contract_address, deal.deal_type, deal.farmer, deal.investor,
    deal.admin, deal.platform, deal.investment_amount,
    deal.farmer_split_pct, deal.investor_split_pct, deal.escrow_pct,
    deal.performance_fee_pct, deal.cycle_duration_days, deal.total_cycles,
    deal.capital_return_near, new Date().toISOString()
  );
  return getDealById(result.lastInsertRowid);
}

function addEvent(event) {
  getDb().prepare(`
    INSERT INTO events (deal_id, event_type, cycle_num, profit_near, losses_near, tx_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    event.deal_id, event.event_type, event.cycle_num ?? null,
    event.profit_near ?? null, event.losses_near ?? null,
    event.tx_hash ?? null, new Date().toISOString()
  );
}

function getDealEvents(dealId) {
  return getDb().prepare('SELECT * FROM events WHERE deal_id = ? ORDER BY created_at ASC').all(dealId);
}

module.exports = { getAllDeals, getDealById, createDeal, addEvent, getDealEvents };
