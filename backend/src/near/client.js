const { connect, keyStores, KeyPair } = require('near-api-js');

let nearInstance = null;
let accountInstance = null;

async function getNear() {
  if (nearInstance) return nearInstance;
  const networkId = process.env.NEAR_NETWORK || 'testnet';
  const nodeUrl = process.env.NEAR_RPC_URL || (networkId === 'mainnet'
    ? 'https://rpc.mainnet.near.org'
    : 'https://rpc.testnet.fastnear.com');
  const keyStore = new keyStores.InMemoryKeyStore();
  await keyStore.setKey(networkId, process.env.NEAR_ADMIN_ACCOUNT, KeyPair.fromString(process.env.NEAR_ADMIN_PRIVATE_KEY));
  nearInstance = await connect({ networkId, nodeUrl, keyStore, deps: { keyStore } });
  return nearInstance;
}

async function getAdminAccount() {
  if (accountInstance) return accountInstance;
  const near = await getNear();
  accountInstance = await near.account(process.env.NEAR_ADMIN_ACCOUNT);
  return accountInstance;
}

function resetInstances() {
  nearInstance = null;
  accountInstance = null;
}

module.exports = { getNear, getAdminAccount, resetInstances };
