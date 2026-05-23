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
