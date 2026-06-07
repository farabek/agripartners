const pool = require('../db/index');

const EDITABLE_FIELDS = ['display_name', 'country', 'investor_type', 'risk_profile'];
const PROTECTED_FIELDS = ['id', 'account_id', 'kyc_status', 'created_at', 'updated_at'];
const INVESTOR_TYPES = ['individual', 'company', 'fund', 'other'];
const RISK_PROFILES = ['conservative', 'balanced', 'growth', 'high_risk'];

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

function normalizeEnum(value, fieldName, allowedValues) {
  const normalized = normalizeOptionalString(value, fieldName, 40);
  if (normalized == null) return null;
  if (!allowedValues.includes(normalized)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
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
    throw new Error(`${unknownField} is not a valid investor profile field`);
  }

  const normalized = {};
  if (Object.prototype.hasOwnProperty.call(payload, 'display_name')) {
    normalized.display_name = normalizeOptionalString(payload.display_name, 'display_name', 120);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'country')) {
    normalized.country = normalizeOptionalString(payload.country, 'country', 80);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'investor_type')) {
    normalized.investor_type = normalizeEnum(payload.investor_type, 'investor_type', INVESTOR_TYPES);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'risk_profile')) {
    normalized.risk_profile = normalizeEnum(payload.risk_profile, 'risk_profile', RISK_PROFILES);
  }

  return normalized;
}

async function getOrCreateInvestorProfile(accountId) {
  const { rows } = await pool.query(
    `INSERT INTO investor_profiles (account_id)
     VALUES ($1)
     ON CONFLICT (account_id) DO NOTHING
     RETURNING *`,
    [accountId]
  );

  if (rows[0]) return rows[0];

  const existing = await pool.query(
    'SELECT * FROM investor_profiles WHERE account_id = $1',
    [accountId]
  );
  return existing.rows[0];
}

async function updateInvestorProfile(accountId, payload) {
  const normalized = validateUpdatePayload(payload);
  await getOrCreateInvestorProfile(accountId);

  const fields = Object.keys(normalized);
  if (fields.length === 0) {
    const { rows } = await pool.query(
      'SELECT * FROM investor_profiles WHERE account_id = $1',
      [accountId]
    );
    return rows[0];
  }

  const assignments = fields.map((field, index) => `${field} = $${index + 2}`);
  const values = fields.map(field => normalized[field]);
  const { rows } = await pool.query(
    `UPDATE investor_profiles
     SET ${assignments.join(', ')}, updated_at = NOW()
     WHERE account_id = $1
     RETURNING *`,
    [accountId, ...values]
  );
  return rows[0];
}

module.exports = {
  getOrCreateInvestorProfile,
  updateInvestorProfile,
  validateUpdatePayload,
};
