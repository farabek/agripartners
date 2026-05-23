use near_sdk::{near, env, AccountId, Promise, require, NearToken};
use near_sdk::json_types::U128;

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

impl Default for AgriPartnersContract {
    fn default() -> Self {
        let placeholder = "a".parse::<AccountId>().unwrap();
        Self {
            farmer: placeholder.clone(),
            investor: placeholder.clone(),
            admin: placeholder.clone(),
            platform: placeholder,
            deal_type: String::new(),
            investment_amount: 0,
            farmer_split_pct: 0,
            investor_split_pct: 0,
            escrow_pct: 0,
            performance_fee_pct: 0,
            cycle_duration_days: 0,
            total_cycles: 0,
            capital_return_near: 0,
            status: ContractStatus::Initialized,
            current_cycle: 0,
            farmer_available: 0,
            investor_available: 0,
            platform_available: 0,
            escrow_pool: 0,
        }
    }
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    const ONE_NEAR: u128 = 1_000_000_000_000_000_000_000_000;
    const INVESTMENT: u128 = 1_000 * ONE_NEAR;
    const CAPITAL_RETURN: u128 = 408 * ONE_NEAR;

    fn setup_context(predecessor: AccountId) {
        let mut ctx = VMContextBuilder::new();
        ctx.predecessor_account_id(predecessor)
           .account_balance(NearToken::from_near(10_000));
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
    fn test_status_eq() {
        assert_eq!(ContractStatus::Initialized, ContractStatus::Initialized);
        assert_ne!(ContractStatus::Initialized, ContractStatus::Funded);
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
        // escrow = 180 * 44% = 79 NEAR (integer div truncation: 180*44=7920, /100=79)
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
}
