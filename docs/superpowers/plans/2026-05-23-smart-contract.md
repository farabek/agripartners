# AgriPartners Smart Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a NEAR smart contract in Rust that manages agricultural investment deals (Fidlot + Hissar) with 60/40 profit split, escrow protection, and pull-payment withdrawals.

**Architecture:** One contract = one deal (one farmer + one investor). Contract holds investor's capital. Admin reports cycle results with attached profit NEAR. Contract distributes to participants using pull-payment pattern (withdraw). Parameters are fully configurable at deploy time so the same contract binary serves both Fidlot and Hissar.

**Tech Stack:** Rust 1.86, near-sdk 5.5.0, near-workspaces 0.14 (integration tests), wasm32-unknown-unknown target.

---

## File Structure

```
E:/agripartners/contract/
  Cargo.toml                   # contract package + dev-deps for integration tests
  src/
    lib.rs                     # ContractStatus enum, AgriPartnersContract struct,
                               # all methods (#[init], fund, start_cycle,
                               # report_cycle, withdraw, view fns), unit tests
  tests/
    integration.rs             # near-workspaces integration tests (async/tokio)
```

---

### Task 1: Project Setup

**Files:**
- Create: `E:/agripartners/contract/Cargo.toml`
- Create: `E:/agripartners/contract/src/lib.rs`

- [ ] **Step 1: Create `E:/agripartners/contract/Cargo.toml`**

```toml
[package]
name = "agripartners"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
near-sdk = "5.5.0"

[dev-dependencies]
near-workspaces = { version = "0.14", features = ["sandbox"] }
tokio = { version = "1", features = ["full"] }
serde_json = "1"

[[test]]
name = "integration"
path = "tests/integration.rs"

[profile.release]
codegen-units = 1
opt-level = "z"
lto = true
debug = false
panic = "abort"
overflow-checks = true
```

- [ ] **Step 2: Create `E:/agripartners/contract/src/lib.rs` skeleton**

```rust
use near_sdk::{near, env, AccountId, Promise, require, NearToken};
use near_sdk::json_types::U128;
```

- [ ] **Step 3: Add wasm32 target**

```
rustup target add wasm32-unknown-unknown
```
Expected: `info: component 'rust-std' for target 'wasm32-unknown-unknown' is up to date`

- [ ] **Step 4: Verify project compiles**

Run from `E:/agripartners/contract/`:
```
cargo check
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git -C E:/agripartners add contract/
git -C E:/agripartners commit -m "feat: scaffold contract project"
```

---

### Task 2: ContractStatus Enum

**Files:**
- Modify: `E:/agripartners/contract/src/lib.rs`

- [ ] **Step 1: Write failing test**

Append to `lib.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_status_eq() {
        assert_eq!(ContractStatus::Initialized, ContractStatus::Initialized);
        assert_ne!(ContractStatus::Initialized, ContractStatus::Funded);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```
cargo test test_status_eq -- --nocapture
```
Expected: FAIL — `ContractStatus` not defined.

- [ ] **Step 3: Add enum before the tests module**

```rust
#[derive(Clone, PartialEq, Debug)]
#[near(serializers = [json, borsh])]
pub enum ContractStatus {
    Initialized,
    Funded,
    CycleActive,
    CycleSettlement,
    Completed,
    Terminated,
}
```

- [ ] **Step 4: Run test to verify it passes**

```
cargo test test_status_eq -- --nocapture
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C E:/agripartners add contract/src/lib.rs
git -C E:/agripartners commit -m "feat: add ContractStatus enum"
```

---

### Task 3: Contract Struct and new()

**Files:**
- Modify: `E:/agripartners/contract/src/lib.rs`

- [ ] **Step 1: Write failing test**

Add to `tests` module:

```rust
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    const ONE_NEAR: u128 = 1_000_000_000_000_000_000_000_000;
    const INVESTMENT: u128 = 1_000 * ONE_NEAR;
    const CAPITAL_RETURN: u128 = 408 * ONE_NEAR;

    fn setup_context(predecessor: AccountId) {
        let mut ctx = VMContextBuilder::new();
        ctx.predecessor_account_id(predecessor);
        testing_env!(ctx.build());
    }

    fn new_contract() -> AgriPartnersContract {
        AgriPartnersContract::new(
            accounts(0),          // farmer
            accounts(1),          // investor
            accounts(2),          // admin
            accounts(3),          // platform
            "fidlot".to_string(),
            U128(INVESTMENT),
            60, 40, 44, 20,       // splits, escrow, fee
            150, 7,               // cycle_duration_days, total_cycles
            U128(CAPITAL_RETURN),
        )
    }

    #[test]
    fn test_new_saves_params() {
        setup_context(accounts(0));
        let c = new_contract();
        assert_eq!(c.farmer, accounts(0));
        assert_eq!(c.investor, accounts(1));
        assert_eq!(c.admin, accounts(2));
        assert_eq!(c.platform, accounts(3));
        assert_eq!(c.deal_type, "fidlot");
        assert_eq!(c.investment_amount, INVESTMENT);
        assert_eq!(c.farmer_split_pct, 60);
        assert_eq!(c.investor_split_pct, 40);
        assert_eq!(c.escrow_pct, 44);
        assert_eq!(c.performance_fee_pct, 20);
        assert_eq!(c.cycle_duration_days, 150);
        assert_eq!(c.total_cycles, 7);
        assert_eq!(c.capital_return_near, CAPITAL_RETURN);
        assert_eq!(c.status, ContractStatus::Initialized);
        assert_eq!(c.current_cycle, 0);
        assert_eq!(c.farmer_available, 0);
        assert_eq!(c.investor_available, 0);
        assert_eq!(c.platform_available, 0);
        assert_eq!(c.escrow_pool, 0);
    }
