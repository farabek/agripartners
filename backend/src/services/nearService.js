const { getAdminAccount } = require('../near/client');

async function getContractStatus(contractAddress) {
  const account = await getAdminAccount();
  const result = await account.viewFunction(contractAddress, 'get_status', {});
  return { status: result[0], current_cycle: result[1] };
}

async function getContractBalances(contractAddress) {
  const account = await getAdminAccount();
  const result = await account.viewFunction(contractAddress, 'get_balances', {});
  return { farmer: result[0], investor: result[1], platform: result[2], escrow: result[3] };
}

module.exports = { getContractStatus, getContractBalances };
