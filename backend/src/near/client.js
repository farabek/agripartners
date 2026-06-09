const { connect, keyStores, KeyPair } = require('near-api-js');

let nearInstance = null;
let accountInstance = null;
let keyStoreInstance = null;
const accountInstancesById = new Map();
const DEFAULT_TESTNET_RPC_URL = 'https://test.rpc.fastnear.com';

function getNetworkConfig() {
  const networkId = process.env.NEAR_NETWORK || 'testnet';
  const nodeUrl = process.env.NEAR_RPC_URL || (networkId === 'mainnet'
    ? 'https://rpc.mainnet.near.org'
    : DEFAULT_TESTNET_RPC_URL);
  return { networkId, nodeUrl };
}

async function getNear() {
  if (nearInstance) return nearInstance;
  if (!process.env.NEAR_ADMIN_ACCOUNT || !process.env.NEAR_ADMIN_PRIVATE_KEY) {
    throw new Error('NEAR_ADMIN_ACCOUNT and NEAR_ADMIN_PRIVATE_KEY are required for NEAR signing');
  }

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

function getConfiguredSigner(accountId) {
  const configuredSigners = [
    {
      label: 'admin',
      accountEnv: 'NEAR_ADMIN_ACCOUNT',
      keyEnv: 'NEAR_ADMIN_PRIVATE_KEY',
      accountId: process.env.NEAR_ADMIN_ACCOUNT,
      privateKey: process.env.NEAR_ADMIN_PRIVATE_KEY
    },
    {
      label: 'farmer',
      accountEnv: 'NEAR_FARMER_SIGNER_ACCOUNT_ID',
      keyEnv: 'NEAR_FARMER_SIGNER_PRIVATE_KEY',
      accountId: process.env.NEAR_FARMER_SIGNER_ACCOUNT_ID,
      privateKey: process.env.NEAR_FARMER_SIGNER_PRIVATE_KEY
    },
    {
      label: 'investor',
      accountEnv: 'NEAR_INVESTOR_SIGNER_ACCOUNT_ID',
      keyEnv: 'NEAR_INVESTOR_SIGNER_PRIVATE_KEY',
      accountId: process.env.NEAR_INVESTOR_SIGNER_ACCOUNT_ID,
      privateKey: process.env.NEAR_INVESTOR_SIGNER_PRIVATE_KEY
    },
    {
      label: 'platform',
      accountEnv: 'NEAR_PLATFORM_SIGNER_ACCOUNT_ID',
      keyEnv: 'NEAR_PLATFORM_SIGNER_PRIVATE_KEY',
      accountId: process.env.NEAR_PLATFORM_SIGNER_ACCOUNT_ID,
      privateKey: process.env.NEAR_PLATFORM_SIGNER_PRIVATE_KEY
    }
  ];

  return configuredSigners.find((signer) => signer.accountId === accountId);
}

async function getAccountFromConfiguredCredentials(accountId) {
  const signer = getConfiguredSigner(accountId);

  if (!signer) {
    throw new Error(
      `No configured NEAR signer account for ${accountId}. Set NEAR_ADMIN_ACCOUNT or one of NEAR_FARMER_SIGNER_ACCOUNT_ID, NEAR_INVESTOR_SIGNER_ACCOUNT_ID, NEAR_PLATFORM_SIGNER_ACCOUNT_ID.`
    );
  }

  if (!signer.privateKey) {
    throw new Error(`${signer.keyEnv} is required for configured NEAR ${signer.label} signer ${accountId}`);
  }

  if (signer.accountEnv === 'NEAR_ADMIN_ACCOUNT') {
    return getAdminAccount();
  }

  if (accountInstancesById.has(accountId)) return accountInstancesById.get(accountId);

  const near = await getNear();
  const { networkId } = getNetworkConfig();
  await keyStoreInstance.setKey(networkId, accountId, KeyPair.fromString(signer.privateKey));
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

module.exports = {
  getNear,
  getAdminAccount,
  getAccountFromConfiguredCredentials,
  resetInstances
};
