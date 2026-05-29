# Testnet Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add fund endpoint to backend and create demo.ps1 to run AgriPartners on NEAR testnet with a single command.

**Architecture:** Backend gets a new endpoint `POST /api/admin/deals/:id/fund` which calls `fund()` on the smart contract. A PowerShell script `demo.ps1` orchestrates the full demo cycle through the API. Everything runs locally.

**Tech Stack:** Node.js + Express (backend), near-api-js v2 (NEAR calls), PowerShell (demo script), NEAR testnet (farab.testnet).

---

## File Structure

```
E:\agripartners\
  backend\src\services\nearService.js    — add fundContract()
  backend\src\routes\admin.js            — add POST /deals/:id/fund
  backend\tests\admin.routes.test.js     — add 2 tests for fund
  demo.ps1                               — new demo script
```

---

## Task 1: Fund endpoint in backend

**Files:**

- Modify: `E:\agripartners\backend\src\services\nearService.js`
- Modify: `E:\agripartners\backend\src\routes\admin.js`
- Modify: `E:\agripartners\backend\tests\admin.routes.test.js`

- [ ] **Step 1: Add mockDeal.investment_amount to test file**

Open `E:\agripartners\backend\tests\admin.routes.test.js`.

Find the line:

```js
const mockDeal = { id: 1, contract_address: 'ap1.agripartners.testnet', deal_type: 'fidlot' };
```

Replace with:

```js
const mockDeal = { id: 1, contract_address: 'ap1.agripartners.testnet', deal_type: 'fidlot', investment_amount: '10000000000000000000000000' };
```

- [ ] **Step 2: Write two failing tests for fund**

At the end of `admin.routes.test.js`, after the last test, add:

```js
test('POST /api/admin/deals/:id/fund calls fundContract and records event', async () => {
  nearService.fundContract = jest.fn().mockResolvedValue({ txHash: 'tx4' });
  const res = await request(app)
    .post('/api/admin/deals/1/fund')
    .set('X-API-Key', 'test-secret');
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.tx_hash).toBe('tx4');
  expect(nearService.fundContract).toHaveBeenCalledWith(
    'ap1.agripartners.testnet',
    '10000000000000000000000000'
  );
  expect(dealService.addEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_type: 'funded', tx_hash: 'tx4' })
  );
});

test('POST /api/admin/deals/:id/fund returns 404 when deal not found', async () => {
  dealService.getDealById.mockReturnValueOnce(null);
  const res = await request(app)
    .post('/api/admin/deals/999/fund')
    .set('X-API-Key', 'test-secret');
  expect(res.status).toBe(404);
});
```

- [ ] **Step 3: Run tests and verify new ones fail**

```powershell
Set-Location E:\agripartners\backend
npm test -- --testPathPattern=admin.routes
```

Expected output: two new tests FAIL (`Cannot read properties of undefined` or `404 expected 200`), remaining 5 PASS.

- [ ] **Step 4: Add fundContract to nearService.js**

Open `E:\agripartners\backend\src\services\nearService.js`.

Before the `module.exports = {` line add:

```js
async function fundContract(contractAddress, investmentAmount) {
  const account = await getAdminAccount();
  const result = await account.functionCall({
    contractId: contractAddress,
    methodName: 'fund',
    args: {},
    gas: '100000000000000',
    attachedDeposit: investmentAmount
  });
  return { txHash: result.transaction.hash };
}
```

- [ ] **Step 5: Export fundContract**

Find the line:

```js
module.exports = { getContractStatus, getContractBalances, deployContract, startCycle, reportCycle };
```

Replace with:

```js
module.exports = { getContractStatus, getContractBalances, deployContract, startCycle, reportCycle, fundContract };
```

- [ ] **Step 6: Add route POST /deals/:id/fund to admin.js**

Open `E:\agripartners\backend\src\routes\admin.js`.

Before the `module.exports = router;` line add:

