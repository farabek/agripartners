const fs = require('fs');
const os = require('os');
const path = require('path');
const { connect, keyStores, KeyPair } = require('near-api-js');

let nearInstance = null;
let accountInstance = null;
let keyStoreInstance = null;
const accountInstancesById = new Map();

function getNetworkConfig() {
  const networkId = process.env.NEAR_NETWORK || 'testnet';
  const nodeUrl = process.env.NEAR_RPC_URL || (networkId === 'mainnet'
    ? 'https://rpc.mainnet.near.org'
    : 'https://rpc.testnet.fastnear.com');
  return { networkId, nodeUrl };
}

async function getNear() {
  if (nearInstance) return nearInstance;
  const { networkId, nodeUrl } = getNetworkConfig();
  keyStoreInstance = new keyStores.InMemoryKeyStore();
  await keyStoreInstance.setKey(
    networkId,
    process.env.NEAR_ADMIN_ACCOUNT,
    KeyPair.fromString(process.env.NEAR_ADMIN_PRIVATE_KEY)
  );
  nearInstance = await connect({ networkId, nodeUrl, keyStore: keyStoreInstance, deps: { keyStore: keyStoreInstance } });
  return nearInstance;
}

async function getAdminAccount() {
  if (accountInstance) return accountInstance;
  const near = await getNear();
  accountInstance = await near.account(process.env.NEAR_ADMIN_ACCOUNT);
  return accountInstance;
}

function getLocalCredentialsPath(accountId, networkId) {
  return path.join(os.homedir(), '.near-credentials', networkId, `${accountId}.json`);
}

async function getAccountFromLocalCredentials(accountId) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Local NEAR credentials are disabled in production');
  }

  if (accountInstancesById.has(accountId)) return accountInstancesById.get(accountId);

  const near = await getNear();
  const { networkId } = getNetworkConfig();
  const credentialsPath = getLocalCredentialsPath(accountId, networkId);
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  const privateKey = credentials.private_key || credentials.privateKey;

  if (!privateKey) {
    throw new Error(`Missing private key in local NEAR credentials for ${accountId}`);
  }

  await keyStoreInstance.setKey(networkId, accountId, KeyPair.fromString(privateKey));
  const account = await near.account(accountId);
  accountInstancesById.set(accountId, account);
  return account;
}

function resetInstances() {
  nearInstance = null;
  accountInstance = null;
  keyStoreInstance = null;
  accountInstancesById.clear();
}

module.exports = { getNear, getAdminAccount, getAccountFromLocalCredentials, resetInstances };
