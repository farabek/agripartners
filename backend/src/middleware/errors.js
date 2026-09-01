function publicError(status, message, code = 'REQUEST_FAILED') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.expose = status < 500;
  return error;
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = Number.isInteger(err.status) ? err.status : 500;
  const requestId = req.requestId || null;
  console.error('[request.error]', {
    request_id: requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    code: err.code || 'INTERNAL_ERROR',
    message: err.message,
  });
  res.status(status).json({
    error: err.expose || status < 500 ? err.message : 'Internal server error',
    code: err.code || (status < 500 ? 'REQUEST_FAILED' : 'INTERNAL_ERROR'),
    ...(requestId ? { request_id: requestId } : {}),
  });
}

module.exports = { publicError, notFoundHandler, errorHandler };
