const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { utils } = require('near-api-js');
const challengeStore = require('./walletChallengeStore');

const NETWORK_ID = 'testnet';
const DEFAULT_RPC_URLS = {
  mainnet: 'https://rpc.mainnet.fastnear.com',
  testnet: 'https://test.rpc.fastnear.com',
};
const RECIPIENT = 'farab.testnet';
const MESSAGE = 'Authenticate with AgriPartners Wallet Phase 3 POC';
const NONCE_TTL_MS = 5 * 60 * 1000;
async function createChallenge() {
  const nonceBytes = crypto.randomBytes(32);
  const nonce = nonceBytes.toString('base64');
  const expiresAt = Date.now() + NONCE_TTL_MS;

  await challengeStore.create({
    nonce,
    message: MESSAGE,
    recipient: RECIPIENT,
    nonceBytes,
    expiresAt,
    used: false,
  });

  return {
    message: MESSAGE,
    recipient: RECIPIENT,
    nonce,
    nonceBase64: nonce,
    nonceBytes: Array.from(nonceBytes),
    network: NETWORK_ID,
    expires_at: new Date(expiresAt).toISOString(),
  };
}

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

function serializeNep413Payload(payload) {
  return crypto
    .createHash('sha256')
    .update(serializeNep413PayloadBytes(payload))
    .digest();
}

function hashPayloadBytes(payloadBytes) {
  return crypto.createHash('sha256').update(payloadBytes).digest();
}

function serializeNep413PayloadBytes(payload) {
  return Buffer.concat([
    writeU32(2147484061),
    writeString(payload.message),
    Buffer.from(payload.nonce),
    writeString(payload.recipient),
    writeOptionString(payload.callbackUrl),
  ]);
}

function detectSignatureFormat(value) {
  if (typeof value !== 'string') return 'byte-array';
  if (value.startsWith('ed25519:')) return 'ed25519-prefixed-base58';
  if (value.includes(' ')) return 'base64-with-query-spaces';
  return 'base64';
}

function normalizeBytes(value, fieldName) {
  if (Buffer.isBuffer(value)) return value;
  if (Array.isArray(value)) return Buffer.from(value);
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value === 'string') {
    const normalized = value.trim().replace(/ /g, '+');
    if (normalized.startsWith('ed25519:')) {
      return Buffer.from(utils.serialize.base_decode(normalized.slice('ed25519:'.length)));
    }

    try {
      return Buffer.from(normalized, 'base64');
    } catch {
      throw new Error(`${fieldName} must be base64 or byte array`);
    }
  }
  throw new Error(`${fieldName} must be base64 or byte array`);
}

function buildVerificationCandidates(challenge, callbackUrl) {
  const basePayload = {
    message: challenge.message,
    nonce: challenge.nonceBytes,
    recipient: challenge.recipient,
  };

  return [
    {
      name: 'withCallbackUrl',
      payload: {
        ...basePayload,
        callbackUrl,
      },
    },
    {
      name: 'withoutCallbackUrl',
      payload: {
        ...basePayload,
        callbackUrl: null,
      },
    },
  ].map(candidate => {
    const payloadBytes = serializeNep413PayloadBytes(candidate.payload);
    return {
      ...candidate,
      payloadBytes,
      messageHash: hashPayloadBytes(payloadBytes),
    };
  });
}

function getRpcUrl() {
  return process.env.NEAR_RPC_URL || DEFAULT_RPC_URLS[NETWORK_ID];
}

function getRpcHeaders() {
  const headers = { 'content-type': 'application/json' };
  if (process.env.FASTNEAR_API_KEY) {
    headers.authorization = `Bearer ${process.env.FASTNEAR_API_KEY}`;
  }
  return headers;
}

async function rpcQuery(params) {
  const rpcUrl = getRpcUrl();
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: getRpcHeaders(),
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'wallet-auth-poc',
      method: 'query',
      params,
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    const message = data.error && (data.error.cause?.name || data.error.message);
    throw new Error(message || `NEAR RPC failed with ${response.status} from ${rpcUrl}`);
  }
  return data.result;
}

async function assertFullAccessKey(accountId, publicKey) {
  const accessKey = await rpcQuery({
    request_type: 'view_access_key',
    finality: 'final',
    account_id: accountId,
    public_key: publicKey,
  });

  if (accessKey.permission !== 'FullAccess') {
    throw new Error('Wallet public key is not a FullAccess key for this account');
  }
}

async function verifyWalletSignature(input) {
  const accountId = input.account_id || input.accountId;
  const publicKey = input.public_key || input.publicKey;
  const signatureValue = input.signature;
  const nonce = input.nonce || input.nonceBase64;
  const callbackUrl = input.callbackUrl || input.callback_url || null;

  if (!accountId || !publicKey || !signatureValue || !nonce) {
    throw new Error('account_id, public_key, signature, and nonce are required');
  }

  const challenge = await challengeStore.consume(nonce);
  if (!challenge) {
    throw new Error('Challenge nonce is invalid or expired');
  }

  const signature = normalizeBytes(signatureValue, 'signature');
  const nearPublicKey = utils.PublicKey.from(publicKey);
  const candidates = buildVerificationCandidates(challenge, callbackUrl);
  const verificationAttempts = candidates.map(candidate => ({
    ...candidate,
    verificationResult: nearPublicKey.verify(candidate.messageHash, signature),
  }));
  const verifiedAttempt = verificationAttempts.find(candidate => candidate.verificationResult);
  const verificationResult = Boolean(verifiedAttempt);

  if (!verificationResult) {
    throw new Error('Signature verification failed');
  }
  try {
    await assertFullAccessKey(accountId, publicKey);
  } catch (error) {
    await challengeStore.release(nonce);
    throw error;
  }

  const token = jwt.sign(
    {
      type: 'wallet-auth-poc',
      account_id: accountId,
      public_key: publicKey,
      network: NETWORK_ID,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const responsePayload = {
    token,
    account_id: accountId,
    public_key: publicKey,
    network: NETWORK_ID,
  };
  return responsePayload;
}

module.exports = {
  createChallenge,
  verifyWalletSignature,
  assertFullAccessKey,
};
