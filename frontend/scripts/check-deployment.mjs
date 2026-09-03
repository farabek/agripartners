const frontendUrl = process.env.FRONTEND_URL || 'https://agripartners.vercel.app';
const apiUrl = process.env.API_URL || 'https://agripartners-zlp2.onrender.com';
const timeoutMs = Number(process.env.DEPLOYMENT_TIMEOUT_MS || 45_000);

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response;
}

const homepage = await get(`${frontendUrl}/`);
const html = await homepage.text();
if (!html.includes('AgriPartners | Transparent Agricultural Investment Workflows')) {
  throw new Error('Frontend title marker is missing.');
}

for (const header of [
  'content-security-policy',
  'permissions-policy',
  'referrer-policy',
  'x-content-type-options',
  'x-frame-options',
]) {
  if (!homepage.headers.get(header)) throw new Error(`Frontend security header is missing: ${header}`);
}

const buildInfoResponse = await get(`${frontendUrl}/build-info.json`);
const buildInfo = await buildInfoResponse.json();
if (!buildInfo.release || !buildInfo.commit || !buildInfo.builtAt) {
  throw new Error('Deployment build metadata is incomplete.');
}

const healthResponse = await get(`${apiUrl}/health`);
const health = await healthResponse.json();
if (!health.ok || health.database !== 'ready' || Number(health.migrations) < 18) {
  throw new Error(`Backend is not ready: ${JSON.stringify(health)}`);
}

console.log(JSON.stringify({ frontend: frontendUrl, api: apiUrl, buildInfo, health: 'ready' }, null, 2));
