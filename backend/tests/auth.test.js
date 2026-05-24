process.env.API_KEY = 'test-secret';
const { requireApiKey } = require('../src/middleware/auth');

function mockReqRes(headers = {}) {
  const req = { headers };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  return { req, res, next };
}

test('calls next() when API key is correct', () => {
  const { req, res, next } = mockReqRes({ 'x-api-key': 'test-secret' });
  requireApiKey(req, res, next);
  expect(next).toHaveBeenCalled();
  expect(res.status).not.toHaveBeenCalled();
});

test('returns 401 when API key is wrong', () => {
  const { req, res, next } = mockReqRes({ 'x-api-key': 'wrong-key' });
  requireApiKey(req, res, next);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(next).not.toHaveBeenCalled();
});

test('returns 401 when API key is missing', () => {
  const { req, res, next } = mockReqRes({});
  requireApiKey(req, res, next);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(next).not.toHaveBeenCalled();
});
