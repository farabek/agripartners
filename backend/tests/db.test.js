const pool = require('../src/db/index');

test('db exports a pg Pool with query method', () => {
  expect(typeof pool.query).toBe('function');
});

test('db returns the same instance on repeated requires', () => {
  const pool2 = require('../src/db/index');
  expect(pool).toBe(pool2);
});
