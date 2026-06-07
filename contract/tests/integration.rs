// NEAR sandbox only supports Linux x86_64, Linux aarch64, and Darwin arm64.
// These integration tests are skipped on Windows.
#![cfg(not(target_os = "windows"))]

use near_workspaces::types::NearToken;
use near_workspaces::{network::Sandbox, Account, Contract, Worker};
use serde_json::json;

const WASM_PATH: &str = "./target/wasm32-unknown-unknown/release/agripartners.wasm";

const ONE_NEAR: u128 = 1_000_000_000_000_000_000_000_000;
const INVESTMENT: u128 = 1_000 * ONE_NEAR;
const CAPITAL_RETURN: u128 = 408 * ONE_NEAR;
const PROFIT: u128 = 300 * ONE_NEAR;

async fn setup(
    worker: &Worker<Sandbox>,
    total_cycles: u8,
) -> (Contract, Account, Account, Account, Account, Account) {
    let wasm = std::fs::read(WASM_PATH)
        .expect("WASM not found — run: cargo build --target wasm32-unknown-unknown --release");
    let contract = worker.dev_deploy(&wasm).await.unwrap();

    let farmer = worker.dev_create_account().await.unwrap();
    let investor = worker.dev_create_account().await.unwrap();
    let investor_withdraw_signer = worker.dev_create_account().await.unwrap();
    let admin = worker.dev_create_account().await.unwrap();
    let platform = worker.dev_create_account().await.unwrap();

    contract
        .call("new")
        .args_json(json!({
            "farmer": farmer.id(),
            "investor": investor.id(),
            "investor_withdraw_signer": investor_withdraw_signer.id(),
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

    (
        contract,
        farmer,
        investor,
        investor_withdraw_signer,
        admin,
        platform,
    )
}

#[tokio::test]
async fn test_happy_path_3_cycles() {
    let worker = near_workspaces::sandbox().await.unwrap();
    let (contract, farmer, investor, _investor_withdraw_signer, admin, _platform) =
        setup(&worker, 3).await;

    // fund
    investor
        .call(contract.id(), "fund")
        .deposit(NearToken::from_yoctonear(INVESTMENT))
        .transact()
        .await
        .unwrap()
        .into_result()
        .unwrap();

    let (status, cycle): (String, u8) = contract.view("get_status").await.unwrap().json().unwrap();
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

    let (status, cycle): (String, u8) = contract.view("get_status").await.unwrap().json().unwrap();
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
async fn test_investor_withdraw_signer_pays_real_investor() {
    let worker = near_workspaces::sandbox().await.unwrap();
    let (contract, _farmer, investor, investor_withdraw_signer, admin, _platform) =
        setup(&worker, 1).await;

    investor
        .call(contract.id(), "fund")
        .deposit(NearToken::from_yoctonear(INVESTMENT))
        .transact()
        .await
        .unwrap()
        .into_result()
        .unwrap();

    admin
        .call(contract.id(), "start_cycle")
        .transact()
        .await
        .unwrap()
        .into_result()
        .unwrap();

    admin
        .call(contract.id(), "report_cycle")
        .args_json(json!({"losses_near": "0"}))
        .deposit(NearToken::from_yoctonear(PROFIT))
        .transact()
        .await
        .unwrap()
        .into_result()
        .unwrap();

    let investor_before = investor.view_account().await.unwrap().balance;
    let signer_before = investor_withdraw_signer
        .view_account()
        .await
        .unwrap()
        .balance;

    investor_withdraw_signer
        .call(contract.id(), "withdraw")
        .transact()
        .await
        .unwrap()
        .into_result()
        .unwrap();

    let investor_after = investor.view_account().await.unwrap().balance;
    let signer_after = investor_withdraw_signer
        .view_account()
        .await
        .unwrap()
        .balance;
    let (_farmer, investor_available, _platform, _escrow): (String, String, String, String) =
        contract.view("get_balances").await.unwrap().json().unwrap();

    assert!(investor_after > investor_before);
    assert!(signer_after <= signer_before);
    assert_eq!(investor_available, "0");
}

#[tokio::test]
async fn test_unauthorized_fund_fails() {
    let worker = near_workspaces::sandbox().await.unwrap();
    let (contract, _farmer, _investor, _investor_withdraw_signer, admin, _platform) =
        setup(&worker, 3).await;

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
    let investor_withdraw_signer = worker.dev_create_account().await.unwrap();
    let admin = worker.dev_create_account().await.unwrap();
    let platform = worker.dev_create_account().await.unwrap();

    contract
        .call("new")
        .args_json(json!({
            "farmer": farmer.id(),
            "investor": investor.id(),
            "investor_withdraw_signer": investor_withdraw_signer.id(),
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

    let params: serde_json::Value = contract.view("get_params").await.unwrap().json().unwrap();
    assert_eq!(params["deal_type"], "hissar");
    assert_eq!(
        params["investor_withdraw_signer"],
        investor_withdraw_signer.id().as_str()
    );
    assert_eq!(params["cycle_duration_days"], 180);
    assert_eq!(params["total_cycles"], 6);
    assert_eq!(params["escrow_pct"], 44);
}