```js
router.post('/deals/:id/fund', async (req, res) => {
  const deal = dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  try {
    const { txHash } = await nearService.fundContract(
      deal.contract_address,
      deal.investment_amount
    );
    dealService.addEvent({ deal_id: deal.id, event_type: 'funded', tx_hash: txHash });
    res.json({ success: true, tx_hash: txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Step 7: Run all tests and verify all pass**

```powershell
Set-Location E:\agripartners\backend
npm test
```

Expected output:

```
Tests: 31 passed, 31 total
```

- [ ] **Step 8: Commit**

```powershell
Set-Location E:\agripartners
git add backend/src/services/nearService.js backend/src/routes/admin.js backend/tests/admin.routes.test.js
git commit -m "feat: add fund endpoint to backend for testnet demo"
```

---

## Task 2: Create demo.ps1

**Files:**

- Create: `E:\agripartners\demo.ps1`

- [ ] **Step 1: Create demo.ps1**

```powershell
# AgriPartners Demo Script
# Run: .\demo.ps1
# Requirements: backend running (npm start), frontend running (serve frontend -p 5500)

$API_BASE = "http://localhost:3000"
$API_KEY  = "agripartners-demo-key"
$HEADERS  = @{ "X-API-Key" = $API_KEY }

$INVESTMENT     = "10000000000000000000000000"   # 10 NEAR
$PROFIT         = "3000000000000000000000000"    # 3 NEAR
$CAPITAL_RETURN = "4080000000000000000000000"    # 4.08 NEAR
$FARMER         = "farab.testnet"
$INVESTOR       = "farab.testnet"

function Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "OK  $msg" -ForegroundColor Green }
function Pause($msg) { Read-Host "`n$msg [Enter]" | Out-Null }

Write-Host "`nAgriPartners Demo — NEAR Testnet" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

# 0. Check backend
Step "Check backend"
try {
    Invoke-RestMethod "$API_BASE/health" -ErrorAction Stop | Out-Null
    Ok "Backend available at $API_BASE"
} catch {
    Write-Host "ERROR: Backend unavailable. Run: cd backend; npm start" -ForegroundColor Red
    exit 1
}

# 1. Deploy deal
Step "1. Deploy smart contract"
Write-Host "This will take 10-30 seconds (testnet transaction)..."

$dealBody = @{
    deal_type          = "Fidlot v5.9"
    farmer             = $FARMER
    investor           = $INVESTOR
    investment_amount  = $INVESTMENT
    farmer_split_pct   = 60
    investor_split_pct = 40
    escrow_pct         = 44
    performance_fee_pct = 20
    cycle_duration_days = 1
    total_cycles       = 3
    capital_return_near = $CAPITAL_RETURN
} | ConvertTo-Json

try {
    $deal = Invoke-RestMethod "$API_BASE/api/admin/deals" -Method POST -Headers $HEADERS -Body $dealBody -ContentType "application/json" -ErrorAction Stop
} catch {
    Write-Host "ERROR during deploy: $_" -ForegroundColor Red
    exit 1
}

$dealId = $deal.id
Ok "Contract deployed: $($deal.contract_address)"
Ok "Deal ID: $dealId"
Write-Host "`nOpen in browser: http://localhost:5500/#deals/$dealId" -ForegroundColor Yellow
Pause "Review dashboard, then continue"

# 2. Fund
Step "2. Deposit investment (fund)"
Write-Host "Investor deposits 10 NEAR..."
try {
    $funded = Invoke-RestMethod "$API_BASE/api/admin/deals/$dealId/fund" -Method POST -Headers $HEADERS -ErrorAction Stop
} catch {
    Write-Host "ERROR during fund: $_" -ForegroundColor Red
    exit 1
}
Ok "Investment deposited. TX: $($funded.tx_hash)"
Write-Host "Refresh dashboard — status will change to Funded" -ForegroundColor Yellow
Pause "Press Enter to start cycle 1"

