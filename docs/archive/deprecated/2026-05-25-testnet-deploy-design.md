# Testnet Deploy Design: AgriPartners

**Date:** 2026-05-25
**Status:** Approved
**Goal:** Run AgriPartners locally with real NEAR testnet for the NEAR Protocol team pitch

---

## Overview

The backend already knows how to deploy contracts via near-api-js — near-cli is not needed. One account `farab.testnet` is used as admin + farmer + investor (acceptable for demo). Everything runs locally, no hosting needed.

---

## Components

| Component | Status | What to do |
| --- | --- | --- |
| Smart contract (WASM) | ✅ ready | Verify the file exists |
| Backend API | ✅ ready | Add fund endpoint, fill .env |
| Frontend dashboard | ✅ ready | No changes needed |
| demo.ps1 | ❌ missing | Create |

---

## Step 1: Export private key

Account `farab.testnet` exists only in the browser wallet. Need to get the private key:

1. Open `testnet.mynearwallet.com`
2. Settings → Security & Recovery → Export Private Key
3. Copy the string in format `ed25519:...`
4. Paste into `backend/.env` as `NEAR_ADMIN_PRIVATE_KEY`

Do not publish the key anywhere. This is testnet — no real money, but still store it carefully.

---

## Step 2: Backend .env

Fill in `E:\agripartners\backend\.env`:

```env
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=farab.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:YOUR_STRING_HERE
WASM_PATH=../contract/target/wasm32-unknown-unknown/release/agripartners.wasm
API_KEY=agripartners-demo-key
PORT=3000
DB_PATH=./agripartners.db
```

---

## Step 3: New backend endpoint — fund

`fund()` in the contract is called on behalf of the investor with deposit = `investment_amount`. In the demo `farab.testnet` is simultaneously admin and investor, so the admin account can call fund().

**Add to backend:**

- `nearService.fundContract(contractAddress, investmentAmount)` — call `fund()` with deposit
- `POST /api/admin/deals/:id/fund` — protected endpoint (X-API-Key)

**nearService.fundContract:**

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

**admin route:**

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

---

## Step 4: demo.ps1

File `E:\agripartners\demo.ps1` — full demo cycle with one command for the pitch.

**What it does:**

1. Checks that backend is running (GET /health)
2. Deploys deal (`POST /api/admin/deals`) — Fidlot, 3 cycles × 1 day, 1000 NEAR
3. Funds (`POST /api/admin/deals/:id/fund`)
4. Start cycle 1 (`POST /api/admin/deals/:id/start-cycle`)
5. Report cycle 1 — profit 300 NEAR (`POST /api/admin/deals/:id/report-cycle`)
6. Outputs link: `http://localhost:5500/#deals/:id`
7. Asks to continue → cycle 2 → cycle 3 → Completed

**Parameters:**

```
API_KEY     = agripartners-demo-key
API_BASE    = http://localhost:3000
INVESTMENT  = "10000000000000000000000000"   # 10 NEAR in yocto (testnet faucet gives ~200 NEAR)
PROFIT      = "3000000000000000000000000"    # 3 NEAR in yocto
FARMER      = farab.testnet
INVESTOR    = farab.testnet
DEAL_TYPE   = Fidlot v5.9
CYCLES      = 3
CYCLE_DAYS  = 1
CAPITAL_RETURN = "4080000000000000000000000" # 4.08 NEAR in yocto (40.8% of 10 NEAR)
```

**After each step:** pause with message "Press Enter to continue" — to show dashboard between steps at the pitch.

---

## Step 5: Running for demo

```powershell
# Terminal 1
Set-Location E:\agripartners\backend
npm start

# Terminal 2
serve E:\agripartners\frontend -p 5500

# Terminal 3 (run demo)
Set-Location E:\agripartners
.\demo.ps1
```

Open browser: `http://localhost:5500`

---

## What is NOT in scope

- Cloud hosting
- Separate accounts for farmer/investor
- Updating demo.sh (leave as-is)
- Mainnet deployment
- NEAR CLI installation