```

- [ ] **Step 2: Run test to verify it fails**

```
cargo test test_new_saves_params -- --nocapture
```
Expected: FAIL — `AgriPartnersContract` not defined.

- [ ] **Step 3: Add contract struct and `new()` before the tests module**

```rust
#[near(serializers = [json])]
pub struct ContractParams {
    pub farmer: AccountId,
    pub investor: AccountId,
    pub admin: AccountId,
    pub platform: AccountId,
    pub deal_type: String,
    pub investment_amount: U128,
    pub farmer_split_pct: u8,
    pub investor_split_pct: u8,
    pub escrow_pct: u8,
    pub performance_fee_pct: u8,
    pub cycle_duration_days: u32,
    pub total_cycles: u8,
    pub capital_return_near: U128,
}

#[near(contract_state)]
pub struct AgriPartnersContract {
    pub farmer: AccountId,
    pub investor: AccountId,
    pub admin: AccountId,
    pub platform: AccountId,
    pub deal_type: String,
    pub investment_amount: u128,
    pub farmer_split_pct: u8,
    pub investor_split_pct: u8,
    pub escrow_pct: u8,
    pub performance_fee_pct: u8,
    pub cycle_duration_days: u32,
    pub total_cycles: u8,
    pub capital_return_near: u128,
    pub status: ContractStatus,
    pub current_cycle: u8,
    pub farmer_available: u128,
    pub investor_available: u128,
    pub platform_available: u128,
    pub escrow_pool: u128,
}

