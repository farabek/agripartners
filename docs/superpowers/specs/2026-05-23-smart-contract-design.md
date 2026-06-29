# AgriPartners — NEAR Smart Contract Design

**Date:** 2026-05-23
**Products:** Fidlot v5.9 (cattle fattening) + Hissar (ewe breeding)
**Status:** Approved

---

## 1. Architecture

**Principle:** One contract = one deal (one farmer + one investor).

Fidlot and Hissar use the **same contract template** — the difference is only in the parameters at deploy time. Each investor gets their own separate contract instance.

**Stack:**

- Language: Rust
- SDK: near-sdk 5.x
- Token: Native NEAR (Ⓝ)
- Cycle verification: Admin (platform address)
- Payout pattern: Pull (withdraw)

---

## 2. Participants

| Role | Description |
| --- | --- |
| `farmer` | Farmer address — receives 60% of income |
| `investor` | Investor address — deposits funds, receives 40% of income |
| `admin` | Platform address — manages cycles, verifies results |
| `platform` | Address for receiving Performance Fee |

---

## 3. Deploy Parameters (all variables)

| Parameter | Type | Fidlot | Hissar |
| --- | --- | --- | --- |
| `farmer` | AccountId | farmer address | farmer address |
| `investor` | AccountId | investor address | investor address |
| `admin` | AccountId | platform address | platform address |
| `platform` | AccountId | platform address | platform address |
| `deal_type` | String | "fidlot" | "hissar" |
| `investment_amount` | Balance (NEAR) | amount in NEAR | amount in NEAR |
| `farmer_split_pct` | u8 | 60 | 60 |
| `investor_split_pct` | u8 | 40 | 40 |
| `escrow_pct` | u8 | 44 | **53** |
| `performance_fee_pct` | u8 | 20 | 20 |
| `cycle_duration_days` | u32 | 150 (5 months) | **180 (6 months)** |
| `total_cycles` | u8 | 7 | **6** |
| `capital_return_near` | Balance | ~$20,400 in NEAR | **~$20,600** (from herd sale) |

---

## 4. State Machine

```
Initialized
    ↓  investor calls fund()
Funded
    ↓  admin calls start_cycle()
CycleActive
    ↓  admin calls report_cycle()
CycleSettlement
    ↓  contract transitions automatically
    ├── cycles remaining → CycleActive (next cycle)
    ├── all cycles completed → Completed ✅
    └── critical losses → Terminated ❌
```

---

## 5. Functions

### `fund()` — investor

- Caller: only `investor`
- Status: only `Initialized`
- Accepts exactly `investment_amount` NEAR, otherwise refunds
- On success: status → `Funded`

### `start_cycle()` — admin

- Caller: only `admin`
- Status: `Funded` or `CycleSettlement`
- Transfers operating funds to the farmer for the cycle
- On success: status → `CycleActive`

### `report_cycle(losses_near)` — admin

- Caller: only `admin`
- Status: only `CycleActive`
- Admin **attaches NEAR to the transaction** — this is the cycle profit (farmer + investor return capital + profit)
- Contract distributes attached NEAR according to the formula (see section 6)
- `losses_near` — loss amount (0 if successful cycle)
- On success: status → `CycleSettlement`

### `withdraw()` — farmer or investor

- Caller: `farmer` or `investor`
- Available after each `CycleSettlement`
- Transfers accumulated available balance to the caller
- Escrow pool is not available for withdrawal until `Completed`

### View functions (free, read-only)

- `get_status()` — current status, cycle number
- `get_balances()` — farmer, investor, escrow balances
- `get_params()` — all contract parameters

---

## 6. Distribution Logic (during report_cycle)

```
Cycle income = profit_near

Farmer share    = profit_near × farmer_split_pct / 100
Investor share  = profit_near × investor_split_pct / 100
Performance fee = investor share × performance_fee_pct / 100  → platform
Net to investor = investor share - performance fee

Escrow contribution = farmer share × escrow_pct / 100  → escrow_pool
Net to farmer       = farmer share - escrow contribution  → farmer_available
```

**Cycle profit** = NEAR attached to `report_cycle()` transaction (attached_deposit)

**When losses_near > 0:**

```
If losses_near ≤ escrow_pool:
    escrow_pool -= losses_near
    investor_available += losses_near   (compensation)
    cycle continues

If losses_near > escrow_pool:
    investor_available += escrow_pool   (all escrow → investor)
    escrow_pool = 0
    status → Terminated
```

**On Completed (all cycles successful):**

```
escrow_pool → farmer_available          (all escrow returned to farmer)
capital_return_near → investor_available (working capital returned to investor)
```

**Note on farmer operating costs:**
Salary ($1,750/cycle) and transport ($1,000/cycle) are off-chain farmer expenses.
The contract does not track them. Admin reports net profit (profit_near) already accounting for
the fact that the farmer covers these costs independently.

---

## 7. Security and Access Control

| Function | Allowed |
| --- | --- |
| `fund()` | only `investor` + status `Initialized` |
| `start_cycle()` | only `admin` + status `Funded`/`CycleSettlement` |
| `report_cycle()` | only `admin` + status `CycleActive` |
| `withdraw()` | `farmer` or `investor` (own balance) |

Any condition violation → contract panic, NEAR is returned.

---

## 8. Testing

### Unit tests (Rust, in contract)

- [ ] Deploy parameters are stored correctly
- [ ] `fund()` accepts exactly `investment_amount`
- [ ] `fund()` rejects incorrect amount
- [ ] `start_cycle()` accessible only by admin
- [ ] `report_cycle()` correctly calculates shares (60/40, escrow, fee)
- [ ] `withdraw()` returns correct amount
- [ ] Full successful path × 7 cycles → Completed, escrow returned
- [ ] Partial losses → deducted from escrow, cycle continues
- [ ] Critical losses → Terminated

### Integration tests (NEAR Sandbox)

- [ ] Happy path: 7 cycles without losses
- [ ] One cycle with partial losses
- [ ] Terminated scenario
- [ ] Fidlot parameters vs Hissar parameters
- [ ] Unauthorized call → panic

### Demo for NEAR Protocol pitch

- Deploy on testnet with real addresses
- Demo script: full cycle in ~1 minute (compressed time parameters)

---

## 9. Deploy Examples

**Fidlot contract:**

```
farmer = "farmer.testnet"
investor = "investor1.testnet"
admin = "agripartners.testnet"
platform = "agripartners.testnet"
deal_type = "fidlot"
investment_amount = 50000 NEAR
farmer_split_pct = 60
investor_split_pct = 40
escrow_pct = 44
performance_fee_pct = 20
cycle_duration_days = 150
total_cycles = 7
capital_return_near = 20400 NEAR  (working capital, returned to investor at Completed)
```

**Hissar contract (different investor):**

```
farmer = "farmer.testnet"
investor = "investor2.testnet"
admin = "agripartners.testnet"
platform = "agripartners.testnet"
deal_type = "hissar"
investment_amount = 50000 NEAR
farmer_split_pct = 60
investor_split_pct = 40
escrow_pct = 53
performance_fee_pct = 20
cycle_duration_days = 180  (6 months)
total_cycles = 6
capital_return_near = 20600 NEAR  (from sale of breeding herd after cycle 6)
```

**Hissar note:** The model-specific reserve rate is 53%, based on the Hissar / VariantB farmer-share calculation. It must not inherit Fidlot's 44% rate.
From cycle 3, the "herd fee" of $2,500/cycle is paid to the investor BEFORE the 60/40 profit split.
Admin accounts for this in the report — specifies net profit already after deducting the herd fee.
