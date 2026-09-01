const AUTH_STORAGE_KEY = 'ap_auth';
const WALLET_AUTH_CHALLENGE_KEY = 'ap_wallet_auth_challenge';

export function getAuth() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setAuth(token, user) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
}

export function updateAuthUser(updates) {
  const auth = getAuth();
  if (auth) setAuth(auth.token, { ...auth.user, ...updates });
}

export function clearAuth() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(WALLET_AUTH_CHALLENGE_KEY);
}

export function authHeaders() {
  const auth = getAuth();
  return auth ? { Authorization: `Bearer ${auth.token}` } : {};
}

export function jsonAuthHeaders() {
  return { ...authHeaders(), 'Content-Type': 'application/json' };
}

export function saveWalletChallenge(challenge) {
  sessionStorage.setItem(WALLET_AUTH_CHALLENGE_KEY, JSON.stringify(challenge));
}

export function readWalletChallenge() {
  const raw = sessionStorage.getItem(WALLET_AUTH_CHALLENGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearWalletChallenge() {
  sessionStorage.removeItem(WALLET_AUTH_CHALLENGE_KEY);
}