#[near]
impl AgriPartnersContract {
    #[init]
    pub fn new(
        farmer: AccountId,
        investor: AccountId,
        admin: AccountId,
        platform: AccountId,
        deal_type: String,
        investment_amount: U128,
        farmer_split_pct: u8,
        investor_split_pct: u8,
        escrow_pct: u8,
        performance_fee_pct: u8,
        cycle_duration_days: u32,
        total_cycles: u8,
        capital_return_near: U128,
    ) -> Self {
        require!(
            farmer_split_pct as u16 + investor_split_pct as u16 == 100,
            "Split percentages must sum to 100"
        );
        require!(performance_fee_pct <= 100, "Performance fee must be <= 100");
        require!(escrow_pct <= 100, "Escrow pct must be <= 100");
        require!(total_cycles > 0, "Must have at least 1 cycle");
        require!(
            capital_return_near.0 <= investment_amount.0,
            "Capital return cannot exceed investment"
        );
        Self {
            farmer,
            investor,
            admin,
            platform,
            deal_type,
            investment_amount: investment_amount.0,
            farmer_split_pct,
            investor_split_pct,
            escrow_pct,
            performance_fee_pct,
            cycle_duration_days,
            total_cycles,
            capital_return_near: capital_return_near.0,
            status: ContractStatus::Initialized,
            current_cycle: 0,
            farmer_available: 0,
            investor_available: 0,
            platform_available: 0,
            escrow_pool: 0,
        }
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```
cargo test test_new_saves_params -- --nocapture
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C E:/agripartners add contract/src/lib.rs
git -C E:/agripartners commit -m "feat: add contract struct and init"
```

---

### Task 4: fund()

**Files:**
- Modify: `E:/agripartners/contract/src/lib.rs`

- [ ] **Step 1: Write failing tests**

Add to `tests` module:

```rust
    #[test]
    fn test_fund_success() {
        setup_context(accounts(0));
        let mut c = new_contract();

        let mut ctx = VMContextBuilder::new();
        ctx.predecessor_account_id(accounts(1))
           .attached_deposit(NearToken::from_yoctonear(INVESTMENT));
        testing_env!(ctx.build());

        c.fund();
        assert_eq!(c.status, ContractStatus::Funded);
    }

    #[test]
    #[should_panic(expected = "Must deposit exactly")]
    fn test_fund_wrong_amount() {
        setup_context(accounts(0));
        let mut c = new_contract();

        let mut ctx = VMContextBuilder::new();
        ctx.predecessor_account_id(accounts(1))
           .attached_deposit(NearToken::from_yoctonear(INVESTMENT - 1));
        testing_env!(ctx.build());

        c.fund();
    }

    #[test]
    #[should_panic(expected = "Only investor")]
    fn test_fund_wrong_caller() {
        setup_context(accounts(0));
        let mut c = new_contract();

        let mut ctx = VMContextBuilder::new();
        ctx.predecessor_account_id(accounts(0)) // farmer, not investor
           .attached_deposit(NearToken::from_yoctonear(INVESTMENT));
        testing_env!(ctx.build());

        c.fund();
    }
```

- [ ] **Step 2: Run tests to verify they fail**

```
cargo test test_fund -- --nocapture
```
Expected: FAIL — method `fund` not found.

- [ ] **Step 3: Add `fund()` inside the `#[near] impl` block**

```rust
    #[payable]
    pub fn fund(&mut self) {
        require!(
            env::predecessor_account_id() == self.investor,
            "Only investor can fund"
        );
        require!(
            self.status == ContractStatus::Initialized,
            "Contract must be in Initialized status"
        );
        let deposit = env::attached_deposit().as_yoctonear();
        require!(
            deposit == self.investment_amount,
            format!("Must deposit exactly {} yoctoNEAR", self.investment_amount)
        );
        self.status = ContractStatus::Funded;
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```
cargo test test_fund -- --nocapture
```
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C E:/agripartners add contract/src/lib.rs
git -C E:/agripartners commit -m "feat: add fund() with access control"
```

---

### Task 5: start_cycle()

**Files:**
- Modify: `E:/agripartners/contract/src/lib.rs`

- [ ] **Step 1: Write failing tests**

Add helper and tests to `tests` module:

```rust
    fn fund_contract(c: &mut AgriPartnersContract) {
        let mut ctx = VMContextBuilder::new();
        ctx.predecessor_account_id(accounts(1))
           .attached_deposit(NearToken::from_yoctonear(INVESTMENT));
        testing_env!(ctx.build());
        c.fund();
    }

    #[test]
    fn test_start_cycle_increments() {
        setup_context(accounts(0));
        let mut c = new_contract();
        fund_contract(&mut c);

        setup_context(accounts(2)); // admin
        c.start_cycle();

        assert_eq!(c.status, ContractStatus::CycleActive);
        assert_eq!(c.current_cycle, 1);
    }

    #[test]
    #[should_panic(expected = "Only admin")]
    fn test_start_cycle_wrong_caller() {
        setup_context(accounts(0));
        let mut c = new_contract();
        fund_contract(&mut c);

        setup_context(accounts(1)); // investor, not admin
        c.start_cycle();
    }

    #[test]
    #[should_panic(expected = "Funded or CycleSettlement")]
    fn test_start_cycle_wrong_status() {
        setup_context(accounts(2));
        let mut c = new_contract(); // Initialized, not Funded
        c.start_cycle();
    }
```

- [ ] **Step 2: Run tests to verify they fail**

```
cargo test test_start_cycle -- --nocapture
```
Expected: FAIL.

- [ ] **Step 3: Add `start_cycle()` inside impl block**

```rust
    pub fn start_cycle(&mut self) {
        require!(
            env::predecessor_account_id() == self.admin,
            "Only admin can start cycle"
        );
        require!(
            self.status == ContractStatus::Funded
                || self.status == ContractStatus::CycleSettlement,
            "Contract must be in Funded or CycleSettlement status"
        );
        self.current_cycle += 1;
        self.status = ContractStatus::CycleActive;
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```
cargo test test_start_cycle -- --nocapture
```
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C E:/agripartners add contract/src/lib.rs
git -C E:/agripartners commit -m "feat: add start_cycle() with access control"
```

---

### Task 6: report_cycle() — Profit Distribution

**Files:**
- Modify: `E:/agripartners/contract/src/lib.rs`

- [ ] **Step 1: Write failing tests**

Add helper and tests to `tests` module:

```rust
    const PROFIT: u128 = 300 * ONE_NEAR;

    fn report_cycle(c: &mut AgriPartnersContract, profit: u128, losses: u128) {
        let mut ctx = VMContextBuilder::new();
        ctx.predecessor_account_id(accounts(2)) // admin
           .attached_deposit(NearToken::from_yoctonear(profit));
        testing_env!(ctx.build());
        c.report_cycle(U128(losses));
    }

    fn start_cycle(c: &mut AgriPartnersContract) {
        setup_context(accounts(2));
        c.start_cycle();
    }

    #[test]
    fn test_report_cycle_distribution() {
        setup_context(accounts(0));
        let mut c = new_contract();
        fund_contract(&mut c);
        start_cycle(&mut c);
        report_cycle(&mut c, PROFIT, 0);

        // farmer_gross = 300 * 60% = 180 NEAR
        let farmer_gross = PROFIT * 60 / 100;
        // escrow = 180 * 44% = 79 NEAR (integer div truncation)
        let escrow = farmer_gross * 44 / 100;
        // farmer_net = 180 - 79 = 101 NEAR
        let farmer_net = farmer_gross - escrow;

        // investor_gross = 300 * 40% = 120 NEAR
        let investor_gross = PROFIT * 40 / 100;
        // platform_fee = 120 * 20% = 24 NEAR
        let platform_fee = investor_gross * 20 / 100;
        // investor_net = 120 - 24 = 96 NEAR
        let investor_net = investor_gross - platform_fee;

        assert_eq!(c.farmer_available, farmer_net);
        assert_eq!(c.investor_available, investor_net);
        assert_eq!(c.platform_available, platform_fee);
        assert_eq!(c.escrow_pool, escrow);
        assert_eq!(c.status, ContractStatus::CycleSettlement);
    }

    #[test]
    #[should_panic(expected = "Only admin")]
    fn test_report_cycle_wrong_caller() {
        setup_context(accounts(0));
        let mut c = new_contract();
        fund_contract(&mut c);
        start_cycle(&mut c);

        setup_context(accounts(1)); // investor, not admin
        c.report_cycle(U128(0));
    }

    #[test]
    #[should_panic(expected = "CycleActive")]
    fn test_report_cycle_wrong_status() {
        setup_context(accounts(0));
        let mut c = new_contract();
        fund_contract(&mut c);
        // status = Funded, not CycleActive
        setup_context(accounts(2));
        c.report_cycle(U128(0));
    }
```

- [ ] **Step 2: Run tests to verify they fail**

```
cargo test test_report_cycle -- --nocapture
```
Expected: FAIL — method `report_cycle` not found.

- [ ] **Step 3: Add `report_cycle()` inside impl block**

```rust
    #[payable]
    pub fn report_cycle(&mut self, losses_near: U128) {
        require!(
            env::predecessor_account_id() == self.admin,
            "Only admin can report cycle"
        );
        require!(
            self.status == ContractStatus::CycleActive,
            "Contract must be in CycleActive status"
        );

        let profit = env::attached_deposit().as_yoctonear();
        let losses = losses_near.0;

        // Distribute profit
        if profit > 0 {
            let farmer_gross = profit * self.farmer_split_pct as u128 / 100;
            let investor_gross = profit * self.investor_split_pct as u128 / 100;

            let platform_fee = investor_gross * self.performance_fee_pct as u128 / 100;
            let investor_net = investor_gross - platform_fee;

            let escrow_contribution = farmer_gross * self.escrow_pct as u128 / 100;
            let farmer_net = farmer_gross - escrow_contribution;

            self.farmer_available += farmer_net;
            self.investor_available += investor_net;
            self.platform_available += platform_fee;
            self.escrow_pool += escrow_contribution;
        }

        // Handle losses
        if losses > 0 {
            if losses <= self.escrow_pool {
                self.escrow_pool -= losses;
                self.investor_available += losses;
            } else {
                self.investor_available += self.escrow_pool;
                self.escrow_pool = 0;
                self.status = ContractStatus::Terminated;
                return;
            }
        }

        self.status = ContractStatus::CycleSettlement;
        if self.current_cycle >= self.total_cycles {
            self.farmer_available += self.escrow_pool;
            self.escrow_pool = 0;
            self.investor_available += self.capital_return_near;
            self.status = ContractStatus::Completed;
        }
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```
cargo test test_report_cycle -- --nocapture
```
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C E:/agripartners add contract/src/lib.rs
git -C E:/agripartners commit -m "feat: add report_cycle() with distribution and loss logic"
```

---

### Task 7: Losses, Termination, and Completion Tests

**Files:**
- Modify: `E:/agripartners/contract/src/lib.rs`

- [ ] **Step 1: Write tests**

Add to `tests` module:

```rust
    #[test]
    fn test_partial_losses_from_escrow() {
        setup_context(accounts(0));
        let mut c = new_contract();
        fund_contract(&mut c);
        start_cycle(&mut c);
        report_cycle(&mut c, PROFIT, 0);

        let escrow_after_c1 = c.escrow_pool;
        let investor_after_c1 = c.investor_available;

        start_cycle(&mut c);
        let loss = 10 * ONE_NEAR;
        report_cycle(&mut c, PROFIT, loss);

        let farmer_gross = PROFIT * 60 / 100;
        let escrow_added = farmer_gross * 44 / 100;
        let investor_gross = PROFIT * 40 / 100;
        let platform_fee = investor_gross * 20 / 100;
        let investor_net = investor_gross - platform_fee;

        assert_eq!(c.escrow_pool, escrow_after_c1 + escrow_added - loss);
        assert_eq!(c.investor_available, investor_after_c1 + investor_net + loss);
        assert_eq!(c.status, ContractStatus::CycleSettlement);
    }

    #[test]
    fn test_critical_losses_terminates() {
        setup_context(accounts(0));
        let mut c = new_contract();
        fund_contract(&mut c);
        start_cycle(&mut c);

        let huge_loss = 500 * ONE_NEAR;
        report_cycle(&mut c, 0, huge_loss); // no profit, big loss

        assert_eq!(c.escrow_pool, 0);
        assert_eq!(c.status, ContractStatus::Terminated);
    }

    #[test]
    fn test_completed_after_all_cycles() {
        setup_context(accounts(0));
        let mut c = new_contract(); // total_cycles = 7
        fund_contract(&mut c);

        let farmer_gross = PROFIT * 60 / 100;
        let escrow_per_cycle = farmer_gross * 44 / 100;
        let farmer_net_per_cycle = farmer_gross - escrow_per_cycle;
        let investor_gross = PROFIT * 40 / 100;
        let platform_fee = investor_gross * 20 / 100;
        let investor_net_per_cycle = investor_gross - platform_fee;

        for _ in 0..7 {
            start_cycle(&mut c);
            report_cycle(&mut c, PROFIT, 0);
        }

        assert_eq!(c.status, ContractStatus::Completed);
        assert_eq!(c.escrow_pool, 0); // returned to farmer
        // farmer: 7x net profit + 7x escrow returned
        assert_eq!(c.farmer_available, farmer_net_per_cycle * 7 + escrow_per_cycle * 7);
        // investor: 7x net profit + capital return
        assert_eq!(c.investor_available, investor_net_per_cycle * 7 + CAPITAL_RETURN);
        assert_eq!(c.platform_available, platform_fee * 7);
    }
```

- [ ] **Step 2: Run tests**

```
cargo test test_partial test_critical test_completed -- --nocapture
```
Expected: 3 tests PASS.

- [ ] **Step 3: Run all tests**

```
cargo test -- --nocapture
```
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git -C E:/agripartners add contract/src/lib.rs
git -C E:/agripartners commit -m "test: add loss handling, termination and completion tests"
```

---

### Task 8: withdraw()

**Files:**
- Modify: `E:/agripartners/contract/src/lib.rs`

- [ ] **Step 1: Write failing tests**

Add to `tests` module:

```rust
    #[test]
    fn test_withdraw_farmer_zeroes_balance() {
        setup_context(accounts(0));
        let mut c = new_contract();
        fund_contract(&mut c);
        start_cycle(&mut c);
        report_cycle(&mut c, PROFIT, 0);

        let farmer_gross = PROFIT * 60 / 100;
        let escrow = farmer_gross * 44 / 100;
        let expected = farmer_gross - escrow;
        assert_eq!(c.farmer_available, expected);

        setup_context(accounts(0)); // farmer withdraws
        c.withdraw();
        assert_eq!(c.farmer_available, 0);
    }

    #[test]
    fn test_withdraw_investor_zeroes_balance() {
        setup_context(accounts(0));
        let mut c = new_contract();
        fund_contract(&mut c);
        start_cycle(&mut c);
        report_cycle(&mut c, PROFIT, 0);

        let investor_gross = PROFIT * 40 / 100;
        let platform_fee = investor_gross * 20 / 100;
        let expected = investor_gross - platform_fee;
        assert_eq!(c.investor_available, expected);

        setup_context(accounts(1)); // investor withdraws
        c.withdraw();
        assert_eq!(c.investor_available, 0);
    }

    #[test]
    #[should_panic(expected = "No balance to withdraw")]
    fn test_withdraw_zero_balance_panics() {
        setup_context(accounts(0));
        let mut c = new_contract();
        fund_contract(&mut c);
        // No cycles run — farmer has zero balance
        setup_context(accounts(0));
        c.withdraw();
    }

    #[test]
    #[should_panic(expected = "Unauthorized")]
    fn test_withdraw_wrong_caller_panics() {
        setup_context(accounts(0));
        let mut c = new_contract();
        let mut ctx = VMContextBuilder::new();
        ctx.predecessor_account_id("random.near".parse().unwrap());
        testing_env!(ctx.build());
        c.withdraw();
    }
```

- [ ] **Step 2: Run tests to verify they fail**

```
cargo test test_withdraw -- --nocapture
```
Expected: FAIL — method `withdraw` not found.

- [ ] **Step 3: Add `withdraw()` inside impl block**

```rust
    pub fn withdraw(&mut self) -> Promise {
        let caller = env::predecessor_account_id();
        let amount = if caller == self.farmer {
            let amt = self.farmer_available;
            require!(amt > 0, "No balance to withdraw");
            self.farmer_available = 0;
            amt
        } else if caller == self.investor {
            let amt = self.investor_available;
            require!(amt > 0, "No balance to withdraw");
            self.investor_available = 0;
            amt
        } else if caller == self.platform {
            let amt = self.platform_available;
            require!(amt > 0, "No balance to withdraw");
            self.platform_available = 0;
            amt
        } else {
            env::panic_str("Unauthorized: only farmer, investor, or platform can withdraw");
        };
        Promise::new(caller).transfer(NearToken::from_yoctonear(amount))
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```
cargo test test_withdraw -- --nocapture
```
Expected: 4 tests PASS.

- [ ] **Step 5: Run all tests**

```
cargo test -- --nocapture
```
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git -C E:/agripartners add contract/src/lib.rs
git -C E:/agripartners commit -m "feat: add withdraw() with pull-payment pattern"
```

---

### Task 9: View Functions

**Files:**
- Modify: `E:/agripartners/contract/src/lib.rs`

- [ ] **Step 1: Write failing tests**

Add to `tests` module:

```rust
    #[test]
    fn test_get_status_initial() {
        setup_context(accounts(0));
        let c = new_contract();
        let (status, cycle) = c.get_status();
        assert_eq!(status, ContractStatus::Initialized);
        assert_eq!(cycle, 0);
    }

    #[test]
    fn test_get_balances_initial() {
        setup_context(accounts(0));
        let c = new_contract();
        let (farmer, investor, platform, escrow) = c.get_balances();
        assert_eq!(farmer.0, 0);
        assert_eq!(investor.0, 0);
        assert_eq!(platform.0, 0);
        assert_eq!(escrow.0, 0);
    }

    #[test]
    fn test_get_params_returns_config() {
        setup_context(accounts(0));
        let c = new_contract();
        let p = c.get_params();
        assert_eq!(p.deal_type, "fidlot");
        assert_eq!(p.farmer_split_pct, 60);
        assert_eq!(p.investor_split_pct, 40);
        assert_eq!(p.escrow_pct, 44);
        assert_eq!(p.performance_fee_pct, 20);
        assert_eq!(p.cycle_duration_days, 150);
        assert_eq!(p.total_cycles, 7);
        assert_eq!(p.investment_amount.0, INVESTMENT);
        assert_eq!(p.capital_return_near.0, CAPITAL_RETURN);
    }
```

- [ ] **Step 2: Run tests to verify they fail**

```
cargo test test_get_ -- --nocapture
```
Expected: FAIL.

- [ ] **Step 3: Add view functions inside impl block**

```rust
    pub fn get_status(&self) -> (ContractStatus, u8) {
        (self.status.clone(), self.current_cycle)
    }

    pub fn get_balances(&self) -> (U128, U128, U128, U128) {
        (
            U128(self.farmer_available),
            U128(self.investor_available),
            U128(self.platform_available),
            U128(self.escrow_pool),
        )
    }

    pub fn get_params(&self) -> ContractParams {
        ContractParams {
            farmer: self.farmer.clone(),
            investor: self.investor.clone(),
            admin: self.admin.clone(),
            platform: self.platform.clone(),
            deal_type: self.deal_type.clone(),
            investment_amount: U128(self.investment_amount),
            farmer_split_pct: self.farmer_split_pct,
            investor_split_pct: self.investor_split_pct,
            escrow_pct: self.escrow_pct,
            performance_fee_pct: self.performance_fee_pct,
            cycle_duration_days: self.cycle_duration_days,
            total_cycles: self.total_cycles,
            capital_return_near: U128(self.capital_return_near),
        }
    }
```

- [ ] **Step 4: Run all tests**

```
cargo test -- --nocapture
```
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git -C E:/agripartners add contract/src/lib.rs
git -C E:/agripartners commit -m "feat: add view functions get_status, get_balances, get_params"
```

---

### Task 10: Build WASM

**Files:**
- No code changes.

- [ ] **Step 1: Build contract**

From `E:/agripartners/contract/`:
```
cargo build --target wasm32-unknown-unknown --release
```
Expected: compiles without errors.

- [ ] **Step 2: Verify WASM file exists**

```
ls -lh target/wasm32-unknown-unknown/release/agripartners.wasm
```
Expected: file exists, size < 500KB.

- [ ] **Step 3: Add .gitignore for build artifacts**

Create `E:/agripartners/contract/.gitignore`:
```
/target
```

- [ ] **Step 4: Commit**

```bash
git -C E:/agripartners add contract/.gitignore
git -C E:/agripartners commit -m "build: verify WASM compiles, add .gitignore"
```

---

### Task 11: Integration Tests

**Files:**
- Create: `E:/agripartners/contract/tests/integration.rs`

- [ ] **Step 1: Create `E:/agripartners/contract/tests/integration.rs`**

```rust
use near_workspaces::{Account, Contract, Worker, network::Sandbox};
use near_workspaces::types::NearToken;
use serde_json::json;

const WASM_PATH: &str =
    "./target/wasm32-unknown-unknown/release/agripartners.wasm";

const ONE_NEAR: u128 = 1_000_000_000_000_000_000_000_000;
const INVESTMENT: u128 = 1_000 * ONE_NEAR;
const CAPITAL_RETURN: u128 = 408 * ONE_NEAR;
const PROFIT: u128 = 300 * ONE_NEAR;

async fn setup(
    worker: &Worker<Sandbox>,
    total_cycles: u8,
) -> (Contract, Account, Account, Account, Account) {
    let wasm = std::fs::read(WASM_PATH)
        .expect("WASM not found — run: cargo build --target wasm32-unknown-unknown --release");
    let contract = worker.dev_deploy(&wasm).await.unwrap();

    let farmer = worker.dev_create_account().await.unwrap();
    let investor = worker.dev_create_account().await.unwrap();
    let admin = worker.dev_create_account().await.unwrap();
    let platform = worker.dev_create_account().await.unwrap();

    contract
        .call("new")
        .args_json(json!({
            "farmer": farmer.id(),
            "investor": investor.id(),
            "admin": admin.id(),
            "platform": platform.id(),
            "deal_type": "fidlot",
            "investment_amount": INVESTMENT.to_string(),
            "farmer_split_pct": 60,
            "investor_split_pct": 40,
            "escrow_pct": 44,
            "performance_fee_pct": 20,
            "cycle_duration_days": 150,
            "total_cycles": total_cycles,
            "capital_return_near": CAPITAL_RETURN.to_string(),
        }))
        .transact()
        .await
        .unwrap()
        .into_result()
        .unwrap();

    (contract, farmer, investor, admin, platform)
}

#[tokio::test]
async fn test_happy_path_3_cycles() {
    let worker = near_workspaces::sandbox().await.unwrap();
    let (contract, farmer, investor, admin, _platform) = setup(&worker, 3).await;

    // fund
    investor
        .call(contract.id(), "fund")
        .deposit(NearToken::from_yoctonear(INVESTMENT))
        .transact()
        .await
        .unwrap()
        .into_result()
        .unwrap();

    let (status, cycle): (String, u8) =
        contract.view("get_status").await.unwrap().json().unwrap();
    assert_eq!(status, "Funded");
    assert_eq!(cycle, 0);

    // 3 cycles
    for i in 1u8..=3 {
        admin
            .call(contract.id(), "start_cycle")
            .transact()
            .await
            .unwrap()
            .into_result()
            .unwrap();

        let (status, cycle): (String, u8) =
            contract.view("get_status").await.unwrap().json().unwrap();
        assert_eq!(status, "CycleActive");
        assert_eq!(cycle, i);

        admin
            .call(contract.id(), "report_cycle")
            .args_json(json!({"losses_near": "0"}))
            .deposit(NearToken::from_yoctonear(PROFIT))
            .transact()
            .await
            .unwrap()
            .into_result()
            .unwrap();
    }

    let (status, cycle): (String, u8) =
        contract.view("get_status").await.unwrap().json().unwrap();
    assert_eq!(status, "Completed");
    assert_eq!(cycle, 3);

    // farmer withdraws
    let balance_before = farmer.view_account().await.unwrap().balance;
    farmer
        .call(contract.id(), "withdraw")
        .transact()
        .await
        .unwrap()
        .into_result()
        .unwrap();
    let balance_after = farmer.view_account().await.unwrap().balance;
    assert!(balance_after > balance_before);

    // investor withdraws
    let balance_before = investor.view_account().await.unwrap().balance;
    investor
        .call(contract.id(), "withdraw")
        .transact()
        .await
        .unwrap()
        .into_result()
        .unwrap();
    let balance_after = investor.view_account().await.unwrap().balance;
    assert!(balance_after > balance_before);
}

#[tokio::test]
async fn test_unauthorized_fund_fails() {
    let worker = near_workspaces::sandbox().await.unwrap();
    let (contract, _farmer, _investor, admin, _platform) = setup(&worker, 3).await;

    let result = admin
        .call(contract.id(), "fund")
        .deposit(NearToken::from_yoctonear(INVESTMENT))
        .transact()
        .await
        .unwrap();

    assert!(result.is_failure());
}

#[tokio::test]
async fn test_hissar_params_stored() {
    let worker = near_workspaces::sandbox().await.unwrap();
    let wasm = std::fs::read(WASM_PATH).unwrap();
    let contract = worker.dev_deploy(&wasm).await.unwrap();

    let farmer = worker.dev_create_account().await.unwrap();
    let investor = worker.dev_create_account().await.unwrap();
    let admin = worker.dev_create_account().await.unwrap();
    let platform = worker.dev_create_account().await.unwrap();

    contract
        .call("new")
        .args_json(json!({
            "farmer": farmer.id(),
            "investor": investor.id(),
            "admin": admin.id(),
            "platform": platform.id(),
            "deal_type": "hissar",
            "investment_amount": INVESTMENT.to_string(),
            "farmer_split_pct": 60,
            "investor_split_pct": 40,
            "escrow_pct": 44,
            "performance_fee_pct": 20,
            "cycle_duration_days": 180,
            "total_cycles": 6,
            "capital_return_near": CAPITAL_RETURN.to_string(),
        }))
        .transact()
        .await
        .unwrap()
        .into_result()
        .unwrap();

    let params: serde_json::Value =
        contract.view("get_params").await.unwrap().json().unwrap();
    assert_eq!(params["deal_type"], "hissar");
    assert_eq!(params["cycle_duration_days"], 180);
    assert_eq!(params["total_cycles"], 6);
    assert_eq!(params["escrow_pct"], 44);
}
```

- [ ] **Step 2: Run integration tests** (requires WASM from Task 10)

```
cargo test --test integration -- --nocapture
```
Expected: 3 tests PASS. (Takes 30–60 seconds — sandbox startup.)

- [ ] **Step 3: Run all tests**

```
cargo test -- --nocapture
```
Expected: all unit + integration tests PASS.

- [ ] **Step 4: Commit**

```bash
git -C E:/agripartners add contract/tests/integration.rs
git -C E:/agripartners commit -m "test: add integration tests — happy path, unauthorized, hissar params"
```

---

### Task 12: Demo Script

**Files:**
- Create: `E:/agripartners/contract/demo.sh`

- [ ] **Step 1: Create `E:/agripartners/contract/demo.sh`**

```bash
#!/usr/bin/env bash
# AgriPartners Demo — testnet
# Prerequisites: near-cli installed, accounts created on testnet
# Usage: bash demo.sh

set -e

CONTRACT="agripartners-demo.testnet"
FARMER="farmer.testnet"
INVESTOR="investor.testnet"
ADMIN="agripartners.testnet"

# amounts in yoctoNEAR
INVESTMENT="1000000000000000000000000000"   # 1000 NEAR
CAPITAL_RETURN="408000000000000000000000000" # 408 NEAR
PROFIT="300000000000000000000000000"         # 300 NEAR

echo "=== AgriPartners Demo ==="

echo "1. Build"
cargo build --target wasm32-unknown-unknown --release

echo "2. Deploy"
near deploy "$CONTRACT" \
  target/wasm32-unknown-unknown/release/agripartners.wasm \
  --initFunction new \
  --initArgs "{
    \"farmer\": \"$FARMER\",
    \"investor\": \"$INVESTOR\",
    \"admin\": \"$ADMIN\",
    \"platform\": \"$ADMIN\",
    \"deal_type\": \"fidlot\",
    \"investment_amount\": \"$INVESTMENT\",
    \"farmer_split_pct\": 60,
    \"investor_split_pct\": 40,
    \"escrow_pct\": 44,
    \"performance_fee_pct\": 20,
    \"cycle_duration_days\": 1,
    \"total_cycles\": 3,
    \"capital_return_near\": \"$CAPITAL_RETURN\"
  }"

echo "3. Investor funds"
near call "$CONTRACT" fund '{}' \
  --accountId "$INVESTOR" --deposit 1000

echo "4. Status after fund"
near view "$CONTRACT" get_status '{}'

echo "5. Cycle 1: start"
near call "$CONTRACT" start_cycle '{}' --accountId "$ADMIN"

echo "6. Cycle 1: report profit"
near call "$CONTRACT" report_cycle '{"losses_near":"0"}' \
  --accountId "$ADMIN" --deposit 300

echo "7. Balances after cycle 1"
near view "$CONTRACT" get_balances '{}'

echo "=== Demo done — repeat steps 5-6 for cycles 2 and 3 ==="
```

- [ ] **Step 2: Commit**

```bash
git -C E:/agripartners add contract/demo.sh
git -C E:/agripartners commit -m "feat: add testnet demo script"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| ContractStatus (6 states) | Task 2 |
| All 13 init params | Task 3 |
| fund() — investor only, exact amount | Task 4 |
| start_cycle() — admin, Funded/CycleSettlement | Task 5 |
| report_cycle() — profit distribution 60/40 | Task 6 |
| report_cycle() — escrow accumulation 44% | Task 6 |
| report_cycle() — performance fee 20% | Task 6 |
| report_cycle() — losses from escrow | Task 6 |
| report_cycle() — Terminated on critical loss | Task 6 |
| report_cycle() — Completed after all cycles | Task 6 |
| report_cycle() — escrow returned at Completed | Task 6 |
| report_cycle() — capital_return at Completed | Task 6 |
| withdraw() — pull payment farmer/investor/platform | Task 8 |
| get_status(), get_balances(), get_params() | Task 9 |
| Unit tests — all scenarios | Tasks 3–9 |
| Integration tests — happy path | Task 11 |
| Integration tests — Fidlot vs Hissar params | Task 11 |
| Integration tests — unauthorized calls | Task 11 |
| Demo script for testnet | Task 12 |

**No placeholders found.**

**Type consistency:** `ContractStatus`, `U128`, `u128`, `NearToken`, `AccountId`, `ContractParams` — consistent throughout all tasks.
