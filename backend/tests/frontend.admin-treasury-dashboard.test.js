const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'app.js'), 'utf8');

function functionBody(name, length = 5000) {
  const start = appJs.indexOf(`function ${name}`);
  expect(start).toBeGreaterThan(-1);
  return appJs.slice(start, start + length);
}

test('admin treasury route exists and remains admin-only', () => {
  const route = functionBody('route', 6500);
  expect(route).toContain("hash === '#admin/treasury'");
  expect(route).toContain('showAdminTreasuryDashboard()');
  expect(route).toContain('if (!isAdmin())');
  expect(route).toContain('location.hash = portalHashForRole(auth.user.role)');
});

test('admin treasury dashboard fetches accounts and ledger from existing APIs', () => {
  const body = functionBody('showAdminTreasuryDashboard', 1800);
  expect(body).toContain("fetchAdminJson('/api/admin/treasury/accounts')");
  expect(body).toContain("fetchAdminJson('/api/admin/treasury/ledger')");
  expect(body).toContain('Promise.allSettled');
  expect(body).not.toContain('POST');
});

test('admin treasury header renders required badges and derived warning', () => {
  const shell = functionBody('renderAdminTreasuryShell', 2300);
  expect(shell).toContain('Alpha Shadow Treasury');
  expect(shell).toContain('NEAR Testnet');
  expect(shell).toContain('Append-only Ledger');
  expect(shell).toContain('Derived balances');
  expect(shell).toContain('Balances are derived from ledger entries and are not production settlement balances.');
});

test('admin navigation links to treasury without replacing existing dashboard behavior', () => {
  const nav = functionBody('renderNav', 2200);
  const shell = functionBody('renderAdminDashboardShell', 1600);
  expect(nav).toContain('href="#admin/treasury"');
  expect(nav).toContain('Treasury');
  expect(shell).toContain('Treasury Dashboard');
  expect(shell).toContain('href="#admin/create"');
  expect(functionBody('showLiveAdminDashboard', 800)).toContain('renderAdminDashboardShell(el)');
});

test('admin treasury overview and shadow explanation render dashboard copy', () => {
  const overview = functionBody('renderAdminTreasuryOverview', 1400);
  const shadow = functionBody('renderAdminTreasuryShadowPanel', 1200);
  expect(overview).toContain('Total accounts');
  expect(overview).toContain('Ledger entries');
  expect(overview).toContain('Recent transactions');
  expect(overview).toContain('Suspense activity');
  expect(shadow).toContain('Treasury currently runs as Alpha/shadow visibility.');
  expect(shadow).toContain('Ledger entries help audit platform flows.');
  expect(shadow).toContain('Treasury does not yet drive payouts or realized ROI.');
});

test('admin treasury accounts table renders catalog and derived activity label', () => {
  const accounts = functionBody('renderAdminTreasuryAccounts', 5000);
  expect(accounts).toContain('No Treasury accounts');
  expect(accounts).toContain('data-admin-treasury-empty-accounts');
  expect(accounts).toContain('Account code');
  expect(accounts).toContain('Account name');
  expect(accounts).toContain('Type');
  expect(accounts).toContain('Currency');
  expect(accounts).toContain('Active');
  expect(accounts).toContain('Derived activity');
  expect(accounts).toContain('derivedActivityForAccount');
});

test('admin treasury ledger renders required columns and explicit empty state', () => {
  const ledger = functionBody('renderAdminTreasuryLedger', 5500);
  for (const label of ['Date', 'Transaction id', 'Account', 'Direction', 'Amount', 'Currency', 'Related deal', 'Related investor', 'Related farmer']) {
    expect(ledger).toContain(label);
  }
  expect(ledger).toContain('No ledger entries');
  expect(ledger).toContain('data-admin-treasury-empty-ledger');
  expect(ledger).toContain('admin-treasury-transaction-link');
});

test('admin treasury filters work client-side without backend changes', () => {
  const filters = functionBody('renderAdminTreasuryFilters', 2500);
  const filter = functionBody('filterTreasuryLedgerEntries', 2600);
  const refresh = functionBody('refreshAdminTreasuryLedgerFilters', 900);
  expect(filters).toContain('treasury-filter-account');
  expect(filters).toContain('treasury-filter-currency');
  expect(filters).toContain('treasury-filter-deal');
  expect(filters).toContain('treasury-filter-investor');
  expect(filters).toContain('treasury-filter-farmer');
  expect(filter).toContain('entry.account_code');
  expect(filter).toContain('entry.currency');
  expect(filter).toContain('entry.related_deal_id');
  expect(filter).toContain('entry.related_investor');
  expect(filter).toContain('entry.related_farmer');
  expect(refresh).toContain('window.adminTreasuryLedgerEntries');
  expect(refresh).toContain('renderAdminTreasuryLedger(filterTreasuryLedgerEntries');
});

test('clicking transaction id fetches transaction detail', () => {
  const bind = functionBody('bindAdminTreasuryTransactionLinks', 900);
  const load = functionBody('loadAdminTreasuryTransactionDetail', 1700);
  expect(bind).toContain('admin-treasury-transaction-link');
  expect(bind).toContain('loadAdminTreasuryTransactionDetail(button.dataset.transactionId)');
  expect(load).toContain('fetchAdminJson(`/api/admin/treasury/transactions/${encodeURIComponent(transactionId)}`)');
  expect(load).toContain('transaction detail fetch error');
  expect(load).toContain('Malformed treasury transaction payload');
});

test('transaction detail shows source and idempotency metadata with reference-only blockchain label', () => {
  const detail = functionBody('renderAdminTreasuryTransactionDetail', 3200);
  expect(detail).toContain('Transaction type');
  expect(detail).toContain('Created at');
  expect(detail).toContain('Created by');
  expect(detail).toContain('Description');
  expect(detail).toContain('source_type');
  expect(detail).toContain('source_id');
  expect(detail).toContain('idempotency_key');
  expect(detail).toContain("'Reference'");
  expect(detail).toContain('Double-entry rows');
  expect(detail).toContain('Metadata');
  expect(detail).not.toContain('Verified');
});

test('transaction detail renders debit and credit rows', () => {
  const entries = functionBody('renderAdminTreasuryTransactionEntries', 2600);
  expect(entries).toContain('Debit');
  expect(entries).toContain('Credit');
  expect(entries).toContain("entry.direction === 'debit'");
  expect(entries).toContain("entry.direction === 'credit'");
  expect(entries).toContain('No ledger entries returned for this transaction.');
});

test('admin treasury has explicit account, ledger and transaction error states', () => {
  const content = functionBody('renderAdminTreasuryContent', 4200);
  const error = functionBody('renderAdminTreasuryError', 700);
  expect(content).toContain('account fetch error');
  expect(content).toContain('ledger fetch error');
  expect(content).toContain('data-admin-treasury-accounts-error');
  expect(content).toContain('data-admin-treasury-ledger-error');
  expect(error).toContain('bg-red-900');
  expect(appJs).toContain('data-admin-treasury-transaction-error');
});
