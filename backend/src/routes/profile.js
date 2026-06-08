const router = require('express').Router();
const profileService = require('../services/profileService');

function accountId(req) {
  return req.wallet.account_id;
}

function validationStatus(err) {
  if (/required|must be|not a valid|cannot be edited|payload must/i.test(err.message)) return 400;
  if (err.code === 'PROFILE_EXISTS') return 409;
  return 500;
}

router.get('/me', async (req, res) => {
  try {
    const profile = await profileService.getProfile(accountId(req));
    res.json({
      ok: true,
      profile,
      needsOnboarding: !profile,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/onboarding', async (req, res) => {
  try {
    const profile = await profileService.createOnboardingProfile(accountId(req), req.body);
    res.status(201).json({ ok: true, profile });
  } catch (err) {
    res.status(validationStatus(err)).json({ error: err.message });
  }
});

router.put('/me', async (req, res) => {
  try {
    const existing = await profileService.getProfile(accountId(req));
    if (!existing) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const profile = await profileService.updateProfile(accountId(req), req.body);
    res.json({ ok: true, profile });
  } catch (err) {
    res.status(validationStatus(err)).json({ error: err.message });
  }
});

module.exports = router;
