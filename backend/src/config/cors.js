const LOCAL_ORIGINS = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
];

function getAllowedOrigins(value = process.env.CORS_ORIGIN) {
  if (!value) return LOCAL_ORIGINS;

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function createCorsOptions(value = process.env.CORS_ORIGIN) {
  const allowedOrigins = new Set(getAllowedOrigins(value));

  return {
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  };
}

module.exports = { createCorsOptions, getAllowedOrigins, LOCAL_ORIGINS };
