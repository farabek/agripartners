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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_status_eq() {
        assert_eq!(ContractStatus::Initialized, ContractStatus::Initialized);
        assert_ne!(ContractStatus::Initialized, ContractStatus::Funded);
    }
}
