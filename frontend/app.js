const API_BASE = 'http://localhost:3000';

// --- Утилиты ---

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

function formatAddress(addr) {
  if (!addr) return '—';
  if (addr.length <= 20) return addr;
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

function statusBadge(status) {
  if (!status) return '<span class="badge badge-Initialized">—</span>';
  return `<span class="badge badge-${status}">${status}</span>`;
}

// --- Роутер ---

function showView(viewId) {
  document.getElementById('view-list').classList.add('hidden');
  document.getElementById('view-detail').classList.add('hidden');
  document.getElementById(viewId).classList.remove('hidden');
}

function route() {
  const hash = location.hash;
  const m = hash.match(/^#deals\/(\d+)$/);
  if (m) {
    showDeal(m[1]);
  } else {
    showDeals();
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', () => {
  if (!location.hash || location.hash === '#') location.hash = '#deals';
  else route();
});

// --- Список сделок ---

async function showDeals() {
  showView('view-list');
  const el = document.getElementById('view-list');
  el.innerHTML = `
    <h1 class="text-3xl font-bold text-green-400 mb-1">AgriPartners</h1>
    <p class="text-slate-400 mb-6">Агро-инвестиции на NEAR Protocol</p>
    <div class="spinner"></div>
  `;
  try {
    const res = await fetch(`${API_BASE}/api/deals`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const deals = await res.json();
    el.querySelector('.spinner').remove();
    if (deals.length === 0) {
      el.innerHTML += '<p class="text-slate-400 mt-4">Нет сделок</p>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'grid gap-4';
    deals.forEach(d => { grid.innerHTML += renderDealCard(d); });
    el.appendChild(grid);
  } catch (e) {
    el.querySelector('.spinner')?.remove();
    el.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Backend недоступен: ${e.message}</div>`;
  }
}

function renderDealCard(d) {
  return `
    <div class="bg-slate-800 rounded-xl p-5 flex justify-between items-center gap-4">
      <div class="space-y-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-semibold bg-slate-700 px-2 py-0.5 rounded text-slate-300">${d.deal_type}</span>
        </div>
        <p class="text-sm text-slate-400">Фермер: <span class="text-slate-200">${formatAddress(d.farmer)}</span></p>
        <p class="text-sm text-slate-400">Инвестор: <span class="text-slate-200">${formatAddress(d.investor)}</span></p>
        <p class="text-sm text-slate-500">${d.total_cycles} цикл(а) × ${d.cycle_duration_days} дн  ·  ${yoctoToNear(d.investment_amount)}</p>
      </div>
      <a href="#deals/${d.id}" class="shrink-0 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Открыть →</a>
    </div>
  `;
}

// --- Детали сделки ---

async function showDeal(id) {
  showView('view-detail');
  const el = document.getElementById('view-detail');
  el.innerHTML = `
    <a href="#deals" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">← Назад</a>
    <div class="spinner"></div>
  `;

  const [dealRes, statusRes, balancesRes, eventsRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/deals/${id}`),
    fetch(`${API_BASE}/api/deals/${id}/status`),
    fetch(`${API_BASE}/api/deals/${id}/balances`),
    fetch(`${API_BASE}/api/deals/${id}/events`)
  ]);

  el.querySelector('.spinner')?.remove();

  if (dealRes.status === 'rejected' || !dealRes.value.ok) {
    const code = dealRes.value?.status;
    el.innerHTML += code === 404
      ? '<p class="text-slate-400 mt-8 text-center">Сделка не найдена</p>'
      : '<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Backend недоступен</div>';
    return;
  }

  const deal = await dealRes.value.json();
  const status = statusRes.status === 'fulfilled' && statusRes.value.ok
    ? await statusRes.value.json() : null;
  const balances = balancesRes.status === 'fulfilled' && balancesRes.value.ok
    ? await balancesRes.value.json() : null;
  const events = eventsRes.status === 'fulfilled' && eventsRes.value.ok
    ? await eventsRes.value.json() : [];

  renderDealDetail(el, deal, status, balances, events);
}

function renderDealDetail(el, deal, status, balances, events) {
  const cycleText = status ? `· Цикл ${status.current_cycle}` : '';
  el.innerHTML = `
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="#deals" class="text-slate-400 hover:text-white text-sm">← Назад</a>
      <span class="text-slate-600">|</span>
      <span class="font-semibold">${deal.deal_type}</span>
      <span id="status-badge">${statusBadge(status?.status)}</span>
      <span id="cycle-text" class="text-slate-400 text-sm">${cycleText}</span>
      <button id="btn-refresh" class="ml-auto bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded transition">Обновить</button>
    </div>
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-slate-800 rounded-xl p-5 space-y-2">
        ${renderParams(deal)}
      </div>
      <div class="bg-slate-800 rounded-xl p-5 flex flex-col items-center justify-center" id="chart-col">
        ${balances
          ? '<canvas id="balances-chart" width="240" height="240"></canvas>'
          : '<p class="text-slate-500 text-sm">Балансы недоступны</p>'}
      </div>
    </div>
    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">История событий</h3>
      ${renderEvents(events)}
    </div>
  `;

  if (balances) renderBalancesChart(balances);

  document.getElementById('btn-refresh').addEventListener('click', () => refreshDeal(deal.id));
}

function renderParams(deal) {
  const rows = [
    ['Фермер',             formatAddress(deal.farmer)],
    ['Инвестор',           formatAddress(deal.investor)],
    ['Администратор',      formatAddress(deal.admin)],
    ['Платформа',          formatAddress(deal.platform)],
    ['Сплит',              `${deal.farmer_split_pct}% / ${deal.investor_split_pct}%`],
    ['Эскроу',             `${deal.escrow_pct}%`],
    ['Performance Fee',    `${deal.performance_fee_pct}%`],
    ['Длительность цикла', `${deal.cycle_duration_days} дн`],
    ['Всего циклов',       deal.total_cycles],
    ['Инвестиция',         yoctoToNear(deal.investment_amount)],
    ['Возврат капитала',   yoctoToNear(deal.capital_return_near)],
  ];
  return rows.map(([k, v]) => `
    <div class="flex justify-between text-sm gap-2">
      <span class="text-slate-400 shrink-0">${k}</span>
      <span class="text-slate-100 font-mono text-right">${v}</span>
    </div>
  `).join('');
}

// Placeholders для Task 6
function renderBalancesChart(balances) {}
function renderEvents(events) { return '<p class="text-slate-500 text-sm">Событий нет</p>'; }
async function refreshDeal(id) {}
