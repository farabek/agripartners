const API_BASE = 'https://agripartners-zlp2.onrender.com';
const IS_PRODUCTION_BUILD = import.meta.env.PROD;
const NEAR_WALLET_NETWORK = 'testnet';
const MY_NEAR_WALLET_URL = 'https://testnet.mynearwallet.com';
const WALLET_AUTH_CHALLENGE_KEY = 'ap_wallet_auth_challenge';
const AUTH_STORAGE_KEY = 'ap_auth';
const LOCAL_MVP_ADMIN_WALLETS = ['farab.testnet'];
const INVESTOR_PROTECTION_MODELS = {
  fidlot: {
    key: 'fidlot',
    title: 'Fidlot v5.9',
    rate: 44,
    scheduledReserve: '$50,820',
    minimumReserve: '$10,000',
    investorPdfEn: 'assets/financial-models/en/Agri-Investor-Fidlot-v5.9-6040-EN.pdf',
    investorPdfRu: 'assets/financial-models/ru/Agri-Investor-Fidlot-v5.9-6040-RU.pdf',
    schedule: [
      ['Cycle 1', '$9,600', '$7,920', '$0', '$7,920', '$7,330'],
      ['Cycle 2', '$19,200', '$7,920', '$0', '$15,840', '$7,330'],
      ['Cycle 3', '$27,680', '$6,996', '$516', '$22,320', '$6,670'],
      ['Cycle 4', '$36,160', '$6,996', '$15,476', '$13,840', '$21,630'],
      ['Cycle 5', '$44,640', '$6,996', '$10,836', '$10,000', '$16,990'],
      ['Cycle 6', '$53,120', '$6,996', '$6,996', '$10,000', '$13,150'],
      ['Cycle 7', '$61,600', '$6,996', '$6,996', '$10,000', '$13,150'],
      ['Completion', '$82,000', '$0', '$10,000', '$0', '$10,000'],
    ],
  },
  hissar: {
    key: 'hissar',
    title: 'Hissar / VariantB v2.1',
    rate: 53,
    scheduledReserve: '$50,752.80',
    minimumReserve: '$10,000',
    investorPdfEn: 'assets/financial-models/en/Agri-Investor-VariantB-v2.1-6040-EN.pdf',
    investorPdfRu: 'assets/financial-models/ru/Agri-Investor-VariantB-v2.1-6040-RU.pdf',
    schedule: [
      ['Cycle 1', '$9,792', '$9,730.80', '$0', '$9,730.80', '$5,529.20'],
      ['Cycle 2', '$19,584', '$9,730.80', '$0', '$19,461.60', '$5,529.20'],
      ['Cycle 3', '$29,956', '$7,822.80', '$7,240.40', '$20,044', '$11,077.60'],
      ['Cycle 4', '$40,328', '$7,822.80', '$17,866.80', '$10,000', '$21,704'],
      ['Cycle 5', '$50,700', '$7,822.80', '$7,822.80', '$10,000', '$11,660'],
      ['Cycle 6', '$61,072', '$7,822.80', '$7,822.80', '$10,000', '$11,660'],
      ['Completion', '$81,672', '$0', '$10,000', '$0', '$16,000'],
    ],
  },
};

// --- Auth state ---

function getAuth() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem(AUTH_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Try the next storage backend.
    }
  }
  return null;
}

function setAuth(token, user) {
  const value = JSON.stringify({ token, user });
  try { localStorage.setItem(AUTH_STORAGE_KEY, value); } catch {}
  try { sessionStorage.setItem(AUTH_STORAGE_KEY, value); } catch {}
}

function updateAuthUser(updates) {
  const auth = getAuth();
  if (!auth) return;
  setAuth(auth.token, { ...auth.user, ...updates });
}

function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(WALLET_AUTH_CHALLENGE_KEY);
}

function authHeaders() {
  const auth = getAuth();
  return auth ? { Authorization: `Bearer ${auth.token}` } : {};
}

function jsonAuthHeaders() {
  return { ...authHeaders(), 'Content-Type': 'application/json' };
}

function isAdmin() {
  const user = getAuth()?.user;
  return user?.role === 'admin' || isAdminWalletUser(user);
}

function isWalletAuth() {
  return getAuth()?.user?.auth_type === 'wallet';
}

function getConnectedWalletAccount() {
  const user = getAuth()?.user;
  if (user?.auth_type !== 'wallet') return '';
  return user.account_id || user.near_account || '';
}

function getNearWalletAccount() {
  return getConnectedWalletAccount();
}

function isLocalMvpHost() {
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function isAdminWalletUser(user) {
  const accountId = user?.account_id || user?.near_account || user?.username;
  return isLocalMvpHost() && LOCAL_MVP_ADMIN_WALLETS.includes(accountId);
}

function portalHashForRole(role) {
  if (role === 'farmer') return '#farmer';
  if (role === 'investor') return '#investor';
  if (role === 'admin') return '#admin';
  return '#deals';
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.error || `Request failed with ${response.status}`);
  }
  return data;
}

async function readJsonResponse(response) {
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`Expected JSON from ${response.url}; received ${contentType || 'unknown content type'}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from ${response.url}`);
  }
}

function walletCallbackUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function redirectToWalletMessageSigning({ message, nonceBase64, recipient, callbackUrl }) {
  if (!nonceBase64 || atob(nonceBase64).length !== 32) {
    throw new Error('Challenge nonce must decode to exactly 32 bytes');
  }

  const walletUrl = new URL('/sign-message', MY_NEAR_WALLET_URL);
  walletUrl.searchParams.set('message', message);
  walletUrl.searchParams.set('nonce', nonceBase64);
  walletUrl.searchParams.set('recipient', recipient);
  walletUrl.searchParams.set('callbackUrl', callbackUrl);
  window.location.assign(walletUrl.toString());
}

function readWalletCallbackParams() {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const hashParams = new URLSearchParams(hash);

  for (const [key, value] of hashParams.entries()) {
    if (!params.has(key)) params.set(key, value);
  }

  return Object.fromEntries(params.entries());
}

function cleanWalletAuthCallbackUrl(targetHash = '#investor') {
  const url = new URL(window.location.href);
  ['accountId', 'account_id', 'publicKey', 'public_key', 'signature', 'callbackUrl', 'state'].forEach(key => {
    url.searchParams.delete(key);
  });
  url.hash = targetHash;
  window.history.replaceState({}, document.title, url.toString());
}

function buildWalletUser(verified) {
  return {
    role: 'wallet',
    username: verified.account_id,
    auth_type: 'wallet',
    account_id: verified.account_id,
    near_account: verified.account_id,
    public_key: verified.public_key,
    network: verified.network,
  };
}

async function fetchMyProfile() {
  const res = await fetch(`${API_BASE}/api/profile/me`, { headers: authHeaders() });
  const data = await readJsonResponse(res);
  if (res.status === 401) {
    clearAuth();
    location.hash = '#login';
    throw new Error('Alpha portal session expired');
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function applyProfileToAuth(profile) {
  if (!profile) return;
  updateAuthUser({
    role: profile.role,
    display_name: profile.displayName,
    profile,
  });
}

async function resolveWalletLandingHash() {
  const data = await fetchMyProfile();
  if (data.needsOnboarding || !data.profile) return '#/onboarding';
  applyProfileToAuth(data.profile);
  return portalHashForRole(data.profile.role);
}

async function loginWithNearWallet() {
  const challenge = await postJson('/api/wallet-auth/challenge');
  challenge.callbackUrl = walletCallbackUrl();
  localStorage.setItem(WALLET_AUTH_CHALLENGE_KEY, JSON.stringify(challenge));
  redirectToWalletMessageSigning({
    message: challenge.message,
    recipient: challenge.recipient,
    nonceBase64: challenge.nonceBase64,
    callbackUrl: challenge.callbackUrl,
  });
}

async function verifyWalletCallbackIfPresent() {
  const params = readWalletCallbackParams();
  if (!params.signature) return false;

  try {
    const challengeRaw = localStorage.getItem(WALLET_AUTH_CHALLENGE_KEY);
    if (!challengeRaw) throw new Error('Wallet challenge was not found. Please try logging in again.');
    const challenge = JSON.parse(challengeRaw);
    const verified = await postJson('/api/wallet-auth/verify', {
      account_id: params.accountId || params.account_id,
      public_key: params.publicKey || params.public_key,
      signature: params.signature?.replace(/ /g, '+'),
      nonce: challenge.nonce,
      callbackUrl: challenge.callbackUrl || walletCallbackUrl(),
    });

    if (!verified.token) throw new Error('Wallet verification did not return a token');
    setAuth(verified.token, buildWalletUser(verified));
    localStorage.removeItem(WALLET_AUTH_CHALLENGE_KEY);
    const targetHash = await resolveWalletLandingHash();
    cleanWalletAuthCallbackUrl(targetHash);
    return true;
  } catch (err) {
    localStorage.removeItem(WALLET_AUTH_CHALLENGE_KEY);
    cleanWalletAuthCallbackUrl();
    sessionStorage.setItem('ap_login_error', err.message || 'Wallet login failed');
    return false;
  }
}

// --- Utilities ---

function yoctoToNear(yocto) {
  if (!yocto || yocto === '0') return '0.00 NEAR';
  const n = BigInt(yocto);
  const one = BigInt('1000000000000000000000000');
  const whole = n / one;
  const frac = (n % one) * 100n / one;
  return `${whole}.${frac.toString().padStart(2, '0')} NEAR`;
}

function yoctoToNearFloat(yocto) {
  if (!yocto || yocto === '0') return 0;
  const n = BigInt(yocto);
  const one = BigInt('1000000000000000000000000');
  const whole = Number(n / one);
  const frac = Number((n % one) * 10000n / one) / 10000;
  return whole + frac;
}

function formatYoctoRaw(yocto) {
  return `${yocto || '0'} yoctoNEAR`;
}

function addYocto(a, b) {
  return (BigInt(a || '0') + BigInt(b || '0')).toString();
}

function hasPositiveYocto(value) {
  return BigInt(value || '0') > 0n;
}

function nearToYocto(near) {
  const value = String(near || '').trim();
  if (!/^\d+(\.\d{1,24})?$/.test(value)) {
    throw new Error('Enter a valid NEAR amount with up to 24 decimal places');
  }
  const [whole, frac = ''] = value.split('.');
  return (BigInt(whole) * BigInt('1000000000000000000000000')
    + BigInt(frac.padEnd(24, '0'))).toString();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatAddress(addr) {
  if (!addr) return '—';
  if (addr.length <= 20) return addr;
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

function statusBadge(status) {
  if (!status) return '<span class="badge badge-Unknown">Unknown</span>';
  return `<span class="badge badge-${status}">${status}</span>`;
}

// --- Router ---

function showView(viewId) {
  ['view-home', 'view-login', 'view-list', 'view-detail', 'view-marketplace', 'view-presentation', 'view-investor', 'view-farmer', 'view-admin', 'view-onboarding', 'view-platform'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(viewId).classList.remove('hidden');
}

// --- Presentation Mode ---

const PRESENTATION_SETTINGS_KEY = 'ap_presentation_settings';
const DEFAULT_PRESENTATION_SETTINGS = {
  presenterMode: true,
  showTimeline: true,
  showProgress: true,
};

const PRESENTATION_PROFILES = {
  investor: {
    id: 'investor',
    title: 'Investor',
    description: 'A guided journey through an agricultural investment Project, Farmer Reports, and Settlement readiness.',
    audience: 'Private investors, funds, angels, and pilot backers',
    objective: 'Help investors understand exactly what happened to their investment from opportunity to recorded return.',
    estimatedDuration: '~5 minutes',
    defaultFlow: 'quickDemo',
    focus: ['Investment Model', 'Project Progress', 'Farmer Reports', 'Return lifecycle', 'Settlement readiness'],
    stepOverrides: {},
    flows: {
      quickDemo: {
        id: 'quickDemo',
        title: 'Investor Quick Demo',
        duration: '~5 minutes',
        banner: 'Investor Quick Demo · Alpha v1.2 · NEAR Testnet · Demo-safe',
        steps: [
          {
            title: 'Welcome',
            audienceQuestion: 'What is AgriPartners, and what am I about to see?',
            keyMessage: 'AgriPartners turns agricultural pilot investments into a guided, transparent capital journey.',
            targetRoute: '#home',
            targetLabel: 'Open Landing',
            presenterNote: 'Frame this as Alpha/Testnet presentation mode, not production investor onboarding.',
            nextLabel: 'Next: See opportunities',
            topics: ['Alpha v1.2', 'NEAR Testnet', 'Demo-safe workflow'],
          },
          {
            title: 'Opportunity',
            audienceQuestion: 'Which pilot opportunities can I compare?',
            keyMessage: 'The Opportunity Catalog presents two flagship $50,000 Investment Models: Hissar Sheep and Feedlot/Fidlot livestock.',
            targetRoute: '#/marketplace',
            targetLabel: 'Open Opportunity Catalog',
            presenterNote: 'Keep the focus on comparable investment terms: amount, cycles, projected ROI, and status.',
            nextLabel: 'Next: Review investment terms',
            topics: ['Opportunity Catalog', 'Feedlot/Fidlot', 'Hissar Sheep'],
          },
          {
            title: 'Investment Terms',
            audienceQuestion: 'What exactly would I be investing in?',
            keyMessage: 'The Hissar pilot shows the investment amount, projected payout, cycles, status, and farmer-facing context.',
            targetRoute: '#/investor/pilots/hissar',
            targetLabel: 'Open Hissar Pilot',
            presenterNote: 'Use Hissar first because it is active and makes the progress story easier to understand.',
            nextLabel: 'Next: Follow farmer progress',
            topics: ['Projected Return', 'Investment amount', 'Pilot cycles'],
          },
          {
            title: 'Farmer Progress',
            audienceQuestion: 'What happens after capital reaches the farmer workflow?',
            keyMessage: 'Farmer progress connects the investment to cycle status, funding confirmation, and operating updates.',
            targetRoute: '#farmer/pilots/hissar',
            targetLabel: 'Open Farmer Progress',
            presenterNote: 'Avoid technical identity details. Explain that this is the operating side of the same investment story.',
            nextLabel: 'Next: Show recorded returns',
            topics: ['Farmer reports', 'Funding confirmation', 'Production cycle'],
          },
          {
            title: 'Returns Recorded',
            audienceQuestion: 'How do I see what has been returned or remains outstanding?',
            keyMessage: 'The completed Feedlot/Fidlot pilot shows recorded returns, projected payout, outstanding amount, and return progress.',
            targetRoute: '#/investor/pilots/fidlot',
            targetLabel: 'Open Feedlot/Fidlot Returns',
            presenterNote: 'Say recorded and projected carefully. Do not describe Alpha records as guaranteed production settlement.',
            nextLabel: 'Next: Explain Treasury transparency',
            topics: ['Projected vs Recorded', 'Recorded returns', 'Outstanding payout'],
          },
          {
            title: 'Treasury Transparency',
            audienceQuestion: 'What accounting trail exists behind a recorded return?',
            keyMessage: 'Treasury Shadow Mode records an append-only accounting trail without yet controlling production payouts.',
            targetRoute: '#admin/treasury',
            targetLabel: 'Open Treasury Dashboard',
            presenterNote: 'If not signed in as admin, stay on this card and explain the concept without forcing login.',
            nextLabel: 'Next: Discuss Settlement readiness',
            topics: ['Treasury Shadow Mode', 'Append-only trail', 'Duplicate-safe records'],
          },
          {
            title: 'Settlement Readiness',
            audienceQuestion: 'When can an Investor receive Settlement?',
            keyMessage: 'Settlement readiness depends on approved payment status and reconciliation controls.',
            targetRoute: '#investor',
            targetLabel: 'Open Investor Portal',
            presenterNote: 'Position the Testnet action as infrastructure validation, not production Settlement authority or direct Farmer interaction.',
            nextLabel: 'Next: Summarize the story',
            topics: ['Recorded vs Paid', 'Reconciliation', 'Investor Settlement'],
          },
          {
            title: 'Summary / Next Steps',
            audienceQuestion: 'What should I remember from this demo?',
            keyMessage: 'AgriPartners already connects opportunity, farmer progress, recorded returns, and Treasury-ready accounting in one guided story.',
            targetRoute: '#/marketplace',
            targetLabel: 'Return to Opportunity Catalog',
            presenterNote: 'Close with Beta focus: clarity, trust, reconciliation, and production readiness.',
            nextLabel: 'Restart demo',
            topics: ['Beta roadmap', 'Investor trust', 'Production readiness'],
          },
        ],
      },
    },
  },
};

PRESENTATION_PROFILES.near = {
  id: 'near',
  title: 'NEAR Foundation',
  description: 'A Testnet and architecture-focused version for ecosystem reviewers.',
  audience: 'NEAR ecosystem, grants, developer relations, and infrastructure reviewers',
  objective: 'Show how AgriPartners uses NEAR Testnet, wallet access, blockchain evidence, and Treasury roadmap discipline.',
  estimatedDuration: '~7 minutes',
  defaultFlow: 'quickDemo',
  focus: ['Wallet authentication', 'NEAR Testnet', 'Blockchain evidence', 'Architecture', 'Treasury roadmap'],
  stepOverrides: {
    Welcome: {
      audienceQuestion: 'What real-world workflow is AgriPartners validating on NEAR Testnet?',
      keyMessage: 'AgriPartners uses NEAR Testnet to validate agricultural investment workflows before production settlement.',
      presenterNote: 'Lead with business utility, then explain why NEAR is useful as evidence and access infrastructure.',
      transition: 'Next: show the Opportunity Catalog that gives the Testnet workflow a real use case.',
    },
    Opportunity: {
      keyMessage: 'The Opportunity Catalog gives NEAR infrastructure a concrete agricultural Project use case instead of an abstract demo.',
      presenterNote: 'Point out that the same screens are reused; the NEAR profile changes emphasis, not functionality.',
    },
    'Investment Terms': {
      audienceQuestion: 'Where does wallet-linked investor context meet pilot investment terms?',
      keyMessage: 'The Investor Project screen connects Investment Model economics to platform infrastructure on NEAR Testnet.',
      transition: 'Next: follow the off-chain operating workflow that surrounds the Testnet references.',
    },
    'Farmer Progress': {
      keyMessage: 'Farmer reports show the real-world activity that blockchain references alone cannot explain.',
      presenterNote: 'Use this step to separate blockchain evidence from agricultural operating evidence.',
    },
    'Returns Recorded': {
      keyMessage: 'Recorded Return visibility shows how AgriPartners avoids overstating blockchain evidence before reconciliation.',
      presenterNote: 'Emphasize conservative semantics: recorded is not automatically paid or reconciled.',
    },
    'Treasury Transparency': {
      audienceQuestion: 'How does the architecture prepare for reliable settlement and reconciliation?',
      keyMessage: 'Treasury Shadow Mode creates an append-only accounting trail that can later be reconciled with blockchain evidence.',
      presenterNote: 'This is the key NEAR Foundation architecture moment. Keep it high level unless asked for details.',
      transition: 'Next: connect Treasury discipline to future Settlement readiness.',
    },
    'Settlement Readiness': {
      keyMessage: 'Settlement readiness depends on payment status, reconciliation, and future production provider decisions.',
    },
    'Summary / Next Steps': {
      keyMessage: 'The NEAR story is applied infrastructure: wallet access, Testnet validation, evidence references, and a Treasury roadmap.',
      presenterNote: 'Close by asking for feedback on Testnet evidence, indexer/reconciliation strategy, and grant fit.',
    },
  },
};

PRESENTATION_PROFILES.accelerator = {
  id: 'accelerator',
  title: 'Accelerator',
  description: 'A product maturity and startup execution version for accelerator evaluators.',
  audience: 'Accelerator reviewers, mentors, demo day judges, and startup program teams',
  objective: 'Show a working Alpha with clear market problem, pilot validation, product maturity, and Beta roadmap.',
  estimatedDuration: '~6 minutes',
  defaultFlow: 'quickDemo',
  focus: ['Market problem', 'Product maturity', 'Pilot validation', 'Roadmap', 'Team execution'],
  stepOverrides: {
    Welcome: {
      audienceQuestion: 'What problem is this startup solving?',
      keyMessage: 'AgriPartners makes agricultural investment workflows understandable, trackable, and demo-ready for stakeholders.',
      presenterNote: 'Keep this crisp: problem, product, traction signal, roadmap.',
    },
    Opportunity: {
      audienceQuestion: 'Is there a clear market wedge?',
      keyMessage: 'Two pilot models show a focused wedge: structured agricultural capital workflows with comparable investment terms.',
    },
    'Investment Terms': {
      keyMessage: 'The product already presents investment terms, projected return, and pilot context in a structured Alpha experience.',
      transition: 'Next: show that this is not only a pitch deck; farmer workflow exists too.',
    },
    'Farmer Progress': {
      keyMessage: 'Farmer Reports show operational depth within AgriPartners-managed Projects.',
      presenterNote: 'Explain that Farmers work through AgriPartners as Project Operator, not directly with Investors.',
    },
    'Returns Recorded': {
      keyMessage: 'Recorded Return visibility shows a mature approach to financial language and investor trust.',
    },
    'Treasury Transparency': {
      keyMessage: 'Treasury Transparency gives the roadmap credibility beyond a lightweight Opportunity Catalog UI.',
    },
    'Settlement Readiness': {
      keyMessage: 'Settlement readiness is framed honestly as Alpha/Testnet infrastructure maturity, not premature production payout.',
    },
    'Summary / Next Steps': {
      audienceQuestion: 'Why is this team ready for the next stage?',
      keyMessage: 'AgriPartners has working Alpha surfaces, pilot economics, reporting, returns visibility, and a practical Beta roadmap.',
      presenterNote: 'Close on execution: current product exists, next work is presentation polish and trust depth.',
    },
  },
};

PRESENTATION_PROFILES.enterprise = {
  id: 'enterprise',
  title: 'Enterprise Partner',
  description: 'An operations, reporting, auditability, and integration-focused version for strategic partners.',
  audience: 'Agribusiness partners, cooperatives, banks, operators, and enterprise innovation teams',
  objective: 'Show how AgriPartners can support operational transparency, reporting, Treasury controls, and future integrations.',
  estimatedDuration: '~8 minutes',
  defaultFlow: 'quickDemo',
  focus: ['Operational workflows', 'Auditability', 'Reporting', 'Treasury controls', 'Future integrations'],
  stepOverrides: {
    Welcome: {
      audienceQuestion: 'How could this support an enterprise agricultural finance workflow?',
      keyMessage: 'AgriPartners organizes capital, farmer operations, reports, returns, and Treasury visibility into one workflow.',
      presenterNote: 'Frame the demo as partner-operating infrastructure, not a retail investor app.',
    },
    Opportunity: {
      keyMessage: 'Pilot opportunities show how partner-backed agricultural programs can be packaged and reviewed consistently.',
    },
    'Investment Terms': {
      keyMessage: 'Structured terms make enterprise review easier: investment amount, cycles, projected return, and status are explicit.',
    },
    'Farmer Progress': {
      audienceQuestion: 'Can operators see what is happening in the field?',
      keyMessage: 'Farmer progress and reporting create an operating layer for partner oversight.',
      presenterNote: 'Spend more time here for enterprise audiences than for investors.',
    },
    'Returns Recorded': {
      keyMessage: 'Recorded Return status gives partners a controlled way to discuss outcomes without overstating settlement.',
    },
    'Treasury Transparency': {
      audienceQuestion: 'Where do auditability and Treasury controls fit?',
      keyMessage: 'Treasury Transparency is the bridge from operational workflow to auditable financial controls.',
      presenterNote: 'This is the enterprise anchor. Avoid raw account codes unless asked.',
    },
    'Settlement Readiness': {
      keyMessage: 'Settlement readiness highlights the need for partner-specific controls, reconciliation, and production integrations.',
    },
    'Summary / Next Steps': {
      keyMessage: 'The enterprise opportunity is a repeatable operating layer for agricultural capital, reporting, Treasury, and integrations.',
      presenterNote: 'Close by asking which partner systems, reports, and approval workflows matter most.',
    },
  },
};

const PRESENTATION_PROFILE_ORDER = ['investor', 'near', 'accelerator', 'enterprise'];

let activePresentationStepIndex = 0;
let activePresentationProfileId = 'investor';
let presentationSettings = loadPresentationSettings();

const PRESENTATION_STEP_DETAILS = {
  Welcome: {
    icon: 'AP',
    shortDescription: 'Set the Alpha Demo frame.',
    whyItMatters: 'The investor starts with the business story before any technical detail.',
    transition: 'Next: compare the pilot opportunities prepared for investor review.',
    metrics: ['Alpha Demo', 'NEAR Testnet', '~5 minutes'],
    speakingTips: ['Say Alpha Demo early and calmly.', 'Do not open with blockchain mechanics.'],
    expectedQuestions: ['Is this production?', 'Is live money involved?'],
    reminders: ['Use demo-safe language throughout.'],
    technicalAppendixLinks: [{ label: 'Landing', route: '#home' }],
  },
  Opportunity: {
    icon: 'OP',
    shortDescription: 'Compare flagship pilot models.',
    whyItMatters: 'Investors need comparable terms before they care about workflow depth.',
    transition: 'Next: open the active Hissar pilot and review the investment terms.',
    metrics: ['$50,000 Investment', '2 Pilot Models', '~63-64% Projected Return'],
    speakingTips: ['Name both pilots.', 'Keep returns framed as projected unless discussing the completed demo story.'],
    expectedQuestions: ['Are these real pilots?', 'Why these two models?'],
    reminders: ['Avoid saying guaranteed return.'],
    technicalAppendixLinks: [{ label: 'Opportunity Catalog', route: '#/marketplace' }],
  },
  'Investment Terms': {
    icon: '$',
    shortDescription: 'Review amount, cycles, and projected return.',
    whyItMatters: 'Clear terms create confidence before the investor follows capital into operations.',
    transition: 'Next: see how the farmer uses invested capital.',
    metrics: ['$50,000 Investment', '6 Cycles', '63.3% Projected Return'],
    speakingTips: ['Point to investment size first.', 'Use Projected Return, not realized return.'],
    expectedQuestions: ['How is projected return calculated?', 'What is the cycle length?'],
    reminders: ['Do not change or reinterpret financial formulas.'],
    technicalAppendixLinks: [{ label: 'Hissar investor pilot', route: '#/investor/pilots/hissar' }],
  },
  'Farmer Progress': {
    icon: 'FR',
    shortDescription: 'Follow funding and operating progress.',
    whyItMatters: 'The platform links capital to production activity, not just a static investment card.',
    transition: 'Next: review the completed pilot return record.',
    metrics: ['Funding Confirmed', 'Cycle Active', 'Farmer Report'],
    speakingTips: ['Present the farmer view as operational context.', 'Keep wallet IDs out of the story.'],
    expectedQuestions: ['Who validates reports?', 'Can farmers upload evidence?'],
    reminders: ['Reports are Alpha records, not verified oracle data.'],
    technicalAppendixLinks: [{ label: 'Farmer pilot view', route: '#farmer/pilots/hissar' }],
  },
  'Returns Recorded': {
    icon: 'RT',
    shortDescription: 'Show recorded return activity.',
    whyItMatters: 'Investors need to see outcomes without confusing recorded activity with production settlement.',
    transition: 'Next: show the Treasury transparency layer behind recorded returns.',
    metrics: ['$82,000 Recorded Return', '64% Return', '7 Cycles'],
    speakingTips: ['Use Recorded Return and Projected Return consistently.', 'Explain Paid Return and Reconciled Return as future maturity states when asked.'],
    expectedQuestions: ['Is this paid?', 'Is this reconciled on-chain?'],
    reminders: ['Recorded Return is not automatically Paid Return or Reconciled Return.'],
    technicalAppendixLinks: [{ label: 'Feedlot/Fidlot investor pilot', route: '#/investor/pilots/fidlot' }],
  },
  'Treasury Transparency': {
    icon: 'TR',
    shortDescription: 'Explain the accounting trail.',
    whyItMatters: 'Treasury shows the path toward auditability while keeping Alpha Demo claims conservative.',
    transition: 'Next: explain what must be true before Settlement is ready.',
    metrics: ['Treasury Transparency', 'Shadow Mode', 'Append-only Trail'],
    speakingTips: ['Describe Treasury as the accounting trail.', 'Avoid account codes unless the audience asks.'],
    expectedQuestions: ['Does Treasury control payouts now?', 'What does Shadow Mode mean?'],
    reminders: ['Shadow Mode observes and records; it does not enforce payouts yet.'],
    technicalAppendixLinks: [{ label: 'Admin Treasury route', route: '#admin/treasury' }],
  },
  'Settlement Readiness': {
    icon: 'WD',
    shortDescription: 'Clarify payout readiness.',
    whyItMatters: 'The investor should understand payout maturity without assuming production custody is live.',
    transition: 'Next: summarize the complete investment story.',
    metrics: ['Settlement Ready Path', 'Paid Return', 'Reconciled Return'],
    speakingTips: ['Separate availability from production payout authority.', 'Use the roadmap if asked about mainnet.'],
    expectedQuestions: ['Can the Investor receive Settlement today?', 'What controls are missing for production?'],
    reminders: ['No production payout claim in Alpha Demo.'],
    technicalAppendixLinks: [{ label: 'Investor portal', route: '#investor' }],
  },
  'Summary / Next Steps': {
    icon: 'NX',
    shortDescription: 'Close with the investment story.',
    whyItMatters: 'The closing ties product clarity to the Beta path: trust, reconciliation, and production readiness.',
    transition: 'Next: restart the quick demo or open the Opportunity Catalog for discussion.',
    metrics: ['1 Guided Story', '2 Pilot Models', 'Beta Readiness'],
    speakingTips: ['Summarize the capital journey in one sentence.', 'Invite questions by audience type.'],
    expectedQuestions: ['What is next for Beta?', 'What would make this production-ready?'],
    reminders: ['End with confidence and clear next steps.'],
    technicalAppendixLinks: [{ label: 'Opportunity Catalog discussion point', route: '#/marketplace' }],
  },
};

function loadPresentationSettings() {
  try {
    const raw = localStorage.getItem(PRESENTATION_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_PRESENTATION_SETTINGS };
    return { ...DEFAULT_PRESENTATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PRESENTATION_SETTINGS };
  }
}

function savePresentationSettings(settings) {
  presentationSettings = { ...DEFAULT_PRESENTATION_SETTINGS, ...settings };
  try {
    localStorage.setItem(PRESENTATION_SETTINGS_KEY, JSON.stringify(presentationSettings));
  } catch {}
  return presentationSettings;
}

function presentationProfile(profileId = activePresentationProfileId) {
  return PRESENTATION_PROFILES[profileId] || PRESENTATION_PROFILES.investor;
}

function presentationProfileUrl(profileId) {
  return `#demo/presentation/${profileId}`;
}

function presentationFlow(profileId = activePresentationProfileId) {
  const profile = presentationProfile(profileId);
  const baseFlow = PRESENTATION_PROFILES.investor.flows.quickDemo;
  return {
    ...baseFlow,
    title: `${profile.title} Quick Demo`,
    duration: profile.estimatedDuration,
    profileId: profile.id,
  };
}

function enrichedPresentationStep(step, profileId = activePresentationProfileId) {
  const profile = presentationProfile(profileId);
  const overrides = profile.stepOverrides?.[step.title] || {};
  return { ...step, ...(PRESENTATION_STEP_DETAILS[step.title] || {}), ...overrides };
}

function presentationProgress(flow, stepIndex, profileId = activePresentationProfileId) {
  const total = flow.steps.length;
  const completionPercent = Math.round(((stepIndex + 1) / total) * 100);
  const remainingSteps = flow.steps.slice(stepIndex + 1).map(step => enrichedPresentationStep(step, profileId));
  const remainingMinutes = remainingSteps.reduce((sum, step) => {
    const value = step.estimatedMinutes ?? (PRESENTATION_STEP_DETAILS[step.title] ? 0.6 : 0.5);
    return sum + value;
  }, 0);
  return {
    label: `Step ${stepIndex + 1} of ${total}`,
    completionPercent,
    remainingLabel: remainingMinutes <= 0 ? 'Wrap-up' : `approx ${Math.max(1, Math.round(remainingMinutes))} minutes remaining`,
  };
}

function presentationStepStatus(index, activeIndex) {
  if (index < activeIndex) return 'completed';
  if (index === activeIndex) return 'current';
  return 'upcoming';
}

function investorQuickDemoFlow() {
  return presentationFlow('investor');
}

function showInvestorPresentation(stepIndex = activePresentationStepIndex, profileId = activePresentationProfileId) {
  showView('view-presentation');
  const el = document.getElementById('view-presentation');
  const profile = presentationProfile(profileId);
  const flow = presentationFlow(profile.id);
  activePresentationProfileId = profile.id;
  activePresentationStepIndex = Math.max(0, Math.min(flow.steps.length - 1, stepIndex));
  renderInvestorPresentationShell(el, flow, activePresentationStepIndex, profile);
}

function renderInvestorPresentationShell(el, flow, stepIndex, profile = presentationProfile()) {
  const step = enrichedPresentationStep(flow.steps[stepIndex], profile.id);
  const settings = presentationSettings;
  const progress = presentationProgress(flow, stepIndex, profile.id);
  el.innerHTML = `
    ${renderNav()}
    <section class="bg-slate-950 border border-green-900 rounded-xl overflow-hidden">
      <div class="bg-green-950/70 border-b border-green-900 px-4 py-3 text-sm font-semibold text-green-100">
        Investor Quick Demo | Alpha v1.2 | NEAR Testnet | Demo-safe
      </div>
      <div class="grid lg:grid-cols-[320px_1fr]">
        <aside class="${settings.showTimeline ? '' : 'hidden'} border-b lg:border-b-0 lg:border-r border-slate-800 p-4 bg-slate-900/70">
          <div class="mb-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">Presentation Mode</p>
            <h1 class="text-xl font-bold text-slate-50">${escapeHtml(flow.title)}</h1>
            <p class="text-sm text-slate-400">${escapeHtml(flow.duration)}</p>
          </div>
          ${renderPresentationTimeline(flow.steps.map(item => enrichedPresentationStep(item, profile.id)), stepIndex)}
        </aside>
        <main class="p-5 md:p-7">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              ${settings.showProgress ? renderPresentationProgress(progress) : ''}
              <h2 class="text-3xl font-bold text-green-300 mt-1">${escapeHtml(step.title)}</h2>
              <p class="text-sm text-slate-400 mt-2 max-w-2xl">${escapeHtml(step.shortDescription || '')}</p>
            </div>
            <a href="${escapeHtml(step.targetRoute)}" class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition">${escapeHtml(step.targetLabel)}</a>
          </div>
          ${renderPresentationAudienceSelector(profile)}
          ${renderPresentationAudienceSummary(profile)}
          ${renderPresentationSettings(settings)}
          ${renderPresentationStepContent(step, stepIndex)}
          ${renderPresentationNavigation(flow.steps, stepIndex, profile.id)}
        </main>
      </div>
    </section>
  `;
  bindPresentationControls(flow);
}

function renderPresentationAudienceSelector(activeProfile) {
  return `
    <section class="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6" data-presentation-audience-selector>
      <p class="text-sm font-semibold text-slate-100 mb-3">Presentation Audience</p>
      <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-2" role="radiogroup" aria-label="Presentation Audience">
        ${PRESENTATION_PROFILE_ORDER.map(profileId => {
          const profile = presentationProfile(profileId);
          return `
            <label class="bg-slate-950 border ${profile.id === activeProfile.id ? 'border-green-700 text-green-100' : 'border-slate-800 text-slate-300'} rounded-lg px-3 py-2 text-sm cursor-pointer">
              <input type="radio" name="presentation-profile" value="${escapeHtml(profile.id)}" ${profile.id === activeProfile.id ? 'checked' : ''} class="presentation-setting-input mr-2">
              <span>${escapeHtml(profile.title)}</span>
            </label>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderPresentationAudienceSummary(profile) {
  return `
    <section class="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6" data-presentation-audience-summary>
      <div class="grid lg:grid-cols-[1fr_1.2fr] gap-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-500">Audience</p>
          <h2 class="text-xl font-bold text-slate-50">${escapeHtml(profile.title)}</h2>
          <p class="text-sm text-slate-400 mt-1">${escapeHtml(profile.description)}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-500">Today's focus</p>
          <div class="flex flex-wrap gap-2 mt-2">
            ${profile.focus.map(item => `<span class="text-xs bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded">${escapeHtml(item)}</span>`).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderPresentationProgress(progress) {
  return `
    <div class="flex flex-wrap items-center gap-3 text-sm" data-presentation-progress>
      <span class="text-slate-300">${escapeHtml(progress.label)}</span>
      <span class="text-green-300 font-semibold" data-presentation-percent>${escapeHtml(progress.completionPercent)}%</span>
      <span class="text-slate-500" data-presentation-remaining>${escapeHtml(progress.remainingLabel)}</span>
    </div>
  `;
}

function renderPresentationTimeline(steps, activeIndex) {
  return `
    <nav aria-label="Investor Quick Demo timeline" class="presentation-timeline" data-presentation-timeline data-presentation-stepper>
      ${steps.map((step, index) => `
        <button
          type="button"
          data-presentation-jump="${index}"
          data-presentation-status="${presentationStepStatus(index, activeIndex)}"
          class="presentation-timeline-step ${presentationStepStatus(index, activeIndex)}"
        >
          <span class="presentation-timeline-icon" aria-hidden="true">${escapeHtml(step.icon || String(index + 1))}</span>
          <span class="presentation-timeline-copy">
            <span class="presentation-timeline-status">${escapeHtml(presentationStepStatus(index, activeIndex))}</span>
            <span class="presentation-timeline-title">${escapeHtml(step.title)}</span>
            <span class="presentation-timeline-description">${escapeHtml(step.shortDescription || '')}</span>
          </span>
        </button>
      `).join('')}
    </nav>
  `;
}

function renderPresentationSettings(settings) {
  return `
    <form id="presentation-settings" class="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6" data-presentation-settings>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-slate-100">Presentation Settings</p>
          <p class="text-xs text-slate-500">Stored locally on this browser only.</p>
        </div>
        <div class="flex flex-wrap gap-3 text-sm">
          ${renderPresentationSettingToggle('presenterMode', 'Presenter Mode', settings.presenterMode)}
          ${renderPresentationSettingToggle('showTimeline', 'Show Timeline', settings.showTimeline)}
          ${renderPresentationSettingToggle('showProgress', 'Show Progress', settings.showProgress)}
        </div>
      </div>
    </form>
  `;
}

function renderPresentationSettingToggle(name, label, checked) {
  return `
    <label class="inline-flex items-center gap-2 text-slate-300">
      <input type="checkbox" name="${escapeHtml(name)}" ${checked ? 'checked' : ''} class="presentation-setting-input">
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function renderPresentationStepContent(step, stepIndex) {
  const treasuryFallback = step.title === 'Treasury Transparency' && !isAdmin()
    ? '<p class="text-sm text-amber-200 bg-amber-950 border border-amber-800 rounded-lg px-3 py-2 mt-4">Treasury Dashboard is admin-authenticated. For non-admin demos, use this step as the plain-language Treasury explanation.</p>'
    : '';
  return `
    <div class="grid gap-4 mb-6">
      ${renderPresentationMetrics(step)}
      <article class="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <p class="text-xs uppercase tracking-wide text-slate-500 mb-2">Audience question</p>
        <p class="text-xl font-semibold text-slate-50">${escapeHtml(step.audienceQuestion)}</p>
      </article>
      <article class="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <p class="text-xs uppercase tracking-wide text-slate-500 mb-2">Key message</p>
        <p class="text-lg text-slate-200">${escapeHtml(step.keyMessage)}</p>
        ${treasuryFallback}
      </article>
      <article class="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <p class="text-xs uppercase tracking-wide text-slate-500 mb-2">Why it matters</p>
        <p class="text-base text-slate-200">${escapeHtml(step.whyItMatters || '')}</p>
      </article>
      <article class="bg-slate-900 border border-slate-700 rounded-xl p-5">
        <p class="text-xs uppercase tracking-wide text-slate-500 mb-2">What comes next</p>
        <p class="text-base text-slate-200">${escapeHtml(step.transition || step.nextLabel)}</p>
      </article>
      ${presentationSettings.presenterMode ? renderPresenterNotesPanel(step) : ''}
      <article class="bg-slate-900 border border-slate-700 rounded-xl p-5">
        <p class="text-xs uppercase tracking-wide text-slate-500 mb-2">Conversation topics</p>
        <div class="flex flex-wrap gap-2" data-presentation-topics="${stepIndex}">
          ${step.topics.map(topic => `<span class="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded">${escapeHtml(topic)}</span>`).join('')}
        </div>
      </article>
    </div>
  `;
}

function renderPresentationMetrics(step) {
  const metrics = Array.isArray(step.metrics) ? step.metrics.slice(0, 3) : [];
  if (!metrics.length) return '';
  return `
    <div class="grid sm:grid-cols-3 gap-3" data-presentation-metrics>
      ${metrics.map(metric => `
        <div class="presentation-metric">
          <span>${escapeHtml(metric)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPresenterNotesPanel(step) {
  const profile = presentationProfile();
  return `
    <details class="bg-slate-900 border border-amber-800 rounded-xl p-5" data-presenter-notes open>
      <summary class="cursor-pointer text-sm font-semibold text-amber-100">Presenter Notes</summary>
      <div class="grid md:grid-cols-3 gap-3 mt-4 mb-4 text-sm">
        <div class="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <span class="block text-xs uppercase tracking-wide text-slate-500">Current audience</span>
          <span class="text-slate-100 font-semibold">${escapeHtml(profile.title)}</span>
        </div>
        <div class="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <span class="block text-xs uppercase tracking-wide text-slate-500">Estimated total duration</span>
          <span class="text-slate-100 font-semibold">${escapeHtml(profile.estimatedDuration)}</span>
        </div>
        <div class="bg-slate-950 border border-slate-800 rounded-lg p-3">
          <span class="block text-xs uppercase tracking-wide text-slate-500">Profile objective</span>
          <span class="text-slate-100 font-semibold">${escapeHtml(profile.objective)}</span>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-4 mt-4 text-sm">
        ${renderPresenterNoteList('Speaking tips', step.speakingTips)}
        ${renderPresenterNoteList('Expected audience questions', step.expectedQuestions)}
        ${renderPresenterNoteList('Reminders', step.reminders)}
        ${renderPresenterAppendixLinks(step.technicalAppendixLinks)}
      </div>
      <p class="text-sm text-slate-300 mt-4">${escapeHtml(step.presenterNote)}</p>
    </details>
  `;
}

function renderPresenterNoteList(title, items = []) {
  return `
    <div>
      <h3 class="text-xs uppercase tracking-wide text-slate-500 mb-2">${escapeHtml(title)}</h3>
      <ul class="space-y-1 text-slate-300">
        ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderPresenterAppendixLinks(links = []) {
  return `
    <div>
      <h3 class="text-xs uppercase tracking-wide text-slate-500 mb-2">Technical appendix links</h3>
      <div class="space-y-1">
        ${links.map(link => `<a class="block text-green-300 hover:underline" href="${escapeHtml(link.route)}">${escapeHtml(link.label)}</a>`).join('')}
      </div>
    </div>
  `;
}

function renderPresentationNavigation(steps, activeIndex, profileId = activePresentationProfileId) {
  const previousDisabled = activeIndex === 0 ? 'disabled' : '';
  const currentStep = enrichedPresentationStep(steps[activeIndex], profileId);
  const nextLabel = currentStep.nextLabel;
  return `
    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5">
      <button type="button" id="presentation-prev" ${previousDisabled} class="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition">Previous</button>
      <button type="button" id="presentation-next" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">${escapeHtml(nextLabel)}</button>
    </div>
  `;
}

function bindPresentationControls(flow) {
  document.getElementById('presentation-prev')?.addEventListener('click', () => {
    showInvestorPresentation(activePresentationStepIndex - 1, activePresentationProfileId);
  });
  document.getElementById('presentation-next')?.addEventListener('click', () => {
    const nextIndex = activePresentationStepIndex + 1 >= flow.steps.length ? 0 : activePresentationStepIndex + 1;
    showInvestorPresentation(nextIndex, activePresentationProfileId);
  });
  document.querySelectorAll('[data-presentation-jump]').forEach(button => {
    button.addEventListener('click', () => showInvestorPresentation(Number(button.dataset.presentationJump), activePresentationProfileId));
  });
  document.querySelectorAll('input[name="presentation-profile"]').forEach(input => {
    input.addEventListener('change', (event) => {
      const profileId = event.target.value;
      if (!PRESENTATION_PROFILES[profileId]) return;
      window.history.replaceState({}, document.title, `${window.location.pathname}${presentationProfileUrl(profileId)}`);
      showInvestorPresentation(0, profileId);
    });
  });
  document.getElementById('presentation-settings')?.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    savePresentationSettings({
      ...presentationSettings,
      [target.name]: target.checked,
    });
    showInvestorPresentation(activePresentationStepIndex, activePresentationProfileId);
  });
  document.removeEventListener('keydown', handlePresentationKeyboardNavigation);
  document.addEventListener('keydown', handlePresentationKeyboardNavigation);
}

function handlePresentationKeyboardNavigation(event) {
  const presentationView = document.getElementById('view-presentation');
  if (!presentationView || presentationView.classList.contains('hidden')) return;
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
  const flow = presentationFlow(activePresentationProfileId);
  event.preventDefault();
  if (event.key === 'ArrowRight') {
    const nextIndex = activePresentationStepIndex + 1 >= flow.steps.length ? 0 : activePresentationStepIndex + 1;
    showInvestorPresentation(nextIndex, activePresentationProfileId);
  } else {
    showInvestorPresentation(activePresentationStepIndex - 1, activePresentationProfileId);
  }
}

async function redirectAuthenticatedUser() {
  const auth = getAuth();
  if (!auth) {
    location.hash = '#login';
    return;
  }
  if (auth.user?.auth_type === 'wallet') {
    try {
      location.hash = await resolveWalletLandingHash();
    } catch (err) {
      sessionStorage.setItem('ap_login_error', err.message || 'Unable to load wallet profile');
      clearAuth();
      location.hash = '#login';
    }
    return;
  }
  location.hash = portalHashForRole(auth.user.role);
}

function route() {
  const auth = getAuth();
  const hash = location.hash;

  if (!hash || hash === '#' || hash === '#home' || hash === '#/') {
    showHome();
    return;
  }

  if (hash === '#login') {
    if (auth) { redirectAuthenticatedUser(); return; }
    showLogin();
    return;
  }

  const loginEntry = hash.match(/^#login\/(investor|farmer|admin)$/);
  if (loginEntry) {
    if (auth) { redirectAuthenticatedUser(); return; }
    showLogin(loginEntry[1]);
    return;
  }

  const investorPilot = hash.match(/^#\/?investor\/pilots\/([a-z0-9-]+)$/);
  if (investorPilot) {
    showInvestorPilotProfile(investorPilot[1]);
    return;
  }

  const protectionModel = hash.match(/^#\/?protection\/(fidlot|hissar)$/);
  if (protectionModel) {
    showPublicProtectionModel(protectionModel[1]);
    return;
  }

  if (hash === '#farmer/pilots') {
    showFarmerPilotSelector();
    return;
  }

  const farmerPilot = hash.match(/^#farmer\/pilots\/([a-z0-9-]+)$/);
  if (farmerPilot) {
    showFarmerPilotProfile(farmerPilot[1]);
    return;
  }

  const adminPilot = hash.match(/^#deals\/pilots\/([a-z0-9-]+)$/);
  if (adminPilot) {
    showAdminPilotDetail(adminPilot[1]);
    return;
  }

  if (hash === '#demo/admin') {
    showAdminDemoPortal();
    return;
  }

  const presentationMatch = hash.match(/^#demo\/presentation\/(investor|near|accelerator|enterprise)$/);
  if (presentationMatch) {
    showInvestorPresentation(0, presentationMatch[1]);
    return;
  }

  if (hash === '#/marketplace' || hash === '#marketplace') {
    showMarketplace();
    return;
  }

  const legacyPlatformDocMatch = hash.match(new RegExp('^#\\/?white' + 'paper(?:\\?lang=(en|ru))?$'));
  if (legacyPlatformDocMatch) {
    location.hash = legacyPlatformDocMatch[1] === 'ru' ? '#/platform?lang=ru' : '#/platform';
    return;
  }

  const platformMatch = hash.match(/^#\/?platform(?:\?lang=(en|ru))?$/);
  if (platformMatch) {
    showPlatformDocumentation(platformMatch[1] || 'en');
    return;
  }

  if (!auth) {
    location.hash = '#home';
    return;
  }

  const farmerDeal = hash.match(/^#farmer\/deals\/(\d+)$/);
  if (farmerDeal) {
    showFarmerDeal(farmerDeal[1]);
    return;
  }

  if (hash === '#farmer') {
    showFarmerPortal();
    return;
  }

  const investorDeal = hash.match(/^#investor\/deals\/(\d+)$/);
  if (investorDeal) {
    showInvestorDeal(investorDeal[1]);
    return;
  }

  if (hash === '#/onboarding' || hash === '#onboarding') {
    showOnboarding();
    return;
  }

  if (hash === '#investor') {
    showInvestorPortal();
    return;
  }

  if (hash === '#admin' || hash === '#/admin') {
    if (!isAdmin()) {
      location.hash = portalHashForRole(auth.user.role);
      return;
    }
    showAdminPortal();
    return;
  }

  if (hash === '#admin/create') {
    if (!isAdmin()) {
      location.hash = portalHashForRole(auth.user.role);
      return;
    }
    showAdminCreatePortal();
    return;
  }

  if (hash === '#admin/users') {
    if (!isAdmin()) {
      location.hash = portalHashForRole(auth.user.role);
      return;
    }
    showAdminUsersPortal();
    return;
  }

  if (hash === '#admin/treasury') {
    if (!isAdmin()) {
      location.hash = portalHashForRole(auth.user.role);
      return;
    }
    showAdminTreasuryDashboard();
    return;
  }

  const m = hash.match(/^#deals\/(\d+)$/);
  if (m) {
    showDeal(m[1]);
  } else {
    if (auth.user.role === 'investor' && !isAdmin()) {
      location.hash = '#investor';
    } else {
      showDeals();
    }
  }
}

async function initializeApp() {
  await verifyWalletCallbackIfPresent();
  if (!location.hash || location.hash === '#') {
    const auth = getAuth();
    if (auth) {
      await redirectAuthenticatedUser();
    } else {
      location.hash = '#home';
    }
  } else {
    route();
  }
}

window.addEventListener('hashchange', route);
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// --- Login ---

function renderProtectionSchedule(model) {
  return `
    <div class="protection-schedule-scroll">
      <table class="protection-schedule-table">
        <thead>
          <tr>
            <th>Stage</th>
            <th>Investor cash</th>
            <th>Contribution</th>
            <th>Farmer release</th>
            <th>Reserve balance</th>
            <th>Farmer cash</th>
          </tr>
        </thead>
        <tbody>
          ${model.schedule.map(row => `
            <tr>
              ${row.map((value, index) => `<${index === 0 ? 'th' : 'td'}>${escapeHtml(value)}</${index === 0 ? 'th' : 'td'}>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderHomeInvestorProtection() {
  const fidlot = INVESTOR_PROTECTION_MODELS.fidlot;
  const hissar = INVESTOR_PROTECTION_MODELS.hissar;
  return `
    <section id="investment-protection" class="landing-section investment-protection-home" aria-labelledby="investment-protection-title">
      <div class="landing-section-heading">
        <span>Investor protection</span>
        <h2 id="investment-protection-title">Explore the Future Protection Concept by Investment Model</h2>
      </div>

      <div class="protection-lead-grid">
        <div>
          <p class="protection-intro">
            This exploratory, model-specific Protection Reserve concept is not active in Pilot 1.0.
            In a future approved phase, a portion of the Farmer share could be allocated to a Protection Reserve.
            If a contractually Confirmed Loss occurs, the legally available reserve may reduce the investor's loss.
            If no Confirmed Loss requires its use, the unused balance is intended to be released to the farmer under the staged rules.
          </p>
          <p class="protection-intro">
            The reserve accumulates only after successful cycles. It is not fully funded at the start, so early-cycle exposure remains.
          </p>
        </div>
        <aside class="protection-formula-card" aria-label="Current model release rule">
          <span>Current $50,000 pilot rule</span>
          <code>Required reserve = max($10,000; $50,000 &minus; investor cash received)</code>
          <small>Investor cash includes profit distributions and capital returns. The final $10,000 stays reserved until completion and performance of obligations.</small>
        </aside>
      </div>

      <div class="protection-model-grid" aria-label="Protection reserve by model">
        ${[fidlot, hissar].map(model => `
          <article class="protection-model-card">
            <div>
              <span class="protection-model-label">Model-specific reserve</span>
              <h3>${escapeHtml(model.title)}</h3>
            </div>
            <strong class="protection-rate">${escapeHtml(model.rate)}%</strong>
            <dl>
              <div><dt>Scheduled contributions</dt><dd>${escapeHtml(model.scheduledReserve)}</dd></div>
              <div><dt>Minimum until completion</dt><dd>${escapeHtml(model.minimumReserve)}</dd></div>
            </dl>
            <div class="protection-document-actions">
              <a href="#/protection/${escapeHtml(model.key)}" class="protection-cta">✦ Full cycle table</a>
              <a href="${model.investorPdfEn}" target="_blank" rel="noopener noreferrer">Investor PDF · EN</a>
              <a href="${model.investorPdfRu}" target="_blank" rel="noopener noreferrer">Investor PDF · RU</a>
            </div>
          </article>
        `).join('')}
      </div>

      <ol class="protection-flow" aria-label="How the Protection Reserve works">
        <li><span>1</span><div><strong>Farmer share is calculated</strong><p>The 60/40 split is applied after the model's pre-split costs.</p></div></li>
        <li><span>2</span><div><strong>The reserve accumulates</strong><p>44% for Fidlot or 53% for VariantB is allocated from the farmer share.</p></div></li>
        <li><span>3</span><div><strong>Losses require confirmation</strong><p>Evidence, approval, legal authority, and available funds are required before reserve use.</p></div></li>
        <li><span>4</span><div><strong>Unused reserve is released</strong><p>In the no-loss model, verified excess is released in stages and the final $10,000 at completion.</p></div></li>
      </ol>

      <details class="protection-details">
        <summary>View the full staged-release schedules</summary>
        <div class="protection-schedule-grid">
          <section>
            <h3>${escapeHtml(fidlot.title)} · ${fidlot.rate}%</h3>
            ${renderProtectionSchedule(fidlot)}
          </section>
          <section>
            <h3>${escapeHtml(hissar.title)} · ${hissar.rate}%</h3>
            <p class="protection-capital-note">$2,500 in cycles 3–6 is returned to the investor before the 60/40 split as partial capital return; no Performance Fee applies.</p>
            ${renderProtectionSchedule(hissar)}
          </section>
        </div>
      </details>

      <details class="protection-details protection-russian-details">
        <summary>Полное объяснение на русском</summary>
        <div class="protection-russian-copy">
          <p>Резерв формируется из доли фермера: 44% для Fidlot и 53% для Hissar / VariantB. Он накапливается постепенно после успешных циклов и не существует в полном объёме в начале проекта.</p>
          <p>При договорно подтверждённом убытке фактически накопленный и юридически доступный резерв может уменьшить потери инвестора. Если подтверждённых убытков нет, неиспользованный остаток предполагается поэтапно вернуть фермеру по установленным правилам.</p>
          <p>В VariantB по $2,500 в циклах 3–6 возвращаются инвестору до разделения прибыли как частичный возврат капитала. Performance Fee на эти суммы не начисляется.</p>
          <p>Юридическая принадлежность заблокированных средств, полномочия на списание и порядок разрешения споров должны быть закреплены договорами.</p>
        </div>
      </details>

      <div class="protection-warning" role="note">
        <strong>Important:</strong>
        The Protection Reserve reduces risk only under defined conditions. It is not insurance and does not guarantee income,
        profit, capital preservation, payout, or settlement. Legal ownership while funds are locked remains subject to contract and legal review.
      </div>

      <div class="protection-home-actions">
        <a class="landing-btn landing-btn-primary" href="#/marketplace">Compare Investment Models</a>
        <a class="landing-btn" href="https://github.com/farabek/agripartners/tree/main/docs/platform/investor-protection" target="_blank" rel="noopener noreferrer">Read Full Framework</a>
      </div>
    </section>
  `;
}

function renderEnvironmentBanner(mode, roleLabel) {
  const isDemo = mode === 'demo';
  return `
    <aside class="${isDemo ? 'bg-amber-950 border-amber-800 text-amber-100' : 'bg-blue-950 border-blue-800 text-blue-100'} border rounded-lg px-4 py-3 mb-6" data-environment="${escapeHtml(mode)}">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-sm font-semibold">${isDemo ? 'Alpha Demo / NEAR Testnet' : 'Pilot 1.0 Preparation'}${roleLabel ? ` · ${escapeHtml(roleLabel)}` : ''}</span>
        <span class="text-xs">${isDemo ? 'Demonstration data and Testnet functionality' : 'AgriPartners-managed workflow'}</span>
      </div>
      <p class="text-xs mt-1 opacity-90">
        ${isDemo
          ? 'This is not a live Pilot 1.0 or production operation.'
          : 'This workspace prepares future Pilot operations; it does not claim live production activity.'}
      </p>
    </aside>
  `;
}

function renderRoleEntrySummary(role) {
  const roleConfig = {
    investor: {
      title: 'Investor path',
      description: 'Review AgriPartners-managed Projects without creating a direct contract or operating relationship with the Farmer.',
      items: ['Projects', 'Investment Models', 'Portfolio'],
    },
    farmer: {
      title: 'Farmer path',
      description: 'Complete Project work through AgriPartners as Project Operator using the approved fiat workflow.',
      items: ['My Projects', 'Funding Confirmation', 'Reports'],
    },
    admin: {
      title: 'AgriPartners Operator path',
      description: 'Operate one controlled Project on behalf of AgriPartners.',
      items: ['Manage Projects', 'Farmer Assignment', 'Reports', 'Settlement'],
    },
  };
  const config = roleConfig[role];
  if (!config) return '';
  return `
    <section class="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6" data-role-entry="${escapeHtml(role)}">
      <h2 class="text-sm font-semibold text-slate-100">${escapeHtml(config.title)}</h2>
      <p class="text-xs text-slate-400 mt-1">${escapeHtml(config.description)}</p>
      <div class="flex flex-wrap gap-2 mt-3">
        ${config.items.map(item => `<span class="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1">${escapeHtml(item)}</span>`).join('')}
      </div>
    </section>
  `;
}

function showHome() {
  showView('view-home');
  const el = document.getElementById('view-home');
  el.innerHTML = `
    <header class="landing-nav">
      <a href="#home" class="landing-brand">AgriPartners</a>
      <div class="landing-nav-actions">
        <a href="#/platform">Platform</a>
        <a href="#/marketplace">Opportunity Catalog</a>
        <a href="#login">Pilot Access</a>
      </div>
    </header>

    <main>
      <section class="landing-hero">
        <div class="landing-hero-copy">
          <div class="landing-badges" aria-label="Environment">
            <span>Alpha v1.2</span>
            <span>NEAR Testnet</span>
            <span>Alpha Demo / Pilot entry separation</span>
          </div>
          <h1>Structured agricultural investment Projects with managed operations, transparent reporting, and audit-ready records.</h1>
          <p>
            AgriPartners structures, manages, and monitors agricultural investment Projects. Investors participate
            through AgriPartners, while Farmers work with AgriPartners as Project Operator. NEAR Testnet supports
            transparency and auditability as platform infrastructure; future Farmer funding remains fiat-based.
          </p>
          <div class="landing-actions" aria-label="Primary actions">
            <a class="landing-btn landing-btn-primary" href="#login/investor">Investor Pilot Entry</a>
            <a class="landing-btn" href="#login/farmer">Farmer Pilot Entry</a>
            <a class="landing-btn" href="#login/admin">AgriPartners Operator Entry</a>
            <a class="landing-btn" href="#/marketplace">Browse Opportunity Catalog</a>
          </div>
          <p class="landing-note">
            Pilot 1.0 is in preparation and is not a live production operation. Choose a role entry only if AgriPartners has invited you.
          </p>
          <div class="landing-actions" aria-label="Alpha demo actions">
            <a class="landing-btn landing-btn-primary" href="#/investor/pilots/fidlot">Explore Investor Demo</a>
            <a class="landing-btn" href="#farmer/pilots">Explore Farmer Demo</a>
            <a class="landing-btn" href="#demo/admin">Explore Admin Demo</a>
            <button type="button" id="home-login-wallet" class="landing-btn landing-btn-wallet">Investor Testnet Login</button>
          </div>
          <p class="landing-note">
            Alpha Demo pages use demonstration profiles and NEAR Testnet functionality. They are separate from future real Pilot operations.
          </p>
        </div>
      </section>

      <section class="landing-section" aria-label="Who AgriPartners serves">
        <div class="landing-section-heading">
          <span>What AgriPartners is</span>
          <h2>One operating view for the whole agricultural capital cycle</h2>
        </div>
        <div class="landing-card-grid">
          <article class="landing-card">
            <h3>Investors</h3>
            <p>Review Projects, Investment Models, Project Progress, Farmer Reports, projected returns, and Settlement status without treating provisional data as realized performance.</p>
            <a class="landing-btn landing-btn-primary mt-4" href="#login/investor">Projects / Investment Models / Portfolio</a>
          </article>
          <article class="landing-card">
            <h3>Farmers</h3>
            <p>Work through AgriPartners as Project Operator to review My Projects, confirm funding, follow Production Cycles, and submit Project Reports.</p>
            <a class="landing-btn landing-btn-primary mt-4" href="#login/farmer">My Projects / Funding Confirmation / Reports</a>
          </article>
          <article class="landing-card">
            <h3>AgriPartners / Project Operators</h3>
            <p>Manage Projects, select Investment Models, assign Farmers, monitor Project Status, review Project Reports, and maintain Settlement and Treasury records.</p>
            <a class="landing-btn landing-btn-primary mt-4" href="#login/admin">Manage Projects / Farmer Assignment / Settlement</a>
          </article>
        </div>
      </section>

      <section class="landing-section" aria-label="What the Alpha demonstrates">
        <div class="landing-section-heading">
          <span>Alpha demonstration</span>
          <h2>What is ready to show</h2>
        </div>
        <div class="landing-feature-list">
          <div><strong>NEAR infrastructure</strong><span>Investor/operator authentication and supplementary transaction references on NEAR Testnet support transparency and auditability.</span></div>
          <div><strong>Farmer reporting</strong><span>Funding Confirmation, Project Reports, Production Cycle history, and AgriPartners-managed operational status.</span></div>
          <div><strong>Investor visibility</strong><span>Project portfolio, Investment Models, Project Progress, Farmer Reports, events, and Settlement / Returns visibility.</span></div>
          <div><strong>Typed returns</strong><span>Principal, profit, and fee classification with recorded, approved, paid, and reconciled status language.</span></div>
          <div><strong>Treasury foundation</strong><span>Append-only double-entry ledger services with idempotent source references for future workflow integrations.</span></div>
        </div>
      </section>

      <section class="landing-section landing-platform" aria-label="AgriPartners platform documentation">
        <div class="landing-section-heading">
          <span>Platform</span>
          <h2>Learn More About AgriPartners</h2>
        </div>
        <p>
          Read the platform explanation to understand the AgriPartners vision, funding model, NEAR Testnet integration,
          investor workflow, farmer workflow, treasury visibility, roadmap, and stakeholder benefits.
        </p>
        <p class="landing-safe-positioning">
          AgriPartners is currently an Alpha platform on NEAR Testnet. It is not a production investment, custody,
          payout, settlement, or Mainnet financial system.
        </p>
        <div class="landing-actions" aria-label="Platform documentation actions">
          <a class="landing-btn landing-btn-primary" href="#/platform">Read Platform Explained (EN)</a>
          <a class="landing-btn" href="assets/platform/PLATFORM_EXPLAINED_EN.pdf" download>Download PDF (EN)</a>
          <a class="landing-btn landing-btn-primary" href="#/platform?lang=ru">Read Platform Explained (RU)</a>
          <a class="landing-btn" href="assets/platform/PLATFORM_EXPLAINED_RU.pdf" download>Download PDF (RU)</a>
        </div>
      </section>

      <section class="landing-section landing-financial-models" aria-label="AgriPartners financial models">
        <div class="landing-section-heading">
          <span>Financial models</span>
          <h2>Explore the 60/40 Model</h2>
        </div>
        <p class="landing-financial-intro">
          Review the demonstration economics for the Fidlot livestock-fattening and Hissar sheep-breeding models.
          Investor and farmer documents are available in English and Russian.
        </p>
        <p class="landing-safe-positioning financial-model-notice">
          <span class="financial-model-notice-icon" aria-hidden="true">i</span>
          <span>These materials contain projections, do not guarantee returns, and do not constitute a public offer to invest.</span>
        </p>
        <div class="financial-model-catalog">
          <article class="financial-model-card">
            <header class="financial-model-header">
              <div>
                <span class="financial-model-type">Livestock fattening</span>
                <h3>Fidlot <span>v5.9</span></h3>
              </div>
              <div class="financial-model-badges" aria-label="Fidlot model details">
                <span>7 cycles</span>
                <span>5 months each</span>
                <span>60 / 40 split</span>
                <a href="#/protection/fidlot" class="financial-protection-badge protection-cta">✦ Protection reserve 44% · View table</a>
              </div>
            </header>
            <div class="financial-model-audiences">
              <section class="financial-model-audience" aria-labelledby="fidlot-investors">
                <div class="financial-audience-heading">
                  <span class="financial-audience-icon financial-audience-icon-investor" aria-hidden="true">↗</span>
                  <div><span>Capital perspective</span><h4 id="fidlot-investors">For Investors</h4></div>
                </div>
                <div class="financial-model-stat"><span>Projected net ROI</span><strong>64.0%</strong></div>
                <div class="financial-document-list" aria-label="Fidlot investor documents">
                  <div class="financial-document-row"><span class="financial-language notranslate" translate="no">EN</span><a class="financial-view-link" href="assets/financial-models/en/Agri-Investor-Fidlot-v5.9-6040-EN.pdf" target="_blank" rel="noopener noreferrer">View PDF <span aria-hidden="true">↗</span></a><a class="financial-download-link" href="assets/financial-models/en/Agri-Investor-Fidlot-v5.9-6040-EN.pdf" download aria-label="Download Fidlot investor model in English">↓</a></div>
                  <div class="financial-document-row"><span class="financial-language notranslate" translate="no">RU</span><a class="financial-view-link" href="assets/financial-models/ru/Agri-Investor-Fidlot-v5.9-6040-RU.pdf" target="_blank" rel="noopener noreferrer">View PDF <span aria-hidden="true">↗</span></a><a class="financial-download-link" href="assets/financial-models/ru/Agri-Investor-Fidlot-v5.9-6040-RU.pdf" download aria-label="Download Fidlot investor model in Russian">↓</a></div>
                </div>
              </section>
              <section class="financial-model-audience" aria-labelledby="fidlot-farmers">
                <div class="financial-audience-heading">
                  <span class="financial-audience-icon" aria-hidden="true">✓</span>
                  <div><span>Operator perspective</span><h4 id="fidlot-farmers">For Farmers</h4></div>
                </div>
                <div class="financial-model-stat-pair">
                  <div class="financial-model-stat"><span>Projected cash received</span><strong>$96,250</strong></div>
                  <div class="financial-model-stat"><span>Total benefit</span><strong>$114,250</strong></div>
                </div>
                <div class="financial-document-list" aria-label="Fidlot farmer documents">
                  <div class="financial-document-row"><span class="financial-language notranslate" translate="no">EN</span><a class="financial-view-link" href="assets/financial-models/en/Agri-Farmer-Fidlot-v5.9-6040-EN.pdf" target="_blank" rel="noopener noreferrer">View PDF <span aria-hidden="true">↗</span></a><a class="financial-download-link" href="assets/financial-models/en/Agri-Farmer-Fidlot-v5.9-6040-EN.pdf" download aria-label="Download Fidlot farmer model in English">↓</a></div>
                  <div class="financial-document-row"><span class="financial-language notranslate" translate="no">RU</span><a class="financial-view-link" href="assets/financial-models/ru/Agri-Farmer-Fidlot-v5.9-6040-RU.pdf" target="_blank" rel="noopener noreferrer">View PDF <span aria-hidden="true">↗</span></a><a class="financial-download-link" href="assets/financial-models/ru/Agri-Farmer-Fidlot-v5.9-6040-RU.pdf" download aria-label="Download Fidlot farmer model in Russian">↓</a></div>
                </div>
              </section>
            </div>
          </article>

          <article class="financial-model-card">
            <header class="financial-model-header">
              <div>
                <span class="financial-model-type">Sheep breeding</span>
                <h3>Hissar / VariantB <span>v2.1</span></h3>
              </div>
              <div class="financial-model-badges" aria-label="Hissar VariantB model details">
                <span>6 cycles</span>
                <span>6 months each</span>
                <span>60 / 40 split</span>
                <a href="#/protection/hissar" class="financial-protection-badge protection-cta">✦ Protection reserve 53% · View table</a>
              </div>
            </header>
            <div class="financial-model-audiences">
              <section class="financial-model-audience" aria-labelledby="hissar-investors">
                <div class="financial-audience-heading">
                  <span class="financial-audience-icon financial-audience-icon-investor" aria-hidden="true">↗</span>
                  <div><span>Capital perspective</span><h4 id="hissar-investors">For Investors</h4></div>
                </div>
                <div class="financial-model-stat"><span>Projected net ROI</span><strong>63.3%</strong></div>
                <div class="financial-document-list" aria-label="Hissar investor documents">
                  <div class="financial-document-row"><span class="financial-language notranslate" translate="no">EN</span><a class="financial-view-link" href="assets/financial-models/en/Agri-Investor-VariantB-v2.1-6040-EN.pdf" target="_blank" rel="noopener noreferrer">View PDF <span aria-hidden="true">↗</span></a><a class="financial-download-link" href="assets/financial-models/en/Agri-Investor-VariantB-v2.1-6040-EN.pdf" download aria-label="Download Hissar investor model in English">↓</a></div>
                  <div class="financial-document-row"><span class="financial-language notranslate" translate="no">RU</span><a class="financial-view-link" href="assets/financial-models/ru/Agri-Investor-VariantB-v2.1-6040-RU.pdf" target="_blank" rel="noopener noreferrer">View PDF <span aria-hidden="true">↗</span></a><a class="financial-download-link" href="assets/financial-models/ru/Agri-Investor-VariantB-v2.1-6040-RU.pdf" download aria-label="Download Hissar investor model in Russian">↓</a></div>
                </div>
              </section>
              <section class="financial-model-audience" aria-labelledby="hissar-farmers">
                <div class="financial-audience-heading">
                  <span class="financial-audience-icon" aria-hidden="true">✓</span>
                  <div><span>Operator perspective</span><h4 id="hissar-farmers">For Farmers</h4></div>
                </div>
                <div class="financial-model-stat-pair">
                  <div class="financial-model-stat"><span>Projected cash received</span><strong>$83,160</strong></div>
                  <div class="financial-model-stat"><span>Total benefit</span><strong>$101,160</strong></div>
                </div>
                <div class="financial-document-list" aria-label="Hissar farmer documents">
                  <div class="financial-document-row"><span class="financial-language notranslate" translate="no">EN</span><a class="financial-view-link" href="assets/financial-models/en/Agri-Farmer-VariantB-v2.1-6040-EN.pdf" target="_blank" rel="noopener noreferrer">View PDF <span aria-hidden="true">↗</span></a><a class="financial-download-link" href="assets/financial-models/en/Agri-Farmer-VariantB-v2.1-6040-EN.pdf" download aria-label="Download Hissar farmer model in English">↓</a></div>
                  <div class="financial-document-row"><span class="financial-language notranslate" translate="no">RU</span><a class="financial-view-link" href="assets/financial-models/ru/Agri-Farmer-VariantB-v2.1-6040-RU.pdf" target="_blank" rel="noopener noreferrer">View PDF <span aria-hidden="true">↗</span></a><a class="financial-download-link" href="assets/financial-models/ru/Agri-Farmer-VariantB-v2.1-6040-RU.pdf" download aria-label="Download Hissar farmer model in Russian">↓</a></div>
                </div>
              </section>
            </div>
          </article>
        </div>
      </section>

      ${renderHomeInvestorProtection()}
    </main>

    ${renderPublicFooter()}
  `;

  document.getElementById('home-login-wallet')?.addEventListener('click', handleWalletLogin);
}

function renderPublicFooter() {
  return `
    <footer class="public-footer">
      <a href="#/platform">Platform</a>
      <a href="https://github.com/farabek/agripartners" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://github.com/farabek/agripartners/tree/main/docs" target="_blank" rel="noopener noreferrer">Documentation</a>
    </footer>
  `;
}

function platformDocumentAsset(lang) {
  return lang === 'ru'
    ? 'assets/platform/PLATFORM_EXPLAINED_RU.pdf'
    : 'assets/platform/PLATFORM_EXPLAINED_EN.pdf';
}

function showPlatformDocumentation(lang = 'en') {
  const activeLang = lang === 'ru' ? 'ru' : 'en';
  const pdfSrc = platformDocumentAsset(activeLang);
  showView('view-platform');
  const el = document.getElementById('view-platform');
  el.innerHTML = `
    <header class="landing-nav">
      <a href="#home" class="landing-brand">AgriPartners</a>
      <div class="landing-nav-actions">
        <a href="#/marketplace">Opportunity Catalog</a>
        <a href="#login">Pilot Access</a>
      </div>
    </header>

    <main class="platform-page">
      <div class="platform-heading">
        <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition">
          <span class="text-lg leading-none" aria-hidden="true">&larr;</span>
          Back home
        </a>
        <h1>AgriPartners Platform Explained</h1>
        <p>
          Read the platform explanation for the AgriPartners Alpha: vision, funding model, NEAR Testnet integration,
          role workflows, treasury visibility, roadmap, and stakeholder benefits.
        </p>
        <p class="platform-positioning">
          AgriPartners is currently an Alpha platform on NEAR Testnet. It is not a production investment, custody,
          payout, settlement, or Mainnet financial system.
        </p>
      </div>

      <div class="platform-controls" aria-label="Platform document language">
        <button type="button" class="platform-lang-btn ${activeLang === 'en' ? 'is-active' : ''}" data-platform-lang="en">English</button>
        <button type="button" class="platform-lang-btn ${activeLang === 'ru' ? 'is-active' : ''}" data-platform-lang="ru">Русский</button>
        <a class="landing-btn landing-btn-primary" href="${pdfSrc}" download>Download PDF (${activeLang.toUpperCase()})</a>
      </div>

      <p class="platform-fallback">If the document does not load, use the download button below.</p>
      <a class="landing-btn platform-download-fallback" href="${pdfSrc}" download>Download PDF (${activeLang.toUpperCase()})</a>
      <iframe class="platform-frame" src="${pdfSrc}" title="AgriPartners Platform Explained ${activeLang.toUpperCase()}"></iframe>
    </main>

    ${renderPublicFooter()}
  `;

  document.querySelectorAll('[data-platform-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextLang = btn.dataset.platformLang === 'ru' ? 'ru' : 'en';
      location.hash = nextLang === 'ru' ? '#/platform?lang=ru' : '#/platform';
    });
  });
}

function showLogin() {
  showView('view-login');
  const el = document.getElementById('view-login');
  const entryRole = arguments[0] || null;
  const entryConfig = {
    investor: {
      title: 'Investor access',
      description: 'Sign in with your NEAR Wallet or an admin-provided platform account.',
    },
    farmer: {
      title: 'Farmer access',
      description: 'Enter My Projects to confirm fiat Funding and submit Reports through AgriPartners as Project Operator.',
    },
    admin: {
      title: 'AgriPartners Operator access',
      description: 'Manage Projects, Farmer Assignment, Reports, and Settlement using an authorized operator account.',
    },
  }[entryRole] || {
    title: 'AgriPartners access',
    description: 'Choose the access method provided by AgriPartners.',
  };
  const showWalletAccess = entryRole == null || entryRole === 'investor';
  const pendingLoginError = sessionStorage.getItem('ap_login_error');
  sessionStorage.removeItem('ap_login_error');
  el.innerHTML = `
    <div class="mb-6">
      <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition">
        <span class="text-lg leading-none" aria-hidden="true">&larr;</span>
        Back home
      </a>
    </div>
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-green-400">AgriPartners</h1>
      <p class="text-slate-100 font-semibold mt-2">${escapeHtml(entryConfig.title)}</p>
      <p class="text-slate-400 mt-1">${escapeHtml(entryConfig.description)}</p>
    </div>
    ${entryRole && entryRole !== 'investor' ? renderEnvironmentBanner('pilot', entryConfig.title) : ''}
    ${entryRole && entryRole !== 'investor' ? renderRoleEntrySummary(entryRole) : ''}
    <form id="login-form" class="bg-slate-800 rounded-xl p-6 space-y-4">
      ${showWalletAccess ? `
      <div class="bg-slate-900 border border-green-900 rounded-lg p-4 space-y-3">
        <div>
          <h2 class="text-sm font-semibold text-green-200">New to AgriPartners?</h2>
          <p class="text-sm text-slate-400 mt-1">
            Public demos do not require registration. NEAR login is Alpha infrastructure for Investors and operators.
            Farmers work through AgriPartners-managed onboarding and future fiat workflows.
          </p>
          ${entryRole === 'investor' ? '<p class="text-sm text-slate-400 mt-2">NEAR/Testnet is AgriPartners infrastructure and does not create a direct Investor-to-Farmer relationship.</p>' : ''}
        </div>
        <button type="button" id="login-near-wallet"
          data-default-label="${entryRole === 'investor' ? 'Continue with NEAR Wallet to Investor Dashboard' : 'Login with NEAR Wallet'}"
          class="w-full bg-slate-100 hover:bg-white text-slate-950 py-2 rounded-lg font-medium transition">
          ${entryRole === 'investor' ? 'Continue with NEAR Wallet to Investor Dashboard' : 'Login with NEAR Wallet'}
        </button>
        <details class="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
          <summary class="cursor-pointer text-sm font-semibold text-green-300">
            Need help? Show step-by-step guide
          </summary>
          <ol class="mt-3 space-y-2 text-sm text-slate-300">
            <li><span class="font-semibold text-green-300">1.</span> Explore the public demo pages first if you only want to review the project.</li>
            <li><span class="font-semibold text-green-300">2.</span> Create or import a NEAR testnet wallet if you want to join the live testnet portal.</li>
            <li><span class="font-semibold text-green-300">3.</span> Return here, continue with NEAR Wallet, then create an Investor or operator profile.</li>
          </ol>
        </details>
        <div class="grid gap-2 sm:grid-cols-2">
          <a href="https://testnet.mynearwallet.com/create" target="_blank" rel="noopener noreferrer"
            class="text-center bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
            Create NEAR Testnet Wallet
          </a>
          <a href="https://testnet.mynearwallet.com/recover-account" target="_blank" rel="noopener noreferrer"
            class="text-center bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
            Import Existing Wallet
          </a>
        </div>
      </div>
      ` : ''}
      <div id="login-error" class="hidden bg-red-900 text-red-200 px-3 py-2 rounded text-sm"></div>
      ${showWalletAccess ? `
        <div class="flex items-center gap-3 py-1">
          <span class="h-px flex-1 bg-slate-700"></span>
          <span class="text-xs uppercase tracking-wide text-slate-500">Platform account access</span>
          <span class="h-px flex-1 bg-slate-700"></span>
        </div>
      ` : ''}
      <div class="bg-green-950/40 border border-green-800 rounded-lg px-4 py-3">
        <p class="text-sm font-semibold text-green-200">${entryRole === 'admin' ? 'For authorized AgriPartners Operator accounts' : 'For admin-provided accounts'}</p>
        <p class="text-sm text-slate-300 mt-1">
          Sign in here only if a platform admin gave you a username and password.
        </p>
        ${entryRole === 'farmer' ? '<p class="text-sm text-slate-300 mt-1">Your Farmer workspace covers My Projects, Funding Confirmation, and Reports. Contact AgriPartners if you do not have access.</p>' : ''}
      </div>
      <div>
        <label class="block text-sm text-slate-400 mb-1">Username</label>
        <input id="login-username" type="text" autocomplete="username"
          class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
      </div>
      <div>
        <label class="block text-sm text-slate-400 mb-1">Password</label>
        <div class="relative">
          <input id="login-password" type="password" autocomplete="current-password"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 pr-12 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
          <button type="button" id="toggle-password"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100">
            👁
          </button>
        </div>
      </div>
      <button type="submit"
        class="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium transition">
        Sign In
      </button>
      <div class="flex flex-wrap justify-center gap-3 pt-2 text-xs">
        <a href="#login/investor" class="text-slate-400 hover:text-green-300">Investor entry</a>
        <a href="#login/farmer" class="text-slate-400 hover:text-green-300">Farmer entry</a>
        <a href="#login/admin" class="text-slate-400 hover:text-green-300">Operator entry</a>
      </div>
    </form>
  `;
  if (pendingLoginError) {
    const errEl = document.getElementById('login-error');
    errEl.textContent = pendingLoginError;
    errEl.classList.remove('hidden');
  }
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    await handleLogin(
      document.getElementById('login-username').value.trim(),
      document.getElementById('login-password').value
    );
  });
  document.getElementById('toggle-password').addEventListener('click', () => {
    const input = document.getElementById('login-password');
    const btn = document.getElementById('toggle-password');

    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁';
    }
  });
  document.getElementById('login-near-wallet')?.addEventListener('click', handleWalletLogin);
}

async function handleLogin(username, password) {
  const errEl = document.getElementById('login-error');
  const btn = document.querySelector('#login-form button[type="submit"]');
  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Signing in...';
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Login failed';
      errEl.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Sign In';
      return;
    }
    setAuth(data.token, data.user);
    location.hash = portalHashForRole(data.user.role);
  } catch {
    errEl.textContent = 'Server unavailable';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

async function handleWalletLogin() {
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-near-wallet');
  const homeBtn = document.getElementById('home-login-wallet');
  errEl?.classList.add('hidden');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Opening wallet...';
  }
  if (homeBtn) {
    homeBtn.disabled = true;
    homeBtn.textContent = 'Opening wallet...';
  }

  try {
    await loginWithNearWallet();
  } catch (err) {
    if (errEl) {
      errEl.textContent = err.message || 'Wallet login failed';
      errEl.classList.remove('hidden');
    } else {
      sessionStorage.setItem('ap_login_error', err.message || 'Wallet login failed');
      location.hash = '#login';
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = btn.dataset.defaultLabel || 'Login with NEAR Wallet';
    }
    if (homeBtn) {
      homeBtn.disabled = false;
      homeBtn.textContent = 'Login with NEAR Wallet';
    }
  }
}

async function logout() {
  clearAuth();
  location.hash = '#login';
}

window.logout = logout;

// --- Nav bar ---

function renderNav() {
  const auth = getAuth();
  if (!auth) return '';
  const labels = { farmer: 'Farmer', investor: 'Investor', admin: 'Administrator' };
  const role = auth.user.role;
  const roleLabel = isWalletAuth() ? 'Secure Account' : (labels[auth.user.role] || auth.user.role);
  const displayName = isWalletAuth() ? auth.user.account_id : auth.user.username;
  const roleLinks = {
    investor: [
      ['#investor', 'Projects / Portfolio'],
      ['#/marketplace', 'Investment Models'],
    ],
    farmer: [
      ['#farmer', 'My Projects'],
      ['#farmer', 'Funding Confirmation'],
      ['#farmer', 'Reports'],
    ],
    admin: [
      ['#admin', 'Operator Home'],
      ['#deals', 'Manage Projects'],
      ['#admin/create', 'Farmer Assignment'],
      ['#deals', 'Reports'],
      ['#deals', 'Settlement'],
      ['#admin/users', 'Users'],
      ['#admin/treasury', 'Treasury'],
    ],
  }[role] || [['#deals', 'Projects']];
  return `
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
      <span class="text-sm text-slate-400">
        ${role === 'admin' ? 'AgriPartners Operator' : roleLabel}:
        <span class="text-slate-200 font-medium">${escapeHtml(displayName)}</span>
      </span>
      <div class="flex flex-wrap items-center justify-end gap-3">
        ${roleLinks.map(([href, label]) => `<a href="${href}" class="text-sm text-slate-400 hover:text-green-400 transition">${label}</a>`).join('')}
        <button onclick="logout()" class="text-sm text-slate-400 hover:text-red-400 transition">Sign out →</button>
      </div>
    </div>
  `;
}

// --- Admin Portal ---

async function fetchAdminJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? jsonAuthHeaders() : authHeaders()),
      ...(options.headers || {}),
    },
  });
  const data = await readJsonResponse(res);
  if (res.status === 401) {
    clearAuth();
    location.hash = '#login';
    throw new Error('Session expired');
  }
  if (res.status === 403) throw new Error('Admin access required');
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function profileOptionLabel(profile) {
  const name = profile.displayName || profile.organizationName || profile.walletAccountId;
  return `${name} (${profile.walletAccountId})`;
}

function renderProfileOptions(profiles) {
  return profiles.map(profile => `
    <option value="${escapeHtml(profile.walletAccountId)}">${escapeHtml(profileOptionLabel(profile))}</option>
  `).join('');
}

async function showAdminPortal() {
  showView('view-admin');
  await showLiveAdminDashboard(document.getElementById('view-admin'));
}

async function showAdminCreatePortal() {
  showView('view-admin');
  const el = document.getElementById('view-admin');
  el.innerHTML = `
    ${renderNav()}
    ${renderEnvironmentBanner('pilot', 'AgriPartners Operator')}
    ${renderRoleEntrySummary('admin')}
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-green-400 mb-1">AgriPartners Project Operator</h1>
        <p class="text-slate-400">Create and assign an AgriPartners-managed Project using existing Alpha participant profiles.</p>
      </div>
      <a href="#deals" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Open Dashboard</a>
    </div>
    <div id="admin-create-content" class="bg-slate-800 rounded-xl p-5">
      <div class="spinner"></div>
    </div>
  `;

  const contentEl = document.getElementById('admin-create-content');
  const profileResults = await Promise.allSettled([
      fetchAdminJson('/api/admin/farmers'),
      fetchAdminJson('/api/admin/investors'),
  ]);
  const farmers = profileResults[0].status === 'fulfilled' && Array.isArray(profileResults[0].value.farmers)
    ? profileResults[0].value.farmers : [];
  const investors = profileResults[1].status === 'fulfilled' && Array.isArray(profileResults[1].value.investors)
    ? profileResults[1].value.investors : [];
  renderAdminCreateForm(contentEl, farmers, investors);
  const failures = profileResults
    .map((result, index) => result.status === 'rejected' ? `${index === 0 ? 'Farmer' : 'Investor'} profiles unavailable: ${result.reason.message}` : null)
    .filter(Boolean);
  if (failures.length) {
    contentEl.insertAdjacentHTML('afterbegin', `<div class="bg-amber-950 border border-amber-800 text-amber-100 px-4 py-3 rounded mb-4">${failures.map(escapeHtml).join('<br>')}</div>`);
  }
}

function showAdminUsersPortal() {
  showView('view-admin');
  const el = document.getElementById('view-admin');
  el.innerHTML = `
    ${renderNav()}
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-green-400 mb-1">Platform Users</h1>
        <p class="text-slate-400">Create username/password accounts for internal platform access.</p>
      </div>
      <a href="#deals" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Open Dashboard</a>
    </div>
    <form id="admin-user-form" class="bg-slate-800 rounded-xl p-5 space-y-4 max-w-2xl">
      <div class="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-300">
        These credentials are for pre-created platform accounts. New public users should still use NEAR Wallet onboarding.
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-user-username">Username</label>
          <input id="admin-user-username" name="username" type="text" autocomplete="off" required
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-user-email">Email</label>
          <input id="admin-user-email" name="email" type="email" autocomplete="off" required
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-user-password">Temporary password</label>
          <input id="admin-user-password" name="password" type="password" autocomplete="new-password" required minlength="6"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-user-role">Role</label>
          <select id="admin-user-role" name="role" required
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500">
            <option value="investor">Investor</option>
            <option value="farmer">Farmer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-sm text-slate-400 mb-1" for="admin-user-near">NEAR account (optional)</label>
        <input id="admin-user-near" name="near_account" type="text" autocomplete="off" placeholder="example.testnet"
          class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
      </div>
      <div id="admin-user-result" class="hidden rounded-lg px-4 py-3 text-sm"></div>
      <button id="admin-user-submit" type="submit"
        class="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg font-medium transition">
        Create Platform User
      </button>
    </form>
  `;
  document.getElementById('admin-user-form').addEventListener('submit', createPlatformUser);
}

function showAdminUserResult(type, message) {
  const el = document.getElementById('admin-user-result');
  if (!el) return;
  el.className = type === 'success'
    ? 'rounded-lg px-4 py-3 text-sm bg-green-950 border border-green-800 text-green-100'
    : 'rounded-lg px-4 py-3 text-sm bg-red-900 text-red-200';
  el.textContent = message;
}

async function createPlatformUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const btn = document.getElementById('admin-user-submit');
  const nearAccount = document.getElementById('admin-user-near').value.trim();
  const payload = {
    username: document.getElementById('admin-user-username').value.trim(),
    email: document.getElementById('admin-user-email').value.trim(),
    password: document.getElementById('admin-user-password').value,
    role: document.getElementById('admin-user-role').value,
  };
  if (nearAccount) payload.near_account = nearAccount;

  btn.disabled = true;
  btn.textContent = 'Creating...';
  try {
    const data = await fetchAdminJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    form.reset();
    showAdminUserResult('success', `Created ${data.role} user: ${data.username}`);
  } catch (err) {
    showAdminUserResult('error', `Create user failed: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Platform User';
  }
}

async function showAdminTreasuryDashboard() {
  showView('view-admin');
  const el = document.getElementById('view-admin');
  renderAdminTreasuryShell(el);

  const [accountsResult, ledgerResult] = await Promise.allSettled([
    fetchAdminJson('/api/admin/treasury/accounts'),
    fetchAdminJson('/api/admin/treasury/ledger'),
  ]);

  const accountsError = accountsResult.status === 'rejected' ? accountsResult.reason.message : null;
  const ledgerError = ledgerResult.status === 'rejected' ? ledgerResult.reason.message : null;
  const accounts = accountsResult.status === 'fulfilled' && Array.isArray(accountsResult.value.accounts)
    ? accountsResult.value.accounts
    : [];
  const ledgerEntries = ledgerResult.status === 'fulfilled' && Array.isArray(ledgerResult.value.ledgerEntries)
    ? ledgerResult.value.ledgerEntries
    : [];

  renderAdminTreasuryContent({ accounts, ledgerEntries, accountsError, ledgerError });
}

function renderAdminTreasuryShell(el) {
  el.innerHTML = `
    ${renderNav()}
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <div class="flex flex-wrap gap-2 mb-3" aria-label="Treasury environment">
          <span class="text-xs font-semibold bg-emerald-950 text-emerald-200 border border-emerald-800 px-2 py-1 rounded">Alpha Shadow Treasury</span>
          <span class="text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1 rounded">NEAR Testnet</span>
          <span class="text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1 rounded">Append-only Ledger</span>
          <span class="text-xs font-semibold bg-amber-950 text-amber-200 border border-amber-800 px-2 py-1 rounded">Derived balances</span>
        </div>
        <h1 class="text-3xl font-bold text-green-400 mb-1">Admin Treasury Dashboard</h1>
        <p class="text-slate-400 max-w-3xl">Treasury records are shown for Alpha visibility. Balances are derived from ledger entries and are not production settlement balances.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <a href="#deals" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Manage Projects</a>
        <a href="#admin/create" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Create Project</a>
      </div>
    </div>
    <div id="admin-treasury-content" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p class="text-slate-400 text-sm mt-3">Loading Treasury records...</p>
    </div>
  `;
}

function renderAdminTreasuryContent({ accounts, ledgerEntries, accountsError, ledgerError }) {
  const contentEl = document.getElementById('admin-treasury-content');
  if (!contentEl) return;
  const filteredEntries = filterTreasuryLedgerEntries(ledgerEntries);
  contentEl.innerHTML = `
    ${renderAdminTreasuryOverview(accounts, ledgerEntries)}
    ${renderAdminTreasuryShadowPanel()}
    <section class="bg-slate-800 rounded-xl p-5 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 class="text-xl font-semibold text-slate-100">Treasury Accounts</h2>
          <p class="text-sm text-slate-400">Logical accounting accounts, not necessarily separate wallets.</p>
        </div>
      </div>
      <div id="admin-treasury-accounts">
        ${accountsError ? renderAdminTreasuryError('account fetch error', accountsError, 'data-admin-treasury-accounts-error') : renderAdminTreasuryAccounts(accounts, ledgerEntries)}
      </div>
    </section>
    <section class="bg-slate-800 rounded-xl p-5 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 class="text-xl font-semibold text-slate-100">Ledger Entries</h2>
          <p class="text-sm text-slate-400">Append-only debit and credit rows from the Treasury Ledger.</p>
        </div>
      </div>
      <div id="admin-treasury-ledger">
        ${ledgerError ? renderAdminTreasuryError('ledger fetch error', ledgerError, 'data-admin-treasury-ledger-error') : `
          ${renderAdminTreasuryFilters(accounts)}
          <div id="admin-treasury-ledger-table">${renderAdminTreasuryLedger(filteredEntries)}</div>
        `}
      </div>
    </section>
    <section class="bg-slate-800 rounded-xl p-5">
      <h2 class="text-xl font-semibold text-slate-100 mb-2">Transaction Detail</h2>
      <div id="admin-treasury-transaction-detail" class="text-sm text-slate-400">Select a transaction id from the ledger to inspect source metadata and double-entry rows.</div>
    </section>
  `;

  window.adminTreasuryLedgerEntries = ledgerEntries;
  bindAdminTreasuryInteractions();
}

function renderAdminTreasuryOverview(accounts, ledgerEntries) {
  const transactionIds = new Set(ledgerEntries.map(entry => entry.transaction_id).filter(value => value !== null && value !== undefined));
  const suspenseEntries = ledgerEntries.filter(entry => entry.account_code === 'TREASURY_SUSPENSE');
  const cards = [
    ['Total accounts', accounts.length],
    ['Ledger entries', ledgerEntries.length],
    ['Recent transactions', transactionIds.size],
    ['Suspense activity', suspenseEntries.length],
  ];
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      ${cards.map(([label, value]) => `
        <div class="metric-box">
          <span class="metric-label">${escapeHtml(label)}</span>
          <span class="metric-value">${escapeHtml(value)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdminTreasuryShadowPanel() {
  return `
    <section class="bg-slate-800 border border-amber-800 rounded-xl p-5 mb-6">
      <h2 class="text-lg font-semibold text-amber-100 mb-2">Shadow Mode Status</h2>
      <div class="grid md:grid-cols-3 gap-3 text-sm text-slate-300">
        <p>Treasury currently runs as Alpha/shadow visibility.</p>
        <p>Ledger entries help audit platform flows.</p>
        <p>Treasury does not yet drive payouts or realized ROI.</p>
      </div>
    </section>
  `;
}

function treasuryAmountUnits(value) {
  const raw = String(value ?? '').trim();
  if (!/^[0-9]+(\.[0-9]{1,24})?$/.test(raw)) return 0n;
  const [whole, fraction = ''] = raw.split('.');
  return BigInt(whole) * 10n ** 24n + BigInt(fraction.padEnd(24, '0'));
}

function formatTreasuryUnits(units, currency = 'NEAR') {
  const sign = units < 0n ? '-' : '';
  const absolute = units < 0n ? -units : units;
  const whole = absolute / 10n ** 24n;
  const fraction = (absolute % 10n ** 24n).toString().padStart(24, '0').replace(/0+$/, '').slice(0, 6);
  return `${sign}${whole.toString()}${fraction ? `.${fraction}` : ''} ${currency}`;
}

function derivedActivityForAccount(accountCode, ledgerEntries, currency = 'NEAR') {
  return ledgerEntries
    .filter(entry => entry.account_code === accountCode && (entry.currency || 'NEAR') === currency)
    .reduce((sum, entry) => sum + treasuryAmountUnits(entry.amount), 0n);
}

function renderAdminTreasuryAccounts(accounts, ledgerEntries) {
  if (!accounts.length) {
    return `
      <div class="bg-slate-900 border border-slate-700 rounded-lg p-5 text-center" data-admin-treasury-empty-accounts>
        <h3 class="font-semibold text-slate-200">No Treasury accounts</h3>
        <p class="text-sm text-slate-400 mt-1">The account catalog is unavailable or has not been seeded yet.</p>
      </div>
    `;
  }
  return `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-slate-400 border-b border-slate-700">
          <tr>
            <th class="py-2 pr-3">Account code</th>
            <th class="py-2 pr-3">Account name</th>
            <th class="py-2 pr-3">Type</th>
            <th class="py-2 pr-3">Currency</th>
            <th class="py-2 pr-3">Active</th>
            <th class="py-2 pr-3">Derived activity</th>
          </tr>
        </thead>
        <tbody>
          ${accounts.map(account => `
            <tr class="border-b border-slate-700/60">
              <td class="py-2 pr-3 font-mono text-xs text-slate-200">${escapeHtml(account.account_code)}</td>
              <td class="py-2 pr-3 text-slate-200">${escapeHtml(account.account_name || 'Unknown')}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(account.account_type || 'Unknown')}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(account.currency || 'NEAR')}</td>
              <td class="py-2 pr-3 text-slate-300">${account.is_active === false ? 'Inactive' : 'Active'}</td>
              <td class="py-2 pr-3 font-mono text-xs text-amber-100">${escapeHtml(formatTreasuryUnits(derivedActivityForAccount(account.account_code, ledgerEntries, account.currency || 'NEAR'), account.currency || 'NEAR'))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminTreasuryFilters(accounts) {
  const accountOptions = accounts.map(account => `<option value="${escapeHtml(account.account_code)}">${escapeHtml(account.account_code)}</option>`).join('');
  return `
    <form id="admin-treasury-filters" class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
      <label class="text-xs text-slate-400">Account
        <select id="treasury-filter-account" class="mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100">
          <option value="">All accounts</option>
          ${accountOptions}
        </select>
      </label>
      <label class="text-xs text-slate-400">Currency
        <input id="treasury-filter-currency" class="mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100" placeholder="NEAR" />
      </label>
      <label class="text-xs text-slate-400">Project id
        <input id="treasury-filter-deal" class="mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100" placeholder="7" />
      </label>
      <label class="text-xs text-slate-400">Investor
        <input id="treasury-filter-investor" class="mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100" placeholder="investor.testnet" />
      </label>
      <label class="text-xs text-slate-400">Farmer
        <input id="treasury-filter-farmer" class="mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100" placeholder="farmer.testnet" />
      </label>
    </form>
  `;
}

function treasuryFilterValue(id) {
  return String(document.getElementById(id)?.value || '').trim().toLowerCase();
}

function filterTreasuryLedgerEntries(ledgerEntries) {
  const account = treasuryFilterValue('treasury-filter-account');
  const currency = treasuryFilterValue('treasury-filter-currency');
  const deal = treasuryFilterValue('treasury-filter-deal');
  const investor = treasuryFilterValue('treasury-filter-investor');
  const farmer = treasuryFilterValue('treasury-filter-farmer');
  return ledgerEntries.filter(entry => {
    if (account && String(entry.account_code || '').toLowerCase() !== account) return false;
    if (currency && String(entry.currency || '').toLowerCase() !== currency) return false;
    if (deal && String(entry.related_deal_id || '').toLowerCase() !== deal) return false;
    if (investor && !String(entry.related_investor || '').toLowerCase().includes(investor)) return false;
    if (farmer && !String(entry.related_farmer || '').toLowerCase().includes(farmer)) return false;
    return true;
  });
}

function renderAdminTreasuryLedger(ledgerEntries) {
  if (!ledgerEntries.length) {
    return `
      <div class="bg-slate-900 border border-slate-700 rounded-lg p-5 text-center" data-admin-treasury-empty-ledger>
        <h3 class="font-semibold text-slate-200">No ledger entries</h3>
        <p class="text-sm text-slate-400 mt-1">No Treasury ledger rows match the current view.</p>
      </div>
    `;
  }
  return `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-slate-400 border-b border-slate-700">
          <tr>
            <th class="py-2 pr-3">Date</th>
            <th class="py-2 pr-3">Transaction id</th>
            <th class="py-2 pr-3">Account</th>
            <th class="py-2 pr-3">Direction</th>
            <th class="py-2 pr-3">Amount</th>
            <th class="py-2 pr-3">Currency</th>
            <th class="py-2 pr-3">Related Project</th>
            <th class="py-2 pr-3">Related investor</th>
            <th class="py-2 pr-3">Related farmer</th>
          </tr>
        </thead>
        <tbody>
          ${ledgerEntries.map(entry => `
            <tr class="border-b border-slate-700/60">
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(formatDateTime(entry.created_at))}</td>
              <td class="py-2 pr-3">
                <button type="button" class="admin-treasury-transaction-link text-green-300 hover:text-green-200 underline font-mono" data-transaction-id="${escapeHtml(entry.transaction_id)}">${escapeHtml(entry.transaction_id || 'Unknown')}</button>
              </td>
              <td class="py-2 pr-3 font-mono text-xs text-slate-200">${escapeHtml(entry.account_code || 'Unknown')}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(entry.direction || 'Unknown')}</td>
              <td class="py-2 pr-3 font-mono text-xs text-slate-200">${escapeHtml(entry.amount || '0')}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(entry.currency || 'NEAR')}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(entry.related_deal_id ?? 'None')}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(entry.related_investor || 'None')}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(entry.related_farmer || 'None')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminTreasuryError(label, message, attributeName) {
  return `
    <div class="bg-red-900 text-red-100 px-4 py-3 rounded" ${attributeName}>
      <strong>${escapeHtml(label)}:</strong> ${escapeHtml(message)}
    </div>
  `;
}

function bindAdminTreasuryInteractions() {
  const filters = document.getElementById('admin-treasury-filters');
  if (filters) {
    filters.addEventListener('input', refreshAdminTreasuryLedgerFilters);
    filters.addEventListener('change', refreshAdminTreasuryLedgerFilters);
  }
  bindAdminTreasuryTransactionLinks();
}

function refreshAdminTreasuryLedgerFilters() {
  const target = document.getElementById('admin-treasury-ledger-table');
  if (!target) return;
  target.innerHTML = renderAdminTreasuryLedger(filterTreasuryLedgerEntries(window.adminTreasuryLedgerEntries || []));
  bindAdminTreasuryTransactionLinks();
}

function bindAdminTreasuryTransactionLinks() {
  document.querySelectorAll('.admin-treasury-transaction-link').forEach(button => {
    button.addEventListener('click', () => loadAdminTreasuryTransactionDetail(button.dataset.transactionId));
  });
}

async function loadAdminTreasuryTransactionDetail(transactionId) {
  const target = document.getElementById('admin-treasury-transaction-detail');
  if (!target || !transactionId) return;
  target.innerHTML = '<p class="text-slate-400">Loading transaction detail...</p>';
  try {
    const data = await fetchAdminJson(`/api/admin/treasury/transactions/${encodeURIComponent(transactionId)}`);
    if (!data.transaction || typeof data.transaction !== 'object') throw new Error('Malformed treasury transaction payload');
    target.innerHTML = renderAdminTreasuryTransactionDetail(data.transaction);
  } catch (err) {
    target.innerHTML = renderAdminTreasuryError('transaction detail fetch error', err.message, 'data-admin-treasury-transaction-error');
  }
}

function renderAdminTreasuryTransactionDetail(transaction) {
  const entries = Array.isArray(transaction.entries) ? transaction.entries : [];
  return `
    <div class="space-y-4">
      <div class="grid md:grid-cols-2 gap-3 text-sm">
        ${renderTreasuryDetailRow('Transaction type', transaction.transaction_type)}
        ${renderTreasuryDetailRow('Created at', formatDateTime(transaction.created_at))}
        ${renderTreasuryDetailRow('Created by', transaction.created_by)}
        ${renderTreasuryDetailRow('Description', transaction.description)}
        ${renderTreasuryDetailRow('source_type', transaction.source_type)}
        ${renderTreasuryDetailRow('source_id', transaction.source_id)}
        ${renderTreasuryDetailRow('idempotency_key', transaction.idempotency_key)}
        ${renderTreasuryDetailRow('Reference', transaction.blockchain_reference)}
      </div>
      <div>
        <h3 class="text-sm font-semibold text-slate-200 mb-2">Double-entry rows</h3>
        ${renderAdminTreasuryTransactionEntries(entries)}
      </div>
      <div>
        <h3 class="text-sm font-semibold text-slate-200 mb-2">Metadata</h3>
        <pre class="bg-slate-900 border border-slate-700 rounded-lg p-3 overflow-x-auto text-xs text-slate-300">${escapeHtml(JSON.stringify(transaction.metadata || {}, null, 2))}</pre>
      </div>
    </div>
  `;
}

function renderTreasuryDetailRow(label, value) {
  return `
    <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
      <div class="text-xs text-slate-500">${escapeHtml(label)}</div>
      <div class="text-slate-200 break-all">${escapeHtml(value || 'None')}</div>
    </div>
  `;
}

function renderAdminTreasuryTransactionEntries(entries) {
  if (!entries.length) return '<p class="text-sm text-slate-400">No ledger entries returned for this transaction.</p>';
  return `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-slate-400 border-b border-slate-700">
          <tr>
            <th class="py-2 pr-3">Account</th>
            <th class="py-2 pr-3">Debit</th>
            <th class="py-2 pr-3">Credit</th>
            <th class="py-2 pr-3">Currency</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(entry => `
            <tr class="border-b border-slate-700/60">
              <td class="py-2 pr-3 font-mono text-xs text-slate-200">${escapeHtml(entry.account_code || 'Unknown')}</td>
              <td class="py-2 pr-3 font-mono text-xs text-slate-200">${entry.direction === 'debit' ? escapeHtml(entry.amount || '0') : ''}</td>
              <td class="py-2 pr-3 font-mono text-xs text-slate-200">${entry.direction === 'credit' ? escapeHtml(entry.amount || '0') : ''}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(entry.currency || 'NEAR')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function showAdminDemoPortal() {
  showView('view-admin');
  const el = document.getElementById('view-admin');
  const deals = buildAdminDemoDataset();
  el.innerHTML = `
    ${renderNav()}
    ${renderEnvironmentBanner('demo', 'Admin')}
    <div class="mb-6">
      <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition">
        <span class="text-lg leading-none" aria-hidden="true">&larr;</span>
        Back home
      </a>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-green-400 mb-1">AgriPartners Operator Demo</h1>
        <p class="text-slate-400">Alpha demonstration of Manage Projects, Farmer Assignment, Reports, and Settlement visibility.</p>
      </div>
      <button type="button" id="admin-demo-pilot-deals-btn" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">View Pilot Projects</button>
    </div>
    ${renderAdminDemoSummary(adminDemoMetrics(deals))}
    <h2 id="admin-demo-pilot-deals" class="text-xl font-semibold mb-4">Pilot Projects</h2>
    <div class="grid gap-4">
      ${deals.map(renderAdminDemoDealCard).join('')}
    </div>
  `;

  document.getElementById('admin-demo-pilot-deals-btn')?.addEventListener('click', () => {
    document.getElementById('admin-demo-pilot-deals')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function renderAdminCreateForm(el, farmers, investors) {
  const hasProfiles = farmers.length > 0 && investors.length > 0;
  el.innerHTML = `
    <form id="admin-create-deal-form" class="space-y-4">
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-investor">Investor Assignment</label>
          <select id="admin-investor" required
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500">
            ${renderProfileOptions(investors)}
          </select>
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-farmer">Farmer Assignment</label>
          <select id="admin-farmer" required
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500">
            ${renderProfileOptions(farmers)}
          </select>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-amount">Amount</label>
          <input id="admin-amount" type="number" min="0" step="0.000001" required placeholder="132"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-reserve-rate">Legacy Alpha model parameter (%)</label>
          <input id="admin-reserve-rate" type="number" min="0" max="100" step="1" required placeholder="Fidlot 44; Hissar 53"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
      </div>
      <div>
        <label class="block text-sm text-slate-400 mb-1" for="admin-title">Project Title</label>
        <input id="admin-title" type="text" maxlength="120" required placeholder="Greenhouse expansion"
          class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
      </div>
      <div>
        <label class="block text-sm text-slate-400 mb-1" for="admin-description">Project Description</label>
        <textarea id="admin-description" rows="4" required placeholder="Short Project summary"
          class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500"></textarea>
      </div>
      <div id="admin-create-result" class="hidden rounded-lg px-4 py-3 text-sm"></div>
      <button type="submit" ${hasProfiles ? '' : 'disabled'}
        class="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-400 text-white px-4 py-2 rounded-lg font-medium transition">
        Create Project
      </button>
      ${hasProfiles ? '' : `<p class="text-sm text-slate-400">${farmers.length === 0 && investors.length === 0 ? 'No Farmer or Investor profiles are available.' : farmers.length === 0 ? 'No Farmer profiles are available.' : 'No Investor profiles are available.'} Add the missing profile before creating a Project.</p>`}
    </form>
  `;

  document.getElementById('admin-create-deal-form').addEventListener('submit', createAdminDeal);
}

function showAdminCreateResult(type, html) {
  const el = document.getElementById('admin-create-result');
  if (!el) return;
  el.className = `${type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'} rounded-lg px-4 py-3 text-sm`;
  el.innerHTML = html;
  el.classList.remove('hidden');
}

async function createAdminDeal(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Creating...';
  showAdminCreateResult('success', 'Creating Project in the Alpha platform...');

  const payload = {
    investor_wallet: document.getElementById('admin-investor').value,
    farmer_wallet: document.getElementById('admin-farmer').value,
    amount: document.getElementById('admin-amount').value,
    escrow_pct: Number(document.getElementById('admin-reserve-rate').value),
    title: document.getElementById('admin-title').value.trim(),
    description: document.getElementById('admin-description').value.trim(),
  };

  try {
    const created = await fetchAdminJson('/api/admin/deals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const dealId = created.deal_id || created.id;
    showAdminCreateResult('success', `
      <div class="font-semibold">Project created successfully</div>
      <div class="mt-2">Project #${escapeHtml(dealId)}</div>
      <div class="font-mono break-all text-xs mt-1">NEAR Testnet infrastructure reference: ${escapeHtml(created.contract_address || 'Pending')}</div>
      <div class="flex flex-wrap gap-2 mt-3">
        <a href="#deals/${escapeHtml(dealId)}" class="underline">Open Admin Project</a>
        <a href="#farmer" class="underline">View in Farmer Portal</a>
        <a href="#investor" class="underline">View in Investor Portal</a>
      </div>
    `);
    form.reset();
  } catch (err) {
    showAdminCreateResult('error', `Create Project failed: ${escapeHtml(err.message)}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Project';
  }
}

// --- Deals list ---

async function showDeals() {
  showView('view-list');
  const el = document.getElementById('view-list');
  if (isAdmin()) {
    await showLiveAdminDashboard(el);
    return;
  }
  el.innerHTML = `
    ${renderNav()}
    <h1 class="text-3xl font-bold text-green-400 mb-1">AgriPartners</h1>
    <p class="text-slate-400 mb-6">AgriPartners-managed agricultural Projects with NEAR Testnet infrastructure.</p>
    <div class="mb-6">
      <a href="#investor" class="inline-flex bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Open Investor Portal</a>
      <a href="#farmer" class="inline-flex bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition ml-2">Open Farmer Portal</a>
    </div>
    <div class="spinner"></div>
  `;
  try {
    const res = await fetch(`${API_BASE}/api/me/deals`, { headers: authHeaders() });
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const deals = await res.json();
    el.querySelector('.spinner').remove();
    if (deals.length === 0) {
      el.innerHTML += '<p class="text-slate-400 mt-4">No Projects found</p>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'grid gap-4';
    deals.forEach(d => { grid.innerHTML += renderDealCard(d); });
    el.appendChild(grid);
  } catch (e) {
    el.querySelector('.spinner')?.remove();
    el.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Backend unavailable: ${e.message}</div>`;
  }
}

function renderAdminDashboardShell(el) {
  el.innerHTML = `
    ${renderNav()}
    ${renderEnvironmentBanner('pilot', 'AgriPartners Operator')}
    ${renderRoleEntrySummary('admin')}
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-green-400 mb-1">Manage Projects</h1>
        <p class="text-slate-400">AgriPartners Project Operator view for Project Status, Farmer Assignment, Project Reports, and Settlement / Returns.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <a href="#admin/treasury" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Treasury Dashboard</a>
        <a href="#admin/users" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Create User</a>
        <a href="#admin/create" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Create Project</a>
      </div>
    </div>
    <div id="admin-dashboard-state" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p class="text-slate-400 text-sm mt-3">Loading live Projects...</p>
    </div>
  `;
}

function adminDashboardErrorMessage(status, message) {
  if (status === 401) return 'Authentication required. Please sign in again.';
  if (status === 403) return 'Admin access is required to load this dashboard.';
  return message || 'The live admin dashboard is unavailable.';
}

async function showLiveAdminDashboard(el) {
  renderAdminDashboardShell(el);
  const stateEl = document.getElementById('admin-dashboard-state');
  try {
    const res = await fetch(`${API_BASE}/api/deals`, { headers: authHeaders() });
    const data = await readJsonResponse(res);
    if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { status: res.status });
    if (!Array.isArray(data)) throw new Error('Malformed deal list payload');
    if (data.length === 0) {
      stateEl.innerHTML = `
        <div class="bg-slate-800 rounded-xl p-6 text-center" data-admin-empty-state>
          <h2 class="text-lg font-semibold text-slate-200">No live Projects yet</h2>
          <p class="text-slate-400 text-sm mt-1">Create a Project to start AgriPartners operator workflows.</p>
        </div>
      `;
      return;
    }
    stateEl.innerHTML = `<div class="grid gap-4">${data.map(renderDealCard).join('')}</div>`;
  } catch (err) {
    stateEl.innerHTML = `
      <div class="bg-red-900 text-red-200 px-4 py-3 rounded" data-admin-dashboard-error="${escapeHtml(err.status || 'network')}">
        ${escapeHtml(adminDashboardErrorMessage(err.status, err.message))}
      </div>
    `;
  }
}

function renderDealCard(d) {
  const dealTitle = d.title || d.deal_type || 'Unknown';
  const protectionKey = d.pilot_key || pilotKeyFromText(`${dealTitle} ${d.description || ''}`);
  return `
    <div class="bg-slate-800 rounded-xl p-5 flex justify-between items-center gap-4">
      <div class="space-y-1 min-w-0">
        <h2 class="text-lg font-semibold text-slate-100 truncate">Project #${escapeHtml(d.id)} &mdash; ${escapeHtml(dealTitle)}</h2>
        ${d.description ? `<p class="text-sm text-slate-300">${escapeHtml(d.description)}</p>` : ''}
        <p class="text-sm text-slate-400">Farmer Assignment: <span class="text-slate-200">${d.farmer ? formatAddress(d.farmer) : 'Unknown'}</span></p>
        <p class="text-sm text-slate-400">Investor Assignment: <span class="text-slate-200">${d.investor ? formatAddress(d.investor) : 'Unknown'}</span></p>
        <p class="text-sm text-slate-500">${d.total_cycles ?? 'Unknown'} cycle(s) × ${d.cycle_duration_days == null ? 'Unknown' : escapeHtml(d.cycle_duration_days)} days  ·  ${formatOptionalYoctoDisplay(d.investment_amount)}</p>
        <span class="inline-flex text-xs font-semibold text-blue-200 bg-blue-950 border border-blue-800 rounded-full px-2.5 py-1 mt-2">Protection reserve: ${d.escrow_pct == null ? 'model rate unavailable' : `${escapeHtml(d.escrow_pct)}%`}</span>
      </div>
      <div class="flex flex-col gap-2 shrink-0">
        <a href="#deals/${d.id}" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition">Open →</a>
        ${protectionKey ? `<a href="#/protection/${escapeHtml(protectionKey)}" class="protection-cta">✦ Protection table</a>` : ''}
      </div>
    </div>
  `;
}

function renderAdminDemoDashboard(el) {
  const deals = buildAdminDemoDataset();
  el.innerHTML = `
    ${renderNav()}
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-green-400 mb-1">Admin Dashboard</h1>
        <p class="text-slate-400">Clean pilot operations view for investor-ready screenshots.</p>
      </div>
        <a href="#admin/create" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Create Project</a>
    </div>
    ${renderAdminDemoSummary(adminDemoMetrics(deals))}
    <h2 class="text-xl font-semibold mb-4">Pilot Projects</h2>
    <div class="grid gap-4">
      ${deals.map(renderAdminDemoDealCard).join('')}
    </div>
  `;
}

function renderAdminDemoSummary(metrics) {
  const cards = [
    ['Total Pilot Funding', metrics.totalPilotFunding],
    ['Active Projects', metrics.activeDeals],
    ['Completed Projects', metrics.completedDeals],
    ['Reports Submitted', metrics.reportsSubmitted],
    ['Reports Pending', metrics.reportsPending],
    ['Returns Recorded', metrics.returnsRecorded],
    ['Outstanding', metrics.outstanding],
  ];
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      ${cards.map(([label, value]) => `
        <div class="metric-box">
          <span class="metric-label">${escapeHtml(label)}</span>
          <span class="metric-value">${escapeHtml(value)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function projectWorkspaceValue(...values) {
  const value = values.find(item => item != null && String(item).trim() !== '');
  return value == null ? null : String(value);
}

function projectWorkspaceStatus(deal = {}, status = null) {
  if (status && typeof status === 'object') return projectWorkspaceValue(status.status);
  return projectWorkspaceValue(status, deal.status?.status, deal.status);
}

function projectWorkspaceFarmer(deal = {}) {
  const farmerProfile = deal.farmer_profile || deal.farmerProfile || {};
  return projectWorkspaceValue(
    deal.farmer_name,
    deal.farmerName,
    deal.farmer_display_name,
    farmerProfile.displayName,
    farmerProfile.organizationName,
    deal.farmer_account,
    deal.farmer
  ) || 'Assigned Farmer';
}

function projectWorkspaceTimelineIndex({ deal = {}, status = null, cycles = [], reports = [], returns = [] } = {}) {
  const statusKey = (projectWorkspaceStatus(deal, status) || '').toLowerCase().replace(/[^a-z]/g, '');
  const statusStages = {
    initialized: 0,
    draft: 0,
    preparing: 0,
    approved: 0,
    fundingpending: 0,
    funded: 1,
    farmerconfirmationpending: 1,
    active: 2,
    cycleactive: 2,
    inproduction: 2,
    reportspending: 3,
    cyclesettlement: 4,
    settlementpending: 4,
    settled: 4,
    completed: 5,
  };
  let currentIndex = Object.prototype.hasOwnProperty.call(statusStages, statusKey)
    ? statusStages[statusKey]
    : -1;
  const fundingStatus = projectWorkspaceValue(deal.fundingStatus, deal.funding_status);
  if (fundingStatus && /(funded|confirmed|received)/i.test(fundingStatus)) currentIndex = Math.max(currentIndex, 1);
  const farmerConfirmed = deal.farmerConfirmed === true
    || deal.farmer_confirmed === true
    || deal.funding_received_at != null
    || cycles.some(cycle => cycle?.fundingReceived === true || cycle?.funding_received_at != null);
  if (farmerConfirmed) currentIndex = Math.max(currentIndex, 2);
  const productionStarted = cycles.some(cycle => {
    const cycleStatus = projectWorkspaceValue(cycle?.cycleStatus, cycle?.status) || '';
    return cycle?.fundingReceived === true
      || cycle?.started_at != null
      || /(active|started|reported|completed)/i.test(cycleStatus);
  })
    || /(active|production|completed)/i.test(projectWorkspaceValue(deal.cycleStatus, deal.cycle_status) || '');
  if (productionStarted) currentIndex = Math.max(currentIndex, 2);
  const reportRecorded = reports.length > 0
    || /submitted|approved|published/i.test(projectWorkspaceValue(deal.reportStatus, deal.report_status) || '')
    || cycles.some(cycle => cycle?.report || /submitted|approved|published/i.test(projectWorkspaceValue(cycle?.reportStatus, cycle?.report_status) || ''));
  if (reportRecorded) currentIndex = Math.max(currentIndex, 3);
  const settlementRecorded = returns.length > 0
    || /recorded|approved|paid|reconciled|settled/i.test(projectWorkspaceValue(deal.returnStatus, deal.return_status) || '');
  if (settlementRecorded) currentIndex = Math.max(currentIndex, 4);
  return currentIndex;
}

function projectWorkspaceFormatDate(value) {
  if (value == null || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function projectWorkspaceItemDate(items, fields) {
  for (const item of items) {
    for (const field of fields) {
      const date = projectWorkspaceFormatDate(item?.[field]);
      if (date) return date;
    }
  }
  return null;
}

function projectWorkspaceEventDate(events, pattern) {
  const event = [...events].reverse().find(item => pattern.test(String(item?.event_type || '')));
  return projectWorkspaceFormatDate(event?.created_at);
}

function projectWorkspaceStageDates({ deal = {}, cycles = [], reports = [], returns = [], events = [] } = {}) {
  return [
    projectWorkspaceFormatDate(projectWorkspaceValue(deal.funded_at, deal.funding_received_at))
      || projectWorkspaceEventDate(events, /funded|funding confirmed/i),
    projectWorkspaceFormatDate(projectWorkspaceValue(deal.farmer_confirmed_at, deal.farmer_confirmation_at))
      || projectWorkspaceItemDate(cycles, ['funding_received_at', 'fundingReceivedAt'])
      || projectWorkspaceEventDate(events, /farmer.*confirm/i),
    projectWorkspaceFormatDate(deal.production_completed_at)
      || projectWorkspaceItemDate([...cycles].reverse(), ['completed_at', 'completedAt'])
      || projectWorkspaceEventDate(events, /cycle completed|cycle_completed|production completed/i),
    projectWorkspaceFormatDate(deal.reports_completed_at)
      || projectWorkspaceItemDate([...reports].reverse(), ['published_at', 'approved_at', 'submitted_at', 'created_at'])
      || projectWorkspaceEventDate(events, /report approved|report published|report submitted|cycle_reported/i),
    projectWorkspaceFormatDate(deal.settled_at)
      || projectWorkspaceItemDate([...returns].reverse(), ['reconciled_at', 'paid_at'])
      || projectWorkspaceEventDate(events, /settlement completed|settled|reconciled/i),
    projectWorkspaceFormatDate(deal.completed_at)
      || projectWorkspaceEventDate(events, /^completed$|project completed/i),
  ];
}

function projectWorkspaceCurrentCycle(deal = {}, status = null, cycles = []) {
  const statusCycle = status && typeof status === 'object' ? status.current_cycle : null;
  const activeCycle = cycles.find(cycle => /active|started|funding_received/i.test(
    projectWorkspaceValue(cycle?.cycleStatus, cycle?.status) || ''
  )) || cycles[0];
  return projectWorkspaceValue(
    statusCycle,
    deal.currentCycle,
    deal.current_cycle,
    deal.activeCycleId,
    activeCycle?.cycle_num,
    activeCycle?.cycleNumber,
    activeCycle?.id
  ) || 'Cycle unavailable';
}

function projectWorkspaceNextMilestone(deal, currentIndex, timelineStages) {
  const explicitMilestone = projectWorkspaceValue(deal.next_milestone, deal.nextMilestone);
  if (explicitMilestone) return explicitMilestone;
  if (currentIndex < 0) return 'Milestone unavailable';
  if (currentIndex >= timelineStages.length - 1) return 'No further milestone';
  return timelineStages[currentIndex + 1];
}

function projectWorkspaceFarmerAction(deal, currentIndex, cycles, reports) {
  const explicitAction = projectWorkspaceValue(deal.next_required_action, deal.next_action, deal.nextAction);
  if (explicitAction) return explicitAction;
  const reportStatus = projectWorkspaceValue(
    deal.reportStatus,
    deal.report_status,
    reports[0]?.status,
    cycles.find(cycle => cycle?.reportStatus)?.reportStatus
  ) || '';
  if (/changes required|correction|rejected/i.test(reportStatus)) return 'Update and resubmit the Project Report';
  if (/submitted|under review/i.test(reportStatus)) return 'Wait for AgriPartners report review';
  if (currentIndex < 0) return 'Required action unavailable';
  if (currentIndex <= 1) return 'Confirm Funding receipt with AgriPartners';
  if (currentIndex === 2) return 'Submit the next Project Report';
  if (currentIndex === 3) return 'Complete report follow-up with AgriPartners';
  if (currentIndex === 4) return 'Complete Project closeout requirements';
  return 'No action required';
}

function projectWorkspaceDueInformation(deal, cycles, reports) {
  const currentCycle = cycles.find(cycle => /active|started|due/i.test(
    projectWorkspaceValue(cycle?.cycleStatus, cycle?.status, cycle?.reportStatus) || ''
  )) || cycles[0];
  const dueDate = projectWorkspaceFormatDate(projectWorkspaceValue(
    deal.next_due_at,
    deal.report_due_at,
    currentCycle?.report_due_at,
    currentCycle?.due_at,
    reports[0]?.due_at
  ));
  return dueDate ? `Due ${dueDate}` : 'Due information unavailable';
}

function projectWorkspaceOperatorAttention(deal = {}) {
  if (Array.isArray(deal.attention_items)) {
    return deal.attention_items.length
      ? `${deal.attention_items.length} attention item${deal.attention_items.length === 1 ? '' : 's'}`
      : 'No attention items reported';
  }
  const count = Number(deal.attention_count ?? deal.exception_count);
  if (Number.isFinite(count)) return count ? `${count} attention item${count === 1 ? '' : 's'}` : 'No attention items reported';
  if (deal.attention_required === true || deal.action_required === true) return 'Attention required';
  if (deal.attention_required === false && deal.action_required !== true) return 'No attention items reported';
  return 'Attention data unavailable';
}

function projectWorkspacePendingItems(deal, cycles, reports, returns) {
  const pending = [];
  if (cycles.some(cycle => cycle?.fundingReceived === false
    && /funding sent|funding_sent/i.test(projectWorkspaceValue(cycle?.status, cycle?.cycleStatus) || ''))) {
    pending.push('Farmer confirmation');
  }
  const reportStatus = projectWorkspaceValue(deal.reportStatus, deal.report_status);
  if (/submitted|under review/i.test(reportStatus || '')
    || reports.some(report => /submitted|under review/i.test(String(report?.status || '')))) {
    pending.push('Report review');
  }
  if (returns.some(entry => /recorded|approved|paid/i.test(String(entry?.payment_status || '')))) {
    pending.push('Settlement review');
  }
  if (pending.length) return `${pending.join(', ')} pending`;
  const hasOperationalData = cycles.length > 0 || reports.length > 0 || returns.length > 0
    || reportStatus != null || deal.fundingStatus != null || deal.funding_status != null;
  return hasOperationalData ? 'No pending confirmations or reviews' : 'Pending review data unavailable';
}

function projectWorkspaceRoleDetails({ role, deal, currentIndex, timelineStages, cycles, reports, returns }) {
  const currentStage = currentIndex < 0 ? 'Stage unavailable' : timelineStages[currentIndex];
  if (role === 'farmer') {
    return [
      ['Current stage', currentStage],
      ['Next required action', projectWorkspaceFarmerAction(deal, currentIndex, cycles, reports)],
      ['Due information', projectWorkspaceDueInformation(deal, cycles, reports)],
    ];
  }
  if (role === 'operator') {
    return [
      ['Current stage', currentStage],
      ['Operational attention', projectWorkspaceOperatorAttention(deal)],
      ['Pending confirmations / reviews', projectWorkspacePendingItems(deal, cycles, reports, returns)],
    ];
  }
  return [
    ['Current stage', currentStage],
    ['Next milestone', projectWorkspaceNextMilestone(deal, currentIndex, timelineStages)],
  ];
}

function projectFinancialAmount(deal = {}, fields = []) {
  const value = projectWorkspaceValue(...fields.map(field => deal[field]));
  if (value == null) return 'Not available';
  if (/[$€£]|\b(?:USD|EUR|NEAR|UZS)\b/i.test(value)) return value;
  return `${value} NEAR`;
}

function projectFinancialFundingStatus(deal = {}, status = null) {
  const explicit = projectWorkspaceValue(deal.fundingStatus, deal.funding_status);
  if (explicit) return explicit;
  const projectStatus = projectWorkspaceStatus(deal, status) || '';
  if (/funded|active|cycle|production|reports|settlement|settled|completed/i.test(projectStatus)) {
    return 'Funding Confirmed';
  }
  if (/funding|approved/i.test(projectStatus)) return 'Funding Pending';
  return 'Not available';
}

function projectFinancialFarmerConfirmation(deal = {}, cycles = []) {
  const explicit = projectWorkspaceValue(
    deal.farmerFundingConfirmation,
    deal.farmer_funding_confirmation
  );
  if (explicit) return explicit;
  if (deal.farmerConfirmed === true
    || deal.farmer_confirmed === true
    || deal.funding_received_at != null
    || cycles.some(cycle => cycle?.fundingReceived === true || cycle?.funding_received_at != null)) {
    return 'Confirmed';
  }
  if (deal.farmerConfirmed === false
    || deal.farmer_confirmed === false
    || cycles.some(cycle => cycle?.fundingReceived === false)) {
    return 'Pending';
  }
  const fundingStatus = projectWorkspaceValue(deal.fundingStatus, deal.funding_status) || '';
  return /confirmed|received/i.test(fundingStatus) ? 'Confirmed' : 'Not available';
}

function projectFinancialPendingReports(deal = {}, cycles = [], reports = []) {
  const pendingPattern = /due|pending|submitted|under review|changes required|correction/i;
  const pendingReports = reports.filter(report => pendingPattern.test(
    projectWorkspaceValue(report?.status, report?.reportStatus, report?.report_status) || ''
  ));
  const pendingCycles = cycles.filter(cycle => pendingPattern.test(
    projectWorkspaceValue(cycle?.reportStatus, cycle?.report_status) || ''
  ));
  const explicitStatus = projectWorkspaceValue(deal.reportStatus, deal.report_status) || '';
  const count = pendingReports.length || pendingCycles.length || (pendingPattern.test(explicitStatus) ? 1 : 0);
  if (count) return `${count} pending report${count === 1 ? '' : 's'}`;
  const hasReportData = reports.length > 0 || cycles.some(cycle => (
    cycle?.report != null || cycle?.reportStatus != null || cycle?.report_status != null
  )) || explicitStatus !== '';
  return hasReportData ? 'No pending reports' : 'Not available';
}

function projectFinancialSettlementStatus(deal = {}, returns = []) {
  const explicit = projectWorkspaceValue(
    deal.settlementStatus,
    deal.settlement_status,
    deal.returnStatus,
    deal.return_status
  );
  const latestReturn = returns.length ? returns[returns.length - 1] : null;
  const raw = explicit || projectWorkspaceValue(
    latestReturn?.settlement_status,
    latestReturn?.payment_status,
    latestReturn?.status
  );
  if (!raw) return 'Not available';
  const labels = {
    no_returns: 'No returns recorded',
    partial: 'Partially settled',
    completed: 'Completed',
    recorded: 'Return recorded',
    approved: 'Approved',
    paid: 'Paid',
    reconciled: 'Reconciled',
  };
  return labels[raw.toLowerCase()] || raw;
}

function projectFinancialOverviewItems({
  role,
  deal,
  status,
  cycles,
  reports,
  returns,
  currentStage,
  currentCycle,
}) {
  const fundingStatus = projectFinancialFundingStatus(deal, status);
  if (role === 'farmer') {
    return [
      ['Funding Status', fundingStatus],
      ['Current Production Cycle', currentCycle],
      ['Project Budget', projectFinancialAmount(deal, [
        'display_project_budget', 'projectBudget', 'project_budget', 'budget',
      ])],
      ['Next Required Action', projectWorkspaceFarmerAction(
        deal,
        projectWorkspaceTimelineIndex({ deal, status, cycles, reports, returns }),
        cycles,
        reports
      )],
    ];
  }
  if (role === 'operator') {
    return [
      ['Investment Amount', projectFinancialAmount(deal, [
        'display_amount', 'displayAmount', 'funding', 'investmentAmount', 'investment_amount', 'invested_amount', 'amount',
      ])],
      ['Funding Status', fundingStatus],
      ['Farmer Funding Confirmation', projectFinancialFarmerConfirmation(deal, cycles)],
      ['Current Cycle', currentCycle],
      ['Pending Reports', projectFinancialPendingReports(deal, cycles, reports)],
      ['Settlement Status', projectFinancialSettlementStatus(deal, returns)],
      ['Operational Attention', projectWorkspaceOperatorAttention(deal)],
    ];
  }
  const projectedRoi = projectWorkspaceValue(
    deal.projectedRoi,
    deal.projected_roi_pct,
    deal.roi_percent,
    deal.roi
  );
  return [
    ['Investment Amount', projectFinancialAmount(deal, [
      'display_amount', 'displayAmount', 'investmentAmount', 'investment_amount', 'invested_amount', 'amount',
    ])],
    ['Funding Status', fundingStatus],
    ['Current Project Stage', currentStage],
    ['Current Production Cycle', currentCycle],
    ['Projected ROI', projectedRoi == null
      ? 'Not available'
      : (projectedRoi.includes('%') ? projectedRoi : `${projectedRoi}%`)],
    ['Projected Return', projectFinancialAmount(deal, [
      'display_expected_return', 'displayExpectedReturn', 'projectedTotalPayout', 'expected_return',
    ])],
    ['Settlement Status', projectFinancialSettlementStatus(deal, returns)],
  ];
}

function renderProjectFinancialOverview({
  deal = {},
  status = null,
  cycles = [],
  reports = [],
  returns = [],
  role = 'investor',
  currentStage = null,
  currentCycle = null,
} = {}) {
  const visibleRole = role === 'farmer' || role === 'operator' ? role : 'investor';
  const stageIndex = projectWorkspaceTimelineIndex({ deal, status, cycles, reports, returns });
  const timelineStages = ['Funding', 'Farmer Confirmation', 'Production', 'Reports', 'Settlement', 'Completed'];
  const resolvedStage = currentStage || (stageIndex < 0 ? 'Stage unavailable' : timelineStages[stageIndex]);
  const resolvedCycle = currentCycle || projectWorkspaceCurrentCycle(deal, status, cycles);
  const items = projectFinancialOverviewItems({
    role: visibleRole,
    deal,
    status,
    cycles,
    reports,
    returns,
    currentStage: resolvedStage,
    currentCycle: resolvedCycle,
  });
  return `
    <section id="project-financial-overview" data-project-financial-overview data-financial-role="${escapeHtml(visibleRole)}" class="mt-5 pt-5 border-t border-slate-700">
      <div class="flex flex-wrap items-end justify-between gap-2 mb-3">
        <div>
          <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Project Financial Overview</h2>
          <p class="text-xs text-slate-500 mt-1">Current Project data for this workspace role.</p>
        </div>
      </div>
      <dl class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        ${items.map(([label, value]) => `
          <div class="bg-slate-900 border border-slate-700 rounded-lg p-3" data-financial-field="${escapeHtml(label)}">
            <dt class="text-xs text-slate-500">${escapeHtml(label)}</dt>
            <dd class="text-sm font-semibold text-slate-100 mt-1 break-words">${escapeHtml(value)}</dd>
          </div>
        `).join('')}
      </dl>
    </section>
  `;
}

function projectActivityDefinition(value) {
  const raw = projectWorkspaceValue(value) || '';
  const normalized = raw.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const definitions = [
    [/farmer.*(?:funding|funds).*(?:confirm|receiv)|funding received/, 'farmer_confirmation', 'Farmer Funding Confirmation', 'Confirmed', '&#10003;'],
    [/farmer.*report.*(?:approv|publish)|report.*(?:approv|publish)/, 'report_approved', 'Farmer Report Approved', 'Approved', '&#128196;'],
    [/farmer.*report.*submit|report submitted|cycle reported/, 'report_submitted', 'Farmer Report Submitted', 'Submitted', '&#128196;'],
    [/settlement completed|settled|reconciled|^completed$/, 'settlement_completed', 'Settlement Completed', 'Completed', '&#8644;'],
    [/settlement started|return recorded|return approved/, 'settlement_started', 'Settlement Started', 'In progress', '&#8644;'],
    [/cycle completed|production completed/, 'cycle_completed', 'Cycle Completed', 'Completed', '&#10003;'],
    [/cycle updated|production cycle updated/, 'production_updated', 'Production Cycle Updated', 'Updated', '&#8635;'],
    [/production started|cycle active|cycle started|funding received/, 'production_started', 'Production Started', 'In progress', '&#9654;'],
    [/funding confirmed|project funded|^funded$/, 'funding_confirmed', 'Funding Confirmed', 'Completed', '&#36;'],
  ];
  const match = definitions.find(([pattern]) => pattern.test(normalized));
  if (match) {
    return {
      type: match[1],
      title: match[2],
      status: match[3],
      icon: match[4],
      known: true,
    };
  }
  const title = normalized
    ? normalized.replace(/\b\w/g, character => character.toUpperCase())
    : 'Internal Workflow Update';
  return {
    type: 'internal_workflow',
    title,
    status: 'Internal',
    icon: '&#8226;',
    known: false,
  };
}

function projectActivityTimestampValue(item = {}) {
  return projectWorkspaceValue(
    item.created_at,
    item.createdAt,
    item.timestamp,
    item.occurred_at,
    item.occurredAt,
    item.updated_at,
    item.updatedAt
  );
}

function projectActivityFormatTimestamp(value) {
  if (!value) return 'Timestamp unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Timestamp unavailable';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function projectActivityCycleLabel(item = {}) {
  const cycle = projectWorkspaceValue(
    item.cycle_num,
    item.cycleNumber,
    item.cycle_number,
    item.cycle
  );
  return cycle ? ` Production Cycle ${cycle}.` : '';
}

function projectActivityDescription(definition, item = {}, role = 'investor') {
  if (role === 'operator') {
    const operatorDescription = projectWorkspaceValue(
      item.internal_note,
      item.operator_note,
      item.description,
      item.summary,
      item.note
    );
    if (operatorDescription) return operatorDescription;
  }
  const cycleLabel = projectActivityCycleLabel(item);
  const descriptions = {
    funding_confirmed: 'Investor Funding has been confirmed by AgriPartners.',
    farmer_confirmation: `The Farmer confirmed receipt of fiat Funding.${cycleLabel}`,
    production_started: `Agricultural production has started.${cycleLabel}`,
    production_updated: `Production progress was updated.${cycleLabel}`,
    report_submitted: `The Farmer submitted a Project Report to AgriPartners.${cycleLabel}`,
    report_approved: `AgriPartners approved a Farmer Project Report.${cycleLabel}`,
    cycle_completed: `The Production Cycle was completed.${cycleLabel}`,
    settlement_started: 'The Project Settlement workflow has started.',
    settlement_completed: 'Project Settlement has been completed and recorded.',
    internal_workflow: 'An internal Project workflow update was recorded.',
  };
  return descriptions[definition.type];
}

function projectActivityItem(raw = {}, role = 'investor', forcedType = null) {
  const definition = projectActivityDefinition(forcedType || raw.event_type || raw.type || raw.title || raw.status);
  const timestamp = projectActivityTimestampValue(raw);
  const isInternal = raw.internal === true
    || raw.operator_only === true
    || /operator|internal/i.test(projectWorkspaceValue(raw.visibility, raw.audience) || '')
    || definition.type === 'internal_workflow';
  return {
    ...definition,
    description: projectActivityDescription(definition, raw, role),
    timestamp,
    timestampLabel: projectActivityFormatTimestamp(timestamp),
    sortTimestamp: timestamp && !Number.isNaN(new Date(timestamp).getTime())
      ? new Date(timestamp).getTime()
      : Number.NEGATIVE_INFINITY,
    cycle: projectWorkspaceValue(raw.cycle_num, raw.cycleNumber, raw.cycle_number, raw.cycle),
    isInternal,
  };
}

function projectActivityReportItems(reports = [], cycles = [], role = 'investor') {
  const cycleReports = cycles
    .filter(cycle => cycle?.report)
    .map(cycle => ({
      ...cycle.report,
      cycle_num: cycle.cycle_num ?? cycle.cycleNumber ?? cycle.id,
      status: cycle.report.status ?? cycle.reportStatus ?? cycle.report_status,
      submitted_at: cycle.report.submitted_at ?? cycle.report.submittedAt,
      approved_at: cycle.report.approved_at ?? cycle.report.approvedAt,
      published_at: cycle.report.published_at ?? cycle.report.publishedAt,
    }));
  return [...reports, ...cycleReports].flatMap(report => {
    const status = projectWorkspaceValue(report?.status, report?.reportStatus, report?.report_status) || '';
    const cycle = report?.cycle_num ?? report?.cycleNumber ?? report?.cycle_number;
    const items = [];
    if (/approved|published/i.test(status)
      || report?.approved_at
      || report?.approvedAt
      || report?.published_at
      || report?.publishedAt) {
      items.push(projectActivityItem({
        ...report,
        cycle_num: cycle,
        created_at: report.approved_at
          || report.approvedAt
          || report.published_at
          || report.publishedAt
          || report.updated_at
          || report.updatedAt
          || report.created_at
          || report.createdAt,
      }, role, 'Farmer Report Approved'));
    } else if (/submitted|under review|changes required/i.test(status)
      || report?.submitted_at
      || report?.submittedAt
      || report?.created_at
      || report?.createdAt) {
      items.push(projectActivityItem({
        ...report,
        cycle_num: cycle,
        created_at: report.submitted_at || report.submittedAt || report.created_at || report.createdAt,
      }, role, 'Farmer Report Submitted'));
    }
    return items;
  });
}

function projectActivityCycleItems(cycles = [], role = 'investor') {
  return cycles.flatMap(cycle => {
    const items = [];
    const cycleNumber = cycle?.cycle_num ?? cycle?.cycleNumber ?? cycle?.id;
    if (cycle?.fundingReceived === true || cycle?.funding_received_at) {
      items.push(projectActivityItem({
        cycle_num: cycleNumber,
        created_at: cycle.funding_received_at || cycle.fundingReceivedAt,
      }, role, 'Farmer Funding Confirmation'));
    }
    const cycleStatus = projectWorkspaceValue(cycle?.cycleStatus, cycle?.status) || '';
    if (cycle?.started_at || /active|started|funding_received/i.test(cycleStatus)) {
      items.push(projectActivityItem({
        cycle_num: cycleNumber,
        created_at: cycle.started_at || cycle.start_date || cycle.created_at,
      }, role, 'Production Started'));
    }
    if (cycle?.completed_at || /completed/i.test(cycleStatus)) {
      items.push(projectActivityItem({
        cycle_num: cycleNumber,
        created_at: cycle.completed_at || cycle.updated_at,
      }, role, 'Cycle Completed'));
    } else if (cycle?.updated_at && !cycle?.started_at) {
      items.push(projectActivityItem({
        cycle_num: cycleNumber,
        created_at: cycle.updated_at,
      }, role, 'Production Cycle Updated'));
    }
    return items;
  });
}

function projectActivityReturnItems(returns = [], role = 'investor') {
  return returns.flatMap(entry => {
    const returnStatus = projectWorkspaceValue(
      entry?.settlement_status,
      entry?.payment_status,
      entry?.status
    ) || '';
    const completed = /paid|reconciled|settled|completed/i.test(returnStatus);
    const started = /recorded|approved|pending|processing/i.test(returnStatus);
    if (!completed && !started) return [];
    return [projectActivityItem({
      ...entry,
      created_at: completed
        ? (entry.reconciled_at
          || entry.reconciledAt
          || entry.paid_at
          || entry.paidAt
          || entry.updated_at
          || entry.updatedAt
          || entry.created_at
          || entry.createdAt)
        : (entry.approved_at || entry.approvedAt || entry.created_at || entry.createdAt),
    }, role, completed ? 'Settlement Completed' : 'Settlement Started')];
  });
}

function projectActivityAlertItems(deal = {}, role = 'operator') {
  if (role !== 'operator' || !Array.isArray(deal.attention_items)) return [];
  return deal.attention_items.map(item => {
    const source = item && typeof item === 'object' ? item : { description: item };
    const activity = projectActivityItem({
      ...source,
      event_type: 'Operational Alert',
      operator_only: true,
    }, role);
    return {
      ...activity,
      type: 'operational_alert',
      title: 'Operational Alert',
      status: 'Alert',
      icon: '&#33;',
    };
  });
}

function projectActivityItems({
  deal = {},
  cycles = [],
  reports = [],
  returns = [],
  events = [],
  role = 'investor',
} = {}) {
  const visibleRole = role === 'farmer' || role === 'operator' ? role : 'investor';
  const embeddedActivities = Array.isArray(deal.activities)
    ? deal.activities
    : (Array.isArray(deal.activity) ? deal.activity : []);
  const eventItems = [...events, ...embeddedActivities].map(event => projectActivityItem(event, visibleRole));
  const allItems = [
    ...eventItems,
    ...projectActivityReportItems(reports, cycles, visibleRole),
    ...projectActivityCycleItems(cycles, visibleRole),
    ...projectActivityReturnItems(returns, visibleRole),
    ...projectActivityAlertItems(deal, visibleRole),
  ];
  const investorTypes = new Set([
    'funding_confirmed',
    'farmer_confirmation',
    'production_started',
    'production_updated',
    'report_approved',
    'cycle_completed',
    'settlement_started',
    'settlement_completed',
  ]);
  const farmerTypes = new Set([
    'funding_confirmed',
    'farmer_confirmation',
    'production_started',
    'production_updated',
    'report_submitted',
    'report_approved',
    'cycle_completed',
    'settlement_started',
    'settlement_completed',
  ]);
  const visibleItems = allItems.filter(item => {
    if (visibleRole === 'operator') return true;
    if (item.isInternal) return false;
    return visibleRole === 'farmer' ? farmerTypes.has(item.type) : investorTypes.has(item.type);
  });
  const seen = new Set();
  return visibleItems
    .filter(item => {
      const key = `${item.type}|${item.timestamp || ''}|${item.cycle || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((left, right) => right.sortTimestamp - left.sortTimestamp);
}

function projectActivityContext({ role, deal, status, cycles, reports, returns }) {
  const timelineStages = ['Funding', 'Farmer Confirmation', 'Production', 'Reports', 'Settlement', 'Completed'];
  const currentIndex = projectWorkspaceTimelineIndex({ deal, status, cycles, reports, returns });
  if (role === 'farmer') {
    return [
      ['Next required action', projectWorkspaceFarmerAction(deal, currentIndex, cycles, reports)],
    ];
  }
  if (role === 'operator') {
    const farmerConfirmation = projectFinancialFarmerConfirmation(deal, cycles);
    return [
      ['Pending approvals', projectFinancialPendingReports(deal, cycles, reports)],
      ['Pending confirmations', farmerConfirmation === 'Pending' ? 'Farmer confirmation pending' : farmerConfirmation],
      ['Operational alerts', projectWorkspaceOperatorAttention(deal)],
      ['Internal workflow status', projectWorkspaceStatus(deal, status) || 'Not available'],
    ];
  }
  return [
    ['Next expected milestone', projectWorkspaceNextMilestone(deal, currentIndex, timelineStages)],
  ];
}

function renderProjectActivityFeed({
  deal = {},
  status = null,
  cycles = [],
  reports = [],
  returns = [],
  events = [],
  role = 'investor',
} = {}) {
  const visibleRole = role === 'farmer' || role === 'operator' ? role : 'investor';
  const items = projectActivityItems({ deal, cycles, reports, returns, events, role: visibleRole });
  const context = projectActivityContext({
    role: visibleRole, deal, status, cycles, reports, returns,
  });
  const statusClasses = {
    Completed: 'border-green-800 bg-green-950 text-green-200',
    Confirmed: 'border-green-800 bg-green-950 text-green-200',
    Approved: 'border-green-800 bg-green-950 text-green-200',
    Submitted: 'border-blue-800 bg-blue-950 text-blue-200',
    'In progress': 'border-blue-800 bg-blue-950 text-blue-200',
    Updated: 'border-slate-600 bg-slate-800 text-slate-200',
    Alert: 'border-amber-700 bg-amber-950 text-amber-200',
    Internal: 'border-purple-800 bg-purple-950 text-purple-200',
  };
  return `
    <section id="project-activity-feed" data-project-activity-feed data-activity-role="${escapeHtml(visibleRole)}" class="mt-5 pt-5 border-t border-slate-700">
      <div class="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Project Activity Feed</h2>
          <p class="text-xs text-slate-500 mt-1">Newest Project activity appears first.</p>
        </div>
      </div>
      <dl class="grid sm:grid-cols-2 ${context.length > 2 ? 'lg:grid-cols-4' : ''} gap-2 mt-3" data-activity-context>
        ${context.map(([label, value]) => `
          <div class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
            <dt class="text-xs text-slate-500">${escapeHtml(label)}</dt>
            <dd class="text-sm text-slate-200 mt-1">${escapeHtml(value)}</dd>
          </div>
        `).join('')}
      </dl>
      ${items.length ? `
        <ol class="grid gap-3 mt-4" aria-label="Project activity, newest first">
          ${items.map(item => `
            <li data-activity-type="${escapeHtml(item.type)}" class="bg-slate-900 border border-slate-700 rounded-lg p-3 sm:p-4">
              <div class="flex items-start gap-3">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-600 text-green-300 text-base" aria-hidden="true">${item.icon}</span>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div class="min-w-0">
                      <h3 class="text-sm font-semibold text-slate-100">${escapeHtml(item.title)}</h3>
                      <p class="text-sm text-slate-400 mt-1">${escapeHtml(item.description)}</p>
                    </div>
                    <span class="self-start shrink-0 text-xs font-semibold border rounded-full px-2 py-0.5 ${statusClasses[item.status] || statusClasses.Updated}">${escapeHtml(item.status)}</span>
                  </div>
                  <time class="block text-xs text-slate-500 mt-2" ${item.timestamp ? `datetime="${escapeHtml(item.timestamp)}"` : ''}>${escapeHtml(item.timestampLabel)}</time>
                </div>
              </div>
            </li>
          `).join('')}
        </ol>
      ` : `
        <div data-activity-empty class="bg-slate-900 border border-dashed border-slate-700 rounded-lg px-4 py-6 mt-4 text-center">
          <p class="text-sm font-medium text-slate-300">No Project activity yet</p>
          <p class="text-xs text-slate-500 mt-1">Milestones, reports, and workflow updates will appear here.</p>
        </div>
      `}
    </section>
  `;
}

function projectDocumentSafeUrl(value) {
  const url = projectWorkspaceValue(value);
  if (!url) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^https?:/i.test(url)) return null;
  return url;
}

function projectDocumentModelAsset(deal = {}, audience = 'investor') {
  const projectKey = projectWorkspaceValue(
    deal.pilot_key,
    deal.investment_model,
    deal.investment_model_name,
    deal.deal_type,
    deal.title
  ) || '';
  const model = /fidlot/i.test(projectKey)
    ? 'Fidlot-v5.9-6040'
    : (/hissar|variantb/i.test(projectKey) ? 'VariantB-v2.1-6040' : null);
  if (!model) return null;
  const audienceName = audience === 'farmer' ? 'Farmer' : 'Investor';
  return `assets/financial-models/en/Agri-${audienceName}-${model}-EN.pdf`;
}

function projectDocumentReportState(reports = [], cycles = []) {
  const cycleReports = cycles.flatMap(cycle => cycle?.report ? [{
    ...cycle.report,
    status: cycle.report.status ?? cycle.reportStatus ?? cycle.report_status,
  }] : []);
  const allReports = [...reports, ...cycleReports];
  const approved = allReports.filter(report => /approved|published/i.test(
    projectWorkspaceValue(report?.status, report?.reportStatus, report?.report_status) || ''
  ));
  const submitted = allReports.filter(report => /submitted|approved|published|under review/i.test(
    projectWorkspaceValue(report?.status, report?.reportStatus, report?.report_status) || ''
  ) || report?.submitted_at || report?.submittedAt);
  return { approved, submitted };
}

function projectDocumentCard({
  title,
  category,
  description,
  status = 'Coming Soon',
  url = null,
  action = null,
  roles = [],
}) {
  const safeUrl = projectDocumentSafeUrl(url);
  const normalizedStatus = status === 'Available' && !safeUrl ? 'Coming Soon' : status;
  return {
    title,
    category,
    description,
    status: ['Available', 'Coming Soon', 'Restricted'].includes(normalizedStatus)
      ? normalizedStatus
      : 'Coming Soon',
    url: safeUrl,
    action: safeUrl ? (action || 'View') : 'Coming Soon',
    roles,
  };
}

function projectDocumentCatalog({
  deal = {},
  reports = [],
  cycles = [],
  role = 'investor',
} = {}) {
  const reportState = projectDocumentReportState(reports, cycles);
  const projectOverviewUrl = projectDocumentSafeUrl(projectWorkspaceValue(
    deal.projectOverviewUrl,
    deal.project_overview_url,
    deal.overview_url
  )) || '#project-workspace-header';
  const investorSummaryUrl = projectDocumentSafeUrl(projectWorkspaceValue(
    deal.investmentSummaryUrl,
    deal.investment_summary_url
  )) || projectDocumentModelAsset(deal, 'investor');
  const financialOverviewUrl = projectDocumentSafeUrl(projectWorkspaceValue(
    deal.financialOverviewUrl,
    deal.financial_overview_url
  )) || '#project-financial-overview';
  const approvedReportUrl = projectDocumentSafeUrl(projectWorkspaceValue(
    reportState.approved[0]?.document_url,
    reportState.approved[0]?.documentUrl,
    reportState.approved[0]?.file_url,
    reportState.approved[0]?.fileUrl
  )) || (reportState.approved.length ? '#project-activity-feed' : null);
  const farmerAgreementUrl = projectDocumentSafeUrl(projectWorkspaceValue(
    deal.farmerAgreementUrl,
    deal.farmer_agreement_url
  ));
  const submittedReportUrl = projectDocumentSafeUrl(projectWorkspaceValue(
    reportState.submitted[0]?.document_url,
    reportState.submitted[0]?.documentUrl,
    reportState.submitted[0]?.file_url,
    reportState.submitted[0]?.fileUrl
  )) || (reportState.submitted.length ? '#project-activity-feed' : null);
  const operatingInstructionsUrl = projectDocumentSafeUrl(projectWorkspaceValue(
    deal.operatingInstructionsUrl,
    deal.operating_instructions_url
  ));

  const investorDocuments = [
    projectDocumentCard({
      title: 'Project Overview',
      category: 'Project',
      description: 'Shared Project identity, lifecycle, participants, and current operating context.',
      status: 'Available',
      url: projectOverviewUrl,
      roles: ['investor', 'farmer', 'operator'],
    }),
    projectDocumentCard({
      title: 'Investment Summary',
      category: 'Investor',
      description: 'Approved Investment Model terms and Project investment summary.',
      status: investorSummaryUrl ? 'Available' : 'Coming Soon',
      url: investorSummaryUrl,
      action: 'Download',
      roles: ['investor', 'operator'],
    }),
    projectDocumentCard({
      title: 'Financial Overview',
      category: 'Investor',
      description: 'Role-appropriate Project funding, projections, returns, and Settlement status.',
      status: 'Available',
      url: financialOverviewUrl,
      roles: ['investor', 'operator'],
    }),
    projectDocumentCard({
      title: 'Approved Farmer Reports',
      category: 'Investor Reporting',
      description: reportState.approved.length
        ? `${reportState.approved.length} approved Farmer Report${reportState.approved.length === 1 ? '' : 's'} available.`
        : 'Approved Farmer Reports will appear after AgriPartners review.',
      status: approvedReportUrl ? 'Available' : 'Coming Soon',
      url: approvedReportUrl,
      roles: ['investor', 'operator'],
    }),
    projectDocumentCard({
      title: 'Legal Documents',
      category: 'Legal',
      description: 'Project legal documents are controlled under participant and disclosure rules.',
      status: 'Restricted',
      roles: ['investor', 'operator'],
    }),
  ];

  const farmerDocuments = [
    projectDocumentCard({
      title: 'Farmer Agreement',
      category: 'Farmer',
      description: farmerAgreementUrl
        ? 'The Farmer Agreement associated with this Project.'
        : 'Agreement access will be provided through the approved Project document process.',
      status: farmerAgreementUrl ? 'Available' : 'Restricted',
      url: farmerAgreementUrl,
      action: 'Download',
      roles: ['farmer', 'operator'],
    }),
    projectDocumentCard({
      title: 'Submitted Reports',
      category: 'Farmer Reporting',
      description: reportState.submitted.length
        ? `${reportState.submitted.length} submitted Project Report${reportState.submitted.length === 1 ? '' : 's'} available.`
        : 'Submitted Farmer Reports will appear here.',
      status: submittedReportUrl ? 'Available' : 'Coming Soon',
      url: submittedReportUrl,
      roles: ['farmer', 'operator'],
    }),
    projectDocumentCard({
      title: 'Operating Instructions',
      category: 'Operations',
      description: 'Project-specific operating instructions and approved Farmer guidance.',
      status: operatingInstructionsUrl ? 'Available' : 'Coming Soon',
      url: operatingInstructionsUrl,
      action: 'Download',
      roles: ['farmer', 'operator'],
    }),
  ];

  const operatorDocuments = [
    projectDocumentCard({
      title: 'Internal Project Notes',
      category: 'Internal',
      description: 'Internal workflow notes and operational decision records.',
      status: 'Coming Soon',
      roles: ['operator'],
    }),
    projectDocumentCard({
      title: 'Compliance Documents',
      category: 'Compliance',
      description: 'Controlled compliance and participant review records.',
      status: 'Restricted',
      roles: ['operator'],
    }),
    projectDocumentCard({
      title: 'Settlement Documents',
      category: 'Settlement',
      description: 'Settlement calculations, approvals, confirmations, and reconciliation records.',
      status: 'Coming Soon',
      roles: ['operator'],
    }),
  ];

  const catalog = role === 'farmer'
    ? [investorDocuments[0], ...farmerDocuments]
    : (role === 'operator'
      ? [...investorDocuments, ...farmerDocuments, ...operatorDocuments]
      : investorDocuments);
  return catalog;
}

function projectCustomDocuments(documents = [], role = 'investor') {
  return documents
    .filter(document => {
      if (!document || typeof document !== 'object') return false;
      if (role === 'operator') return true;
      const roles = Array.isArray(document.roles)
        ? document.roles
        : (document.role ? [document.role] : []);
      return roles.length === 0 || roles.includes(role);
    })
    .map(document => projectDocumentCard({
      title: projectWorkspaceValue(document.title, document.name) || 'Untitled Document',
      category: projectWorkspaceValue(document.category) || 'Project',
      description: projectWorkspaceValue(document.description) || 'Project document.',
      status: projectWorkspaceValue(document.availability, document.status)
        || (projectDocumentSafeUrl(document.url || document.file_url) ? 'Available' : 'Coming Soon'),
      url: document.url || document.file_url,
      action: document.action,
      roles: document.roles,
    }));
}

function renderProjectDocumentAction(document) {
  if (document.status !== 'Available' || !document.url) {
    return `<button type="button" disabled class="w-full sm:w-auto bg-slate-800 text-slate-500 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed">Coming Soon</button>`;
  }
  const externalAttributes = document.url.startsWith('#')
    ? ''
    : ' target="_blank" rel="noopener noreferrer"';
  const downloadAttribute = document.action === 'Download' ? ' download' : '';
  return `<a href="${escapeHtml(document.url)}"${externalAttributes}${downloadAttribute} class="inline-flex w-full sm:w-auto items-center justify-center bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">${escapeHtml(document.action)}</a>`;
}

function renderProjectDocuments({
  deal = {},
  cycles = [],
  reports = [],
  role = 'investor',
  documents = null,
} = {}) {
  const visibleRole = role === 'farmer' || role === 'operator' ? role : 'investor';
  const cards = Array.isArray(documents)
    ? projectCustomDocuments(documents, visibleRole)
    : [
      ...projectDocumentCatalog({ deal, reports, cycles, role: visibleRole }),
      ...projectCustomDocuments(Array.isArray(deal.documents) ? deal.documents : [], visibleRole),
    ];
  const statusClasses = {
    Available: 'border-green-800 bg-green-950 text-green-200',
    'Coming Soon': 'border-slate-600 bg-slate-800 text-slate-300',
    Restricted: 'border-amber-700 bg-amber-950 text-amber-200',
  };
  return `
    <section id="project-documents" data-project-documents data-documents-role="${escapeHtml(visibleRole)}" class="mt-5 pt-5 border-t border-slate-700">
      <div>
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Project Documents</h2>
        <p class="text-xs text-slate-500 mt-1">Role-authorized Project files, summaries, and document placeholders.</p>
      </div>
      ${cards.length ? `
        <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4" aria-label="Project documents">
          ${cards.map(document => `
            <article data-document-title="${escapeHtml(document.title)}" data-document-status="${escapeHtml(document.status)}" class="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col">
              <div class="flex items-start gap-3">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-600 text-green-300" aria-hidden="true">&#128196;</span>
                <div class="min-w-0 flex-1">
                  <h3 class="text-sm font-semibold text-slate-100">${escapeHtml(document.title)}</h3>
                  <p class="text-xs text-slate-500 mt-1">${escapeHtml(document.category)}</p>
                </div>
                <span class="shrink-0 text-xs font-semibold border rounded-full px-2 py-0.5 ${statusClasses[document.status]}">${escapeHtml(document.status)}</span>
              </div>
              <p class="text-sm text-slate-400 mt-3 flex-1">${escapeHtml(document.description)}</p>
              <div class="mt-4">${renderProjectDocumentAction(document)}</div>
            </article>
          `).join('')}
        </div>
      ` : `
        <div data-documents-empty class="bg-slate-900 border border-dashed border-slate-700 rounded-lg px-4 py-6 mt-4 text-center">
          <p class="text-sm font-medium text-slate-300">No Project documents available</p>
          <p class="text-xs text-slate-500 mt-1">Authorized documents and placeholders will appear here.</p>
        </div>
      `}
    </section>
  `;
}

function renderProjectWorkspaceHeader({
  deal = {},
  status = null,
  cycles = [],
  reports = [],
  returns = [],
  events = [],
  role = 'investor',
} = {}) {
  const projectName = projectWorkspaceValue(deal.title, deal.project_name, deal.project_title, deal.name)
    || (deal.id != null ? `Project #${deal.id}` : 'Project name unavailable');
  const investmentModel = projectWorkspaceValue(
    deal.investment_model_name,
    deal.investment_model,
    deal.deal_type
  ) || 'Investment Model unavailable';
  const projectStatus = projectWorkspaceStatus(deal, status) || 'Status unavailable';
  const farmer = projectWorkspaceFarmer(deal);
  const timelineStages = ['Funding', 'Farmer Confirmation', 'Production', 'Reports', 'Settlement', 'Completed'];
  const currentIndex = projectWorkspaceTimelineIndex({ deal, status, cycles, reports, returns });
  const isCompleted = currentIndex === timelineStages.length - 1;
  const stageDates = projectWorkspaceStageDates({ deal, cycles, reports, returns, events });
  const currentCycle = projectWorkspaceCurrentCycle(deal, status, cycles);
  const roleDetails = projectWorkspaceRoleDetails({
    role, deal, currentIndex, timelineStages, cycles, reports, returns,
  });

  return `
    <section id="project-workspace-header" data-project-workspace-header class="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <span class="block text-xs font-semibold text-green-300 uppercase tracking-wide">Project Workspace</span>
          <h1 aria-label="Project Name" class="text-2xl md:text-3xl font-bold text-slate-50 mt-1">${escapeHtml(projectName)}</h1>
        </div>
        <span class="text-xs font-semibold bg-slate-900 text-slate-200 border border-slate-600 px-3 py-1 rounded-full">${escapeHtml(projectStatus)}</span>
      </div>
      <dl class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
          <dt class="text-xs text-slate-500">Investment Model</dt>
          <dd class="text-sm font-semibold text-slate-100 mt-1">${escapeHtml(investmentModel)}</dd>
        </div>
        <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
          <dt class="text-xs text-slate-500">Project Status</dt>
          <dd class="text-sm font-semibold text-slate-100 mt-1">${escapeHtml(projectStatus)}</dd>
        </div>
        <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
          <dt class="text-xs text-slate-500">Project Operator</dt>
          <dd class="text-sm font-semibold text-slate-100 mt-1">AgriPartners</dd>
        </div>
        <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
          <dt class="text-xs text-slate-500">Farmer</dt>
          <dd class="text-sm font-semibold text-slate-100 mt-1 break-all">${escapeHtml(farmer)}</dd>
        </div>
      </dl>
      <div class="mt-5">
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Timeline</h2>
        <ol class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2" aria-label="Project timeline">
          ${timelineStages.map((label, index) => {
            const isCurrentStage = index === currentIndex;
            const state = isCompleted || index < currentIndex
              ? 'completed'
              : (isCurrentStage ? 'current' : 'upcoming');
            const stageStatus = state === 'completed'
              ? (isCurrentStage ? 'Completed · Current stage' : 'Completed')
              : (state === 'current' ? 'Current' : 'Upcoming');
            const completionText = state === 'completed'
              ? `Completion: ${stageDates[index] || 'Date unavailable'}`
              : (state === 'current' ? 'Completion: Pending' : 'Completion: Not available');
            const stateClass = `${state === 'completed'
              ? 'border-green-800 bg-green-950 text-green-200'
              : (state === 'current'
                ? 'border-blue-700 bg-blue-950 text-blue-100'
                : 'border-slate-700 bg-slate-900 text-slate-400')}${isCurrentStage && isCompleted ? ' ring-2 ring-green-400' : ''}`;
            const marker = state === 'completed' ? '&#10003;' : (state === 'current' ? '&#8226;' : index + 1);
            return `
              <li data-project-stage="${escapeHtml(label)}" data-stage-state="${state}" class="border rounded-lg px-3 py-2 ${stateClass}" ${isCurrentStage ? 'aria-current="step"' : ''}>
                <span class="block text-xs opacity-75">${marker}</span>
                <span class="block text-sm font-medium mt-1">${escapeHtml(label)}</span>
                <span class="block text-xs font-semibold mt-2">${stageStatus}</span>
                <span class="block text-xs opacity-75 mt-1">${escapeHtml(completionText)}</span>
                ${label === 'Production' ? `<span class="block text-xs opacity-75 mt-1">Current cycle: ${escapeHtml(currentCycle)}</span>` : ''}
              </li>
            `;
          }).join('')}
        </ol>
        <dl class="grid sm:grid-cols-2 ${roleDetails.length > 2 ? 'lg:grid-cols-3' : ''} gap-2 mt-3" data-timeline-role="${escapeHtml(role)}">
          ${roleDetails.map(([label, value]) => `
            <div class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
              <dt class="text-xs text-slate-500">${escapeHtml(label)}</dt>
              <dd class="text-sm text-slate-200 mt-1">${escapeHtml(value)}</dd>
            </div>
          `).join('')}
        </dl>
      </div>
      ${renderProjectFinancialOverview({
        deal,
        status,
        cycles,
        reports,
        returns,
        role,
        currentStage: currentIndex < 0 ? 'Stage unavailable' : timelineStages[currentIndex],
        currentCycle,
      })}
      ${renderProjectActivityFeed({
        deal,
        status,
        cycles,
        reports,
        returns,
        events,
        role,
      })}
      ${renderProjectDocuments({
        deal,
        cycles,
        reports,
        role,
      })}
    </section>
  `;
}

function renderAdminDemoDealCard(deal) {
  return `
    <div class="bg-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-2 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold bg-slate-700 px-2 py-0.5 rounded text-slate-300">Pilot Project</span>
          ${statusBadge(deal.status)}
          <span class="text-xs text-slate-500">${escapeHtml(deal.cycles)} cycles</span>
        </div>
        <h2 class="text-xl font-semibold text-slate-100">${escapeHtml(deal.title)}</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm">
          <p class="text-slate-400">Farmer Assignment: <span class="text-slate-200">${escapeHtml(deal.farmer)}</span></p>
          <p class="text-slate-400">Project Operator: <span class="text-slate-200">AgriPartners</span></p>
          <p class="text-slate-400">Funding: <span class="text-slate-100 font-mono">${escapeHtml(deal.funding)}</span></p>
          <p class="text-slate-400">${escapeHtml(deal.roiLabel)}: <span class="text-slate-100 font-mono">${escapeHtml(deal.roi)}</span></p>
          <p class="text-slate-400">Simple annualized ROI: <span class="text-slate-100 font-mono">${escapeHtml(deal.simpleAnnualizedRoi)}</span></p>
          <p class="text-slate-400">Report: <span class="text-slate-200">${escapeHtml(deal.reportStatus)}</span></p>
          <p class="text-slate-400">Funding Status: <span class="text-slate-200">${escapeHtml(deal.fundingStatus)}</span></p>
          <p class="text-slate-400">Return Status: <span class="text-slate-200">${escapeHtml(deal.returnStatus)}</span></p>
        </div>
      </div>
      <div class="flex flex-col gap-2 shrink-0">
        <a href="#deals/pilots/${escapeHtml(deal.pilot_key)}" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition">Open</a>
        <a href="#/protection/${escapeHtml(deal.pilot_key)}" class="protection-cta">✦ Protection table</a>
      </div>
    </div>
  `;
}

function showAdminPilotDetail(key) {
  showView('view-detail');
  const el = document.getElementById('view-detail');
  const pilot = getPilotByKey(key);
  if (!pilot) {
    el.innerHTML = `
      ${renderNav()}
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition">
          <span class="text-lg leading-none" aria-hidden="true">&larr;</span>
          Back home
        </a>
        <span class="text-slate-600">|</span>
        <a href="#demo/admin" class="text-slate-400 hover:text-white text-sm">Back to Admin Dashboard</a>
      </div>
      <div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Pilot profile unavailable</div>
    `;
    return;
  }
  renderAdminDemoDealDetail(el, adminDemoDealFromPilot(pilot));
}

function renderAdminDemoDealDetail(el, deal) {
  el.innerHTML = `
    ${renderNav()}
    ${renderEnvironmentBanner('demo', 'Admin Project')}
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition">
        <span class="text-lg leading-none" aria-hidden="true">&larr;</span>
        Back home
      </a>
      <span class="text-slate-600">|</span>
      <a href="#demo/admin" class="text-slate-400 hover:text-white text-sm">Back to Admin Dashboard</a>
      <span class="text-slate-600">|</span>
      <span class="font-semibold">${escapeHtml(deal.title)}</span>
      <span class="text-xs text-slate-500">Pilot Project</span>
      ${statusBadge(deal.status)}
      ${deal.status === 'Active' ? `<span class="text-slate-400 text-sm">Production Cycle ${escapeHtml(deal.currentCycle)}</span>` : ''}
    </div>
    ${renderProjectWorkspaceHeader({
      deal,
      status: deal.status,
      events: adminDemoEvents(deal),
      role: 'operator',
    })}
    ${renderAdminDemoProjectProfile(deal)}
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-slate-800 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Funding Status</h3>
        ${renderAdminDemoStatusRows([
          ['Funding Status', deal.fundingStatus],
          ['Funding', deal.funding],
          ['Farmer Assignment', deal.farmer],
          ['Project Operator', 'AgriPartners'],
        ])}
      </div>
      <div class="bg-slate-800 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Cycle Status</h3>
        ${renderAdminDemoStatusRows([
          ['Production Cycle Status', deal.cycleStatus],
          ['Production Cycles', deal.cycles],
          ['Current Production Cycle', deal.status === 'Active' ? deal.currentCycle : 'Completed'],
          ['Project Report', deal.reportStatus],
        ])}
      </div>
    </div>
    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Farmer Report</h3>
      ${renderAdminDemoReport(deal)}
    </div>
    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Returns History</h3>
      ${renderAdminDemoReturns(deal)}
    </div>
    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Event History</h3>
      <div id="admin-demo-events-list">${renderEvents(adminDemoEvents(deal))}</div>
    </div>
  `;
}

function renderAdminDemoProjectProfile(deal) {
  const metrics = [
    ['Funding', deal.funding],
    [deal.roiLabel, deal.roi],
    ['Simple annualized ROI', deal.simpleAnnualizedRoi],
    ['Protection reserve', `${deal.reserveRate}%`],
    ['Production Cycles', deal.cycles],
    ['Project Status', deal.status],
  ];
  return `
    <section class="bg-slate-800 border border-green-900 rounded-lg p-5 mb-6">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <span class="text-xs font-semibold text-green-300 uppercase tracking-wide">Project Profile</span>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-50 mt-1">${escapeHtml(deal.title)}</h1>
          <p class="text-sm text-slate-400 mt-2 max-w-3xl">${escapeHtml(deal.description)}</p>
        </div>
        <span class="text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700 px-2 py-1 rounded">Investment Model: ${escapeHtml(deal.deal_type)}</span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        ${metrics.map(([label, value]) => `
          <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <span class="block text-xs text-slate-500">${escapeHtml(label)}</span>
            <span class="block text-lg font-bold text-slate-100">${escapeHtml(value)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderAdminDemoStatusRows(rows) {
  return rows.map(([label, value]) => `
    <div class="flex justify-between text-sm gap-3 py-1">
      <span class="text-slate-400 shrink-0">${escapeHtml(label)}</span>
      <span class="text-slate-100 font-mono text-right break-all">${escapeHtml(value)}</span>
    </div>
  `).join('');
}

function renderAdminDemoReport(deal) {
  if (deal.reportStatus === 'Report Submitted') {
    return renderFarmerReportSummary({
      title: deal.reportTitle,
      description: deal.reportDescription,
      amountUsed: 'Pilot operations',
      submittedAt: new Date().toISOString(),
    });
  }
  return `
    <div class="farmer-report-summary">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h4 class="font-semibold text-slate-100">Next Report Due</h4>
        <span class="text-xs bg-amber-900 text-amber-100 px-2 py-1 rounded">Pending</span>
      </div>
      <p class="text-sm text-slate-400 mt-2">The active Hissar cycle is funded and operating. Farmer report is pending for the next update.</p>
    </div>
  `;
}

function renderAdminDemoReturns(deal) {
  return `
    <div class="grid sm:grid-cols-3 gap-3">
      ${[
        ['Return Status', deal.returnStatus],
        ['Returns Recorded', deal.returnedAmount],
        ['Outstanding', deal.outstandingAmount],
      ].map(([label, value]) => `
        <div class="metric-box">
          <span class="metric-label">${escapeHtml(label)}</span>
          <span class="metric-value">${escapeHtml(value)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function adminDemoEvents(deal) {
  const now = new Date().toISOString();
  if (deal.pilot_key === 'fidlot') {
    return [
      { event_type: 'Funding Confirmed', cycle_num: 7, tx_hash: null, created_at: now },
      { event_type: 'Report Submitted', cycle_num: 7, tx_hash: null, created_at: now },
      { event_type: 'Return Recorded', cycle_num: 7, tx_hash: null, created_at: now },
      { event_type: 'Completed', cycle_num: null, tx_hash: null, created_at: now },
    ];
  }
  return [
    { event_type: 'Funding Confirmed', cycle_num: 1, tx_hash: null, created_at: now },
    { event_type: 'Cycle Active', cycle_num: 1, tx_hash: null, created_at: now },
    { event_type: 'Next Report Due', cycle_num: 1, tx_hash: null, created_at: now },
    { event_type: 'Pending', cycle_num: null, tx_hash: null, created_at: now },
  ];
}

// --- Onboarding ---

async function showOnboarding() {
  showView('view-onboarding');
  const el = document.getElementById('view-onboarding');
  const wallet = getNearWalletAccount();

  if (!isWalletAuth() || !wallet) {
    el.innerHTML = `
      <div class="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200">
        An authenticated Alpha session is required to create a profile.
      </div>
    `;
    return;
  }

  try {
    const data = await fetchMyProfile();
    if (data.profile) {
      applyProfileToAuth(data.profile);
      location.hash = portalHashForRole(data.profile.role);
      return;
    }
  } catch (err) {
    el.innerHTML = `<div class="bg-red-900 text-red-200 px-4 py-3 rounded">Unable to load profile: ${escapeHtml(err.message)}</div>`;
    return;
  }

  el.innerHTML = `
    ${renderEnvironmentBanner('demo', 'Wallet onboarding')}
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-green-400 mb-1">Welcome to AgriPartners</h1>
      <p class="text-slate-400">Create an Alpha/Testnet participant profile. Future Pilot Farmers use AgriPartners-provided access and fiat workflows.</p>
    </div>

    <form id="onboarding-form" class="bg-slate-800 rounded-xl p-6 space-y-5">
      <div>
        <label class="block text-sm text-slate-400 mb-2">Choose your role</label>
        <div class="onboarding-role-grid">
          <button type="button" class="onboarding-role-btn is-selected" data-role="farmer">
            <span class="onboarding-role-title">Farmer</span>
            <span class="onboarding-role-note">Work with AgriPartners to manage Projects and submit Project Reports.</span>
          </button>
          <button type="button" class="onboarding-role-btn" data-role="investor">
            <span class="onboarding-role-title">Investor</span>
            <span class="onboarding-role-note">Review Projects, Farmer Reports, and Settlement / Returns.</span>
          </button>
        </div>
      </div>

      <input type="hidden" id="onboarding-role" value="farmer" />

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-slate-400 mb-1">Display Name</label>
          <input id="onboarding-display-name" type="text" maxlength="120" required
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Country</label>
          <input id="onboarding-country" type="text" maxlength="80"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Phone</label>
          <input id="onboarding-phone" type="tel" maxlength="40"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Organization / Farm Name</label>
          <input id="onboarding-organization" type="text" maxlength="160"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
      </div>

      <div>
        <label class="block text-sm text-slate-400 mb-1">Bio</label>
        <textarea id="onboarding-bio" rows="4" maxlength="1000"
          class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500"></textarea>
      </div>

      <div id="onboarding-error" class="hidden bg-red-900 text-red-200 px-3 py-2 rounded text-sm"></div>
      <button type="submit" id="btn-create-profile" class="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium transition">
        Create Profile
      </button>
    </form>
  `;

  document.querySelectorAll('.onboarding-role-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.onboarding-role-btn').forEach(item => item.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      document.getElementById('onboarding-role').value = btn.dataset.role;
    });
  });
  document.getElementById('onboarding-form').addEventListener('submit', submitOnboarding);
}

async function submitOnboarding(event) {
  event.preventDefault();
  const errEl = document.getElementById('onboarding-error');
  const btn = document.getElementById('btn-create-profile');
  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Creating profile...';

  const payload = {
    role: document.getElementById('onboarding-role').value,
    displayName: document.getElementById('onboarding-display-name').value.trim(),
    country: document.getElementById('onboarding-country').value.trim(),
    phone: document.getElementById('onboarding-phone').value.trim(),
    organizationName: document.getElementById('onboarding-organization').value.trim(),
    bio: document.getElementById('onboarding-bio').value.trim(),
  };

  try {
    const res = await fetch(`${API_BASE}/api/profile/onboarding`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    applyProfileToAuth(data.profile);
    location.hash = portalHashForRole(data.profile.role);
  } catch (err) {
    errEl.textContent = err.message || 'Profile creation failed';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Create Profile';
  }
}

// --- Farmer Portal ---

async function fetchFarmerJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? jsonAuthHeaders() : authHeaders()),
      ...(options.headers || {}),
    },
  });
  let data = {};
  let parseError = null;
  try {
    data = await res.json();
  } catch {
    parseError = new Error(`Farmer API returned invalid JSON for ${path}`);
  }
  if (res.status === 401) {
    clearAuth();
    throw new Error('Farmer Portal session expired');
  }
  if (parseError) throw parseError;
  if (res.status === 403 || res.status === 404) {
    throw new Error(data.error || 'Farmer Project not found');
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function showFarmerPortal() {
  showView('view-farmer');
  const el = document.getElementById('view-farmer');
  el.innerHTML = `
    ${renderNav()}
    ${renderEnvironmentBanner('pilot', 'Farmer')}
    ${renderRoleEntrySummary('farmer')}
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-green-400 mb-1">My Projects</h1>
      <p class="text-slate-400">Farmer operations managed through AgriPartners.</p>
      <p class="text-slate-400 mt-2">Project Operator: <span class="text-slate-200 font-medium">AgriPartners</span></p>
    </div>
    <div id="farmer-dashboard-content">
      <h2 class="text-xl font-semibold mb-4">Active Projects</h2>
      <div class="spinner"></div>
    </div>
  `;

  const contentEl = document.getElementById('farmer-dashboard-content');
  try {
    const [profileData, dealsData] = await Promise.all([
      fetchFarmerJson('/api/profile/me'),
      fetchFarmerJson('/api/farmer/deals'),
    ]);
    const farmerData = normalizeFarmerDashboardPayload(dealsData);
    const profile = normalizeFarmerProfilePayload(profileData);
    renderFarmerDashboard(contentEl, farmerData.deals, farmerData.farmer, profile);
  } catch (err) {
    contentEl.querySelector('.spinner')?.remove();
    contentEl.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Farmer Portal unavailable: ${escapeHtml(err.message)}</div>`;
  }
}

function normalizeFarmerDashboardPayload(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.deals)) {
    throw new Error('Farmer Projects returned malformed data');
  }
  if (!payload.deals.every(deal => deal && typeof deal === 'object' && !Array.isArray(deal))) {
    throw new Error('Farmer Projects returned malformed data');
  }
  return {
    farmer: payload.farmer || getNearWalletAccount() || '',
    deals: payload.deals.map(normalizeLiveFarmerDeal),
  };
}

function normalizeFarmerProfilePayload(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Farmer profile returned malformed data');
  if (payload.profile == null) return {};
  if (typeof payload.profile !== 'object' || Array.isArray(payload.profile)) {
    throw new Error('Farmer profile returned malformed data');
  }
  return payload.profile;
}

function normalizeLiveFarmerDeal(deal = {}) {
  return {
    ...deal,
    id: deal.id ?? null,
    title: deal.title || null,
    description: deal.description || null,
    status: deal.status || 'Unknown',
    activeCycleId: deal.activeCycleId ?? null,
    fundingStatus: deal.fundingStatus || null,
    reportStatus: deal.reportStatus || null,
    reportLabel: deal.reportLabel || null,
  };
}

function farmerProfileValue(profile, field, fallback = 'Not set') {
  const value = profile?.[field];
  return value ? escapeHtml(value) : fallback;
}

function farmerDemoProfile(profile = {}) {
  return {
    ...profile,
    displayName: 'AgriPartners Pilot Farm',
    organizationName: 'AgriPartners Pilot Farm',
    region: 'Tashkent Region',
    activity: 'Hissar Sheep Breeding',
    status: 'Active',
    role: 'farmer',
  };
}

function farmerDashboardMetrics(deals) {
  deals = Array.isArray(deals) ? deals : [];
  const allUsd = deals.length > 0 && deals.every((deal) => deal.display_currency === 'USD');
  const totalFunding = deals.reduce(
    (sum, deal) => allUsd ? sum : addYoctoSafe(sum, deal.amount ?? deal.investment_amount),
    '0'
  );
  const activeCycles = deals.filter((deal) => deal.activeCycleId != null).length;
  const activeStatuses = ['Initialized', 'Funded', 'CycleActive', 'CycleSettlement', 'Active'];
  const activeDeals = deals.filter((deal) => activeStatuses.includes(deal.status)).length;
  const hasReportStatus = deals.some((deal) => deal.reportStatus != null);
  const reportsSubmitted = deals.filter((deal) => deal.reportStatus === 'submitted').length;
  const nextReportDue = deals.filter((deal) => deal.reportStatus === 'pending' || deal.reportStatus === 'due').length;
  const currentCycle = deals.find((deal) => deal.activeCycleId != null)?.activeCycleId
    ?? deals.find((deal) => activeStatuses.includes(deal.status))?.current_cycle
    ?? 'Unavailable';
  return {
    activeDeals,
    totalFunding,
    displayTotalFunding: allUsd
      ? formatUsdAmount(deals.reduce((sum, deal) => sum + parseNearAmount(deal.amount), 0))
      : null,
    activeCycles,
    currentCycle,
    reportsSubmitted: hasReportStatus ? reportsSubmitted : null,
    nextReportDue: hasReportStatus ? nextReportDue : null,
  };
}

function addYoctoSafe(total, value) {
  if (value == null || value === '') return total;
  try {
    return addYocto(total, value);
  } catch {
    return total;
  }
}

function farmerProfileDisplay(profile, farmer) {
  const source = profile || {};
  return {
    farmName: source.organizationName || source.displayName || 'Unavailable',
    region: source.region || source.country || 'Unavailable',
    activity: source.activity || source.bio || 'Unavailable',
    farmerAccount: farmer || source.walletAccountId || 'Not connected',
    status: source.status || 'Unknown',
    role: source.role || 'Unknown',
  };
}

function renderFarmerProfilePanel(profile, farmer) {
  const displayProfile = farmerProfileDisplay(profile, farmer);
  return `
    <div class="bg-slate-800 border border-green-900 rounded-xl p-5 mb-4">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span class="text-xs font-semibold text-green-300 uppercase tracking-wide">Farm Profile</span>
          <h2 class="text-xl font-semibold text-slate-100 mt-1">${escapeHtml(displayProfile.farmName)}</h2>
          <p class="text-sm text-slate-400 mt-1">${escapeHtml(displayProfile.activity)}</p>
        </div>
        <span class="text-xs font-semibold bg-green-950 border border-green-800 px-2 py-1 rounded text-green-200">${escapeHtml(displayProfile.status)}</span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 text-sm">
        <div>
          <span class="block text-slate-500">Farm Name</span>
          <span class="text-slate-200">${escapeHtml(displayProfile.farmName)}</span>
        </div>
        <div>
          <span class="block text-slate-500">Region</span>
          <span class="text-slate-200">${escapeHtml(displayProfile.region)}</span>
        </div>
        <div>
          <span class="block text-slate-500">Activity / Livestock Type</span>
          <span class="text-slate-200">${escapeHtml(displayProfile.activity)}</span>
        </div>
        <div>
          <span class="block text-slate-500">Farmer Account</span>
          <span class="text-slate-200 font-mono break-all">${escapeHtml(displayProfile.farmerAccount)}</span>
        </div>
        <div>
          <span class="block text-slate-500">Status</span>
          <span class="text-slate-200">${escapeHtml(displayProfile.status)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderFarmerSummaryCards(metrics) {
  const totalFunding = metrics.displayTotalFunding || 'Available in Project terms';
  const rawFunding = metrics.displayTotalFunding
    ? '<span class="metric-raw">Financial view in USD</span>'
    : '<span class="metric-raw">AgriPartners-managed fiat workflow</span>';
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      <div class="metric-box">
        <span class="metric-label">Project Funding</span>
        <span class="metric-value">${escapeHtml(totalFunding)}</span>
        ${rawFunding}
      </div>
      <div class="metric-box">
        <span class="metric-label">Active Projects</span>
        <span class="metric-value">${metrics.activeDeals}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Production Cycle</span>
        <span class="metric-value">${escapeHtml(metrics.currentCycle)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Reports Submitted</span>
        <span class="metric-value">${metrics.reportsSubmitted ?? 'Unavailable'}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Next Report Due</span>
        <span class="metric-value">${metrics.nextReportDue ?? 'Unavailable'}</span>
      </div>
    </div>
  `;
}

function renderFarmerEmptyState(farmer) {
  return `
    <div class="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h2 class="text-xl font-semibold text-slate-100 mb-2">No active Projects yet</h2>
      <p class="text-slate-400 mb-4">
        Your Farmer profile is ready. Once AgriPartners assigns a Project, it will appear here.
      </p>
      <div class="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 mb-4">
        <span class="block text-xs uppercase text-slate-500 font-semibold">Secure account reference</span>
        <span id="farmer-wallet-copy-value" class="text-slate-100 font-mono break-all">${escapeHtml(farmer || 'Not connected')}</span>
      </div>
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-slate-300 mb-2">Next steps</h3>
        <ul class="list-disc list-inside text-sm text-slate-400 space-y-1">
          <li>Confirm your secure account reference with AgriPartners</li>
          <li>Prepare your farm information</li>
          <li>Wait for your first Project to be assigned</li>
        </ul>
      </div>
      <button id="btn-copy-farmer-wallet" type="button" class="admin-action-btn">Copy Account Reference</button>
      <span id="farmer-wallet-copy-state" class="ml-3 text-sm text-green-300 hidden">Copied</span>
    </div>
  `;
}

function bindFarmerDashboardActions(farmer) {
  document.getElementById('btn-copy-farmer-wallet')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(farmer || '');
      document.getElementById('farmer-wallet-copy-state')?.classList.remove('hidden');
    } catch {
      document.getElementById('farmer-wallet-copy-state')?.classList.remove('hidden');
      document.getElementById('farmer-wallet-copy-state').textContent = 'Copy unavailable';
    }
  });
}

function renderFarmerDashboard(el, deals, farmer, profile = null) {
  el.querySelector('.spinner')?.remove();
  deals = Array.isArray(deals) ? deals : [];
  const metrics = farmerDashboardMetrics(deals);

  if (deals.length === 0) {
    el.innerHTML = `
      ${renderFarmerProfilePanel(profile, farmer)}
      ${renderFarmerSummaryCards(metrics)}
      ${renderFarmerEmptyState(farmer)}
    `;
    bindFarmerDashboardActions(farmer);
    return;
  }

  el.innerHTML = `
    ${renderFarmerProfilePanel(profile, farmer)}
    ${renderFarmerSummaryCards(metrics)}
    <h2 class="text-xl font-semibold mb-4">Active Projects</h2>
    <div class="grid gap-4">
      ${deals.map(renderFarmerDealCard).join('')}
    </div>
  `;
}

function farmerDealNextAction(deal) {
  if (deal.reportStatus === 'submitted') return 'Review submitted report and cycle status';
  if (deal.reportStatus === 'due' || deal.reportStatus === 'pending') return 'Prepare next farmer report';
  if (deal.fundingStatus && !String(deal.fundingStatus).toLowerCase().includes('confirmed')) return 'Confirm funding received';
  if (deal.status === 'Completed') return 'Review completed Project summary';
  return 'Open Project to review the current Production Cycle';
}

function farmerDealProjectedRoi(deal) {
  const roi = deal.projected_roi_pct ?? deal.roi_percent ?? deal.roi;
  if (roi == null || roi === '') return 'Not available';
  return String(roi).includes('%') ? String(roi) : `${roi}%`;
}

function renderFarmerDealCard(deal) {
  const dealBadge = deal.isDemoPilot ? 'Pilot Project' : `Project #${deal.id}`;
  const dealHref = deal.isDemoPilot ? `#farmer/pilots/${deal.pilot_key}` : `#farmer/deals/${deal.id}`;
  const amount = deal.display_amount || formatFarmerFundingAmount(deal.amount ?? deal.investment_amount);
  const activeCycle = deal.activeCycleId ?? 'Unavailable';
  return `
    <div class="bg-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold bg-slate-700 px-2 py-0.5 rounded text-slate-300">${escapeHtml(dealBadge)}</span>
          ${statusBadge(deal.status)}
          <span class="text-xs text-slate-500">Production Cycle: ${escapeHtml(activeCycle)}</span>
        </div>
        <h3 class="text-lg font-semibold text-slate-100">${escapeHtml(deal.title || `Project #${deal.id}`)}</h3>
        <p class="text-sm text-slate-400">Project Operator: <span class="text-slate-200">AgriPartners</span></p>
        <p class="text-sm text-slate-400">Funding: <span class="text-slate-100 font-mono">${escapeHtml(amount)}</span></p>
        <p class="text-sm text-slate-400">Production Cycle: <span class="text-slate-200">${escapeHtml(activeCycle)}</span></p>
        <p class="text-sm text-slate-400">Funding Confirmation: <span class="text-slate-200">${escapeHtml(deal.fundingStatus || 'Unavailable')}</span></p>
        <p class="text-sm text-slate-400">Project Report: <span class="text-slate-200">${escapeHtml(deal.reportLabel || 'Unavailable')}</span></p>
        <p class="text-sm text-slate-400">Projected ROI: <span class="text-slate-200">${escapeHtml(farmerDealProjectedRoi(deal))}</span></p>
        <p class="text-sm text-green-300">Next action: ${escapeHtml(farmerDealNextAction(deal))}</p>
      </div>
      <a href="${escapeHtml(dealHref)}" class="shrink-0 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition">Open Project</a>
    </div>
  `;
}

function formatFarmerFundingAmount(value) {
  if (value == null || value === '') return 'Unavailable';
  return 'Available in Project terms';
}

async function showFarmerDeal(id, actionState = null) {
  showView('view-farmer');
  const el = document.getElementById('view-farmer');
  el.innerHTML = `
    ${renderNav()}
    <a href="#farmer" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">Back to Farmer Portal</a>
    <div class="spinner"></div>
  `;

  try {
    const bundle = await fetchFarmerDealBundle(id);
    renderFarmerDealDetail(el, bundle);
    if (actionState) showFarmerActionResult(actionState.type, actionState.message);
  } catch (err) {
    el.querySelector('.spinner')?.remove();
    el.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Project unavailable: ${escapeHtml(err.message)}</div>`;
  }
}

async function fetchFarmerDealBundle(id) {
  const [dealResult, cyclesResult, balancesResult] = await Promise.allSettled([
    fetchFarmerJson(`/api/farmer/deals/${id}`),
    fetchFarmerJson(`/api/farmer/deals/${id}/cycles`),
    fetchFarmerJson(`/api/deals/${id}/balances`),
  ]);
  const deal = readMandatoryFarmerDealResult(dealResult);
  const cycles = readOptionalFarmerResource(cyclesResult, 'Cycle status', normalizeFarmerCyclesPayload, []);
  const balances = readOptionalFarmerResource(balancesResult, 'Farmer balances', normalizeFarmerBalancesPayload, null);
  return {
    deal,
    cycles: cycles.data,
    balances: balances.data,
    resourceErrors: {
      cycles: cycles.error,
      balances: balances.error,
    },
  };
}

function readMandatoryFarmerDealResult(result) {
  if (result.status === 'rejected') {
    throw new Error(result.reason?.message || 'Farmer Project request failed');
  }
  const payload = result.value;
  if (!payload || typeof payload !== 'object'
    || !payload.deal || typeof payload.deal !== 'object' || Array.isArray(payload.deal)
    || (payload.raw != null && (typeof payload.raw !== 'object' || Array.isArray(payload.raw)))) {
    throw new Error('Farmer Project returned malformed data');
  }
  return normalizeLiveFarmerDeal({ ...(payload.raw || {}), ...payload.deal });
}

function readOptionalFarmerResource(result, label, normalize, fallback) {
  if (result.status === 'rejected') {
    return { data: fallback, error: `${label} unavailable: ${result.reason?.message || 'request failed'}` };
  }
  try {
    return { data: normalize(result.value), error: null };
  } catch (err) {
    return { data: fallback, error: err.message || `${label} returned malformed data` };
  }
}

function normalizeFarmerCyclesPayload(payload) {
  if (!payload || !Array.isArray(payload.cycles)
    || !payload.cycles.every(cycle => cycle && typeof cycle === 'object' && !Array.isArray(cycle))) {
    throw new Error('Cycle status returned malformed data');
  }
  return payload.cycles;
}

function normalizeFarmerBalancesPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Farmer balances returned malformed data');
  }
  return payload;
}

function showPublicProtectionModel(key) {
  const model = INVESTOR_PROTECTION_MODELS[key];
  const pilot = getPilotByKey(key);
  showView('view-home');
  const el = document.getElementById('view-home');

  if (!model || !pilot) {
    el.innerHTML = '<div class="bg-red-900 text-red-200 px-4 py-3 rounded">Protection model unavailable</div>';
    return;
  }

  const deal = farmerDemoDealFromPilot(pilot, '');
  el.innerHTML = `
    <header class="landing-nav">
      <a href="#home" class="landing-brand">AgriPartners</a>
      <div class="landing-nav-actions">
        <a href="#home">Home</a>
        <a href="#/marketplace">Opportunity Catalog</a>
        <a href="#farmer/pilots">Farmer Demo</a>
      </div>
    </header>
    <main class="public-protection-page">
      <a href="#home" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition mb-6">&larr; Back home</a>
      <section class="public-protection-hero">
        <div>
          <span>Public protection schedule</span>
          <h1>${escapeHtml(model.title)}</h1>
          <p>
            One shared explanation for investors, farmers, administrators, and public visitors.
            This is the canonical USD no-loss projection used across AgriPartners demo surfaces.
          </p>
        </div>
        <div class="public-protection-hero-metrics">
          <div><span>Reserve rate</span><strong>${escapeHtml(model.rate)}%</strong></div>
          <div><span>Scheduled contributions</span><strong>${escapeHtml(model.scheduledReserve)}</strong></div>
          <div><span>Minimum until completion</span><strong>${escapeHtml(model.minimumReserve)}</strong></div>
        </div>
      </section>
      ${renderFarmerReserveBreakdown(deal, farmerDemoCycles(pilot), null, null, { hidePublicLink: true })}
      <section class="public-protection-audiences">
        <h2>Continue in the view relevant to you</h2>
        <div>
          <a class="landing-btn landing-btn-primary" href="#/investor/pilots/${escapeHtml(key)}">Investor view</a>
          <a class="landing-btn" href="#farmer/pilots/${escapeHtml(key)}">Farmer view</a>
          <a class="landing-btn" href="#deals/pilots/${escapeHtml(key)}">Admin view</a>
          <a class="landing-btn" href="${model.investorPdfEn}" target="_blank" rel="noopener noreferrer">Investor PDF · EN</a>
          <a class="landing-btn" href="${model.investorPdfRu}" target="_blank" rel="noopener noreferrer">Investor PDF · RU</a>
        </div>
      </section>
    </main>
  `;
}

function showFarmerPilotSelector() {
  showView('view-farmer');
  const el = document.getElementById('view-farmer');
  const cards = INVESTOR_DEMO_PILOTS.map((pilot) => {
    const model = INVESTOR_PROTECTION_MODELS[pilot.key];
    const buttonLabel = pilot.key === 'fidlot' ? 'Open Fidlot Farmer View' : 'Open Hissar Farmer View';
    return `
      <article class="farmer-pilot-selector-card">
        <div class="farmer-pilot-selector-card-header">
          <div>
            <span>${escapeHtml(pilot.type)}</span>
            <h2>${escapeHtml(pilot.title)}</h2>
          </div>
          <span class="farmer-pilot-selector-status is-${pilot.status.toLowerCase()}">${escapeHtml(pilot.status)}</span>
        </div>
        <p>${escapeHtml(pilot.description)}</p>
        <div class="farmer-pilot-selector-metrics">
          <div><span>Funding</span><strong>${escapeHtml(pilot.displayAmount)}</strong></div>
          <div><span>Protection reserve</span><strong>${escapeHtml(pilot.reserveRate)}%</strong></div>
          <div><span>Cycles</span><strong>${escapeHtml(pilot.cycles)}</strong></div>
          <div><span>Schedule</span><strong>${model ? `${model.schedule.length - 1} cycles + completion` : 'Unavailable'}</strong></div>
        </div>
        <div class="farmer-pilot-selector-note">
          Includes the same cycle table for reserve contributions, releases, farmer payments, ending balance, and program totals.
        </div>
        <a href="#/protection/${escapeHtml(pilot.key)}" class="farmer-pilot-protection-link protection-cta">✦ View public protection schedule</a>
        <a href="#farmer/pilots/${escapeHtml(pilot.key)}" class="landing-btn landing-btn-primary">
          ${escapeHtml(buttonLabel)}
        </a>
      </article>
    `;
  }).join('');

  el.innerHTML = `
    <div class="farmer-pilot-selector">
      <a href="#home" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition mb-6">
        <span class="text-lg leading-none" aria-hidden="true">&larr;</span>
        Back home
      </a>
      ${renderEnvironmentBanner('demo', 'Farmer')}
      <div class="farmer-pilot-selector-heading">
        <span>Farmer demo</span>
        <h1>Choose an Investment Model</h1>
        <p>
          Compare both farmer workflows. Each model has its own reserve rate, cycle schedule,
          staged releases, and farmer payment totals.
        </p>
      </div>
      <div class="farmer-pilot-selector-grid">${cards}</div>
      <div class="farmer-pilot-selector-warning">
        Pilot pages are Investment Model projections for demonstration. Future Farmer funding and payments are fiat through AgriPartners.
      </div>
    </div>
  `;
}

function showFarmerPilotProfile(key) {
  showView('view-farmer');
  const el = document.getElementById('view-farmer');
  const pilot = getPilotByKey(key);

  if (!pilot) {
    el.innerHTML = `
      ${renderNav()}
      <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition mb-6">
        <span class="text-lg leading-none" aria-hidden="true">&larr;</span>
        Back home
      </a>
      <div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Pilot profile unavailable</div>
    `;
    return;
  }

  const deal = farmerDemoDealFromPilot(pilot, getNearWalletAccount());
  renderFarmerDemoDealDetail(
    el,
    deal,
    farmerDemoCycles(pilot),
    farmerDemoEvents(pilot)
  );
}

function renderFarmerDemoDealDetail(el, deal, cycles, events) {
  el.innerHTML = `
    ${renderNav()}
    ${renderEnvironmentBanner('demo', 'Farmer')}
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition">
        <span class="text-lg leading-none" aria-hidden="true">&larr;</span>
        Back home
      </a>
      <span class="text-slate-600">|</span>
      <span class="font-semibold">${escapeHtml(deal.title)}</span>
      <span class="text-xs text-slate-500">Pilot Profile</span>
      ${statusBadge(deal.status)}
    </div>

    ${renderProjectWorkspaceHeader({ deal, status: deal.status, cycles, events, role: 'farmer' })}
    ${renderFarmerProjectProfile(deal)}
    ${renderFarmerDealOperationsSummary(deal, cycles)}
    ${renderFarmerReserveBreakdown(deal, cycles)}

    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-slate-800 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Funding Status</h3>
        ${renderFarmerFundingStatus(deal)}
      </div>
      <div class="bg-slate-800 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Cycle Status</h3>
        <div id="farmer-cycles-list">${renderFarmerCycles(deal.id, cycles)}</div>
      </div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Cycle Timeline</h3>
      ${renderFarmerCycleTimeline(cycles)}
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Reports History</h3>
      ${renderFarmerReportsHistory(cycles)}
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Farmer Report</h3>
      ${renderFarmerDemoReportSection(deal, cycles)}
    </div>

    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Event History</h3>
      <div id="farmer-events-list">${renderEvents(events)}</div>
    </div>
  `;
}

function renderFarmerProjectProfile(deal) {
  const metrics = [
    ['Funding', deal.display_amount || formatFarmerFundingAmount(deal.amount ?? deal.investment_amount)],
    ['Status', deal.status || 'Unknown'],
    ['Funding Status', deal.fundingStatus || 'Unavailable'],
    ['Cycle Status', deal.cycleStatus || 'Unavailable'],
    ['Report', deal.reportLabel || 'Unavailable'],
  ];
  return `
    <section class="bg-slate-800 border border-green-900 rounded-lg p-5 mb-6">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <span class="text-xs font-semibold text-green-300 uppercase tracking-wide">Project Profile</span>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-50 mt-1">${escapeHtml(deal.title || `Project #${deal.id}`)}</h1>
          <p class="text-sm text-slate-400 mt-2 max-w-3xl">${escapeHtml(deal.description || 'Unavailable')}</p>
        </div>
        <span class="text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700 px-2 py-1 rounded">Investment Model: ${escapeHtml(deal.deal_type || 'Unavailable')}</span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        ${metrics.map(([label, value]) => `
          <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <span class="block text-xs text-slate-500">${label}</span>
            <span class="block text-lg font-bold text-slate-100">${escapeHtml(value)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderFarmerFundingStatus(deal) {
  const rows = [
    ['Funding Status', deal.fundingStatus || 'Unavailable'],
    ['Funding Amount', deal.display_amount || formatFarmerFundingAmount(deal.amount ?? deal.investment_amount)],
    ['Project Operator', 'AgriPartners'],
    ['Return Status', deal.returnLabel || 'Unavailable'],
  ];
  return rows.map(([k, v]) => `
    <div class="flex justify-between text-sm gap-3 py-1">
      <span class="text-slate-400 shrink-0">${k}</span>
      <span class="text-slate-100 font-mono text-right break-all">${escapeHtml(v)}</span>
    </div>
  `).join('');
}

function currentFarmerCycle(cycles) {
  if (!cycles.length) return null;
  return cycles.find((cycle) => cycle.status !== 'reported' && cycle.cycleStatus !== 'Completed') || cycles[cycles.length - 1];
}

function farmerReportSubmitted(cycle) {
  return cycle?.reportStatus === 'submitted' || Boolean(cycle?.report);
}

function farmerCycleCompleted(cycle) {
  return cycle?.cycleStatus === 'Completed' || ['completed', 'reported'].includes(cycle?.status);
}

function renderFarmerDealOperationsSummary(deal, cycles) {
  const cycle = currentFarmerCycle(cycles);
  const reportSubmitted = farmerReportSubmitted(cycle);
  const summaryRows = [
    ['Project Summary', deal.description || 'Unavailable'],
    ['Funding Confirmation', deal.fundingStatus || (cycle ? (cycle.fundingReceived ? 'Funding Confirmed' : 'Not confirmed') : 'Unavailable')],
    ['Production Cycle Status', cycle?.cycleStatus || cycle?.status || deal.cycleStatus || 'Unavailable'],
    ['Project Report Status', reportSubmitted ? 'Report Submitted' : (deal.reportLabel || (cycle ? 'Not submitted' : 'Unavailable'))],
  ];
  return `
    <section class="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
      <h2 class="text-lg font-semibold text-slate-100 mb-4">Project Progress</h2>
      <div class="grid md:grid-cols-2 gap-3">
        ${summaryRows.map(([label, value]) => `
          <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <span class="block text-xs text-slate-500">${label}</span>
            <span class="block text-sm text-slate-100 mt-1">${escapeHtml(value)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function farmerProtectionUsdNumber(value) {
  const amount = Number(String(value ?? '').replace(/[$,\s]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
}

function formatFarmerProtectionUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function farmerProtectionStageStatus(stage, deal, cycles = []) {
  const isCompletion = stage === 'Completion';
  const stageNumber = Number(String(stage).match(/\d+/)?.[0]);
  const normalizedDealStatus = String(deal?.status?.status || deal?.status || '').toLowerCase();
  if (isCompletion) return normalizedDealStatus === 'completed' ? 'Completed' : 'Planned';

  const cycle = cycles.find(item => Number(item?.id ?? item?.cycle_id ?? item?.cycle_number) === stageNumber);
  if (farmerCycleCompleted(cycle)) return 'Completed';
  if (cycle) return 'Current';

  const activeCycle = Number(deal?.activeCycleId ?? deal?.current_cycle ?? deal?.status?.current_cycle);
  if (Number.isFinite(activeCycle) && stageNumber === activeCycle) return 'Current';
  if (normalizedDealStatus === 'completed') return 'Completed';
  if (Number.isFinite(activeCycle) && stageNumber < activeCycle) return 'Completed';
  return 'Planned';
}

function formatFarmerProtectionContractBalance(value) {
  if (value == null || value === '') return 'Unavailable';
  try {
    return yoctoToNear(value);
  } catch {
    return 'Unavailable';
  }
}

function renderFarmerReserveBreakdown(deal, cycles = [], balances = null, balancesError = null, options = {}) {
  const pilot = getPilotForDeal(deal);
  const modelKey = deal?.pilot_key || pilot?.key || pilotKeyFromText(`${deal?.title || ''} ${deal?.deal_type || ''}`);
  const model = INVESTOR_PROTECTION_MODELS[modelKey];
  const reserveRate = deal?.escrow_pct ?? pilot?.reserveRate ?? model?.rate;
  const scheduleTotals = model?.schedule.reduce((totals, [_stage, _investorCash, contribution, release, _endingReserve, farmerCash]) => {
    totals.contribution += farmerProtectionUsdNumber(contribution);
    totals.release += farmerProtectionUsdNumber(release);
    totals.farmerCash += farmerProtectionUsdNumber(farmerCash);
    totals.beforeReserve += farmerProtectionUsdNumber(farmerCash)
      - farmerProtectionUsdNumber(release)
      + farmerProtectionUsdNumber(contribution);
    return totals;
  }, { beforeReserve: 0, contribution: 0, release: 0, farmerCash: 0 });

  const liveBalanceView = `
    <div class="farmer-protection-demo-note">
      Investment Model projection only. This concept is not active in Pilot 1.0.
      Future Farmer funding and payments are fiat and managed by AgriPartners as Project Operator.
    </div>
    ${balancesError ? '<div class="farmer-protection-data-warning">Alpha technical balance data is unavailable. Farmer operations can continue through AgriPartners.</div>' : ''}
  `;

  const scheduleView = model
    ? `
      <div class="farmer-protection-table-scroll">
        <table class="farmer-protection-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Status</th>
              <th>Before reserve · after expenses</th>
              <th>Added to reserve</th>
              <th>Released to farmer</th>
              <th>Farmer receives</th>
              <th>Ending reserve</th>
            </tr>
          </thead>
          <tbody>
            ${model.schedule.map(([stage, _investorCash, contribution, release, endingReserve, farmerCash]) => {
              const beforeReserve = farmerProtectionUsdNumber(farmerCash)
                - farmerProtectionUsdNumber(release)
                + farmerProtectionUsdNumber(contribution);
              const status = farmerProtectionStageStatus(stage, deal, cycles);
              return `
                <tr class="farmer-protection-row is-${status.toLowerCase()}">
                  <td>${escapeHtml(stage)}</td>
                  <td><span class="farmer-protection-status">${escapeHtml(status)}</span></td>
                  <td>${escapeHtml(formatFarmerProtectionUsd(beforeReserve))}</td>
                  <td>${escapeHtml(contribution)}</td>
                  <td>${escapeHtml(release)}</td>
                  <td><strong>${escapeHtml(farmerCash)}</strong></td>
                  <td>${escapeHtml(endingReserve)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td>Program total</td>
              <td><span class="farmer-protection-status">No-loss model</span></td>
              <td>${escapeHtml(formatFarmerProtectionUsd(scheduleTotals.beforeReserve))}</td>
              <td>${escapeHtml(formatFarmerProtectionUsd(scheduleTotals.contribution))}</td>
              <td>${escapeHtml(formatFarmerProtectionUsd(scheduleTotals.release))}</td>
              <td><strong>${escapeHtml(formatFarmerProtectionUsd(scheduleTotals.farmerCash))}</strong></td>
              <td>${escapeHtml(model.schedule[model.schedule.length - 1][4])} at completion</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `
    : `
      <div class="farmer-protection-data-warning">
        A cycle-by-cycle USD projection has not been configured for this Project.
      </div>
    `;

  return `
    <section class="farmer-reserve-panel" data-farmer-reserve-breakdown>
      <div class="farmer-protection-heading">
        <div>
          <span class="farmer-protection-kicker">Farmer payment transparency</span>
          <h2>Reserve and Farmer Payment by Cycle</h2>
          <p>
            See what is temporarily added to the Protection Reserve, what may be released after cycle checks,
            what remains protected, and the total modeled cash available to the farmer.
          </p>
        </div>
        <span class="farmer-protection-rate">${reserveRate == null ? 'Rate unavailable' : `${escapeHtml(reserveRate)}% of farmer share`}</span>
      </div>

      ${liveBalanceView}

      <div class="farmer-protection-formula">
        <span>How the reserve and farmer payment are calculated</span>
        <code>farmer’s gross 60% profit share × reserve rate = reserve contribution</code>
        <code>gross farmer share − operating expenses − reserve contribution + reserve released = farmer receives</code>
      </div>

      <div class="farmer-protection-basis-note">
        <strong>Important: the ${reserveRate == null ? 'model-specific' : `${escapeHtml(reserveRate)}%`} rate is calculated before operating expenses.</strong>
        <p>
          “Before reserve · after expenses” is not the percentage base. It shows the farmer cash after costs,
          before subtracting the reserve contribution.
        </p>
        ${modelKey === 'hissar' ? `
          <div class="farmer-protection-example">
            <span>Hissar cycles 1–2 example</span>
            <code>$18,360 × 53% = $9,730.80 reserve contribution</code>
            <code>$18,360 − $3,100 expenses = $15,260 before reserve</code>
          </div>
        ` : ''}
      </div>

      <div class="farmer-protection-schedule-heading">
        <div>
          <h3>${model ? `${escapeHtml(model.title)} staged schedule` : 'Cycle schedule unavailable'}</h3>
          <p>USD Investment Model projection. It is not an active Pilot 1.0 payment schedule.</p>
        </div>
        ${model ? `<span>Minimum reserve until completion: ${escapeHtml(model.minimumReserve)}</span>` : ''}
      </div>

      ${model && !options.hidePublicLink ? `<a href="#/protection/${escapeHtml(modelKey)}" class="farmer-protection-public-link protection-cta">✦ Open the public protection page →</a>` : ''}
      ${modelKey === 'hissar' ? `
        <p class="farmer-protection-capital-note">
          Hissar cycles 3–6 include a $2,500 partial capital return to the investor before the 60/40 profit split.
          It is included in the staged release calculation and has no Performance Fee.
        </p>
      ` : ''}
      ${model ? '<p class="farmer-protection-scroll-hint">Swipe horizontally to compare every amount →</p>' : ''}
      ${scheduleView}

      <div class="farmer-protection-warning">
        A release is not automatic. A Confirmed Loss, overdue mandatory report, default, or open dispute may reduce or suspend it.
        The final ${model ? escapeHtml(model.minimumReserve) : 'minimum reserve'} is released only after completion and required checks.
      </div>
    </section>
  `;
}

function farmerTimelineSteps(cycle) {
  const hasStatus = typeof cycle?.status === 'string' && cycle.status.length > 0;
  const fundingSent = hasStatus
    ? ['funding_sent', 'cycle_active', 'reported', 'completed'].includes(cycle.status)
    : null;
  const fundingConfirmed = typeof cycle?.fundingReceived === 'boolean' ? cycle.fundingReceived : null;
  const cycleStarted = hasStatus ? ['cycle_active', 'reported', 'completed'].includes(cycle.status) : null;
  const reportSubmitted = cycle?.reportStatus != null || cycle?.report
    ? farmerReportSubmitted(cycle)
    : null;
  const cycleCompleted = hasStatus || cycle?.cycleStatus
    ? farmerCycleCompleted(cycle)
    : null;
  return [
    ['Funding Sent by AgriPartners', fundingSent],
    ['Funding Confirmation', fundingConfirmed],
    ['Production Cycle Started', cycleStarted],
    ['Project Report Submitted', reportSubmitted],
    ['Production Cycle Completed', cycleCompleted],
  ];
}

function renderFarmerCycleTimeline(cycles) {
  if (!cycles.length) {
    return '<p class="text-slate-500 text-sm">Production Cycle timeline will appear once a Project cycle is created.</p>';
  }
  return cycles.map((cycle) => `
    <div class="mb-5 last:mb-0">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 class="font-semibold text-slate-100">Cycle #${escapeHtml(cycle.id)}</h4>
        <span class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">${escapeHtml(cycle.cycleStatus || cycle.status || 'Pending')}</span>
      </div>
      <div class="farmer-timeline">
        ${farmerTimelineSteps(cycle).map(([label, done]) => `
          <div class="farmer-timeline-step ${done === true ? 'is-complete' : (done === false ? 'is-pending' : 'is-unknown')}">
            <span class="farmer-timeline-dot"></span>
            <span class="farmer-timeline-label">${label}</span>
            <span class="farmer-timeline-state">${done === true ? 'Completed' : (done === false ? 'Pending' : 'Unknown')}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function normalizeFarmerReport(cycle) {
  const report = cycle.report || {};
  return {
    cycleNumber: cycle.id ?? cycle.cycle_id ?? 'Cycle',
    title: report.report_title || report.title || cycle.report_title || 'Unavailable',
    summary: report.report_body || report.description || cycle.report_body || 'Unavailable',
    amountUsed: report.amount_used || report.amountUsed || cycle.amount_used || 'Not provided',
    submittedDate: report.report_created_at || report.submittedAt || report.created_at || cycle.report_created_at || '',
    status: cycle.reportStatus === 'submitted' ? 'Submitted' : 'Pending',
  };
}

function renderFarmerReportsHistory(cycles) {
  const reports = cycles.filter(farmerReportSubmitted).map(normalizeFarmerReport);
  if (!reports.length) {
    return `
      <div class="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-400">
        No submitted reports yet. Reports History will update after the farmer submits a cycle report.
      </div>
    `;
  }
  return `
    <div class="grid gap-3">
      ${reports.map((report) => `
        <div class="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h4 class="font-semibold text-slate-100">Cycle ${escapeHtml(report.cycleNumber)} · ${escapeHtml(report.title)}</h4>
            <span class="text-xs bg-green-950 text-green-200 border border-green-800 px-2 py-0.5 rounded">${escapeHtml(report.status)}</span>
          </div>
          <p class="text-sm text-slate-400 mt-2">${escapeHtml(report.summary)}</p>
          <div class="grid sm:grid-cols-2 gap-2 mt-3 text-xs">
            <div>
              <span class="block text-slate-500">Amount used</span>
              <span class="text-slate-200">${escapeHtml(report.amountUsed)}</span>
            </div>
            <div>
              <span class="block text-slate-500">Submitted date</span>
              <span class="text-slate-200">${report.submittedDate ? escapeHtml(new Date(report.submittedDate).toLocaleDateString('en-US')) : 'Submitted'}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderFarmerDemoReportSection(deal, cycles) {
  const cycle = cycles.find((item) => item.reportStatus === 'submitted') || cycles[0];
  if (deal.reportStatus === 'submitted' && cycle?.report) {
    return renderFarmerReportSummary(cycle.report);
  }
  return `
    <div class="farmer-report-summary">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h4 class="font-semibold text-slate-100">Next Report Due</h4>
        <span class="text-xs bg-amber-900 text-amber-100 px-2 py-1 rounded">Pending</span>
      </div>
      <p class="text-sm text-slate-400 mt-2">The active Hissar cycle is funded and operating. Farmer report is pending for the next cycle update.</p>
    </div>
  `;
}

function renderFarmerDealDetail(el, bundle) {
  const { deal, cycles = [], balances = null, resourceErrors = {} } = bundle;
  const farmerBalance = resourceErrors.balances ? null : balances?.farmer;
  const canWithdrawFarmer = hasPositiveYoctoSafe(farmerBalance);
  const balanceDisplay = farmerBalance == null
    ? 'Unavailable'
    : (canWithdrawFarmer ? 'Available in Alpha demo' : 'No Alpha demo payout available');
  el.innerHTML = `
    ${renderNav()}
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="#farmer" class="text-slate-400 hover:text-white text-sm">Back to Farmer Portal</a>
      <span class="text-slate-600">|</span>
      <span class="font-semibold">Project #${deal.id}</span>
      ${statusBadge(deal.status)}
      <button id="btn-farmer-refresh" class="ml-auto bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded transition">Refresh</button>
    </div>

    ${renderProjectWorkspaceHeader({ deal, status: deal.status, cycles, role: 'farmer' })}
    ${deal.description ? `<p class="text-slate-400 mb-6">${escapeHtml(deal.description)}</p>` : ''}
    ${renderFarmerProjectProfile(deal)}
    ${renderFarmerDealOperationsSummary(deal, cycles)}
    ${renderFarmerReserveBreakdown(deal, cycles, balances, resourceErrors.balances)}
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-slate-800 rounded-xl p-5 space-y-2">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Project Summary</h3>
        ${renderFarmerDealParams(deal)}
      </div>
      <div class="bg-slate-800 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Project Actions</h3>
        <div class="mb-4 text-sm">
          <span class="block text-slate-500">Alpha Demo Payout Status</span>
          <span id="farmer-available-balance" class="text-slate-100 font-mono">${escapeHtml(balanceDisplay)}</span>
        </div>
        ${resourceErrors.balances ? renderFarmerResourceUnavailable('Farmer balances', resourceErrors.balances) : ''}
        <button id="btn-farmer-withdraw" class="admin-action-btn action-fund w-full mb-4" ${canWithdrawFarmer ? '' : 'disabled'}>${canWithdrawFarmer ? 'Request Alpha Demo Payout' : (resourceErrors.balances ? 'Demo Payout Unavailable' : 'No Demo Payout Available')}</button>
        <p class="text-xs text-slate-400 mb-4">Alpha demonstration only. Future Farmer funding and payments are fiat through AgriPartners. Confirm Funding and submit Project Reports for active Production Cycles.</p>
        <div id="farmer-action-result" class="hidden rounded-lg px-4 py-3 text-sm"></div>
      </div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Production Cycles</h3>
      <div id="farmer-cycles-list">${resourceErrors.cycles ? renderFarmerResourceUnavailable('Cycle status', resourceErrors.cycles) : renderFarmerCycles(deal.id, cycles)}</div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mt-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Production Cycle Timeline</h3>
      ${resourceErrors.cycles ? renderFarmerResourceUnavailable('Cycle timeline', resourceErrors.cycles) : renderFarmerCycleTimeline(cycles)}
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mt-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Project Reports</h3>
      ${resourceErrors.cycles ? renderFarmerResourceUnavailable('Reports history', resourceErrors.cycles) : renderFarmerReportsHistory(cycles)}
    </div>
  `;

  document.getElementById('btn-farmer-refresh').addEventListener('click', () => showFarmerDeal(deal.id));
  document.getElementById('btn-farmer-withdraw')?.addEventListener('click', () => withdrawFarmerWithWallet(deal));
  bindFarmerCycleActions(deal.id);
}

function hasPositiveYoctoSafe(value) {
  if (value == null || value === '') return false;
  try {
    return hasPositiveYocto(value);
  } catch {
    return false;
  }
}

function renderFarmerResourceUnavailable(label, message) {
  return `
    <div class="bg-amber-950 border border-amber-800 rounded-lg px-4 py-3 mb-3 text-sm text-amber-100" data-farmer-resource-error="${escapeHtml(label)}">
      <span class="font-semibold">${escapeHtml(label)} unavailable.</span>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

function renderFarmerDealParams(deal) {
  const rows = [
    ['Farmer Assignment', deal.farmer ? 'Assigned by AgriPartners' : 'Unavailable'],
    ['Project Operator', 'AgriPartners'],
    ['Funding', formatFarmerFundingAmount(deal.amount ?? deal.investment_amount)],
    ['Project Status', deal.status || 'Unknown'],
    ['Production Cycle', deal.activeCycleId ?? 'Unavailable'],
    ['Investment Model', deal.deal_type || 'Unavailable'],
  ];
  return rows.map(([k, v]) => `
    <div class="flex justify-between text-sm gap-3">
      <span class="text-slate-400 shrink-0">${k}</span>
      <span class="text-slate-100 font-mono text-right break-all">${escapeHtml(v)}</span>
    </div>
  `).join('');
}

function renderFarmerCycles(dealId, cycles) {
  if (!cycles.length) return '<p class="text-slate-500 text-sm">No cycles found yet</p>';
  const isDemoPilot = String(dealId).startsWith('demo-');
  return cycles.map((cycle) => {
    const reportSubmitted = cycle.reportStatus === 'submitted' && cycle.report;
    const fundingSent = ['funding_sent', 'reported'].includes(cycle.status);
    const canConfirmFunding = fundingSent && !cycle.fundingReceived;
    const canSubmitReport = cycle.fundingReceived && !reportSubmitted;
    const fundingLabel = cycle.fundingReceived === true
      ? 'Funding Confirmed'
      : (cycle.fundingReceived === false ? 'Not confirmed' : 'Unknown');
    const reportLabel = reportSubmitted
      ? 'Report Submitted'
      : (cycle.reportStatus === 'due' ? 'Next Report Due' : (cycle.reportStatus ? 'Not submitted' : 'Unknown'));
    const cycleLabel = reportSubmitted
      ? 'Report Submitted'
      : (cycle.fundingReceived
        ? (cycle.reportStatus === 'due' ? 'Next Report Due' : 'Funding Confirmed')
        : (cycle.status === 'pending' ? 'Pending' : (fundingSent ? 'Funding sent' : 'Unknown')));
    return `
      <div class="farmer-cycle-row">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="font-semibold text-slate-100">Production Cycle #${cycle.id}</span>
            <span class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">${escapeHtml(cycleLabel)}</span>
          </div>
          <p class="text-sm text-slate-400">Funding Confirmation: <span class="text-slate-200">${fundingLabel}</span></p>
          <p class="text-sm text-slate-400">Production Cycle Status: <span class="text-slate-200">${escapeHtml(cycle.cycleStatus || cycle.status || 'Unknown')}</span></p>
          <p class="text-sm text-slate-400">Project Report: <span class="text-slate-200">${reportLabel}</span></p>
          ${reportSubmitted ? renderFarmerReportSummary(cycle.report) : ''}
        </div>
        ${isDemoPilot ? '' : `<div class="farmer-cycle-actions">
          <button type="button" class="admin-action-btn farmer-confirm-btn" data-deal-id="${dealId}" data-cycle-id="${cycle.id}" ${canConfirmFunding ? '' : 'disabled'}>Confirm Funding</button>
          <button type="button" class="admin-action-btn farmer-report-btn" data-deal-id="${dealId}" data-cycle-id="${cycle.id}" ${canSubmitReport ? '' : 'disabled'}>${reportSubmitted ? 'Project Report submitted' : (cycle.fundingReceived ? 'Submit Project Report' : 'Confirm Funding first')}</button>
        </div>`}
      </div>
    `;
  }).join('');
}

function renderFarmerReportSummary(report) {
  const title = report.report_title || report.title || 'Farmer report';
  const body = report.report_body || report.description || '';
  return `
    <div class="farmer-report-summary">
      <div class="font-semibold text-slate-100">${escapeHtml(title)}</div>
      <p class="text-sm text-slate-400 mt-1">${escapeHtml(body)}</p>
      <div class="grid sm:grid-cols-2 gap-2 mt-3 text-xs">
        <div>
          <span class="block text-slate-500">Amount used</span>
          <span class="text-slate-200">${escapeHtml(report.amountUsed || 'Not provided')}</span>
        </div>
        <div>
          <span class="block text-slate-500">Submitted</span>
          <span class="text-slate-200">${report.submittedAt ? escapeHtml(new Date(report.submittedAt).toLocaleDateString('en-US')) : 'Submitted'}</span>
        </div>
      </div>
      ${report.evidenceUrl ? `<a href="${escapeHtml(report.evidenceUrl)}" target="_blank" rel="noopener noreferrer" class="inline-block text-blue-400 hover:underline text-xs mt-2">Evidence link</a>` : ''}
    </div>
  `;
}

function bindFarmerCycleActions(dealId) {
  document.querySelectorAll('.farmer-confirm-btn').forEach((btn) => {
    btn.addEventListener('click', () => confirmFarmerFunding(btn.dataset.dealId, btn.dataset.cycleId));
  });
  document.querySelectorAll('.farmer-report-btn').forEach((btn) => {
    btn.addEventListener('click', () => showFarmerReportForm(dealId, btn.dataset.cycleId));
  });
}

function showFarmerActionResult(type, message) {
  const el = document.getElementById('farmer-action-result');
  if (!el) return;
  el.className = `${type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'} rounded-lg px-4 py-3 text-sm`;
  el.textContent = message;
  el.classList.remove('hidden');
}

async function withdrawFarmerWithWallet(deal) {
  const connectedWallet = getNearWalletAccount();
  if (connectedWallet !== deal.farmer) {
    showFarmerActionResult('error', `The active secure account must match ${deal.farmer}`);
    return;
  }
  if (!confirm('Run the Alpha demo payout action? This is not a Pilot 1.0 fiat payment.')) return;

  const btn = document.getElementById('btn-farmer-withdraw');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Submitting...';
  }
  showFarmerActionResult('success', 'Alpha demo payout action submitted...');

  try {
    const result = await fetchFarmerJson(`/api/farmer/deals/${deal.id}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const message = result.tx_hash
      ? 'Alpha demo payout action completed with a supplementary infrastructure reference.'
      : 'Alpha demo payout action completed.';
    await showFarmerDeal(deal.id, { type: 'success', message });
  } catch (err) {
    showFarmerActionResult('error', `Alpha demo payout action failed: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Request Alpha Demo Payout';
    }
  }
}

async function confirmFarmerFunding(dealId, cycleId) {
  try {
    await fetchFarmerJson(`/api/farmer/deals/${dealId}/cycles/${cycleId}/confirm-funding`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    await showFarmerDeal(dealId, { type: 'success', message: 'Funding receipt confirmed' });
  } catch (err) {
    showFarmerActionResult('error', `Confirmation failed: ${err.message}`);
  }
}

function showFarmerReportForm(dealId, cycleId) {
  const el = document.getElementById('farmer-action-result');
  if (!el) return;
  el.className = 'bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm';
  el.innerHTML = `
    <form id="farmer-report-form" class="space-y-3">
      <div class="font-semibold text-slate-100">Cycle #${escapeHtml(cycleId)} report</div>
      <input id="farmer-report-title" class="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" placeholder="Report title (optional)" />
      <textarea id="farmer-report-body" rows="5" class="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" placeholder="Report body"></textarea>
      <button type="submit" class="admin-action-btn action-fund w-full">Submit report</button>
    </form>
  `;
  el.classList.remove('hidden');
  document.getElementById('farmer-report-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitFarmerReport(dealId, cycleId);
  });
}

async function submitFarmerReport(dealId, cycleId) {
  const payload = {
    report_title: document.getElementById('farmer-report-title').value.trim(),
    report_body: document.getElementById('farmer-report-body').value.trim(),
  };
  try {
    await fetchFarmerJson(`/api/farmer/deals/${dealId}/cycles/${cycleId}/report`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await showFarmerDeal(dealId, { type: 'success', message: 'Cycle report submitted' });
  } catch (err) {
    showFarmerActionResult('error', `Report failed: ${err.message}`);
  }
}

// --- Investor Portal ---

async function showInvestorPortal() {
  showView('view-investor');
  const el = document.getElementById('view-investor');
  const auth = getAuth();
  const connectedWalletAccount = getNearWalletAccount();
  const signedInLabel = connectedWalletAccount || auth.user.username;
  el.innerHTML = `
    ${renderNav()}
    ${renderEnvironmentBanner('pilot', 'Investor')}
    ${renderRoleEntrySummary('investor')}
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-green-400 mb-1">Investor Portfolio</h1>
      <p class="text-slate-400">Review your AgriPartners-managed Projects, Investment Models, approved Project progress, Reports, and Settlement / Returns visibility.</p>
      <p class="text-slate-400 mt-1">AgriPartners is the Project Operator. NEAR/Testnet is supporting AgriPartners infrastructure.</p>
      <p class="text-slate-400">Signed in as <span class="text-slate-200 font-medium">${escapeHtml(signedInLabel)}</span></p>
    </div>
    <div id="near-wallet-section" class="mb-6"></div>
    <div id="investor-profile-section" class="mb-6"></div>
    <div id="investor-dashboard-content"></div>
  `;
  renderNearWalletSection();
  const profileEl = document.getElementById('investor-profile-section');
  const dashboardEl = document.getElementById('investor-dashboard-content');

  if (!connectedWalletAccount) {
    renderInvestorProfileLoginMessage(profileEl);
    renderInvestorPortalMessage(
      dashboardEl,
      'Investor Portal access requires a signed NEAR wallet session. Use Login with NEAR Wallet on the sign-in screen.'
    );
    return;
  }

  loadInvestorProfile();
  dashboardEl.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">My Investments</h2>
    <div class="spinner"></div>
  `;

  try {
    const headers = authHeaders();
    const [res, portfolioResult] = await Promise.all([
      fetch(`${API_BASE}/api/investor/deals`, { headers }),
      fetchInvestorPortfolioSummary(headers),
    ]);
    if (res.status === 401) {
      clearAuth();
      renderInvestorPortalMessage(dashboardEl, 'Wallet session expired. Sign in again to load live investor data.', 'error');
      return;
    }
    if (res.status === 403) {
      renderInvestorPortalMessage(dashboardEl, 'This session is not authorized for wallet investor data.', 'error');
      return;
    }
    if (portfolioResult.authStatus === 401) {
      clearAuth();
      renderInvestorPortalMessage(dashboardEl, 'Wallet session expired. Sign in again to load live investor data.', 'error');
      return;
    }
    if (portfolioResult.authStatus === 403) {
      renderInvestorPortalMessage(dashboardEl, 'This session is not authorized for wallet investor data.', 'error');
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const deals = normalizeInvestorDealsPayload(await res.json());
    const enrichedDeals = await enrichDealsForInvestor(deals);
    renderInvestorDashboard(dashboardEl, enrichedDeals, connectedWalletAccount, portfolioResult);
  } catch (e) {
    dashboardEl.querySelector('.spinner')?.remove();
    renderInvestorPortalMessage(
      dashboardEl,
      `Investor Portal unavailable: ${e.message}`,
      'error'
    );
  }
}

function renderNoWalletInvestorDashboard() {
  const dashboardEl = document.getElementById('investor-dashboard-content');
  if (!dashboardEl) return;
  renderInvestorPortalMessage(
    dashboardEl,
    'Investor Portal access requires a signed NEAR wallet session. Use Login with NEAR Wallet on the sign-in screen.'
  );
}

function renderNearWalletSection() {
  const el = document.getElementById('near-wallet-section');
  if (!el) return;

  const accountId = getNearWalletAccount();
  el.innerHTML = `
    <div class="wallet-panel">
      <div class="wallet-header">
        <div>
          <h2 class="wallet-title">NEAR Wallet</h2>
          <p class="wallet-note">Authenticated with NEP-413 wallet signature.</p>
        </div>
        <span class="wallet-network">Network: ${NEAR_WALLET_NETWORK}</span>
      </div>
      <div class="wallet-body">
        <div class="wallet-account">
          <span class="wallet-label">Connected account</span>
          <span class="wallet-value">${accountId ? escapeHtml(accountId) : 'Not connected'}</span>
        </div>
        <div class="wallet-actions">
          <button type="button" id="btn-wallet-logout" class="wallet-btn" ${accountId ? '' : 'disabled'}>
            Logout
          </button>
        </div>
      </div>
      <p class="wallet-helper">Investor data is loaded through wallet-protected API routes using this session JWT.</p>
    </div>
  `;

  document.getElementById('btn-wallet-logout')?.addEventListener('click', logout);
}

function renderInvestorProfileLoginMessage(el) {
  if (!el) return;
  el.innerHTML = `
    <div class="wallet-panel">
      <h2 class="wallet-title">Investor Profile</h2>
      <p class="wallet-helper">Investor Profile requires a signed NEAR wallet session.</p>
    </div>
  `;
}

function renderInvestorProfileLoading(el) {
  el.innerHTML = `
    <div class="wallet-panel">
      <div class="wallet-header">
        <div>
          <h2 class="wallet-title">Investor Profile</h2>
          <p class="wallet-note">Loading wallet-linked profile...</p>
        </div>
      </div>
      <div class="spinner"></div>
    </div>
  `;
}

async function loadInvestorProfile() {
  const el = document.getElementById('investor-profile-section');
  if (!el) return;
  renderInvestorProfileLoading(el);

  try {
    const res = await fetch(`${API_BASE}/api/investor/profile`, { headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      clearAuth();
      renderInvestorProfileError(el, 'Wallet session expired. Sign in again to load your investor profile.');
      return;
    }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    renderInvestorProfileForm(el, data);
  } catch (err) {
    renderInvestorProfileError(el, err.message || 'Profile unavailable');
  }
}

function profileOption(value, label, selectedValue) {
  return `<option value="${value}" ${selectedValue === value ? 'selected' : ''}>${label}</option>`;
}

function renderInvestorProfileForm(el, profile, message = null, type = 'success') {
  const accountId = profile.account_id || getNearWalletAccount();
  el.innerHTML = `
    <form id="investor-profile-form" class="wallet-panel">
      <div class="wallet-header">
        <div>
          <h2 class="wallet-title">Investor Profile</h2>
          <p class="wallet-note">Linked to your authenticated wallet account.</p>
        </div>
        <span class="wallet-network">KYC: ${escapeHtml(profile.kyc_status || 'not_started')}</span>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-slate-400 mb-1">Wallet account</label>
          <input type="text" value="${escapeHtml(accountId)}" readonly
            class="w-full bg-slate-900 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 font-mono" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">KYC status</label>
          <input type="text" value="${escapeHtml(profile.kyc_status || 'not_started')}" readonly
            class="w-full bg-slate-900 text-slate-300 px-3 py-2 rounded-lg border border-slate-700" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Display name</label>
          <input id="profile-display-name" type="text" maxlength="120" value="${escapeHtml(profile.display_name || '')}"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Country</label>
          <input id="profile-country" type="text" maxlength="80" value="${escapeHtml(profile.country || '')}"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Investor type</label>
          <select id="profile-investor-type"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500">
            <option value="">Not specified</option>
            ${profileOption('individual', 'Individual', profile.investor_type)}
            ${profileOption('company', 'Company', profile.investor_type)}
            ${profileOption('fund', 'Fund', profile.investor_type)}
            ${profileOption('other', 'Other', profile.investor_type)}
          </select>
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Risk profile</label>
          <select id="profile-risk-profile"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500">
            <option value="">Not specified</option>
            ${profileOption('conservative', 'Conservative', profile.risk_profile)}
            ${profileOption('balanced', 'Balanced', profile.risk_profile)}
            ${profileOption('growth', 'Growth', profile.risk_profile)}
            ${profileOption('high_risk', 'High risk', profile.risk_profile)}
          </select>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-700">
        <div id="profile-save-state" class="${message ? '' : 'hidden'} text-sm ${type === 'error' ? 'text-red-200' : 'text-green-200'}">
          ${message ? escapeHtml(message) : ''}
        </div>
        <button type="submit" id="btn-save-investor-profile" class="wallet-btn wallet-btn-primary ml-auto">
          Save Profile
        </button>
      </div>
    </form>
  `;

  document.getElementById('investor-profile-form')?.addEventListener('submit', saveInvestorProfile);
}

function renderInvestorProfileError(el, message) {
  el.innerHTML = `
    <div class="wallet-panel">
      <h2 class="wallet-title">Investor Profile</h2>
      <div class="bg-red-900 text-red-100 border border-red-800 rounded-lg px-4 py-3 mt-3">
        ${escapeHtml(message)}
      </div>
    </div>
  `;
}

async function saveInvestorProfile(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-save-investor-profile');
  const stateEl = document.getElementById('profile-save-state');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
  if (stateEl) {
    stateEl.className = 'text-sm text-slate-300';
    stateEl.textContent = 'Saving profile...';
  }

  const payload = {
    display_name: document.getElementById('profile-display-name')?.value || '',
    country: document.getElementById('profile-country')?.value || '',
    investor_type: document.getElementById('profile-investor-type')?.value || '',
    risk_profile: document.getElementById('profile-risk-profile')?.value || '',
  };

  try {
    const res = await fetch(`${API_BASE}/api/investor/profile`, {
      method: 'PUT',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    renderInvestorProfileForm(document.getElementById('investor-profile-section'), data, 'Profile saved.');
  } catch (err) {
    if (stateEl) {
      stateEl.className = 'text-sm text-red-200';
      stateEl.textContent = err.message || 'Profile save failed';
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Profile'; }
  }
}

function renderInvestorPortalMessage(el, message, type = 'info') {
  const isError = type === 'error';
  el.innerHTML = `
    <div class="${isError ? 'bg-red-900 text-red-100 border-red-800' : 'bg-slate-800 text-slate-200 border-slate-700'} border rounded-lg px-4 py-3">
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

async function enrichDealsForInvestor(deals) {
  const headers = authHeaders();
  const safeDeals = Array.isArray(deals) ? deals : [];
  return Promise.all(safeDeals.map(async deal => {
    const [detailRes, statusRes, balancesRes] = await Promise.allSettled([
      fetch(`${API_BASE}/api/investor/deals/${deal.id}`, { headers }),
      fetch(`${API_BASE}/api/investor/deals/${deal.id}/status`, { headers }),
      fetch(`${API_BASE}/api/investor/deals/${deal.id}/balances`, { headers })
    ]);
    const [detailResult, statusResult, balancesResult] = await Promise.all([
      readInvestorEnrichmentResult(detailRes, 'Project details', {}),
      readInvestorEnrichmentResult(statusRes, 'contract status', null),
      readInvestorEnrichmentResult(balancesRes, 'contract balances', null),
    ]);
    const warnings = [detailResult.error, statusResult.error, balancesResult.error].filter(Boolean);
    const detail = detailResult.data && typeof detailResult.data === 'object'
      ? detailResult.data
      : {};
    return normalizeInvestorDeal({
      ...deal,
      ...detail,
      status: statusResult.data ?? detail.status ?? deal.status,
      balances: balancesResult.data ?? detail.balances ?? deal.balances ?? null,
      enrichment_warnings: warnings,
    });
  }));
}

async function fetchInvestorPortfolioSummary(headers = authHeaders()) {
  try {
    const response = await fetch(`${API_BASE}/api/investor/portfolio-summary`, { headers });
    if ([401, 403].includes(response.status)) {
      return {
        data: null,
        error: response.status === 401 ? 'Wallet session expired' : 'Investor authorization failed',
        authStatus: response.status,
      };
    }
    if (!response.ok) {
      return { data: null, error: `Portfolio financial summary unavailable (HTTP ${response.status})`, authStatus: null };
    }
    return { data: normalizeInvestorPortfolioSummary(await response.json()), error: null, authStatus: null };
  } catch (err) {
    return {
      data: null,
      error: `Portfolio financial summary unavailable: ${err.message || 'network request failed'}`,
      authStatus: null,
    };
  }
}

async function readInvestorEnrichmentResult(result, label, fallback) {
  if (result.status !== 'fulfilled') {
    return { data: fallback, error: `${label} unavailable` };
  }
  if ([401, 403].includes(result.value.status)) {
    throw new Error(`Investor authorization failed while loading ${label}`);
  }
  if (!result.value.ok) {
    return { data: fallback, error: `${label} unavailable (HTTP ${result.value.status})` };
  }
  try {
    return { data: await result.value.json(), error: null };
  } catch {
    return { data: fallback, error: `${label} returned invalid data` };
  }
}

function normalizeInvestorDealsPayload(payload) {
  if (!Array.isArray(payload)) throw new Error('Investor Projects response is not a list');
  return payload.filter(deal => deal && typeof deal === 'object').map(normalizeInvestorDeal);
}

function normalizeFinancialAmount(value) {
  if (value == null || value === '') return null;
  return Number.isFinite(Number(value)) ? String(value) : null;
}

function normalizeFinancialPercent(value) {
  if (value == null || value === '') return null;
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function normalizeInvestorPortfolioSummary(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Portfolio financial summary returned malformed data');
  }
  return {
    totalInvested: normalizeFinancialAmount(payload.totalInvested),
    totalProjectedProfit: normalizeFinancialAmount(payload.totalProjectedProfit),
    totalProjectedPayout: normalizeFinancialAmount(payload.totalProjectedPayout),
    totalRecordedReturns: normalizeFinancialAmount(payload.totalRecordedReturns),
    totalOutstanding: normalizeFinancialAmount(payload.totalOutstanding),
    weightedProjectedRoi: normalizeFinancialPercent(payload.weightedProjectedRoi),
  };
}

function preferredFinancialField(source, camelField, legacyFields = []) {
  if (Object.prototype.hasOwnProperty.call(source, camelField)) return source[camelField] ?? null;
  for (const field of legacyFields) {
    if (Object.prototype.hasOwnProperty.call(source, field)) return source[field] ?? null;
  }
  return null;
}

function normalizeInvestorDeal(deal) {
  const source = deal && typeof deal === 'object' ? deal : {};
  const rawStatus = source.status;
  const status = rawStatus && typeof rawStatus === 'object'
    ? { ...rawStatus, status: rawStatus.status || 'Unknown' }
    : { status: typeof rawStatus === 'string' && rawStatus ? rawStatus : 'Unknown' };
  const investmentAmount = normalizeFinancialAmount(preferredFinancialField(
    source, 'investmentAmount', ['amount', 'invested_amount']
  ));
  const projectedRoi = normalizeFinancialPercent(preferredFinancialField(
    source, 'projectedRoi', ['projected_roi_pct', 'roi_percent']
  ));
  const projectedProfit = normalizeFinancialAmount(preferredFinancialField(source, 'projectedProfit'));
  const projectedTotalPayout = normalizeFinancialAmount(preferredFinancialField(
    source, 'projectedTotalPayout', ['expected_return']
  ));
  const recordedReturns = normalizeFinancialAmount(preferredFinancialField(
    source, 'recordedReturns', ['returned_amount']
  ));
  const projectedOutstanding = normalizeFinancialAmount(preferredFinancialField(
    source, 'projectedOutstanding', ['outstanding_amount']
  ));
  const returnStatus = preferredFinancialField(source, 'returnStatus', ['return_status']);
  return {
    ...source,
    id: source.id ?? null,
    investmentAmount,
    projectedRoi,
    projectedProfit,
    projectedTotalPayout,
    recordedReturns,
    projectedOutstanding,
    returnStatus: returnStatus == null || returnStatus === '' ? null : String(returnStatus),
    amount: investmentAmount,
    expected_return: projectedTotalPayout,
    returned_amount: recordedReturns,
    outstanding_amount: projectedOutstanding,
    projected_roi_pct: projectedRoi,
    return_status: returnStatus == null || returnStatus === '' ? null : String(returnStatus),
    status,
    balances: source.balances && typeof source.balances === 'object' ? source.balances : null,
  };
}

function parseNearAmount(value) {
  if (value == null || value === '') return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNearAmount(value) {
  if (value == null || !Number.isFinite(Number(value))) return 'Unavailable';
  return `${value.toFixed(2)} NEAR`;
}

function formatUsdAmount(value) {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return 'Unavailable';
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function dealStatusName(deal) {
  return deal?.status?.status || deal?.status || 'Unknown';
}

function fundingAmountSource(deal) {
  return deal?.display_amount
    ?? deal?.displayAmount
    ?? deal?.investment
    ?? deal?.amount
    ?? deal?.invested_amount
    ?? '0';
}

function fundingDisplayAmount(value, currency = 'NEAR') {
  const raw = String(value ?? '');
  if (raw.includes('$')) return formatUsdAmount(numericReturnAmount(raw));
  if (currency === 'USD') return formatUsdAmount(value);
  return formatNearAmount(Number(value || 0));
}

function fundingProgressMetrics(deal = {}) {
  const status = dealStatusName(deal);
  const currency = deal.display_currency || (String(fundingAmountSource(deal)).includes('$') ? 'USD' : 'NEAR');
  const goal = numericReturnAmount(fundingAmountSource(deal));
  const explicitRaised = deal.amount_raised ?? deal.raised_amount ?? deal.funding_raised_amount ?? deal.fundingRaisedAmount;
  const explicitPercent = deal.funding_percentage ?? deal.funding_percent ?? deal.fundingProgressPercent;
  const completedStatuses = ['Completed', 'Funded', 'CycleActive', 'CycleSettlement'];
  const isDemoDeal = Boolean(deal.isDemoPilot || deal.key || deal.pilot_key);
  const demoPercent = isDemoDeal && status === 'Active' ? 64 : null;
  const percent = explicitPercent != null
    ? Number(explicitPercent)
    : (goal > 0
      ? (explicitRaised != null
        ? (numericReturnAmount(explicitRaised) / goal) * 100
        : (completedStatuses.includes(status) ? 100 : (demoPercent ?? 0)))
      : 0);
  const fundingPercentage = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  const amountRaised = explicitRaised != null
    ? numericReturnAmount(explicitRaised)
    : goal * fundingPercentage / 100;
  const remainingAmount = Math.max(goal - amountRaised, 0);
  const investorCount = Number(deal.investor_count ?? deal.investorCount ?? (amountRaised > 0 ? 1 : 0));
  const daysRemaining = Number(deal.days_remaining ?? deal.daysRemaining ?? (fundingPercentage >= 100 ? 0 : (isDemoDeal ? 14 : 30)));

  return {
    goal,
    amountRaised,
    remainingAmount,
    fundingPercentage,
    investorCount: Number.isFinite(investorCount) ? investorCount : 0,
    daysRemaining: Number.isFinite(daysRemaining) ? Math.max(daysRemaining, 0) : 0,
    displayGoal: fundingDisplayAmount(goal, currency),
    displayRaised: fundingDisplayAmount(amountRaised, currency),
    displayRemaining: fundingDisplayAmount(remainingAmount, currency),
  };
}

function renderFundingProgressBar(percent) {
  const width = Math.max(0, Math.min(100, Number(percent || 0))).toFixed(1);
  return `
    <div class="funding-progress-track" aria-label="Funding progress">
      <div class="funding-progress-fill" style="width: ${width}%"></div>
    </div>
  `;
}

function renderFundingProgressCompact(deal) {
  const funding = fundingProgressMetrics(deal);
  return `
    <div class="funding-progress-compact">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <span class="text-sm font-semibold text-slate-100">${escapeHtml(funding.displayRaised)} / ${escapeHtml(funding.displayGoal)}</span>
        <span class="text-xs font-semibold text-green-300">${funding.fundingPercentage.toFixed(0)}% Funded</span>
      </div>
      ${renderFundingProgressBar(funding.fundingPercentage)}
    </div>
  `;
}

function renderFundingProgressPanel(deal) {
  const funding = fundingProgressMetrics(deal);
  const rows = [
    ['Funding Goal', funding.displayGoal],
    ['Amount Raised', funding.displayRaised],
    ['Remaining Amount', funding.displayRemaining],
    ['Funding Percentage', `${funding.fundingPercentage.toFixed(1)}%`],
    ['Investor Count', funding.investorCount],
    ['Days Remaining', funding.daysRemaining],
  ];
  return `
    <section class="bg-slate-800 rounded-xl p-5 mb-6">
      <div class="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide">Funding Progress</h3>
        <span class="text-sm text-green-300 font-semibold">${escapeHtml(funding.displayRaised)} / ${escapeHtml(funding.displayGoal)} · ${funding.fundingPercentage.toFixed(0)}% Funded</span>
      </div>
      ${renderFundingProgressBar(funding.fundingPercentage)}
      <div class="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-4">
        ${rows.map(([label, value]) => `
          <div class="metric-box">
            <span class="metric-label">${label}</span>
            <span class="metric-value">${escapeHtml(value)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function liveFundingProgressMetrics(deal = {}) {
  const goalValue = deal.display_amount
    ?? deal.displayAmount
    ?? deal.investment
    ?? deal.amount
    ?? deal.invested_amount;
  const raisedValue = deal.amount_raised ?? deal.raised_amount ?? deal.funding_raised_amount ?? deal.fundingRaisedAmount;
  const percentValue = deal.funding_percentage ?? deal.funding_percent ?? deal.fundingProgressPercent;
  const goal = goalValue != null ? numericReturnAmount(goalValue) : null;
  const raised = raisedValue != null ? numericReturnAmount(raisedValue) : null;
  const explicitPercent = percentValue != null ? Number(percentValue) : null;
  const percentage = Number.isFinite(explicitPercent) ? Math.max(0, Math.min(100, explicitPercent)) : null;
  const remaining = goal != null && raised != null ? Math.max(goal - raised, 0) : null;
  const currency = deal.display_currency || (String(goalValue ?? '').includes('$') ? 'USD' : 'NEAR');
  const investorCount = deal.investor_count ?? deal.investorCount;
  const daysRemaining = deal.days_remaining ?? deal.daysRemaining;
  return {
    displayGoal: goal != null ? fundingDisplayAmount(goal, currency) : 'Unavailable',
    displayRaised: raised != null ? fundingDisplayAmount(raised, currency) : 'Unavailable',
    displayRemaining: remaining != null ? fundingDisplayAmount(remaining, currency) : 'Unavailable',
    displayPercentage: percentage != null ? `${percentage.toFixed(1)}%` : 'Unavailable',
    percentage,
    investorCount: investorCount != null && Number.isFinite(Number(investorCount)) ? Number(investorCount) : 'Unavailable',
    daysRemaining: daysRemaining != null && Number.isFinite(Number(daysRemaining)) ? Math.max(Number(daysRemaining), 0) : 'Unavailable',
  };
}

function renderLiveFundingProgressCompact(deal) {
  const funding = liveFundingProgressMetrics(deal);
  if (funding.percentage == null) {
    return '<p class="text-xs text-slate-500 mt-3">Funding progress: <span class="text-slate-400">Not available</span></p>';
  }
  return `
    <div class="mt-3">
      <div class="flex items-center justify-between gap-3 text-xs">
        <span class="text-slate-500">Funding progress</span>
        <span class="text-slate-300">${escapeHtml(funding.displayPercentage)}</span>
      </div>
      ${renderFundingProgressBar(funding.percentage)}
    </div>
  `;
}

function renderLiveFundingProgressPanel(deal) {
  const funding = liveFundingProgressMetrics(deal);
  const rows = [
    ['Funding Goal', funding.displayGoal],
    ['Amount Raised', funding.displayRaised],
    ['Remaining Amount', funding.displayRemaining],
    ['Funding Percentage', funding.displayPercentage],
    ['Investor Count', funding.investorCount],
    ['Days Remaining', funding.daysRemaining],
  ];
  const summary = funding.percentage == null
    ? 'Funding progress unavailable'
    : `${funding.displayRaised} / ${funding.displayGoal} · ${funding.percentage.toFixed(0)}% Funded`;
  return `
    <section id="investor-funding-progress" class="bg-slate-800 rounded-xl p-5 mb-6">
      <div class="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide">Funding Progress</h3>
        <span class="text-sm text-green-300 font-semibold">${escapeHtml(summary)}</span>
      </div>
      ${funding.percentage == null
        ? renderInvestorResourceUnavailable('Funding progress', 'Authoritative funding progress is not available for this Project')
        : renderFundingProgressBar(funding.percentage)}
      <div class="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-4">
        ${rows.map(([label, value]) => `
          <div class="metric-box">
            <span class="metric-label">${label}</span>
            <span class="metric-value">${escapeHtml(value)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

// Canonical platform projection data for every demo surface.
// Financial-model sources:
// - docs/60-40/pdf/en/Agri-Investor-Fidlot-v5.9-6040-EN.pdf
// - docs/60-40/pdf/en/Agri-Investor-VariantB-v2.1-6040-EN.pdf
const INVESTOR_DEMO_PILOTS = [
  {
    number: 1,
    key: 'fidlot',
    title: 'Fidlot Livestock Project',
    type: 'Fidlot',
    investment: '$50,000',
    roi: '64%',
    roiPercent: 64,
    simpleAnnualizedRoi: '21.9%',
    reserveRate: 44,
    cycles: '7',
    cycleDurationDays: 150,
    status: 'Completed',
    currentCycle: 7,
    amount: '50000.00',
    expectedReturn: '82000.00',
    returnedAmount: '82000.00',
    outstandingAmount: '0.00',
    displayAmount: '$50,000',
    displayExpectedReturn: '$82,000',
    displayReturnedAmount: '$82,000',
    displayOutstandingAmount: '$0',
    description: 'Livestock fattening operation based on a real pilot agricultural agreement. Demonstrated through the AgriPartners workflow on NEAR Testnet.',
    reportTitle: 'Cycle completion report',
    reportDescription: 'Pilot livestock cycle completed for investor demonstration. Operational reporting is shown as part of the AgriPartners workflow.',
    returnNote: 'Demo return record for completed Fidlot pilot profile.',
  },
  {
    number: 2,
    key: 'hissar',
    title: 'Hissar Sheep Breeding Project',
    type: 'Hissar Sheep',
    investment: '$50,000',
    roi: '63.3%',
    roiPercent: 63.3,
    simpleAnnualizedRoi: '21.1%',
    reserveRate: 53,
    cycles: '6',
    cycleDurationDays: 180,
    status: 'Active',
    currentCycle: 1,
    amount: '50000.00',
    expectedReturn: '81672.00',
    returnedAmount: '0.00',
    outstandingAmount: '81672.00',
    displayAmount: '$50,000',
    displayExpectedReturn: '$81,672',
    displayReturnedAmount: '$0',
    displayOutstandingAmount: '$81,672',
    description: 'Sheep breeding operation based on a real pilot agricultural agreement. Demonstrated through the AgriPartners workflow on NEAR Testnet.',
    reportTitle: 'Initial breeding cycle update',
    reportDescription: 'Demo cycle update for the active Hissar pilot profile. This profile is presented for investor demo readiness and is not a new smart contract deployment.',
    returnNote: '',
  },
];

function pilotKeyFromText(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('fidlot')) return 'fidlot';
  if (text.includes('hissar')) return 'hissar';
  return null;
}

function getPilotByKey(key) {
  return INVESTOR_DEMO_PILOTS.find(pilot => pilot.key === key) || null;
}

function getPilotForDeal(deal) {
  return getPilotByKey(deal?.pilot_key || pilotKeyFromText(`${deal?.title || ''} ${deal?.deal_type || ''}`));
}

function investorDemoDealFromPilot(pilot, connectedWalletAccount) {
  return {
    id: `demo-${pilot.key}`,
    pilot_key: pilot.key,
    isDemoPilot: true,
    title: pilot.title,
    deal_type: pilot.type,
    description: pilot.description,
    farmer: `${pilot.key}-operator.demo.testnet`,
    investor: connectedWalletAccount || 'investor.demo.testnet',
    contract_address: `${pilot.key}-pilot-profile.near-testnet-demo`,
    total_cycles: Number(pilot.cycles),
    cycle_duration_days: pilot.cycleDurationDays,
    amount: pilot.amount,
    expected_return: pilot.expectedReturn,
    returned_amount: pilot.returnedAmount,
    outstanding_amount: pilot.outstandingAmount,
    display_amount: pilot.displayAmount,
    display_expected_return: pilot.displayExpectedReturn,
    display_returned_amount: pilot.displayReturnedAmount,
    display_outstanding_amount: pilot.displayOutstandingAmount,
    display_currency: 'USD',
    roi_percent: pilot.roiPercent,
    escrow_pct: pilot.reserveRate,
    status: { status: pilot.status, current_cycle: pilot.currentCycle },
    balances: null,
  };
}

function farmerDemoDealFromPilot(pilot, farmerAccount) {
  const isFidlot = pilot.key === 'fidlot';
  return {
    id: `demo-${pilot.key}`,
    pilot_key: pilot.key,
    isDemoPilot: true,
    title: pilot.title,
    deal_type: pilot.type,
    description: pilot.description,
    farmer: farmerAccount || `${pilot.key}-operator.demo.testnet`,
    investor: 'pilot-investor.demo.testnet',
    contract_address: `${pilot.key}-pilot-profile.near-testnet-demo`,
    total_cycles: Number(pilot.cycles),
    cycle_duration_days: pilot.cycleDurationDays,
    amount: pilot.amount,
    display_amount: pilot.displayAmount,
    display_currency: 'USD',
    escrow_pct: pilot.reserveRate,
    status: pilot.status,
    activeCycleId: isFidlot ? null : 1,
    fundingStatus: 'Funding Confirmed',
    cycleStatus: isFidlot ? 'Completed' : 'Cycle Active',
    reportStatus: isFidlot ? 'submitted' : 'due',
    reportLabel: isFidlot ? 'Report Submitted' : 'Next Report Due',
    returnLabel: isFidlot ? 'Return Recorded' : 'Cycle Active',
  };
}

function buildFarmerDemoDataset(_deals, farmerAccount) {
  return INVESTOR_DEMO_PILOTS.map(pilot => farmerDemoDealFromPilot(pilot, farmerAccount));
}

function adminDemoDealFromPilot(pilot) {
  const isFidlot = pilot.key === 'fidlot';
  return {
    id: `admin-demo-${pilot.key}`,
    pilot_key: pilot.key,
    isDemoPilot: true,
    title: pilot.title,
    deal_type: pilot.type,
    description: pilot.description,
    status: pilot.status,
    farmer: 'AgriPartners Pilot Farm',
    investor: 'Pilot Investor',
    funding: pilot.displayAmount,
    amount: pilot.amount,
    roi: pilot.roi,
    roiLabel: isFidlot ? 'ROI' : 'Projected ROI',
    simpleAnnualizedRoi: pilot.simpleAnnualizedRoi,
    cycles: pilot.cycles,
    currentCycle: isFidlot ? 7 : 1,
    reportStatus: isFidlot ? 'Report Submitted' : 'Next Report Due',
    fundingStatus: 'Funding Confirmed',
    cycleStatus: isFidlot ? 'Completed' : 'Cycle Active',
    returnStatus: isFidlot ? 'Return Recorded' : 'Pending',
    returnedAmount: isFidlot ? '$82,000' : '$0',
    outstandingAmount: isFidlot ? '$0' : pilot.displayOutstandingAmount,
    expectedReturn: pilot.displayExpectedReturn,
    reportTitle: pilot.reportTitle,
    reportDescription: pilot.reportDescription,
  };
}

function buildAdminDemoDataset() {
  return INVESTOR_DEMO_PILOTS.map(adminDemoDealFromPilot);
}

function marketplaceDeals() {
  return [...INVESTOR_DEMO_PILOTS].sort((a, b) => a.title.localeCompare(b.title));
}

function marketplaceMetrics(deals) {
  const totalDeals = deals.length;
  const activeDeals = deals.filter((deal) => deal.status === 'Active').length;
  const completedDeals = deals.filter((deal) => deal.status === 'Completed').length;
  const averageRoi = totalDeals
    ? deals.reduce((sum, deal) => sum + Number(deal.roiPercent || 0), 0) / totalDeals
    : 0;
  const averageSimpleAnnualizedRoi = totalDeals
    ? deals.reduce((sum, deal) => sum + numericReturnAmount(deal.simpleAnnualizedRoi), 0) / totalDeals
    : 0;

  return { totalDeals, activeDeals, completedDeals, averageRoi, averageSimpleAnnualizedRoi };
}

function filterMarketplaceDeals(deals, filter) {
  if (filter === 'active') return deals.filter((deal) => deal.status === 'Active');
  if (filter === 'completed') return deals.filter((deal) => deal.status === 'Completed');
  if (filter === 'pilot') return deals;
  return deals;
}

function showMarketplace(filter = 'all') {
  showView('view-marketplace');
  const el = document.getElementById('view-marketplace');
  const deals = marketplaceDeals();
  const filteredDeals = filterMarketplaceDeals(deals, filter);

  el.innerHTML = `
    ${renderNav()}
    ${renderEnvironmentBanner('demo', 'Opportunity Catalog')}
    <div class="mb-6">
      <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition">
        <span class="text-lg leading-none" aria-hidden="true">&larr;</span>
        Back home
      </a>
    </div>
    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-green-400 mb-1">Opportunity Catalog</h1>
        <p class="text-slate-400">Explore AgriPartners Investment Models and Pilot Project profiles in a curated Alpha catalog, not a live transaction venue.</p>
      </div>
    </div>
    ${renderMarketplaceStats(marketplaceMetrics(deals))}
    ${renderDashboardSection('Available Investment Models', `
      ${renderMarketplaceFilters(filter)}
      <div id="marketplace-deals" class="grid lg:grid-cols-2 gap-4 mt-4">
        ${filteredDeals.map(renderMarketplaceDealCard).join('')}
      </div>
    `)}
  `;

  el.querySelectorAll('[data-marketplace-filter]').forEach((button) => {
    button.addEventListener('click', () => showMarketplace(button.dataset.marketplaceFilter));
  });
}

function renderMarketplaceStats(metrics) {
  const rows = [
    ['Total Projects', metrics.totalDeals],
    ['Active Projects', metrics.activeDeals],
    ['Completed Projects', metrics.completedDeals],
    ['Average ROI', `${metrics.averageRoi.toFixed(1)}%`],
    ['Average simple annualized ROI', `${metrics.averageSimpleAnnualizedRoi.toFixed(1)}%`],
  ];

  return `
    <section class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
      ${rows.map(([label, value]) => `
        <div class="metric-box">
          <span class="metric-label">${label}</span>
          <span class="metric-value">${escapeHtml(value)}</span>
        </div>
      `).join('')}
    </section>
  `;
}

function renderMarketplaceFilters(activeFilter) {
  const filters = [
    ['all', 'All'],
    ['active', 'Active'],
    ['completed', 'Completed'],
    ['pilot', 'Pilot Projects'],
  ];

  return `
    <div id="marketplace-filters" class="flex flex-wrap gap-2">
      ${filters.map(([value, label]) => `
        <button
          type="button"
          data-marketplace-filter="${value}"
          class="marketplace-filter-btn ${activeFilter === value ? 'is-active' : ''}"
        >${label}</button>
      `).join('')}
    </div>
  `;
}

function renderMarketplaceDealCard(deal) {
  const metrics = [
    ['Investment', deal.investment],
    ['ROI', deal.roi],
    ['Simple annualized ROI', deal.simpleAnnualizedRoi],
    ['Cycles', deal.cycles],
    ['Status', deal.status],
  ];

  return `
    <article class="bg-slate-800 border border-green-900 rounded-lg p-5">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <span class="text-xs font-semibold text-green-300 uppercase tracking-wide">Pilot Project #${deal.number}</span>
          <h3 class="text-xl font-bold text-slate-50 mt-1">${escapeHtml(deal.title)}</h3>
        </div>
        <span class="text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700 px-2 py-1 rounded">Investment Model: ${escapeHtml(deal.type)}</span>
      </div>
      <div class="marketplace-deal-stats">
        ${metrics.map(([label, value]) => `
          <div class="marketplace-deal-stat bg-slate-900 border border-slate-700 rounded-lg p-3">
            <span class="block text-xs text-slate-500">${label}</span>
            <span class="marketplace-deal-stat-value block text-lg font-bold text-slate-100">${escapeHtml(value)}</span>
          </div>
        `).join('')}
      </div>
      ${renderFundingProgressCompact(deal)}
      <div class="flex flex-wrap gap-2 mt-4">
        <a href="#/investor/pilots/${deal.key}" class="inline-flex bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition">View Project</a>
        <a href="#/protection/${deal.key}" class="protection-cta">✦ Protection table</a>
      </div>
    </article>
  `;
}

function adminDemoMetrics(deals) {
  return {
    totalPilotFunding: formatUsdAmount(deals.reduce((sum, deal) => sum + numericReturnAmount(deal.amount), 0)),
    activeDeals: deals.filter((deal) => deal.status === 'Active').length,
    completedDeals: deals.filter((deal) => deal.status === 'Completed').length,
    reportsSubmitted: deals.filter((deal) => deal.reportStatus === 'Report Submitted').length,
    reportsPending: deals.filter((deal) => deal.reportStatus === 'Next Report Due').length,
    returnsRecorded: formatUsdAmount(deals.reduce((sum, deal) => sum + numericReturnAmount(deal.returnedAmount), 0)),
    outstanding: formatUsdAmount(deals.reduce((sum, deal) => sum + numericReturnAmount(deal.outstandingAmount), 0)),
  };
}

function investorMetrics(deals, portfolioSummary = null) {
  deals = Array.isArray(deals) ? deals.filter(deal => deal && typeof deal === 'object') : [];
  const activeDeals = deals.filter(deal => !['Completed', 'Terminated'].includes(deal.status?.status)).length;
  const completedDeals = deals.filter(deal => deal.status?.status === 'Completed').length;
  return {
    totalInvested: portfolioSummary?.totalInvested ?? null,
    totalProjectedProfit: portfolioSummary?.totalProjectedProfit ?? null,
    totalProjectedPayout: portfolioSummary?.totalProjectedPayout ?? null,
    totalRecordedReturns: portfolioSummary?.totalRecordedReturns ?? null,
    totalOutstanding: portfolioSummary?.totalOutstanding ?? null,
    weightedProjectedRoi: portfolioSummary?.weightedProjectedRoi ?? null,
    activeDeals,
    completedDeals,
  };
}

function renderInvestorDashboard(el, deals, connectedWalletAccount, portfolioResult = {}) {
  el.querySelector('.spinner')?.remove();
  deals = Array.isArray(deals) ? deals : [];
  const metrics = investorMetrics(deals, portfolioResult.data);
  const financialError = portfolioResult.error || (!portfolioResult.data ? 'Portfolio financial summary unavailable' : null);
  const dashboard = document.createElement('div');
  const activeDeals = deals.filter(deal => !['Completed', 'Terminated'].includes(deal.status?.status));
  const completedDeals = deals.filter(deal => deal.status?.status === 'Completed');
  const attention = investorAttentionState(deals);

  if (deals.length === 0) {
    dashboard.innerHTML = `
      ${renderDashboardSection('Portfolio Summary', renderInvestorMetrics(metrics, attention, financialError))}
      ${renderDashboardSection('Attention Required', renderInvestorAttention(attention))}
      ${renderDashboardSection('Active Projects', `<p class="text-slate-400">No active Projects found for the connected Investor account: <span class="font-mono text-slate-200">${escapeHtml(connectedWalletAccount)}</span></p>`)}
      ${renderDashboardSection('Completed Projects', renderEmptyDashboardSection('No completed Projects yet'))}
      ${renderDashboardSection('Portfolio Performance', renderPortfolioPerformance(metrics, financialError))}
      ${renderDashboardSection('Recent Activity', renderRecentActivity())}
      ${renderDashboardSection('Reporting Information', renderInvestorReportingSignals())}
    `;
    el.appendChild(dashboard);
    return;
  }

  dashboard.innerHTML = `
    ${renderDashboardSection('Portfolio Summary', renderInvestorMetrics(metrics, attention, financialError))}
    ${renderDashboardSection('Attention Required', renderInvestorAttention(attention))}
    ${renderDashboardSection('Active Projects', renderDealSection(activeDeals, 'No active Projects'))}
    ${renderDashboardSection('Completed Projects', renderDealSection(completedDeals, 'No completed Projects yet'))}
    ${renderDashboardSection('Portfolio Performance', renderPortfolioPerformance(metrics, financialError))}
    ${renderDashboardSection('Recent Activity', renderRecentActivity())}
    ${renderDashboardSection('Reporting Information', renderInvestorReportingSignals())}
  `;
  el.appendChild(dashboard);
}

function renderDashboardSection(title, content) {
  return `
    <section class="mt-8 first:mt-0">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 class="text-xl font-semibold text-slate-100">${escapeHtml(title)}</h2>
      </div>
      ${content}
    </section>
  `;
}

function renderEmptyDashboardSection(message) {
  return `<div class="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-400">${escapeHtml(message)}</div>`;
}

function renderDealSection(deals, emptyMessage) {
  if (!Array.isArray(deals) || !deals.length) return renderEmptyDashboardSection(emptyMessage);
  return `<div class="grid gap-4">${deals.map(renderInvestorDealCard).join('')}</div>`;
}

function investorAttentionState(deals) {
  const safeDeals = Array.isArray(deals) ? deals : [];
  if (safeDeals.length === 0) return { available: true, count: 0, items: [] };
  const hasCompleteAuthoritativeFlags = safeDeals.every(deal => typeof deal.attention_required === 'boolean');
  if (!hasCompleteAuthoritativeFlags) return { available: false, count: null, items: [] };
  const items = safeDeals.filter(deal => deal.attention_required === true);
  return { available: true, count: items.length, items };
}

function renderInvestorAttention(attention) {
  if (!attention?.available) {
    return '<p class="text-sm text-slate-500">No authoritative attention signals are available for this portfolio.</p>';
  }
  if (!attention.count) {
    return '<p class="text-sm text-slate-500">No investments require attention based on available backend signals.</p>';
  }
  return `<div class="grid gap-3">${attention.items.map(deal => `
    <div class="bg-slate-800 border border-amber-800 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="font-semibold text-slate-100">${escapeHtml(deal.title || `Project #${deal.id ?? 'Unknown'}`)}</p>
        <p class="text-sm text-amber-200">${escapeHtml(deal.attention_reason || 'Backend attention flag is active.')}</p>
      </div>
      ${deal.id == null ? '' : `<a href="#investor/deals/${escapeHtml(deal.id)}" class="text-sm text-green-400 hover:underline">View Project</a>`}
    </div>
  `).join('')}</div>`;
}

function renderInvestorMetrics(metrics, attention = { available: false, count: null }, financialError = null) {
  if (financialError) return renderInvestorFinancialSummaryUnavailable(financialError);
  const invested = formatOptionalNearDisplay(metrics.totalInvested);
  const returned = formatOptionalNearDisplay(metrics.totalRecordedReturns);
  const outstanding = formatOptionalNearDisplay(metrics.totalOutstanding);
  const attentionValue = attention.available ? attention.count : 'Unavailable';
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="metric-box">
        <span class="metric-label">Total Invested</span>
        <span class="metric-value">${escapeHtml(invested)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Recorded Off-chain Returns</span>
        <span class="metric-value">${escapeHtml(returned)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Projected Outstanding</span>
        <span class="metric-value">${escapeHtml(outstanding)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Investments Requiring Attention</span>
        <span class="metric-value">${escapeHtml(attentionValue)}</span>
      </div>
    </div>
  `;
}

function renderInvestorFinancialSummaryUnavailable(message) {
  return `
    <div class="bg-amber-950 border border-amber-800 rounded-lg px-4 py-3 text-sm text-amber-100" data-investor-financial-summary-error>
      <span class="font-semibold">Financial summary unavailable.</span>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

function portfolioPercentLabel(value, missingLabel = 'Unavailable') {
  return value == null || !Number.isFinite(Number(value)) ? missingLabel : `${Number(value).toFixed(1)}%`;
}

function renderPortfolioPerformance(metrics, financialError = null) {
  if (financialError) return renderInvestorFinancialSummaryUnavailable(financialError);
  const rows = [
    ['Projected Profit', formatOptionalNearDisplay(metrics.totalProjectedProfit)],
    ['Projected Total Payout', formatOptionalNearDisplay(metrics.totalProjectedPayout)],
    ['Weighted Projected ROI', portfolioPercentLabel(metrics.weightedProjectedRoi, 'Unavailable')],
    ['Realized Profit', 'Not yet authoritative'],
    ['Realized ROI', 'Not yet authoritative'],
    ['Active Projects', metrics.activeDeals],
    ['Completed Projects', metrics.completedDeals],
  ];
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      ${rows.map(([label, value]) => `
        <div class="metric-box">
          <span class="metric-label">${label}</span>
          <span class="metric-value">${escapeHtml(value)}</span>
        </div>
      `).join('')}
    </div>
    <p class="text-xs text-slate-500 mt-2">Realized performance remains unavailable until return entries are typed and reconciled.</p>
  `;
}

function renderRecentActivity() {
  return '<p class="text-sm text-slate-500">Authoritative recent activity is not available in the portfolio summary. Open a Project to view its event and Settlement / Returns history.</p>';
}

function renderInvestorReportingSignals() {
  const signals = [
    ['Project Reports', 'Available in Project detail'],
    ['Production Cycles', 'Available in Project detail'],
    ['Project Progress', 'Available in Project detail'],
    ['Farmer Reports', 'Available in Project detail'],
  ];
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      ${signals.map(([label, value]) => `
        <div class="metric-box">
          <span class="metric-label">${label}</span>
          <span class="metric-value text-base">${value}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function investorPilotLabel(deal) {
  const pilot = getPilotForDeal(deal);
  if (pilot) return pilot.title;
  return deal.title || `Project #${deal.id}`;
}

function investorProjectProfile(deal = {}, status) {
  if (deal.isDemoPilot) {
    const pilot = getPilotForDeal(deal);
    const projectStatus = status?.status || deal.status?.status || 'Unknown';
    return {
      title: pilot?.title || deal.title || 'Demo pilot',
      investment: pilot?.investment || deal.display_amount || 'Unavailable',
      roi: pilot?.roi || 'Unavailable',
      roiLabel: projectStatus === 'Completed' ? 'ROI' : 'Projected ROI',
      simpleAnnualizedRoi: pilot?.simpleAnnualizedRoi || 'Unavailable',
      reserveRate: pilot?.reserveRate != null ? `${pilot.reserveRate}%` : 'Unavailable',
      cycles: pilot?.cycles || String(deal.total_cycles ?? 'Unavailable'),
      description: pilot?.description || deal.description || 'Unavailable',
      status: projectStatus,
    };
  }

  const projectStatus = status?.status || 'Unknown';
  const projectedRoi = deal.projectedRoi;
  const investment = deal.display_amount
    || formatOptionalNearDisplay(deal.investmentAmount);
  return {
    title: deal.title || `Project #${deal.id ?? 'Unknown'}`,
    investment,
    roi: projectedRoi != null && Number.isFinite(Number(projectedRoi)) ? `${projectedRoi}%` : 'Unavailable',
    roiLabel: 'Projected ROI',
    simpleAnnualizedRoi: deal.simple_annualized_roi != null
      ? String(deal.simple_annualized_roi)
      : deal.apr != null
        ? String(deal.apr)
        : deal.apr_pct != null
          ? `${deal.apr_pct}%`
          : 'Unavailable',
    reserveRate: deal.escrow_pct != null ? `${deal.escrow_pct}%` : 'Unavailable',
    cycles: deal.total_cycles != null ? String(deal.total_cycles) : 'Unavailable',
    description: deal.description || 'Unavailable',
    status: projectStatus,
  };
}

function investorDealPerformanceState(deal = {}) {
  const status = deal.status?.status || (typeof deal.status === 'string' ? deal.status : null);
  if (deal.attention_required === true || deal.action_required === true || status === 'Terminated') {
    return { label: 'Attention required', className: 'bg-amber-950 text-amber-200 border-amber-800' };
  }
  if (status === 'Completed') {
    return { label: 'Completed', className: 'bg-green-950 text-green-200 border-green-800' };
  }
  if (!status || status === 'Unknown') {
    return { label: 'Awaiting data', className: 'bg-slate-900 text-slate-300 border-slate-700' };
  }
  return { label: 'Active', className: 'bg-blue-950 text-blue-200 border-blue-800' };
}

function investorDealReportsState(deal = {}) {
  const value = deal.report_status ?? deal.reports_status;
  return value == null || value === '' ? 'Unavailable' : String(value);
}

function renderProjectProfile(deal, status, statusError = null) {
  const profile = investorProjectProfile(deal, status);
  const profileBadge = deal.isDemoPilot ? 'Pilot Project' : `Project #${deal.id}`;
  const metrics = [
    ['Investment', profile.investment],
    [profile.roiLabel, profile.roi],
    ['Simple annualized ROI', profile.simpleAnnualizedRoi],
    ['Protection reserve', profile.reserveRate],
    ['Production Cycles', profile.cycles],
    ['Project Status', profile.status],
  ];

  return `
    <section id="investor-project-profile" class="bg-slate-800 border border-green-900 rounded-lg p-5 mb-6">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <span class="text-xs font-semibold text-green-300 uppercase tracking-wide">Project Profile</span>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-50 mt-1">${escapeHtml(profile.title)}</h1>
          <p class="text-sm text-slate-400 mt-2 max-w-3xl">${escapeHtml(profile.description)}</p>
        </div>
        <span class="text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700 px-2 py-1 rounded">${escapeHtml(profileBadge)}</span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
        ${metrics.map(([label, value]) => `
          <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <span class="block text-xs text-slate-500">${label}</span>
            <span class="block text-lg font-bold text-slate-100">${escapeHtml(value)}</span>
          </div>
        `).join('')}
      </div>
      ${statusError ? renderInvestorResourceUnavailable('NEAR Testnet status', statusError) : ''}
    </section>
  `;
}

function renderInvestorDealCard(deal) {
  const pilotLabel = investorPilotLabel(deal);
  const dealBadge = deal.isDemoPilot ? 'Pilot Project' : `Project #${deal.id}`;
  const dealHref = deal.isDemoPilot ? `#investor/pilots/${deal.pilot_key}` : `#investor/deals/${deal.id}`;
  const invested = deal.display_amount || formatNearDisplay(deal.investmentAmount);
  const returned = deal.display_returned_amount || formatNearDisplay(deal.recordedReturns);
  const outstanding = deal.display_outstanding_amount || formatNearDisplay(deal.projectedOutstanding);
  const performance = investorDealPerformanceState(deal);
  const currentCycle = deal.status?.current_cycle ?? 'Unknown';
  const farmer = deal.farmer ? formatAddress(deal.farmer) : 'Unknown';
  const reportsState = investorDealReportsState(deal);
  const protectionText = `${deal.pilot_key || ''} ${deal.title || ''} ${deal.deal_type || ''}`.toLowerCase();
  const protectionRate = deal.escrow_pct != null
    ? deal.escrow_pct
    : protectionText.includes('fidlot')
      ? 44
      : protectionText.includes('hissar')
        ? 53
        : null;
  return `
    <article class="bg-slate-800 rounded-xl p-5">
      <div class="min-w-0">
        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-semibold text-slate-100">${escapeHtml(pilotLabel)}</h3>
          <div class="flex flex-wrap items-center gap-2 mt-2">
            <span class="text-xs font-semibold border px-2 py-0.5 rounded ${performance.className}">${escapeHtml(performance.label)}</span>
            <span class="text-xs text-slate-500">${escapeHtml(dealBadge)}</span>
            <span data-protection-rate-badge class="text-xs font-semibold text-blue-200 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded">Protection reserve: ${protectionRate == null ? 'Unavailable' : `${escapeHtml(protectionRate)}%`}</span>
          </div>
        </div>
      </div>
      <div class="grid sm:grid-cols-3 gap-3 mt-4">
        <div>
          <span class="block text-xs text-slate-500">Total Invested</span>
          <span class="text-sm text-slate-100 font-mono">${escapeHtml(invested)}</span>
        </div>
        <div>
          <span class="block text-xs text-slate-500">Recorded Off-chain Returns</span>
          <span class="text-sm text-green-300 font-mono">${escapeHtml(returned)}</span>
        </div>
        <div>
          <span class="block text-xs text-slate-500">Projected Outstanding</span>
          <span class="text-sm text-slate-100 font-mono">${escapeHtml(outstanding)}</span>
        </div>
      </div>
      <div class="flex justify-end mt-4">
        <a href="${escapeHtml(dealHref)}" class="shrink-0 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition">View Project</a>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-700 text-xs text-slate-500">
        <span>Farmer Assignment: <span class="text-slate-300">${escapeHtml(farmer)}</span></span>
        <span>Project Operator: <span class="text-slate-300">AgriPartners</span></span>
        <span>Production Cycle: <span class="text-slate-300">${escapeHtml(currentCycle)}</span></span>
        <span>Farmer Reports: <span class="text-slate-300">${escapeHtml(reportsState)}</span></span>
      </div>
      ${renderLiveFundingProgressCompact(deal)}
    </article>
  `;
}

function investorDemoCycles(pilot) {
  return [{
    cycle_number: pilot.key === 'fidlot' ? 7 : 1,
    status: pilot.key === 'fidlot' ? 'reported' : 'funding_sent',
    funding_sent: true,
    funding_confirmed: true,
    report_submitted: true,
    report_title: pilot.reportTitle,
    report_body: pilot.reportDescription,
    report_created_at: new Date().toISOString(),
  }];
}

function investorDemoReports(pilot, deal) {
  return [{
    id: `demo-report-${pilot.key}`,
    cycle_id: pilot.key === 'fidlot' ? 7 : 1,
    farmer_wallet: deal.farmer,
    title: pilot.reportTitle,
    description: pilot.reportDescription,
    amount_used: 'Demo pilot operations',
    evidence_url: '',
    submitted_at: new Date().toISOString(),
  }];
}

function investorDemoReturns(pilot) {
  if (pilot.key !== 'fidlot') return [];
  return [{
    id: 'demo-return-fidlot',
    amount_near: pilot.returnedAmount,
    note: pilot.returnNote,
    created_at: new Date().toISOString(),
  }];
}

function investorDemoEvents(pilot) {
  const now = new Date().toISOString();
  const base = [
    { event_type: 'demo_profile_created', cycle_num: null, tx_hash: null, created_at: now },
    { event_type: 'pilot_terms_reviewed', cycle_num: null, tx_hash: null, created_at: now },
  ];
  if (pilot.key === 'fidlot') {
    return [
      ...base,
      { event_type: 'cycle_reported', cycle_num: 7, tx_hash: null, created_at: now },
      { event_type: 'completed', cycle_num: null, tx_hash: null, created_at: now },
    ];
  }
  return [
    ...base,
    { event_type: 'cycle_started', cycle_num: 1, tx_hash: null, created_at: now },
  ];
}

function farmerDemoCycles(pilot) {
  const now = new Date().toISOString();
  if (pilot.key === 'fidlot') {
    return [{
      id: 7,
      status: 'reported',
      cycleStatus: 'Completed',
      fundingReceived: true,
      reportStatus: 'submitted',
      report: {
        title: pilot.reportTitle,
        description: pilot.reportDescription,
        amountUsed: 'Pilot livestock operations',
        submittedAt: now,
      },
    }];
  }
  return [{
    id: 1,
    status: 'funding_sent',
    cycleStatus: 'Cycle Active',
    fundingReceived: true,
    reportStatus: 'due',
    report: null,
  }];
}

function farmerDemoEvents(pilot) {
  const now = new Date().toISOString();
  if (pilot.key === 'fidlot') {
    return [
      { event_type: 'Funding Confirmed', cycle_num: 7, tx_hash: null, created_at: now },
      { event_type: 'Report Submitted', cycle_num: 7, tx_hash: null, created_at: now },
      { event_type: 'Return Recorded', cycle_num: 7, tx_hash: null, created_at: now },
      { event_type: 'Completed', cycle_num: null, tx_hash: null, created_at: now },
    ];
  }
  return [
    { event_type: 'Funding Confirmed', cycle_num: 1, tx_hash: null, created_at: now },
    { event_type: 'Cycle Active', cycle_num: 1, tx_hash: null, created_at: now },
    { event_type: 'Next Report Due', cycle_num: 1, tx_hash: null, created_at: now },
  ];
}

function showInvestorPilotProfile(key) {
  showView('view-investor');
  const el = document.getElementById('view-investor');
  const pilot = getPilotByKey(key);

  if (!pilot) {
    el.innerHTML = `
      ${renderNav()}
      <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition mb-6">
        <span class="text-lg leading-none" aria-hidden="true">&larr;</span>
        Back home
      </a>
      <div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Pilot profile unavailable</div>
    `;
    return;
  }

  const deal = investorDemoDealFromPilot(pilot, getNearWalletAccount());
  renderInvestorDemoDealDetail(
    el,
    deal,
    deal.status,
    investorDemoEvents(pilot),
    investorDemoReports(pilot, deal),
    investorDemoCycles(pilot),
    investorDemoReturns(pilot)
  );
}

function renderInvestorDemoDealDetail(el, deal, status, events, reports, cycles, returns) {
  const profile = investorProjectProfile(deal, status);
  el.innerHTML = `
    ${renderNav()}
    ${renderEnvironmentBanner('demo', 'Investor')}
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-green-300 transition">
        <span class="text-lg leading-none" aria-hidden="true">&larr;</span>
        Back home
      </a>
      <span class="text-slate-600">|</span>
      <span class="font-semibold">${escapeHtml(profile.title)}</span>
      <span class="text-xs text-slate-500">Pilot Profile</span>
      ${statusBadge(status?.status)}
      <span class="text-slate-400 text-sm">Cycle ${status?.current_cycle ?? '-'}</span>
    </div>

    ${renderProjectWorkspaceHeader({ deal, status, cycles, reports, returns, events, role: 'investor' })}
    ${renderProjectProfile(deal, status)}
    ${renderFundingProgressPanel(deal)}
    ${renderInvestorProtectionPanel(deal, deal.balances)}

    <div class="bg-amber-950 border border-amber-800 rounded-lg px-4 py-3 mb-6 text-sm text-amber-100">
      Investor demo profile: this screen is prepared for presentation and screenshot readiness. It does not deploy or modify a smart contract.
    </div>

    ${renderInvestorReturnsManagement(deal, returns)}

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Cycle Status</h3>
      <div id="investor-cycles-list">${renderCycleStatusCards(cycles)}</div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Farmer Reports</h3>
      <div id="investor-reports-list">${renderInvestorReports(reports)}</div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Returns Ledger</h3>
      <div id="investor-returns-list">${renderRepaymentHistory(returns)}</div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Event History</h3>
      <div id="investor-events-list">${renderEvents(events)}</div>
    </div>
  `;
}

async function showInvestorDeal(id) {
  showView('view-investor');
  const el = document.getElementById('view-investor');
  el.innerHTML = `
    ${renderNav()}
    <a href="#investor" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">Back to Investor Portal</a>
    <div class="spinner"></div>
  `;

  try {
    const bundle = await fetchInvestorDealBundle(id);
    renderInvestorDealDetail(el, bundle);
  } catch (e) {
    el.querySelector('.spinner')?.remove();
    el.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Project unavailable: ${escapeHtml(e.message)}</div>`;
  }
}

async function fetchInvestorDealBundle(id) {
  const headers = authHeaders();
  const [dealRes, statusRes, balancesRes, eventsRes, cyclesRes, reportsRes, returnsRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/investor/deals/${id}`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/status`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/balances`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/events`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/cycles`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/reports`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/returns`, { headers })
  ]);

  const deal = normalizeInvestorDeal(await readMandatoryInvestorDeal(dealRes));
  const resources = await Promise.all([
    readOptionalInvestorResource(statusRes, 'NEAR Testnet status', normalizeInvestorObjectPayload, null),
    readOptionalInvestorResource(balancesRes, 'NEAR Testnet balances', normalizeInvestorObjectPayload, null),
    readOptionalInvestorResource(eventsRes, 'Event history', normalizeInvestorArrayPayload, []),
    readOptionalInvestorResource(cyclesRes, 'Cycle status', normalizeInvestorCyclesPayload, []),
    readOptionalInvestorResource(reportsRes, 'Farmer reports', normalizeInvestorReportsPayload, []),
    readOptionalInvestorResource(returnsRes, 'Returns ledger', normalizeInvestorArrayPayload, []),
  ]);
  const [status, balances, events, cycles, reports, returns] = resources;
  return {
    deal,
    status: status.data,
    balances: balances.data,
    events: events.data,
    cycles: cycles.data,
    reports: reports.data,
    returns: returns.data,
    resourceErrors: {
      status: status.error,
      balances: balances.error,
      events: events.error,
      cycles: cycles.error,
      reports: reports.error,
      returns: returns.error,
    },
  };
}

async function readInvestorResponseJson(response, label) {
  try {
    return await response.json();
  } catch {
    throw new Error(`${label} returned invalid JSON`);
  }
}

function investorResponseError(label, status) {
  if (status === 401) return `${label} authorization failed: wallet session expired`;
  if (status === 403) return `${label} authorization failed`;
  if (status === 404) return `${label} not found`;
  return `${label} unavailable (HTTP ${status || 'unknown'})`;
}

async function readMandatoryInvestorDeal(result) {
  if (result.status === 'rejected') throw new Error('Investor Project request failed: network unavailable');
  if (!result.value.ok) {
    if (result.value.status === 401) clearAuth();
    throw new Error(investorResponseError('Investor Project', result.value.status));
  }
  const payload = await readInvestorResponseJson(result.value, 'Investor Project');
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Investor Project returned malformed data');
  }
  return payload;
}

async function readOptionalInvestorResource(result, label, normalize, fallback) {
  if (result.status === 'rejected') {
    return { data: fallback, error: `${label} unavailable: network request failed` };
  }
  if (!result.value.ok) {
    if (result.value.status === 401) clearAuth();
    return { data: fallback, error: investorResponseError(label, result.value.status) };
  }
  try {
    const payload = await readInvestorResponseJson(result.value, label);
    return { data: normalize(payload, label), error: null };
  } catch (err) {
    return { data: fallback, error: err.message || `${label} returned malformed data` };
  }
}

function normalizeInvestorObjectPayload(payload, label) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error(`${label} returned malformed data`);
  }
  return payload;
}

function normalizeInvestorArrayPayload(payload, label) {
  if (!Array.isArray(payload)) throw new Error(`${label} returned malformed data`);
  if (!payload.every(item => item && typeof item === 'object' && !Array.isArray(item))) {
    throw new Error(`${label} returned malformed data`);
  }
  return payload;
}

function normalizeInvestorCyclesPayload(payload) {
  const cycles = Array.isArray(payload) ? payload : payload?.cycles;
  if (Array.isArray(cycles) && cycles.every(item => item && typeof item === 'object' && !Array.isArray(item))) {
    return cycles;
  }
  throw new Error('Cycle status returned malformed data');
}

function normalizeInvestorReportsPayload(payload) {
  if (!payload || !Array.isArray(payload.reports)
    || !payload.reports.every(item => item && typeof item === 'object' && !Array.isArray(item))) {
    throw new Error('Farmer reports returned malformed data');
  }
  return payload.reports;
}

function renderInvestorDealAccessMessage(el) {
  el.querySelector('.spinner')?.remove();
  el.innerHTML = `
    ${renderNav()}
    <a href="#investor" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">Back to Investor Portal</a>
    <div class="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200">
      <p>This Project is not linked to the connected Investor account.</p>
    </div>
  `;
}

function renderInvestorDealDetail(el, bundle) {
  const {
    deal,
    status,
    balances,
    events = [],
    reports = [],
    cycles = [],
    returns = [],
    resourceErrors = {},
  } = bundle;
  const investorBalance = balances?.investor ?? null;
  const profile = investorProjectProfile(deal, status);
  el.innerHTML = `
    ${renderNav()}
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="#investor" class="text-slate-400 hover:text-white text-sm">Back to Investor Portal</a>
      <span class="text-slate-600">|</span>
      <span id="investor-deal-title" class="font-semibold">${escapeHtml(profile.title)}</span>
      <span class="text-xs text-slate-500">Project #${escapeHtml(deal.id)}</span>
      <span id="investor-status-badge">${statusBadge(status?.status)}</span>
      <span id="investor-cycle-text" class="text-slate-400 text-sm">Production Cycle ${status?.current_cycle ?? '—'}</span>
      <button id="btn-investor-refresh" class="ml-auto bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded transition">Refresh</button>
    </div>

    ${renderProjectWorkspaceHeader({ deal, status, cycles, reports, returns, events, role: 'investor' })}
    <nav aria-label="Project sections" class="flex flex-wrap gap-2 mb-6 text-sm">
      <button type="button" id="btn-investor-section-overview" class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition">Overview</button>
      <button type="button" id="btn-investor-section-returns" class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition">Settlement / Returns</button>
      <button type="button" id="btn-investor-section-reports" class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition">Farmer Reports</button>
      <button type="button" id="btn-investor-section-activity" class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition">Activity</button>
      <button type="button" id="btn-investor-section-technical" class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition">Technical</button>
    </nav>

    <div id="investor-detail-overview">
      ${renderProjectProfile(deal, status, resourceErrors.status)}
      ${renderLiveFundingProgressPanel(deal)}
      ${renderInvestorProtectionPanel(deal, balances)}
    </div>

    <div id="investor-detail-returns">
      ${renderInvestorReturnsManagement(deal, returns)}
      <button type="button" id="btn-investor-section-ledger" class="text-sm text-green-400 hover:underline mb-6">View ledger entries</button>
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Settlement Infrastructure</h3>
      <p class="text-xs text-amber-200 bg-amber-950 border border-amber-800 rounded-lg px-3 py-2 mb-4">Alpha/Testnet infrastructure action only. It is not production Settlement and does not create direct Investor-to-Farmer interaction.</p>
      <button id="btn-investor-withdraw" class="admin-action-btn w-full">Run Testnet Settlement Action</button>
      <div id="investor-action-result" class="hidden mt-4 rounded-lg px-4 py-3 text-sm"></div>
    </div>

    <div id="investor-detail-reports" class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Farmer Reports</h3>
      <div id="investor-reports-list">${resourceErrors.reports ? renderInvestorResourceUnavailable('Farmer reports', resourceErrors.reports) : renderInvestorReports(reports)}</div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Production Cycles</h3>
      <div id="investor-cycles-list">${resourceErrors.cycles ? renderInvestorResourceUnavailable('Cycle status', resourceErrors.cycles) : renderCycleStatusCards(cycles)}</div>
    </div>

    <div id="investor-detail-ledger" class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Settlement / Returns Ledger</h3>
      <div id="investor-returns-list">${resourceErrors.returns ? renderInvestorResourceUnavailable('Returns ledger', resourceErrors.returns) : renderInvestorTypedReturnLedger(returns)}</div>
    </div>

    <div id="investor-detail-activity" class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Event History</h3>
      <div id="investor-events-list">${resourceErrors.events ? renderInvestorResourceUnavailable('Event history', resourceErrors.events) : renderEvents(events)}</div>
    </div>

    <div id="investor-detail-technical" class="bg-slate-800 rounded-xl p-5 space-y-2">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">NEAR Testnet Infrastructure</h3>
      <div id="investor-technical-data">${renderInvestorDealParams(deal, status, investorBalance, resourceErrors)}</div>
    </div>
  `;

  document.getElementById('btn-investor-refresh').addEventListener('click', () => refreshInvestorDeal(deal.id));
  document.getElementById('btn-investor-withdraw').addEventListener('click', () => withdrawInvestorFromPortal(deal));
  bindInvestorDetailSectionLink('btn-investor-section-overview', 'investor-detail-overview');
  bindInvestorDetailSectionLink('btn-investor-section-returns', 'investor-detail-returns');
  bindInvestorDetailSectionLink('btn-investor-section-reports', 'investor-detail-reports');
  bindInvestorDetailSectionLink('btn-investor-section-activity', 'investor-detail-activity');
  bindInvestorDetailSectionLink('btn-investor-section-technical', 'investor-detail-technical');
  bindInvestorDetailSectionLink('btn-investor-section-ledger', 'investor-detail-ledger');
}

function renderInvestorProtectionPanel(deal = {}, balances = null) {
  const descriptor = `${deal.pilot_key || deal.key || ''} ${deal.title || ''} ${deal.deal_type || ''}`.toLowerCase();
  const modelKey = descriptor.includes('fidlot') ? 'fidlot' : descriptor.includes('hissar') ? 'hissar' : null;
  const modeledRate = modelKey === 'fidlot' ? 44 : modelKey === 'hissar' ? 53 : null;
  const reserveRate = deal.escrow_pct != null ? deal.escrow_pct : modeledRate;
  const modeledContributions = modelKey === 'fidlot' ? '$50,820' : modelKey === 'hissar' ? '$50,752.80' : 'Agreement-specific';
  const modelTitle = modelKey === 'fidlot' ? 'Fidlot v5.9' : modelKey === 'hissar' ? 'Hissar / VariantB v2.1' : 'Model-specific Project';
  const reserveRaw = balances?.escrow ?? deal.balances?.escrow;
  let currentReserve = 'Not available from the current Project data';
  if (reserveRaw != null && reserveRaw !== '') {
    try {
      const amount = BigInt(reserveRaw);
      const oneNear = BigInt('1000000000000000000000000');
      const whole = amount / oneNear;
      const fraction = ((amount % oneNear) * BigInt(100)) / oneNear;
      currentReserve = `${whole}.${fraction.toString().padStart(2, '0')} NEAR`;
    } catch {
      currentReserve = 'Unavailable';
    }
  } else if (deal.isDemoPilot) {
    currentReserve = 'Projection only — no live contract balance';
  }
  const pdfBase = modelKey === 'fidlot'
    ? 'Agri-Investor-Fidlot-v5.9-6040'
    : modelKey === 'hissar'
      ? 'Agri-Investor-VariantB-v2.1-6040'
      : null;
  const documents = pdfBase ? `
    <div class="flex flex-wrap gap-2 mt-4">
      <a class="protection-cta" href="#/protection/${escapeHtml(modelKey)}">✦ Full cycle protection table →</a>
      <a class="text-sm font-semibold text-green-300 hover:text-green-200" href="assets/financial-models/en/${pdfBase}-EN.pdf" target="_blank" rel="noopener noreferrer">Detailed model · EN ↗</a>
      <a class="text-sm font-semibold text-green-300 hover:text-green-200" href="assets/financial-models/ru/${pdfBase}-RU.pdf" target="_blank" rel="noopener noreferrer">Подробная модель · RU ↗</a>
    </div>
  ` : '';

  return `
    <section id="investor-protection-panel" data-investor-protection-panel class="investor-protection-panel mb-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span class="text-xs font-semibold text-blue-300 uppercase tracking-wide">Investment Protection</span>
          <h2 class="text-xl font-semibold text-slate-50 mt-1">Future Protection Concept · ${escapeHtml(modelTitle)}</h2>
          <p class="text-sm text-slate-300 mt-2 max-w-3xl">
            This exploratory concept is not active in Pilot 1.0. If approved in a future phase,
            a model-specific portion of the Farmer share could support defined loss-mitigation procedures.
          </p>
        </div>
        <span class="protection-panel-rate">${reserveRate == null ? 'Rate unavailable' : `${escapeHtml(reserveRate)}% reserve rate`}</span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        <div class="protection-panel-metric"><span>Alpha infrastructure reserve reference</span><strong>${escapeHtml(currentReserve)}</strong></div>
        <div class="protection-panel-metric"><span>Modeled contributions</span><strong>${escapeHtml(modeledContributions)}</strong></div>
        <div class="protection-panel-metric"><span>Minimum until completion</span><strong>${modelKey ? '$10,000' : 'Agreement-specific'}</strong></div>
        <div class="protection-panel-metric"><span>Release status</span><strong>${deal.isDemoPilot ? 'Modeled no-loss schedule' : 'Requires verified cycle and checks'}</strong></div>
      </div>
      <p class="text-xs text-amber-100 bg-amber-950 border border-amber-800 rounded-lg px-3 py-2 mt-4">
        Not insurance or a guarantee. Release may be reduced or suspended by a Confirmed Loss, overdue mandatory report,
        default, or dispute. Legal ownership while funds are locked depends on the governing agreements.
      </p>
      ${modelKey === 'hissar' ? '<p class="text-xs text-slate-400 mt-3">$2,500 in cycles 3–6 is modeled as partial capital return before the 60/40 split, without a Performance Fee.</p>' : ''}
      ${documents}
    </section>
  `;
}

function bindInvestorDetailSectionLink(buttonId, sectionId) {
  document.getElementById(buttonId)?.addEventListener('click', () => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function formatNearDisplay(value) {
  return value == null || value === '' ? 'Unavailable' : `${escapeHtml(value)} NEAR`;
}

function formatOptionalNearDisplay(value) {
  return value == null || value === '' ? 'Unavailable' : formatNearDisplay(value);
}

function formatOptionalYoctoDisplay(value) {
  if (value == null || value === '') return 'Unavailable';
  try {
    return `${yoctoToNear(value)} · ${formatYoctoRaw(value)}`;
  } catch {
    return 'Unavailable';
  }
}

function formatOptionalYoctoNear(value) {
  if (value == null || value === '') return 'Unavailable';
  try { return yoctoToNear(value); } catch { return 'Unavailable'; }
}

function renderInvestorResourceUnavailable(label, message) {
  return `
    <div class="bg-amber-950 border border-amber-800 rounded-lg px-4 py-3 mt-3 text-sm text-amber-100" data-investor-resource-error="${escapeHtml(label)}">
      <span class="font-semibold">${escapeHtml(label)} unavailable.</span>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

function returnStatusLabel(status) {
  const labels = {
    no_returns: 'No returns',
    partial: 'Partial return',
    completed: 'Completed',
    unknown: 'Unknown',
  };
  return labels[status] || 'Unknown';
}

function numericReturnAmount(value) {
  const normalized = String(value ?? '0').replace(/[^0-9.-]/g, '');
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function deriveReturnStatus(deal) {
  const authoritativeStatus = deal.returnStatus ?? deal.return_status;
  if (authoritativeStatus) return authoritativeStatus;
  if (!deal.isDemoPilot) return 'unknown';
  const rawReturned = deal.display_returned_amount ?? deal.returned_amount;
  const rawExpected = deal.display_expected_return ?? deal.expected_return;
  if (rawReturned == null || rawExpected == null) return 'unknown';
  const returned = numericReturnAmount(rawReturned);
  const expected = numericReturnAmount(rawExpected);
  if (returned <= 0) return 'no_returns';
  if (returned < expected) return 'partial';
  return 'completed';
}

function recordedReturnStatusLabel(status) {
  const labels = {
    no_returns: 'No recorded returns',
    partial: 'Partially recorded',
    completed: 'Projected payout recorded',
    unknown: 'Unknown',
  };
  return labels[status] || 'Unknown';
}

function returnDisclaimer() {
  return '<p class="text-xs text-amber-200 bg-amber-950 border border-amber-800 rounded-lg px-3 py-2 mt-3">Projected returns are estimates and are not guaranteed.</p>';
}

function percentLabel(value) {
  if (value == null || !Number.isFinite(Number(value))) return 'Unavailable';
  return `${Number(value).toFixed(1)}%`;
}

function dealReturnMetrics(deal) {
  const isDemoPilot = Boolean(deal.isDemoPilot);
  const rawInvested = deal.display_amount ?? deal.investmentAmount ?? deal.invested_amount ?? deal.amount;
  const rawExpected = deal.display_expected_return ?? deal.projectedTotalPayout ?? deal.expected_return;
  const rawReturned = deal.display_returned_amount ?? deal.recordedReturns ?? deal.returned_amount;
  const invested = numericReturnAmount(rawInvested);
  const expected = numericReturnAmount(rawExpected);
  const returned = numericReturnAmount(rawReturned);
  const rawProjectedRoi = deal.projectedRoi ?? deal.projected_roi_pct ?? deal.roi_percent;
  const projectedRoi = rawProjectedRoi != null && Number.isFinite(Number(rawProjectedRoi))
    ? Number(rawProjectedRoi)
    : null;
  const completionPercent = rawExpected != null && rawReturned != null
    ? (expected > 0 ? Math.min(100, (returned / expected) * 100) : 0)
    : null;
  const demoProfitReturned = isDemoPilot && rawInvested != null && rawReturned != null
    ? Math.max(returned - invested, 0)
    : null;
  const actualRoi = demoProfitReturned != null && invested > 0 ? (demoProfitReturned / invested) * 100 : null;
  const remainingRoi = isDemoPilot && projectedRoi != null && actualRoi != null
    ? Math.max(0, projectedRoi - actualRoi)
    : null;
  return {
    invested,
    expected,
    returned,
    projectedRoi,
    completionPercent,
    actualRoi,
    remainingRoi,
  };
}

function renderInvestorReturnsManagement(deal, returns = []) {
  const isDemoPilot = Boolean(deal.isDemoPilot);
  return `
    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Investment Summary</h3>
      <div id="investor-investment-summary">${renderInvestmentSummary(deal)}</div>
    </div>
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-slate-800 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Returns Summary</h3>
        <div id="investor-returns-summary">${renderReturnsSummary(deal)}</div>
      </div>
      <div class="bg-slate-800 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">${isDemoPilot ? 'ROI Progress' : 'Recorded Return Progress'}</h3>
        <div id="investor-roi-progress">${renderRoiProgressCard(deal)}</div>
      </div>
    </div>
    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">${isDemoPilot ? 'Actual vs Projected ROI' : 'Financial Authority Status'}</h3>
      <div id="investor-actual-vs-projected-roi">${renderActualVsProjectedRoi(deal)}</div>
    </div>
  `;
}

function renderInvestmentSummary(deal) {
  const isDemoPilot = Boolean(deal.isDemoPilot);
  const status = deal.status?.status || deal.status;
  const roiLabel = isDemoPilot && status === 'Completed' ? 'ROI' : 'Projected ROI';
  const projectedRoi = deal.projectedRoi ?? deal.projected_roi_pct ?? deal.roi_percent;
  const rows = [
    ['Invested', deal.display_amount || formatOptionalNearDisplay(deal.investmentAmount ?? deal.invested_amount ?? deal.amount)],
    ...(!isDemoPilot ? [['Projected Profit', formatOptionalNearDisplay(deal.projectedProfit)]] : []),
    ['Projected Total Payout', deal.display_expected_return || formatOptionalNearDisplay(deal.projectedTotalPayout ?? deal.expected_return)],
    [isDemoPilot ? 'Total Cash Returned' : 'Recorded Off-chain Returns', deal.display_returned_amount || formatOptionalNearDisplay(deal.recordedReturns ?? deal.returned_amount)],
    [isDemoPilot ? 'Outstanding Payout' : 'Projected Outstanding', deal.display_outstanding_amount || formatOptionalNearDisplay(deal.projectedOutstanding ?? deal.outstanding_amount)],
    [isDemoPilot ? 'Return Status' : 'Recorded Return Status', escapeHtml(isDemoPilot ? returnStatusLabel(deriveReturnStatus(deal)) : recordedReturnStatusLabel(deriveReturnStatus(deal)))],
    [roiLabel, projectedRoi != null ? `${escapeHtml(projectedRoi)}%` : 'Unavailable'],
  ];
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
      ${rows.map(([label, value]) => `
        <div class="metric-box">
          <span class="metric-label">${label}</span>
          <span class="metric-value">${value}</span>
        </div>
      `).join('')}
    </div>
    ${returnDisclaimer()}
  `;
}

function renderReturnsSummary(deal) {
  const isDemoPilot = Boolean(deal.isDemoPilot);
  const rows = [
    ['Invested', deal.display_amount || formatOptionalNearDisplay(deal.investmentAmount ?? deal.invested_amount ?? deal.amount)],
    ['Projected Total Payout', deal.display_expected_return || formatOptionalNearDisplay(deal.projectedTotalPayout ?? deal.expected_return)],
    [isDemoPilot ? 'Total Cash Returned' : 'Recorded Off-chain Returns', deal.display_returned_amount || formatOptionalNearDisplay(deal.recordedReturns ?? deal.returned_amount)],
    [isDemoPilot ? 'Outstanding Payout' : 'Projected Outstanding', deal.display_outstanding_amount || formatOptionalNearDisplay(deal.projectedOutstanding ?? deal.outstanding_amount)],
    [isDemoPilot ? 'Return Status' : 'Recorded Return Status', escapeHtml(isDemoPilot ? returnStatusLabel(deriveReturnStatus(deal)) : recordedReturnStatusLabel(deriveReturnStatus(deal)))],
  ];
  return `
    <div class="grid sm:grid-cols-2 gap-3">
      ${rows.map(([label, value]) => `
        <div class="metric-box">
          <span class="metric-label">${label}</span>
          <span class="metric-value">${value}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRoiProgressCard(deal) {
  const isDemoPilot = Boolean(deal.isDemoPilot);
  const metrics = dealReturnMetrics(deal);
  const returned = deal.display_returned_amount || formatOptionalNearDisplay(deal.recordedReturns ?? deal.returned_amount);
  const expected = deal.display_expected_return || formatOptionalNearDisplay(deal.projectedTotalPayout ?? deal.expected_return);
  const completion = percentLabel(metrics.completionPercent);
  return `
    <div class="roi-progress-card">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span class="metric-label">${isDemoPilot ? 'Total Cash Returned' : 'Recorded Off-chain Returns'} / Projected Total Payout</span>
          <p class="metric-value text-green-300">${isDemoPilot ? 'Returned' : 'Recorded'}: ${escapeHtml(returned)} / ${escapeHtml(expected)}</p>
        </div>
        <div class="text-right">
          <span class="metric-label">Completion Percent</span>
          <p class="metric-value">${completion}</p>
        </div>
      </div>
      ${metrics.completionPercent == null
        ? renderInvestorResourceUnavailable(isDemoPilot ? 'ROI progress' : 'Recorded return progress', 'Return data is unavailable')
        : `<div class="roi-progress-track" aria-label="Return completion progress">
            <div class="roi-progress-fill" style="width: ${Math.max(0, Math.min(100, metrics.completionPercent)).toFixed(1)}%"></div>
          </div>`}
      <p class="text-sm text-slate-400">Completion: ${completion}</p>
    </div>
  `;
}

function renderActualVsProjectedRoi(deal) {
  const metrics = dealReturnMetrics(deal);
  const rows = deal.isDemoPilot
    ? [
        ['Projected ROI', percentLabel(metrics.projectedRoi)],
        ['Realized ROI', percentLabel(metrics.actualRoi)],
        ['Remaining ROI', percentLabel(metrics.remainingRoi)],
      ]
    : [
        ['Projected ROI', percentLabel(metrics.projectedRoi)],
        ['Realized Profit', 'Not yet authoritative'],
        ['Realized ROI', 'Not yet authoritative'],
      ];
  return `
    <div class="grid sm:grid-cols-3 gap-3">
      ${rows.map(([label, value]) => `
        <div class="metric-box">
          <span class="metric-label">${label}</span>
          <span class="metric-value">${escapeHtml(value)}</span>
        </div>
      `).join('')}
    </div>
    ${returnDisclaimer()}
  `;
}

function investorReturnTypeLabel(entry) {
  if (entry.legacyUntyped || entry.entry_type == null) return 'Legacy / Untyped';
  return {
    principal: 'Principal',
    profit: 'Profit',
    fee: 'Fee',
    correction: 'Correction',
  }[entry.entry_type] || 'Unknown type';
}

function investorReturnPaymentStatusLabel(paymentStatus) {
  if (paymentStatus == null || paymentStatus === '') return 'Recorded off-chain';
  return {
    recorded: 'Recorded',
    approved: 'Approved',
    paid: 'Paid',
    reconciled: 'Reconciled',
  }[paymentStatus] || 'Unknown status';
}

function renderInvestorReturnEvidence(transactionHash) {
  if (!transactionHash) return '<span class="text-slate-500">No evidence</span>';
  const transactionUrlHash = encodeURIComponent(transactionHash);
  return `<a href="https://testnet.nearblocks.io/txns/${transactionUrlHash}" target="_blank" rel="noopener noreferrer" title="Reference only; not proof of payment or reconciliation" class="text-blue-400 hover:underline font-mono">${escapeHtml(formatAddress(transactionHash))}</a>`;
}

function renderInvestorTypedReturnLedger(returns) {
  if (!returns.length) return '<p class="text-slate-500 text-sm">No returns recorded yet.</p>';
  return `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-slate-400">
          <tr class="border-b border-slate-700">
            <th class="text-left py-2 pr-3">Date</th>
            <th class="text-left py-2 pr-3">Type</th>
            <th class="text-left py-2 pr-3">Amount</th>
            <th class="text-left py-2 pr-3">Status</th>
            <th class="text-left py-2 pr-3">Evidence / Tx Hash</th>
            <th class="text-left py-2 pr-3">Note</th>
          </tr>
        </thead>
        <tbody>
          ${returns.map((entry) => `
            <tr class="border-b border-slate-700 last:border-0">
              <td class="py-2 pr-3 text-slate-300">${entry.created_at ? escapeHtml(new Date(entry.created_at).toLocaleDateString('en-US')) : 'Unavailable'}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(investorReturnTypeLabel(entry))}</td>
              <td class="py-2 pr-3 text-green-300 font-mono">${formatOptionalNearDisplay(entry.amount_near)}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(investorReturnPaymentStatusLabel(entry.payment_status))}</td>
              <td class="py-2 pr-3 text-slate-300">${renderInvestorReturnEvidence(entry.transaction_hash)}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(entry.note || 'No note')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderRepaymentHistory(returns) {
  if (!returns.length) return '<p class="text-slate-500 text-sm">No returns recorded yet.</p>';
  return renderInvestorTypedReturnLedger(returns);
}

function renderInvestorReports(reports) {
  if (!reports.length) return '<p class="text-slate-500 text-sm">No farmer reports submitted yet</p>';
  return reports.map((report) => `
    <div class="farmer-report-summary">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span class="text-xs text-slate-500">Cycle #${escapeHtml(report.cycle_id)}</span>
          <h4 class="font-semibold text-slate-100">${escapeHtml(report.title)}</h4>
        </div>
        <span class="text-xs bg-green-900 text-green-200 px-2 py-1 rounded">Submitted</span>
      </div>
      <p class="text-sm text-slate-400 mt-2">${escapeHtml(report.description)}</p>
      <div class="grid sm:grid-cols-3 gap-3 mt-3 text-xs">
        <div>
          <span class="block text-slate-500">Report Source</span>
          <span class="text-slate-200">Farmer report managed by AgriPartners</span>
        </div>
        <div>
          <span class="block text-slate-500">Amount used</span>
          <span class="text-slate-200">${escapeHtml(report.amount_used || 'Not provided')}</span>
        </div>
        <div>
          <span class="block text-slate-500">Submitted</span>
          <span class="text-slate-200">${report.submitted_at ? escapeHtml(new Date(report.submitted_at).toLocaleDateString('en-US')) : 'Submitted'}</span>
        </div>
      </div>
      ${report.evidence_url ? `<a href="${escapeHtml(report.evidence_url)}" target="_blank" rel="noopener noreferrer" class="inline-block text-blue-400 hover:underline text-xs mt-2">Evidence link</a>` : ''}
    </div>
  `).join('');
}

function normalizeCyclesResponse(data) {
  return Array.isArray(data) ? data : (data?.cycles || []);
}

function normalizeCycleCard(cycle) {
  const report = cycle.report || {};
  const reportSubmitted = cycle.report_submitted ?? (cycle.reportStatus === 'submitted' && Boolean(cycle.report));
  const fundingSent = cycle.funding_sent ?? ['funding_sent', 'reported'].includes(cycle.status);
  const fundingConfirmed = cycle.funding_confirmed ?? Boolean(cycle.fundingReceived);
  const reportCreatedAt = cycle.report_created_at || report.submittedAt || report.created_at || '';
  return {
    cycleNumber: cycle.cycle_number ?? cycle.id,
    status: cycle.status || (fundingSent ? (reportSubmitted ? 'reported' : 'funding_sent') : 'pending'),
    fundingSent,
    fundingConfirmed,
    reportSubmitted,
    report: reportSubmitted ? {
      ...report,
      title: cycle.report_title || report.title || 'Farmer report',
      description: cycle.report_body || report.description || '',
      submittedAt: reportCreatedAt,
    } : null,
  };
}

function renderCycleStatusCards(cycles) {
  if (!cycles.length) return '<p class="text-slate-500 text-sm">No cycle updates yet</p>';
  return cycles.map((cycle) => {
    const card = normalizeCycleCard(cycle);
    return `
      <div class="farmer-cycle-row">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="font-semibold text-slate-100">Cycle #${escapeHtml(card.cycleNumber)}</span>
            <span class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">${escapeHtml(card.status)}</span>
          </div>
          <p class="text-sm text-slate-400">Funding sent: <span class="text-slate-200">${card.fundingSent ? 'Yes' : 'No'}</span></p>
          <p class="text-sm text-slate-400">Funding confirmed: <span class="text-slate-200">${card.fundingConfirmed ? 'Yes' : 'No'}</span></p>
          <p class="text-sm text-slate-400">Report status: <span class="text-slate-200">${card.reportSubmitted ? 'Submitted' : 'Waiting for farmer report'}</span></p>
          ${card.reportSubmitted ? renderFarmerReportSummary(card.report) : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderInvestorDealParams(deal, status, investorBalance, resourceErrors = {}) {
  const investmentAmount = formatOptionalYoctoDisplay(deal.investment_amount);
  const availableBalance = resourceErrors.balances
    ? 'Unavailable'
    : formatOptionalYoctoDisplay(investorBalance);
  const rows = [
    ['NEAR Infrastructure Reference', deal.contract_address || 'Unavailable'],
    ['Project Operator',    'AgriPartners'],
    ['Farmer Assignment',   deal.farmer || 'Unavailable'],
    ['Investor Account',    deal.investor || 'Unavailable'],
    ['Investment Amount',  investmentAmount],
    ['Project Status',     status?.status || 'Unknown'],
    ['Production Cycle',   status?.current_cycle ?? '—'],
    ['Investor Testnet Available', availableBalance],
  ];
  return `${rows.map(([k, v]) => `
    <div class="flex justify-between text-sm gap-3">
      <span class="text-slate-400 shrink-0">${k}</span>
      <span ${k === 'Investor Testnet Available' ? 'id="investor-available-balance"' : ''} class="text-slate-100 font-mono text-right break-all">${escapeHtml(v)}</span>
    </div>
  `).join('')}${resourceErrors.balances ? renderInvestorResourceUnavailable('NEAR Testnet balances', resourceErrors.balances) : ''}`;
}

function showInvestorActionResult(type, message, txHash) {
  const el = document.getElementById('investor-action-result');
  if (!el) return;
  const isSuccess = type === 'success';
  el.className = `${isSuccess ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'} mt-4 rounded-lg px-4 py-3 text-sm`;
  el.innerHTML = `
    <div class="font-medium">${escapeHtml(message)}</div>
    ${txHash ? `<div class="mt-1 text-xs">Tx: <a href="https://testnet.nearblocks.io/txns/${escapeHtml(txHash)}" target="_blank" class="font-mono underline">${escapeHtml(txHash)}</a></div>` : ''}
  `;
  el.classList.remove('hidden');
}

async function withdrawInvestorFromPortal(deal) {
  if (!confirm('Run the Alpha/Testnet Settlement infrastructure action? This is not production Settlement.')) return;

  const btn = document.getElementById('btn-investor-withdraw');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }
  showInvestorActionResult('success', 'Testnet Settlement action submitted...');

  try {
    const res = await fetch(`${API_BASE}/api/investor/deals/${deal.id}/withdraw`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      clearAuth();
      throw new Error('Investor session expired while submitting the Testnet Settlement action');
    }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    showInvestorActionResult('success', 'Testnet Settlement action completed successfully', data.tx_hash);
    await refreshInvestorDeal(deal.id);
  } catch (err) {
    showInvestorActionResult('error', `Testnet Settlement action failed: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Run Testnet Settlement Action'; }
  }
}

async function refreshInvestorDeal(id) {
  const btn = document.getElementById('btn-investor-refresh');
  if (btn) { btn.disabled = true; btn.textContent = 'Refreshing...'; }

  try {
    const bundle = await fetchInvestorDealBundle(id);
    const { deal, status, balances, events, reports, cycles, returns, resourceErrors = {} } = bundle;
    const titleEl = document.getElementById('investor-deal-title');
    const badgeEl = document.getElementById('investor-status-badge');
    const cycleEl = document.getElementById('investor-cycle-text');
    const workspaceHeaderEl = document.getElementById('project-workspace-header');
    const profileEl = document.getElementById('investor-project-profile');
    const fundingEl = document.getElementById('investor-funding-progress');
    const protectionEl = document.getElementById('investor-protection-panel');
    const technicalEl = document.getElementById('investor-technical-data');
    const eventsEl = document.getElementById('investor-events-list');
    const reportsEl = document.getElementById('investor-reports-list');
    const cyclesEl = document.getElementById('investor-cycles-list');
    const summaryEl = document.getElementById('investor-investment-summary');
    const returnsSummaryEl = document.getElementById('investor-returns-summary');
    const roiProgressEl = document.getElementById('investor-roi-progress');
    const actualRoiEl = document.getElementById('investor-actual-vs-projected-roi');
    const returnsEl = document.getElementById('investor-returns-list');
    if (titleEl) titleEl.textContent = investorProjectProfile(deal, status).title;
    if (badgeEl) badgeEl.innerHTML = statusBadge(status?.status);
    if (cycleEl) cycleEl.textContent = `Cycle ${status?.current_cycle ?? '—'}`;
    if (workspaceHeaderEl) {
      workspaceHeaderEl.outerHTML = renderProjectWorkspaceHeader({
        deal, status, cycles, reports, returns, events, role: 'investor',
      });
    }
    if (profileEl) profileEl.outerHTML = renderProjectProfile(deal, status, resourceErrors.status);
    if (fundingEl) fundingEl.outerHTML = renderLiveFundingProgressPanel(deal);
    if (protectionEl) protectionEl.outerHTML = renderInvestorProtectionPanel(deal, balances);
    if (technicalEl) technicalEl.innerHTML = renderInvestorDealParams(deal, status, balances?.investor ?? null, resourceErrors);
    if (eventsEl) eventsEl.innerHTML = resourceErrors.events
      ? renderInvestorResourceUnavailable('Event history', resourceErrors.events)
      : renderEvents(events);
    if (reportsEl) reportsEl.innerHTML = resourceErrors.reports
      ? renderInvestorResourceUnavailable('Farmer reports', resourceErrors.reports)
      : renderInvestorReports(reports);
    if (cyclesEl) cyclesEl.innerHTML = resourceErrors.cycles
      ? renderInvestorResourceUnavailable('Cycle status', resourceErrors.cycles)
      : renderCycleStatusCards(cycles);
    if (summaryEl) summaryEl.innerHTML = renderInvestmentSummary(deal);
    if (returnsSummaryEl) returnsSummaryEl.innerHTML = renderReturnsSummary(deal);
    if (roiProgressEl) roiProgressEl.innerHTML = renderRoiProgressCard(deal);
    if (actualRoiEl) actualRoiEl.innerHTML = renderActualVsProjectedRoi(deal);
    if (returnsEl) returnsEl.innerHTML = resourceErrors.returns
      ? renderInvestorResourceUnavailable('Returns ledger', resourceErrors.returns)
      : renderInvestorTypedReturnLedger(returns);

    const investorBalanceEl = document.getElementById('investor-available-balance');
    if (investorBalanceEl) {
      const investorBalance = balances?.investor;
      investorBalanceEl.textContent = resourceErrors.balances || investorBalance == null
        ? 'Unavailable'
        : `${yoctoToNear(investorBalance)} · ${formatYoctoRaw(investorBalance)}`;
    }
  } catch (err) {
    showInvestorActionResult('error', `Refresh failed: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }
  }
}

// --- Deal detail ---

async function fetchDealJson(url, headers) {
  const response = await fetch(url, { headers });
  let data;
  try {
    data = await readJsonResponse(response);
  } catch (err) {
    err.status = response.status;
    throw err;
  }
  if (!response.ok) {
    throw Object.assign(new Error(data.error || `HTTP ${response.status}`), { status: response.status });
  }
  return data;
}

function optionalResourceResult(result, label, select, validate = () => true) {
  if (result.status === 'rejected') {
    const status = result.reason?.status;
    const authMessage = status === 401
      ? 'Authentication required (HTTP 401).'
      : status === 403 ? 'Admin access denied (HTTP 403).' : null;
    return { data: null, error: authMessage || result.reason?.message || `${label} request failed` };
  }
  try {
    const data = select(result.value);
    if (!validate(data)) throw new Error(`Malformed ${label.toLowerCase()} payload`);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

function isObjectList(value) {
  return Array.isArray(value) && value.every(item => item && typeof item === 'object' && !Array.isArray(item));
}

function isBalancePayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return ['farmer', 'investor', 'platform', 'escrow'].every(key => {
    if (value[key] == null) return true;
    try { BigInt(value[key]); return true; } catch { return false; }
  });
}

function hasCompleteBalanceData(value) {
  return isBalancePayload(value) && ['farmer', 'investor', 'platform', 'escrow'].every(key => value[key] != null);
}

async function fetchDealBundle(id) {
  const headers = authHeaders();
  const base = `${API_BASE}/api/deals/${id}`;
  const requests = [
    fetchDealJson(base, headers),
    fetchDealJson(`${base}/status`, headers),
    fetchDealJson(`${base}/balances`, headers),
    fetchDealJson(`${base}/events`, headers),
  ];
  if (isAdmin()) {
    requests.push(
      fetchDealJson(`${API_BASE}/api/admin/deals/${id}/cycles`, headers),
      fetchDealJson(`${API_BASE}/api/admin/deals/${id}/return-summary`, headers),
      fetchDealJson(`${API_BASE}/api/admin/deals/${id}/returns`, headers),
    );
  }

  const settled = await Promise.allSettled(requests);
  if (settled[0].status === 'rejected') throw settled[0].reason;
  const deal = settled[0].value;
  if (!deal || typeof deal !== 'object' || Array.isArray(deal)) throw new Error('Malformed main deal payload');

  const status = optionalResourceResult(settled[1], 'Status', value => value, value => value && typeof value === 'object');
  const balances = optionalResourceResult(settled[2], 'Balances', value => value, isBalancePayload);
  const events = optionalResourceResult(settled[3], 'Events', value => value, isObjectList);
  const cycles = isAdmin()
    ? optionalResourceResult(settled[4], 'Cycles', value => value.cycles, isObjectList)
    : { data: [], error: null };
  const returnSummary = isAdmin()
    ? optionalResourceResult(settled[5], 'Return summary', value => value.summary, value => value == null || typeof value === 'object')
    : { data: null, error: null };
  const returns = isAdmin()
    ? optionalResourceResult(settled[6], 'Returns', value => value.returns, isObjectList)
    : { data: [], error: null };

  return {
    deal,
    status: status.data,
    balances: balances.data,
    events: events.data,
    cycles: cycles.data,
    returnSummary: returnSummary.data,
    adminReturns: returns.data,
    resourceErrors: {
      status: status.error,
      balances: balances.error,
      events: events.error,
      cycles: cycles.error,
      returnSummary: returnSummary.error,
      returns: returns.error,
    },
  };
}

function renderAdminResourceUnavailable(label, message) {
  return `<div class="bg-amber-950 border border-amber-800 rounded-lg px-4 py-3 text-sm text-amber-100" data-admin-resource-error="${escapeHtml(label)}"><span class="font-semibold">${escapeHtml(label)} unavailable.</span> ${escapeHtml(message)}</div>`;
}

async function showDeal(id) {
  showView('view-detail');
  const el = document.getElementById('view-detail');
  el.innerHTML = `
    ${renderNav()}
    <a href="#deals" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">← Back</a>
    <div class="spinner"></div>
  `;

  try {
    const bundle = await fetchDealBundle(id);
    renderDealDetail(el, bundle);
  } catch (err) {
    el.querySelector('.spinner')?.remove();
    const message = err.status === 404 ? 'Project not found'
      : err.status === 401 ? 'Authentication required to load this Project.'
      : err.status === 403 ? 'Access denied while loading this Project.'
      : `Project unavailable: ${err.message || 'Network request failed'}`;
    el.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4" data-main-deal-error>${escapeHtml(message)}</div>`;
  }
}

function renderDealDetail(el, bundle) {
  const { deal, status, balances, events, cycles, returnSummary, adminReturns, resourceErrors = {} } = bundle;
  const dealTitle = deal.title || deal.deal_type || 'Unknown';
  const cycleText = resourceErrors.status ? '· Cycle Unavailable' : `· Cycle ${status?.current_cycle ?? 'Unknown'}`;
  el.innerHTML = `
    ${renderNav()}
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="#deals" class="text-slate-400 hover:text-white text-sm">← Back</a>
      <span class="text-slate-600">|</span>
      <span class="font-semibold">${escapeHtml(dealTitle)}</span>
      <span id="status-badge">${statusBadge(status?.status)}</span>
      <span id="cycle-text" class="text-slate-400 text-sm">${cycleText}</span>
      <button id="btn-refresh" class="ml-auto bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded transition">Refresh</button>
    </div>
    ${renderProjectWorkspaceHeader({
      deal,
      status,
      cycles,
      returns: adminReturns,
      events,
      role: 'operator',
    })}
    ${resourceErrors.status ? renderAdminResourceUnavailable('Status', resourceErrors.status) : ''}
    ${deal.description ? `<p class="text-slate-400 mb-6">${escapeHtml(deal.description)}</p>` : ''}
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-slate-800 rounded-xl p-5 space-y-2">
        ${renderParams(deal)}
      </div>
      <div class="bg-slate-800 rounded-xl p-5 flex flex-col items-center justify-center" id="chart-col">
        ${resourceErrors.balances ? renderAdminResourceUnavailable('Balances', resourceErrors.balances) : hasCompleteBalanceData(balances)
          ? `<canvas id="balances-chart" width="240" height="240"></canvas>
             <div id="balances-summary" class="w-full mt-4 space-y-2">
               ${renderBalancesSummary(balances)}
             </div>`
          : balances ? `<div id="balances-summary" class="w-full space-y-2">${renderBalancesSummary(balances)}</div>` : '<p class="text-slate-500 text-sm">Balances unavailable</p>'}
      </div>
    </div>
    ${isAdmin() ? renderAdminActions(deal, status?.status) : ''}
    ${isAdmin() ? renderAdminReturnSummaryPanel(returnSummary, resourceErrors.returnSummary) : ''}
    ${isAdmin() ? renderAdminReturnsLedger(adminReturns, resourceErrors.returns) : ''}
    ${isAdmin() ? `
      <div class="bg-slate-800 rounded-xl p-5 mb-6">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Production Cycles</h3>
        <div id="admin-cycles-list">${resourceErrors.cycles ? renderAdminResourceUnavailable('Cycles', resourceErrors.cycles) : renderCycleStatusCards(cycles)}</div>
      </div>
    ` : ''}
    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Event History</h3>
      <div id="events-list">${resourceErrors.events ? renderAdminResourceUnavailable('Events', resourceErrors.events) : renderEvents(events)}</div>
    </div>
  `;

  if (hasCompleteBalanceData(balances)) renderBalancesChart(balances);

  document.getElementById('btn-refresh').addEventListener('click', () => refreshDeal(deal.id));
  if (isAdmin()) bindAdminActions(deal);
}

function renderAdminReturnSummaryPanel(summary, error = null) {
  return `
    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Return Summary</h3>
      <div id="admin-return-summary">
        ${error ? renderAdminResourceUnavailable('Return summary', error) : renderAdminReturnSummary(summary)}
      </div>
      ${returnDisclaimer()}
    </div>
  `;
}

function renderAdminReturnSummary(summary) {
  if (!summary) return '<p class="text-slate-500 text-sm">No return summary data yet</p>';
  const projectedRoi = summary.projected_roi_pct ?? summary.roi_percent;
  const rows = [
    ['Invested', formatOptionalNearDisplay(summary.invested_amount ?? summary.amount)],
    ['Projected ROI', projectedRoi == null ? 'Unknown' : `${escapeHtml(projectedRoi)}%`],
    ['Projected Return', formatOptionalNearDisplay(summary.expected_return)],
    ['Returned Amount', formatOptionalNearDisplay(summary.returned_amount)],
    ['Outstanding Return', formatOptionalNearDisplay(summary.outstanding_amount)],
    ['Return Status', summary.return_status == null ? 'Unknown' : escapeHtml(returnStatusLabel(summary.return_status))],
  ];
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      ${rows.map(([label, value]) => `
        <div class="metric-box">
          <span class="metric-label">${label}</span>
          <span class="metric-value">${value}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdminReturnsLedger(returns, error = null) {
  return `
    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Returns Ledger</h3>
      <div id="admin-returns-ledger">
        ${error ? renderAdminResourceUnavailable('Returns', error) : renderReturnsLedgerRows(returns)}
      </div>
    </div>
  `;
}

function adminReturnTypeLabel(entryType) {
  return {
    principal: 'Principal',
    profit: 'Profit',
    fee: 'Fee',
    correction: 'Correction',
  }[entryType] || 'Legacy / Untyped';
}

function adminReturnStatusLabel(paymentStatus) {
  return {
    recorded: 'Recorded off-chain',
    approved: 'Approved',
    paid: 'Paid',
    reconciled: 'Reconciled',
  }[paymentStatus] || 'Recorded off-chain';
}

function renderAdminReturnEvidence(transactionHash) {
  if (!transactionHash) return '<span class="text-slate-500">None</span>';
  const transactionUrlHash = encodeURIComponent(transactionHash);
  return `<a href="https://testnet.nearblocks.io/txns/${transactionUrlHash}" target="_blank" rel="noopener noreferrer" title="Reference only; not proof of payment or reconciliation" class="text-blue-400 hover:underline font-mono">${escapeHtml(formatAddress(transactionHash))}</a>`;
}

function adminReturnTransitionAction(paymentStatus) {
  return {
    recorded: { action: 'approve', label: 'Approve', endpoint: 'approve' },
    approved: { action: 'mark-paid', label: 'Mark Paid', endpoint: 'mark-paid' },
    paid: { action: 'reconcile', label: 'Reconcile', endpoint: 'reconcile' },
  }[paymentStatus] || null;
}

function renderAdminReturnTransitionControls(entry) {
  const transition = adminReturnTransitionAction(entry.payment_status);
  if (!transition) return '<span class="text-slate-500 text-xs">No action</span>';
  const evidenceInput = transition.action === 'approve' ? '' : `
    <input type="text" data-return-evidence="${escapeHtml(entry.id)}" placeholder="Evidence / Reference"
      class="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-green-500" />
  `;
  return `
    <div class="min-w-[180px] space-y-2">
      <input type="text" data-return-note="${escapeHtml(entry.id)}" placeholder="Optional note"
        class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-green-500" />
      ${evidenceInput}
      <button type="button" class="admin-return-transition-btn admin-action-btn text-xs px-2 py-1"
        data-return-id="${escapeHtml(entry.id)}"
        data-return-action="${escapeHtml(transition.action)}"
        data-return-endpoint="${escapeHtml(transition.endpoint)}"
        data-return-label="${escapeHtml(transition.label)}">
        ${escapeHtml(transition.label)}
      </button>
    </div>
  `;
}

function renderAdminReturnStatusHistory(events = null) {
  if (!Array.isArray(events)) {
    return '<p class="text-slate-500 text-xs">Status History unavailable until loaded.</p>';
  }
  if (!events.length) return '<p class="text-slate-500 text-xs">Status History unavailable.</p>';
  return `
    <div class="space-y-1 text-xs">
      ${events.map(event => `
        <div class="border-b border-slate-700 last:border-0 py-1">
          <div class="text-slate-300">
            ${escapeHtml(adminReturnStatusLabel(event.from_status))} -> ${escapeHtml(adminReturnStatusLabel(event.to_status))}
          </div>
          <div class="text-slate-500">
            ${event.changed_by ? escapeHtml(event.changed_by) : 'Unknown actor'}
            ${event.changed_at ? ` &middot; ${escapeHtml(new Date(event.changed_at).toLocaleString('en-US'))}` : ''}
          </div>
          ${event.note ? `<div class="text-slate-400">${escapeHtml(event.note)}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderReturnsLedgerRows(returns) {
  if (!returns.length) return '<p class="text-slate-500 text-sm">No returns recorded yet</p>';
  return `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-slate-400">
          <tr class="border-b border-slate-700">
            <th class="text-left py-2 pr-3">Date</th>
            <th class="text-left py-2 pr-3">Amount</th>
            <th class="text-left py-2 pr-3">Type</th>
            <th class="text-left py-2 pr-3">Status</th>
            <th class="text-left py-2 pr-3">Recorded By</th>
            <th class="text-left py-2 pr-3">Evidence / Transaction Hash</th>
            <th class="text-left py-2 pr-3">Note</th>
            <th class="text-left py-2 pr-3">Actions</th>
            <th class="text-left py-2 pr-3">Status History</th>
          </tr>
        </thead>
        <tbody>
          ${returns.map((entry) => `
            <tr class="border-b border-slate-700 last:border-0">
              <td class="py-2 pr-3 text-slate-300">${entry.created_at ? escapeHtml(new Date(entry.created_at).toLocaleDateString('en-US')) : 'Unavailable'}</td>
              <td class="py-2 pr-3 text-green-300 font-mono">${formatOptionalNearDisplay(entry.amount_near)}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(adminReturnTypeLabel(entry.entry_type))}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(adminReturnStatusLabel(entry.payment_status))}</td>
              <td class="py-2 pr-3 text-slate-300 font-mono">${entry.recorded_by ? escapeHtml(entry.recorded_by) : 'Unavailable'}</td>
              <td class="py-2 pr-3 text-slate-300">${renderAdminReturnEvidence(entry.transaction_hash)}</td>
              <td class="py-2 pr-3 text-slate-300">${escapeHtml(entry.note || 'No note')}</td>
              <td class="py-2 pr-3 text-slate-300">${renderAdminReturnTransitionControls(entry)}</td>
              <td class="py-2 pr-3 text-slate-300 min-w-[220px]">
                <button type="button" class="admin-return-history-btn text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded px-2 py-1 mb-2"
                  data-return-id="${escapeHtml(entry.id)}">Status History</button>
                <div id="return-status-history-${escapeHtml(entry.id)}" data-return-status-history="${escapeHtml(entry.id)}">
                  ${renderAdminReturnStatusHistory()}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function findAdminReturnElement(attribute, returnId) {
  return [...document.querySelectorAll(`[${attribute}]`)]
    .find(el => el.getAttribute(attribute) === String(returnId)) || null;
}

function renderParams(deal) {
  const optionalPercent = value => value == null ? 'Unknown' : `${escapeHtml(value)}%`;
  const rows = [
    ['Investment Model',   deal.deal_type || 'Unknown'],
    ['Farmer Assignment',  deal.farmer ? formatAddress(deal.farmer) : 'Unknown'],
    ['Investor Assignment', deal.investor ? formatAddress(deal.investor) : 'Unknown'],
    ['Project Operator',   'AgriPartners'],
    ['Operator Account',   deal.admin ? formatAddress(deal.admin) : 'Unknown'],
    ['Split',              deal.farmer_split_pct == null && deal.investor_split_pct == null ? 'Unknown' : `${optionalPercent(deal.farmer_split_pct)} / ${optionalPercent(deal.investor_split_pct)}`],
    ['Escrow',             optionalPercent(deal.escrow_pct)],
    ['Performance Fee',    optionalPercent(deal.performance_fee_pct)],
    ['Production Cycle duration', deal.cycle_duration_days == null ? 'Unknown' : `${escapeHtml(deal.cycle_duration_days)} days`],
    ['Production Cycles',  deal.total_cycles ?? 'Unknown'],
    ['Investment',         formatOptionalYoctoDisplay(deal.investment_amount)],
    ['Capital return',     formatOptionalYoctoDisplay(deal.capital_return_near)],
  ];
  return rows.map(([k, v]) => `
    <div class="flex justify-between text-sm gap-2">
      <span class="text-slate-400 shrink-0">${k}</span>
      <span class="text-slate-100 font-mono text-right">${v}</span>
    </div>
  `).join('');
}

function renderBalancesSummary(balances) {
  const rows = [
    ['Farmer', balances.farmer],
    ['Investor', balances.investor],
    ['Platform', balances.platform],
    ['Escrow', balances.escrow],
  ];

  return rows.map(([label, raw]) => `
    <div class="balance-row">
      <span class="balance-label">${label}</span>
      <span class="balance-values">
        <span class="balance-near">${raw == null ? 'Unavailable' : yoctoToNear(raw)}</span>
        <span class="balance-raw">${raw == null ? 'Unavailable' : formatYoctoRaw(raw)}</span>
      </span>
    </div>
  `).join('');
}

function isAdminActionEnabled(action, status) {
  const normalizedStatus = status || 'Unknown';
  if (action === 'fund') return normalizedStatus === 'Initialized';
  if (action === 'start-cycle') return normalizedStatus === 'Funded';
  if (action === 'report-profit') return normalizedStatus === 'CycleActive';
  return true;
}

function isProductionDisabledAdminAction(action, deal) {
  if (!IS_PRODUCTION_BUILD) return false;
  if (action === 'fund' || action === 'withdraw-farmer' || action === 'withdraw-investor') return true;
  return action === 'withdraw-platform' && deal.platform !== deal.admin;
}

function renderAdminActionButton(action, label, status, deal, className = '') {
  const productionDisabled = isProductionDisabledAdminAction(action, deal);
  const enabled = !productionDisabled && isAdminActionEnabled(action, status);
  return `
    <button type="button" class="admin-action-btn ${className}" data-action="${action}" data-production-disabled="${productionDisabled}" ${enabled ? '' : 'disabled'} title="${productionDisabled ? 'Unavailable in production: this workflow requires a non-production signer endpoint.' : ''}">
      ${label}
    </button>
  `;
}

function renderAdminActions(deal, status) {
  return `
    <div id="admin-actions" data-status="${escapeHtml(status || 'Unknown')}" class="bg-slate-800 rounded-xl p-5 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide">Manage Project</h3>
        <span class="text-xs text-slate-500">Legacy NEAR actions remain Alpha/Testnet infrastructure only</span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        ${renderAdminActionButton('fund', 'Fund Project (Testnet)', status, deal, 'action-fund')}
        ${renderAdminActionButton('start-cycle', 'Start Production Cycle', status, deal)}
        ${renderAdminActionButton('report-profit', 'Record Cycle Result', status, deal)}
        ${renderAdminActionButton('withdraw-farmer', 'Farmer Demo Payout', status, deal)}
        ${renderAdminActionButton('withdraw-investor', 'Investor Testnet Settlement', status, deal)}
        ${renderAdminActionButton('withdraw-platform', 'Operator Testnet Transfer', status, deal)}
      </div>
      ${IS_PRODUCTION_BUILD ? '<p class="text-xs text-amber-300 mt-3">Legacy Testnet transfer controls are disabled in production because they are non-production workflows.</p>' : ''}
      <form id="admin-return-form" class="mt-5 border-t border-slate-700 pt-4 space-y-3">
        <h4 class="text-sm font-semibold text-slate-300">Record Return</h4>
        <p class="text-xs text-amber-200 bg-amber-950 border border-amber-800 rounded-lg px-3 py-2">
          Recording a return updates the Alpha ledger only. It is not production Settlement.
        </p>
        <div class="grid sm:grid-cols-[160px_160px_1fr_auto] gap-2">
          <input id="admin-return-amount" name="amount_near" type="text" inputmode="decimal" placeholder="Amount (NEAR)"
            class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-green-500" />
          <select id="admin-return-type" name="entry_type" aria-label="Return entry type"
            class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-green-500">
            <option value="">Select type (optional)</option>
            <option value="principal">Principal</option>
            <option value="profit">Profit</option>
            <option value="fee">Fee</option>
          </select>
          <input id="admin-return-note" name="note" type="text" placeholder="Note"
            class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-green-500" />
          <button id="btn-admin-record-return" type="submit" class="admin-action-btn">Record Return</button>
        </div>
        <p class="text-xs text-slate-400">Type classifies the recorded off-chain return. It does not prove payment or reconciliation.</p>
      </form>
      <div id="admin-action-result" class="hidden mt-4 rounded-lg px-4 py-3 text-sm"></div>
    </div>
  `;
}

function bindAdminActions(deal) {
  document.querySelectorAll('.admin-action-btn').forEach(btn => {
    if (btn.classList.contains('admin-return-transition-btn')) return;
    if (btn.type === 'submit') return;
    btn.addEventListener('click', () => runAdminAction(deal, btn.dataset.action));
  });
  document.querySelectorAll('.admin-return-transition-btn').forEach(btn => {
    btn.addEventListener('click', () => runAdminReturnTransition(deal, btn));
  });
  document.querySelectorAll('.admin-return-history-btn').forEach(btn => {
    btn.addEventListener('click', () => loadAdminReturnStatusHistory(btn.dataset.returnId));
  });
  document.getElementById('admin-return-form')?.addEventListener('submit', (event) => recordAdminReturn(event, deal));
}

function setAdminActionBusy(isBusy) {
  if (isBusy) {
    document.querySelectorAll('.admin-action-btn').forEach(btn => {
      btn.disabled = true;
    });
    return;
  }
  updateAdminActionState(document.getElementById('admin-actions')?.dataset.status);
}

function updateAdminActionState(status) {
  const actionsEl = document.getElementById('admin-actions');
  if (!actionsEl) return;
  const normalizedStatus = status || 'Unknown';
  actionsEl.dataset.status = normalizedStatus;
  actionsEl.querySelectorAll('.admin-action-btn').forEach(btn => {
    btn.disabled = btn.dataset.productionDisabled === 'true' || !isAdminActionEnabled(btn.dataset.action, normalizedStatus);
  });
}

function showAdminActionResult(type, message, txHash) {
  const el = document.getElementById('admin-action-result');
  if (!el) return;
  const isSuccess = type === 'success';
  el.className = `${isSuccess ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'} mt-4 rounded-lg px-4 py-3 text-sm`;
  el.innerHTML = `
    <div class="font-medium">${escapeHtml(message)}</div>
    ${txHash ? `<div class="mt-1 text-xs">Tx: <a href="https://testnet.nearblocks.io/txns/${escapeHtml(txHash)}" target="_blank" class="font-mono underline">${escapeHtml(txHash)}</a></div>` : ''}
  `;
  el.classList.remove('hidden');
}

async function recordAdminReturn(event, deal) {
  event.preventDefault();
  const form = event.currentTarget;
  const btn = document.getElementById('btn-admin-record-return');
  const amountNear = document.getElementById('admin-return-amount')?.value.trim();
  const entryType = document.getElementById('admin-return-type')?.value;
  const note = document.getElementById('admin-return-note')?.value.trim();
  if (btn) { btn.disabled = true; btn.textContent = 'Recording...'; }
  showAdminActionResult('success', 'Recording return...');

  try {
    const payload = { amount_near: amountNear, note };
    if (entryType) payload.entry_type = entryType;
    const res = await fetch(`${API_BASE}/api/admin/deals/${deal.id}/returns`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    form.reset();
    showAdminActionResult('success', 'Return recorded successfully');
    await refreshDeal(deal.id);
  } catch (err) {
    showAdminActionResult('error', `Record return failed: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Record Return'; }
  }
}

function getAdminReturnTransitionPayload(returnId) {
  const note = findAdminReturnElement('data-return-note', returnId)?.value.trim();
  const evidenceReference = findAdminReturnElement('data-return-evidence', returnId)?.value.trim();
  const payload = {};
  if (note) payload.note = note;
  if (evidenceReference) {
    payload.evidence_metadata = {
      transaction_hash: evidenceReference,
      reference: evidenceReference,
      label: 'Evidence / Reference',
    };
  }
  return payload;
}

async function runAdminReturnTransition(deal, button) {
  const returnId = button.dataset.returnId;
  const endpoint = button.dataset.returnEndpoint;
  const label = button.dataset.returnLabel || 'Transition';
  if (!returnId || !endpoint) {
    showAdminActionResult('error', 'Return transition failed: missing return action metadata.');
    return;
  }

  button.disabled = true;
  showAdminActionResult('success', `${label} submitted...`);
  try {
    const res = await fetch(`${API_BASE}/api/admin/returns/${returnId}/${endpoint}`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(getAdminReturnTransitionPayload(returnId)),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    const message = `${label} completed successfully. Evidence / Reference remains unverified metadata.`;
    await refreshDeal(deal.id);
    showAdminActionResult('success', message);
  } catch (err) {
    showAdminActionResult('error', `${label} failed: ${err.message}`);
  } finally {
    button.disabled = false;
  }
}

async function loadAdminReturnStatusHistory(returnId) {
  const container = findAdminReturnElement('data-return-status-history', returnId);
  if (!container) return;
  container.innerHTML = '<p class="text-slate-500 text-xs">Loading Status History...</p>';
  try {
    const res = await fetch(`${API_BASE}/api/admin/returns/${returnId}/status-events`, {
      headers: authHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    if (!Array.isArray(data.statusEvents)) throw new Error('Malformed status history payload');
    container.innerHTML = renderAdminReturnStatusHistory(data.statusEvents);
  } catch (err) {
    container.innerHTML = `<p class="text-red-300 text-xs">Status History unavailable: ${escapeHtml(err.message || 'Network request failed')}</p>`;
  }
}

function adminActionConfig(deal, action) {
  const base = `${API_BASE}/api/admin/deals/${deal.id}`;
  const configs = {
    fund: {
      label: 'Fund Project (Testnet)',
      confirm: `Run the Alpha/Testnet funding action for Project #${deal.id}?`,
      url: `${base}/fund-as`,
      body: { account_id: deal.investor }
    },
    'start-cycle': {
      label: 'Start cycle',
      confirm: 'Start the next Alpha Production Cycle?',
      url: `${base}/start-cycle`
    },
    'withdraw-farmer': {
      label: 'Farmer demo payout',
      confirm: 'Run the Farmer Alpha demo payout action? This is not a Pilot 1.0 fiat payment.',
      url: `${base}/withdraw-as`,
      body: { account_id: deal.farmer }
    },
    'withdraw-investor': {
      label: 'Investor Testnet Settlement',
      confirm: 'Run the Investor Testnet Settlement action? This is not production Settlement.',
      url: `${base}/withdraw-as`,
      body: { account_id: deal.investor }
    },
    'withdraw-platform': {
      label: 'Operator Testnet transfer',
      confirm: 'Run the AgriPartners operator Testnet transfer?',
      url: deal.platform === deal.admin ? `${base}/withdraw` : `${base}/withdraw-as`,
      body: deal.platform === deal.admin ? null : { account_id: deal.platform }
    }
  };

  if (action === 'report-profit') {
    const profitNear = prompt('Profit amount in NEAR', '300');
    if (profitNear == null) return null;
    const lossesNear = prompt('Losses amount in NEAR', '0');
    if (lossesNear == null) return null;
    const profitYocto = nearToYocto(profitNear);
    const lossesYocto = nearToYocto(lossesNear || '0');
    return {
      label: 'Report profit',
      confirm: `Report profit ${profitNear} NEAR and losses ${lossesNear || '0'} NEAR?`,
      url: `${base}/report-cycle`,
      body: { profit_near: profitYocto, losses_near: lossesYocto }
    };
  }

  return configs[action];
}

async function runAdminAction(deal, action) {
  if (isProductionDisabledAdminAction(action, deal)) {
    showAdminActionResult('error', 'This action is unavailable in production because it requires a non-production signer endpoint.');
    return;
  }
  const currentStatus = document.getElementById('admin-actions')?.dataset.status;
  if (!isAdminActionEnabled(action, currentStatus)) {
    showAdminActionResult('error', `${action} is not available while Project Status is ${currentStatus || 'Unknown'}.`);
    return;
  }

  let config;
  try {
    config = adminActionConfig(deal, action);
  } catch (err) {
    showAdminActionResult('error', err.message);
    return;
  }
  if (!config) return;
  if (!confirm(config.confirm)) return;

  setAdminActionBusy(true);
  showAdminActionResult('success', `${config.label} submitted...`);

  try {
    const res = await fetch(config.url, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: config.body ? JSON.stringify(config.body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    showAdminActionResult('success', `${config.label} completed successfully`, data.tx_hash);
    await refreshDeal(deal.id);
  } catch (err) {
    showAdminActionResult('error', `${config.label} failed: ${err.message}`);
  } finally {
    setAdminActionBusy(false);
  }
}

// --- Chart, events, refresh ---

let balancesChartInstance = null;

function renderBalancesChart(balances) {
  if (balancesChartInstance) {
    balancesChartInstance.destroy();
    balancesChartInstance = null;
  }
  const ctx = document.getElementById('balances-chart');
  if (!ctx) return;
  const data = [
    yoctoToNearFloat(balances.farmer),
    yoctoToNearFloat(balances.investor),
    yoctoToNearFloat(balances.platform),
    yoctoToNearFloat(balances.escrow),
  ];
  balancesChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Farmer', 'Investor', 'Platform', 'Escrow'],
      datasets: [{
        data,
        backgroundColor: ['#2563eb', '#16a34a', '#ca8a04', '#dc2626'],
        borderWidth: 0
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 12 }, padding: 12 }
        }
      },
      cutout: '65%'
    }
  });
}

function renderEvents(events) {
  if (!events.length) return '<p class="text-slate-500 text-sm">No events</p>';
  return events.map(e => {
    const profitHtml = e.profit_near
      ? `<span class="text-green-400 ml-2">+${formatOptionalYoctoNear(e.profit_near)}</span>` : '';
    const lossHtml = e.losses_near && e.losses_near !== '0'
      ? `<span class="text-red-400 ml-2">−${formatOptionalYoctoNear(e.losses_near)}</span>` : '';
    const txHtml = e.tx_hash
      ? `<a href="https://testnet.nearblocks.io/txns/${e.tx_hash}" target="_blank" class="text-blue-400 hover:underline font-mono">${formatAddress(e.tx_hash)}</a>`
      : '';
    const parsedDate = e.created_at ? new Date(e.created_at) : null;
    const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString('en-US') : 'Unknown';
    return `
      <div class="flex justify-between items-start text-sm py-2.5 border-b border-slate-700 last:border-0 gap-2">
        <div>
          <span class="text-slate-200 font-medium">${escapeHtml(e.event_type || 'Unknown')}</span>
          ${e.cycle_num != null ? `<span class="text-slate-400 ml-2">cycle ${e.cycle_num}</span>` : ''}
          ${profitHtml}${lossHtml}
        </div>
        <div class="text-right text-slate-500 shrink-0">
          ${txHtml}
          <div class="text-xs mt-0.5">${date}</div>
        </div>
      </div>
    `;
  }).join('');
}

async function refreshDeal(id) {
  const btn = document.getElementById('btn-refresh');
  if (btn) { btn.disabled = true; btn.textContent = 'Refreshing...'; }
  try {
    const bundle = await fetchDealBundle(id);
    renderDealDetail(document.getElementById('view-detail'), bundle);
  } catch (err) {
    showAdminActionResult('error', `Refresh failed: ${err.message || 'Network request failed'}`);
    if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }
  }
}
