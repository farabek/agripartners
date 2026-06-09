process.env.JWT_SECRET = 'test-jwt-secret';
delete process.env.WALLET_AUTH_SKIP_ACCESS_KEY_CHECK;
delete process.env.NEAR_RPC_URL;
delete process.env.FASTNEAR_API_KEY;

const crypto = require('crypto');
const express = require('express');
const request = require('supertest');
const { KeyPair } = require('near-api-js');
const walletAuthService = require('../src/services/walletAuthService');
const { requireWalletAuth } = require('../src/middleware/walletAuth');
const investorRouter = require('../src/routes/investor');

function writeU32(value) {
  const out = Buffer.alloc(4);
  out.writeUInt32LE(value, 0);
  return out;
}

function writeString(value) {
  const bytes = Buffer.from(value, 'utf8');
  return Buffer.concat([writeU32(bytes.length), bytes]);
}

function writeOptionString(value) {
  if (!value) return Buffer.from([0]);
  return Buffer.concat([Buffer.from([1]), writeString(value)]);
}

function buildNep413MessageHash({ message, nonceBase64, recipient, callbackUrl }) {
  const payloadBytes = Buffer.concat([
    writeU32(2147484061),
    writeString(message),
    Buffer.from(nonceBase64, 'base64'),
    writeString(recipient),
    writeOptionString(callbackUrl),
  ]);

  return crypto.createHash('sha256').update(payloadBytes).digest();
}

function mockAccessKeyFetch(permission = 'FullAccess') {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      jsonrpc: '2.0',
      result: {
        nonce: 1,
        block_height: 1,
        block_hash: 'test',
        permission,
      },
      id: 'wallet-auth-poc',
    }),
  });
}

beforeEach(() => {
  process.env.JWT_SECRET = 'test-jwt-secret';
  delete process.env.WALLET_AUTH_SKIP_ACCESS_KEY_CHECK;
  delete process.env.NEAR_RPC_URL;
  delete process.env.FASTNEAR_API_KEY;
  mockAccessKeyFetch();
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('assertFullAccessKey uses FastNear testnet RPC by default', async () => {
  await walletAuthService.assertFullAccessKey('owner.testnet', 'ed25519:PUBLIC');

  expect(global.fetch).toHaveBeenCalledWith(
    'https://test.rpc.fastnear.com',
    expect.objectContaining({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    })
  );
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toMatchObject({
    method: 'query',
    params: {
      request_type: 'view_access_key',
      finality: 'final',
      account_id: 'owner.testnet',
      public_key: 'ed25519:PUBLIC',
    },
  });
});

test('assertFullAccessKey rejects function-call keys', async () => {
  mockAccessKeyFetch({ FunctionCall: { receiver_id: 'contract.testnet', method_names: [] } });

  await expect(walletAuthService.assertFullAccessKey('owner.testnet', 'ed25519:PUBLIC'))
    .rejects.toThrow('Wallet public key is not a FullAccess key for this account');
});

test('verifyWalletSignature issues JWT without skip flag after real full-access ownership validation', async () => {
  const keyPair = KeyPair.fromRandom('ed25519');
  const publicKey = keyPair.getPublicKey().toString();
  const accountId = 'owner.testnet';
  const callbackUrl = 'http://localhost:5173/wallet-auth-poc.html';
  const challenge = walletAuthService.createChallenge();
  const messageHash = buildNep413MessageHash({
    message: challenge.message,
    nonceBase64: challenge.nonce,
    recipient: challenge.recipient,
    callbackUrl,
  });
  const signature = Buffer.from(keyPair.sign(messageHash).signature).toString('base64');

  const verified = await walletAuthService.verifyWalletSignature({
    account_id: accountId,
    public_key: publicKey,
    signature,
    nonce: challenge.nonce,
    callbackUrl,
  });

  expect(process.env.WALLET_AUTH_SKIP_ACCESS_KEY_CHECK).toBeUndefined();
  expect(verified.token).toBeDefined();
  expect(verified.account_id).toBe(accountId);
  expect(global.fetch).toHaveBeenCalledWith(
    'https://test.rpc.fastnear.com',
    expect.objectContaining({ method: 'POST' })
  );

  const app = express();
  app.use('/api/investor', requireWalletAuth, investorRouter);
  const me = await request(app)
    .get('/api/investor/me')
    .set('Authorization', `Bearer ${verified.token}`);

  expect(me.status).toBe(200);
  expect(me.body).toMatchObject({
    account_id: accountId,
    public_key: publicKey,
    network: 'testnet',
  });
});
