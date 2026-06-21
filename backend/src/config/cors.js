const LOCAL_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
];

const PRODUCTION_ORIGINS = [
  'https://frontend-omega-woad-90.vercel.app',
];

const DEFAULT_ALLOWED_ORIGINS = [...LOCAL_ORIGINS, ...PRODUCTION_ORIGINS];

function getAllowedOrigins(value = process.env.CORS_ORIGIN) {
  const configuredOrigins = value
    ? value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
    : [];

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins])];
}

function createCorsOptions(value = process.env.CORS_ORIGIN) {
  const allowedOrigins = new Set(getAllowedOrigins(value));

  return {
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  };
}

module.exports = {
  createCorsOptions,
  getAllowedOrigins,
  DEFAULT_ALLOWED_ORIGINS,
  LOCAL_ORIGINS,
  PRODUCTION_ORIGINS,
};
