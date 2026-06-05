const fs = require('fs');
const path = require('path');
const nearApi = require('near-api-js');
const BN = require('bn.js');
const { getAdminAccount, getAccountFromLocalCredentials } = require('../near/client');

async function getContractStatus(contractAddress) {
  const account = await getAdminAccount();
  const result = await account.viewFunction({ contractId: contractAddress, methodName: 'get_status', args: {} });
  return { status: result[0], current_cycle: result[1] };
}

async function getContractBalances(contractAddress) {
  const account = await getAdminAccount();
  const result = await account.viewFunction({ contractId: contractAddress, methodName: 'get_balances', args: {} });
  return { farmer: result[0], investor: result[1], platform: result[2], escrow: result[3] };
}

async function deployContract(params) {
  const account = await getAdminAccount();
  const adminAccount = process.env.NEAR_ADMIN_ACCOUNT;
  const contractId = `ap${Date.now()}.${adminAccount}`;

  const wasmPath = process.env.WASM_PATH
    || path.resolve(__dirname, '../../../contract/target/wasm32-unknown-unknown/release/agripartners.wasm');
  const wasm = fs.readFileSync(wasmPath);

  const newKeyPair = nearApi.KeyPair.fromRandom('ed25519');
  const publicKey = nearApi.utils.PublicKey.fromString(newKeyPair.getPublicKey().toString());

  const initArgs = Buffer.from(JSON.stringify({
    farmer: params.farmer,
    investor: params.investor,
    admin: adminAccount,
    platform: adminAccount,
    deal_type: params.deal_type,
    investment_amount: params.investment_amount,
    farmer_split_pct: params.farmer_split_pct,
    investor_split_pct: params.investor_split_pct,
    escrow_pct: params.escrow_pct,
    performance_fee_pct: params.performance_fee_pct,
    cycle_duration_days: params.cycle_duration_days,
    total_cycles: params.total_cycles,
    capital_return_near: params.capital_return_near
  }));

  const { transactions } = nearApi;
  const result = await account.signAndSendTransaction({
    receiverId: contractId,
    actions: [
      transactions.createAccount(),
      transactions.transfer(new BN(nearApi.utils.format.parseNearAmount('2'))),
      transactions.addKey(publicKey, transactions.fullAccessKey()),
      transactions.deployContract(wasm),
      transactions.functionCall('new', initArgs, new BN('100000000000000'), new BN('0'))
    ]
  });

  return { contractId, txHash: result.transaction.hash };
}

async function startCycle(contractAddress) {
  const account = await getAdminAccount();
  const result = await account.functionCall({
    contractId: contractAddress,
    methodName: 'start_cycle',
    args: {},
    gas: '100000000000000'
  });
  return { txHash: result.transaction.hash };
}

async function reportCycle(contractAddress, profitNear, lossesNear) {
  const account = await getAdminAccount();
  const result = await account.functionCall({
    contractId: contractAddress,
    methodName: 'report_cycle',
    args: { losses_near: lossesNear },
    gas: '100000000000000',
    attachedDeposit: profitNear
  });
  return { txHash: result.transaction.hash };
}

async function fundContract(contractAddress, investmentAmount) {
  const account = await getAdminAccount();
  return fundContractWithAccount(account, contractAddress, investmentAmount);
}

async function fundContractAs(accountId, contractAddress, investmentAmount) {
  const account = await getAccountFromLocalCredentials(accountId);
  return fundContractWithAccount(account, contractAddress, investmentAmount);
}

async function fundContractWithAccount(account, contractAddress, investmentAmount) {
  const result = await account.functionCall({
    contractId: contractAddress,
    methodName: 'fund',
    args: {},
    gas: '100000000000000',
    attachedDeposit: investmentAmount
  });
  return { txHash: result.transaction.hash };
}

async function withdrawContract(contractAddress) {
  const account = await getAdminAccount();
  return withdrawContractWithAccount(account, contractAddress);
}

async function withdrawContractAs(accountId, contractAddress) {
  const account = await getAccountFromLocalCredentials(accountId);
  return withdrawContractWithAccount(account, contractAddress);
}

async function withdrawContractWithAccount(account, contractAddress) {
  const result = await account.functionCall({
    contractId: contractAddress,
    methodName: 'withdraw',
    args: {},
    gas: '100000000000000'
  });
  return { txHash: result.transaction.hash };
}

module.exports = {
  getContractStatus,
  getContractBalances,
  deployContract,
  startCycle,
  reportCycle,
  fundContract,
  fundContractAs,
  withdrawContract,
  withdrawContractAs
};