# 3. Cycles
for ($i = 1; $i -le 3; $i++) {
    Step "$i. Start cycle $i"
    try {
        $started = Invoke-RestMethod "$API_BASE/api/admin/deals/$dealId/start-cycle" -Method POST -Headers $HEADERS -ErrorAction Stop
    } catch {
        Write-Host "ERROR during start-cycle: $_" -ForegroundColor Red
        exit 1
    }
    Ok "Cycle $i started. TX: $($started.tx_hash)"
    Write-Host "Refresh dashboard — status: CycleActive, cycle $i" -ForegroundColor Yellow
    Pause "Press Enter to report cycle $i"

    $reportBody = @{ profit_near = $PROFIT; losses_near = "0" } | ConvertTo-Json
    try {
        $reported = Invoke-RestMethod "$API_BASE/api/admin/deals/$dealId/report-cycle" -Method POST -Headers $HEADERS -Body $reportBody -ContentType "application/json" -ErrorAction Stop
    } catch {
        Write-Host "ERROR during report-cycle: $_" -ForegroundColor Red
        exit 1
    }
    Ok "Cycle $i completed. Status: $($reported.status)"

    if ($reported.status -eq "Completed" -or $reported.status -eq "Terminated") {
        Write-Host "Refresh dashboard — status: $($reported.status)" -ForegroundColor Yellow
        break
    }

    if ($i -lt 3) {
        Pause "Press Enter for cycle $($i + 1)"
    }
}

Write-Host "`n=================================" -ForegroundColor Yellow
Write-Host "Demo complete!" -ForegroundColor Green
Write-Host "Dashboard: http://localhost:5500/#deals/$dealId" -ForegroundColor Yellow
```

- [ ] **Step 2: Verify script syntax**

```powershell
$errors = $null
[System.Management.Automation.Language.Parser]::ParseFile(
    "E:\agripartners\demo.ps1", [ref]$null, [ref]$errors
)
if ($errors) { $errors | ForEach-Object { Write-Host $_.Message -ForegroundColor Red } }
else { Write-Host "Syntax OK" -ForegroundColor Green }
```

Expected output: `Syntax OK`

- [ ] **Step 3: Commit**

```powershell
Set-Location E:\agripartners
git add demo.ps1
git commit -m "feat: add PowerShell demo script for testnet pitch"
```

---

## Task 3: .env setup and readiness check

These are manual instructions (not code). Must be done before running demo.ps1.

**Files:**

- Modify: `E:\agripartners\backend\.env` (manually, do not commit)

- [ ] **Step 1: Export private key from MyNearWallet**

1. Open `testnet.mynearwallet.com` in browser
2. Click profile icon → Settings
3. Security & Recovery → Export Private Key
4. Enter wallet password
5. Copy the string in format `ed25519:...`

- [ ] **Step 2: Fill in backend/.env**

Open `E:\agripartners\backend\.env` and fill in:

```env
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=farab.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:INSERT_KEY_HERE
WASM_PATH=../contract/target/wasm32-unknown-unknown/release/agripartners.wasm
API_KEY=agripartners-demo-key
PORT=3000
DB_PATH=./agripartners.db
```

- [ ] **Step 3: Verify WASM exists**

```powershell
Test-Path "E:\agripartners\contract\target\wasm32-unknown-unknown\release\agripartners.wasm"
```

Expected output: `True`

If `False` — build WASM:

```powershell
Set-Location E:\agripartners\contract
$env:RUSTUP_TOOLCHAIN = "1.86"
cargo build --target wasm32-unknown-unknown --release
```

- [ ] **Step 4: Check farab.testnet balance**

Open `https://testnet.nearblocks.io/address/farab.testnet` in browser.

Verify balance > 15 NEAR (need ~12 NEAR for account deploy + investment + gas).

If less — get test NEAR from `https://near-faucet.io`.

- [ ] **Step 5: Start backend and verify connection**

```powershell
Set-Location E:\agripartners\backend
npm start
```

Expected output: `AgriPartners backend listening on port 3000` (or similar with no errors).

Check in a new terminal:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Expected output: `@{status=ok}`

- [ ] **Step 6: Start frontend**

```powershell
serve E:\agripartners\frontend -p 5500
```

Open `http://localhost:5500` — dark dashboard loads, deals list is empty.

- [ ] **Step 7: Run demo**

```powershell
Set-Location E:\agripartners
.\demo.ps1
```

Follow the script instructions. Between each step refresh the dashboard using the "Refresh" button.

---

## Launch order for pitch

```powershell
# Terminal 1 — backend
Set-Location E:\agripartners\backend; npm start

# Terminal 2 — frontend
serve E:\agripartners\frontend -p 5500

# Terminal 3 — demo
Set-Location E:\agripartners; .\demo.ps1
```

Browser: `http://localhost:5500`
