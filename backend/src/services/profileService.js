const pool = require('../db/index');

const ROLES = ['farmer', 'investor'];
const EDITABLE_FIELDS = ['displayName', 'country', 'phone', 'organizationName', 'bio'];
const PROTECTED_FIELDS = [
  'walletAccountId',
  'wallet_account_id',
  'account_id',
  'role',
  'created_at',
  'createdAt',
  'updated_at',
  'updatedAt',
];

function toCamel(row) {
  if (!row) return null;
  return {
    walletAccountId: row.wallet_account_id,
    role: row.role,
    displayName: row.display_name,
    country: row.country,
    phone: row.phone,
    organizationName: row.organization_name,
    bio: row.bio,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeOptionalString(value, fieldName, maxLength) {
  if (value == null) return null;
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer`);
  }
  return trimmed;
}

function normalizeRequiredString(value, fieldName, maxLength) {
  const normalized = normalizeOptionalString(value, fieldName, maxLength);
  if (!normalized) throw new Error(`${fieldName} is required`);
  return normalized;
}

function normalizeRole(role) {
  if (!ROLES.includes(role)) {
    throw new Error('role must be farmer or investor');
  }
  return role;
}

function normalizeProfilePayload(payload = {}, { requireRole = false, requireDisplayName = false } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Profile payload must be an object');
  }

  const normalized = {};
  if (requireRole || Object.prototype.hasOwnProperty.call(payload, 'role')) {
    normalized.role = normalizeRole(payload.role);
  }
  if (requireDisplayName || Object.prototype.hasOwnProperty.call(payload, 'displayName')) {
    normalized.displayName = normalizeRequiredString(payload.displayName, 'displayName', 120);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'country')) {
    normalized.country = normalizeOptionalString(payload.country, 'country', 80);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'phone')) {
    normalized.phone = normalizeOptionalString(payload.phone, 'phone', 40);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'organizationName')) {
    normalized.organizationName = normalizeOptionalString(payload.organizationName, 'organizationName', 160);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'bio')) {
    normalized.bio = normalizeOptionalString(payload.bio, 'bio', 1000);
  }

  return normalized;
}

function validateUpdatePayload(payload = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Profile payload must be an object');
  }

  for (const field of PROTECTED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      throw new Error(`${field} cannot be edited`);
    }
  }

  const unknownField = Object.keys(payload).find(field => !EDITABLE_FIELDS.includes(field));
  if (unknownField) {
    throw new Error(`${unknownField} is not a valid profile field`);
  }

  return normalizeProfilePayload(payload);
}

async function getProfile(accountId) {
  const { rows } = await pool.query(
    'SELECT * FROM user_profiles WHERE wallet_account_id = $1',
    [accountId]
  );
  return toCamel(rows[0]);
}

async function createOnboardingProfile(accountId, payload) {
  const existing = await getProfile(accountId);
  if (existing) {
    const err = new Error('Profile already exists');
    err.code = 'PROFILE_EXISTS';
    throw err;
  }

  const profile = normalizeProfilePayload(payload, { requireRole: true, requireDisplayName: true });
  const { rows } = await pool.query(
    `INSERT INTO user_profiles (
       wallet_account_id, role, display_name, country, phone, organization_name, bio
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      accountId,
      profile.role,
      profile.displayName,
      profile.country ?? null,
      profile.phone ?? null,
      profile.organizationName ?? null,
      profile.bio ?? null,
    ]
  );
  return toCamel(rows[0]);
}

async function updateProfile(accountId, payload) {
  const normalized = validateUpdatePayload(payload);
  const fields = Object.keys(normalized);
  if (fields.length === 0) return getProfile(accountId);

  const columnMap = {
    displayName: 'display_name',
    country: 'country',
    phone: 'phone',
    organizationName: 'organization_name',
    bio: 'bio',
  };
  const assignments = fields.map((field, index) => `${columnMap[field]} = $${index + 2}`);
  const values = fields.map(field => normalized[field]);
  const { rows } = await pool.query(
    `UPDATE user_profiles
     SET ${assignments.join(', ')}, updated_at = NOW()
     WHERE wallet_account_id = $1
     RETURNING *`,
    [accountId, ...values]
  );
  return toCamel(rows[0]);
}

module.exports = {
  getProfile,
  createOnboardingProfile,
  updateProfile,
  validateUpdatePayload,
  normalizeProfilePayload,
};
