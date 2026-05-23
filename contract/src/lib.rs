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
}
