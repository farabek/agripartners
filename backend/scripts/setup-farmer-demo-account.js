#!/usr/bin/env node

const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = require('../src/db');

const DEFAULT_ACCOUNT_ID = 'farmer03.testnet';
const DEFAULT_DISPLAY_NAME = 'Demo Farmer';
const DEFAULT_PROJECT_ID = 4;
const OBSOLETE_DEMO_ACCOUNT_IDS = ['farmer01.testnet'];

function normalizeAccountId(value) {
  const accountId = String(value || '').trim().toLowerCase();
  if (!/^[a-z0-9._-]+\.testnet$/.test(accountId)) {
    throw new Error('FARMER_DEMO_ACCOUNT_ID must be a valid NEAR Testnet account ID');
  }
  return accountId;
}

function normalizeProjectId(value) {
  const projectId = Number(value);
  if (!Number.isInteger(projectId) || projectId < 1) {
    throw new Error('FARMER_DEMO_PROJECT_ID must be a positive integer');
  }
  return projectId;
}

async function selectDemoProject(client, preferredProjectId) {
  const preferred = await client.query(
    `SELECT d.*
     FROM deals d
     WHERE d.id = $1
     FOR UPDATE`,
    [preferredProjectId]
  );
  if (preferred.rows[0]) return preferred.rows[0];

  const fallback = await client.query(
    `SELECT d.*
     FROM deals d
     WHERE NOT EXISTS (
       SELECT 1
       FROM events e
       WHERE e.deal_id = d.id
         AND e.event_type = 'completed'
     )
       AND (
         LOWER(COALESCE(d.deal_type, '')) LIKE '%demo%'
         OR LOWER(COALESCE(d.deal_type, '')) LIKE '%farmer_dashboard%'
       )
     ORDER BY d.created_at DESC, d.id DESC
     LIMIT 1
     FOR UPDATE`
  );
  if (fallback.rows[0]) return fallback.rows[0];

  throw new Error(`No active Farmer demo Project is available (preferred Project #${preferredProjectId})`);
}

async function ensureCycleStarted(client, projectId, cycleNumber) {
  const { rowCount } = await client.query(
    `INSERT INTO events (deal_id, event_type, cycle_num)
     SELECT $1, 'cycle_started', $2
     WHERE NOT EXISTS (
       SELECT 1
       FROM events
       WHERE deal_id = $1
         AND event_type = 'cycle_started'
         AND cycle_num = $2
     )`,
    [projectId, cycleNumber]
  );
  return rowCount > 0;
}

async function prepareFarmerDemoAccount(client, options = {}) {
  const accountId = normalizeAccountId(options.accountId || DEFAULT_ACCOUNT_ID);
  const displayName = String(options.displayName || DEFAULT_DISPLAY_NAME).trim();
  const preferredProjectId = normalizeProjectId(options.projectId || DEFAULT_PROJECT_ID);

  if (!displayName) throw new Error('FARMER_DEMO_DISPLAY_NAME is required');

  const project = await selectDemoProject(client, preferredProjectId);
  const assignmentChanged = project.farmer !== accountId;
  const cycleNumber = 1;

  const { rows: profileRows } = await client.query(
    `INSERT INTO user_profiles (
       wallet_account_id,
       role,
       display_name,
       organization_name,
       bio,
       onboarding_complete,
       created_at,
       updated_at
     )
     VALUES (
       $1,
       'farmer',
       $2,
       'AgriPartners Demo Farm',
       'Canonical Farmer demo account',
       TRUE,
       NOW(),
       NOW()
     )
     ON CONFLICT (wallet_account_id)
     DO UPDATE SET
       role = 'farmer',
       display_name = EXCLUDED.display_name,
       organization_name = EXCLUDED.organization_name,
       bio = EXCLUDED.bio,
       onboarding_complete = TRUE,
       updated_at = NOW()
     RETURNING wallet_account_id, role, display_name, organization_name, onboarding_complete`,
    [accountId, displayName]
  );

  const { rows: projectRows } = await client.query(
    `UPDATE deals
     SET farmer = $1
     WHERE id = $2
     RETURNING id, title, deal_type, farmer, investor, contract_address, total_cycles`,
    [accountId, project.id]
  );

  const reportResult = await client.query(
    'DELETE FROM reports WHERE deal_id = $1 AND cycle_id = $2',
    [project.id, cycleNumber]
  );
  const cycleUpdateResult = await client.query(
    'DELETE FROM farmer_cycle_updates WHERE deal_id = $1 AND cycle_num = $2',
    [project.id, cycleNumber]
  );

  const resetEventResult = await client.query(
    `DELETE FROM events
     WHERE deal_id = $1
       AND cycle_num = $2
       AND event_type IN (
         'cycle_reported',
         'farmer_funding_confirmed',
         'farmer_cycle_report_submitted'
       )`,
    [project.id, cycleNumber]
  );

  const cycleStartedCreated = await ensureCycleStarted(client, project.id, cycleNumber);

  const obsoleteProfiles = [];
  for (const obsoleteAccountId of OBSOLETE_DEMO_ACCOUNT_IDS) {
    if (obsoleteAccountId === accountId) continue;
    const { rows } = await client.query(
      `DELETE FROM user_profiles p
       WHERE p.wallet_account_id = $1
         AND p.role = 'farmer'
         AND NOT EXISTS (
           SELECT 1
           FROM deals d
           WHERE d.farmer = p.wallet_account_id
              OR d.investor = p.wallet_account_id
         )
       RETURNING p.wallet_account_id`,
      [obsoleteAccountId]
    );
    obsoleteProfiles.push(...rows.map(row => row.wallet_account_id));
  }

  return {
    account: profileRows[0],
    onboardingCompleted: profileRows[0].onboarding_complete,
    project: projectRows[0],
    cycle: {
      cycleNumber,
      fundingConfirmationRequired: true,
      reportStatus: 'not_submitted',
    },
    reset: {
      assignmentChanged,
      deletedReports: reportResult.rowCount,
      deletedCycleUpdates: cycleUpdateResult.rowCount,
      deletedWorkflowEvents: resetEventResult.rowCount,
      cycleStartedCreated,
      obsoleteProfiles,
    },
  };
}

async function main() {
  const options = {
    accountId: process.env.FARMER_DEMO_ACCOUNT_ID || DEFAULT_ACCOUNT_ID,
    displayName: process.env.FARMER_DEMO_DISPLAY_NAME || DEFAULT_DISPLAY_NAME,
    projectId: process.env.FARMER_DEMO_PROJECT_ID || DEFAULT_PROJECT_ID,
  };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await prepareFarmerDemoAccount(client, options);
    await client.query('COMMIT');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`Farmer demo account setup failed: ${err.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  DEFAULT_ACCOUNT_ID,
  DEFAULT_DISPLAY_NAME,
  DEFAULT_PROJECT_ID,
  OBSOLETE_DEMO_ACCOUNT_IDS,
  normalizeAccountId,
  normalizeProjectId,
  prepareFarmerDemoAccount,
};
