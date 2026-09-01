const router = require('express').Router();
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const { requireJWT, requireRole } = require('../middleware/jwtAuth');
const { loginLimiter } = require('../middleware/security');

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, near_account: user.near_account || null },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  try {
    const user = await userService.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await userService.verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: signToken(user), user: { id: user.id, username: user.username, role: user.role, near_account: user.near_account || null } });
  } catch (err) {
    console.error('[auth.login] failed', { message: err.message });
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// Admin-only: create new users (farmer, investor, admin)
router.post('/register', requireJWT, requireRole('admin'), async (req, res) => {
  const { username, email, password, role, near_account } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'username, email, password, role are required' });
  }
  if (!['admin', 'farmer', 'investor'].includes(role)) {
    return res.status(400).json({ error: 'role must be admin, farmer, or investor' });
  }
  try {
    const user = await userService.createUser({ username, email, password, role, near_account });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    console.error('[auth.register] failed', { message: err.message });
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

module.exports = router;
