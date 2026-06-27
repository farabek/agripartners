# AgriPartners — Pitch & Launch Pack Design

**Date:** 2026-05-25
**Status:** Approved

---

## Context

AgriPartners — RWA agro-investment platform on NEAR testnet. Status:

- Smart contract ✅, Backend ✅, Frontend ✅, Testnet demo ✅
- Real farmer ready to sign 2 Fidlot v5.9 agreements after funding is secured
- **2 deals × $50,000 = $100,000** — awaiting funding from investors and/or NEAR Foundation
- Solo founder; next step — secure funding → farmer signs

### Agreements (docs/60-40/)

| File | For | Model |
| --- | --- | --- |
| `docs/60-40/Agri-Investor-Fidlot-v5.9-6040.pdf` | Investor | Fidlot v5.9 |
| `docs/60-40/Agri-Farmer-Fidlot-v5.9-6040.pdf` | Farmer | Fidlot v5.9 |
| `docs/60-40/Agri-Investor-VariantB-v2.1-6040.pdf` | Investor | Variant B |
| `docs/60-40/Agri-Farmer-VariantB-v2.1-6040.pdf` | Farmer | Variant B |

**These PDFs are attached to all pitch materials and the NEAR Foundation package.**

### Fidlot v5.9 Financial Model (real numbers)

**For the investor ($50,000):**

- Return over 35 months: ~$82,000 (+64% ROI, 21.9% APR)
- Cycles 1–2: $9,600/cycle → Cycles 3–7: $8,480/cycle
- Capital return at completion: $20,400
- Performance Fee 20% — only from the investor's share (40%)

**For the farmer ($0 invested):**

- First payout after 5 months: $15,250
- Over 35 months in cash: ~$96,250 (~1M UZS equivalent)
- Total benefit: $114,250 + feedlot base ($18,000) owned permanently
- Fee 20% — taken only from investors, does not affect the farmer

**Deal structure:**

- 50 heads of young cattle × $1,000/head = $50,000 revenue/cycle
- Starting pool $50,000: young cattle purchase C1–C2 ($20k) + feedlot base ($18k) + reserve ($12k)
- From Cycle 3: purchase from revenue (self-financing)

**Goal:** prepare everything needed for first users and the NEAR Foundation application.

---

## Block 1 — Deployment (Railway + Vercel + Turso)

### Problem

Railway uses an ephemeral file system — SQLite is reset on redeploy.

### Solution: Turso (LibSQL)

Turso — a cloud SQLite-compatible service. Minimal code changes:

- Replace `better-sqlite3` with `@libsql/client`
- Adapt `db/index.js` for async API
- The rest of the business logic does not change

**Turso free tier:** 500 databases, 9 GB, sufficient for MVP.

### Architecture

```
GitHub (main)
  ├─→ Railway      — backend Node.js (PORT=3000)
  │     └─→ Turso  — SQLite cloud (deals + events)
  └─→ Vercel       — frontend static (index.html + style.css + app.js)
```

### Railway Environment Variables

```
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=farab.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:...
WASM_PATH=./contract/target/wasm32-unknown-unknown/release/agripartners.wasm
API_KEY=<generate>
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

### Vercel Environment Variables

```
VITE_API_URL=https://<railway-url>
```

### WASM on deploy

WASM file (~127 KB) is committed to the repository (add a `.gitignore` exception for release WASM). Building from source on Railway is impossible (no Rust toolchain) — the file must be in the repo.

### Result

- Backend URL: `https://agripartners-backend.railway.app`
- Frontend URL: `https://agripartners.vercel.app`

---

## Block 2 — One-pagers (3 documents)

All three are static HTML files in `frontend/pages/`. Open in browser, print as PDF (Ctrl+P).

### 2A — Investor Brief

**Audience:** potential investor, $50k/deal
**Language:** Russian + English (two versions)
**Attachment:** `docs/60-40/Agri-Investor-Fidlot-v5.9-6040.pdf`
**Structure:**

1. Headline: "Invest $50,000 — receive $82,000 in 35 months. Secured by NEAR blockchain."
2. Key numbers: $50k in · $82k out · +64% ROI · 21.9% APR · 35 months
3. How it works: 3 steps (invest → smart contract holds escrow → receive $9,600 every 5 months)
4. Protection: on-chain escrow, immutable terms, real-time transparency
5. The deal: 50 heads cattle × $1,000/head, 7 cycles × 5 months, Uzbekistan
6. Document: link to PDF agreement + demo dashboard
7. CTA: founder contact

### 2B — Farmer Brief

**Audience:** Uzbekistan farmer
**Language:** Uzbek + Russian
**Attachment:** `docs/60-40/Agri-Farmer-Fidlot-v5.9-6040.pdf`
**Structure:**

1. Headline (UZ): "Siz 0 so'm kiritasiz — 35 oyda $114,250 olasiz."
2. Problems with traditional financing (6 points):
   - Banks: high interest rates — unprofitable, eats all profit
   - Opaque agreements — fine print, hidden fees
   - Long approval — months of waiting, mountains of documents
   - Collateral and guarantors — complex collateral requirements
   - Late payment penalties — one bad season = debt trap
   - Farmer doesn't trust — no transparent control over money in bank accounts
3. Key numbers: $0 invested · $15,250 first payout after 5 months · $114,250 total + base
4. How it works: investor funds, you raise and sell, profit 60/40
5. Your protection: 20% fee taken only from investors — your share is untouched
6. Feedlot base $18,000 — yours permanently after 35 months
7. Document: PDF agreement is ready, terms are fixed
8. CTA: founder contact

### 2C — Platform Overview

**Audience:** NEAR Foundation, partners, press
**Language:** English
**Structure:**

1. Headline: "AgriPartners — Real-World Asset platform for Central Asian agriculture on NEAR"
2. Market: Uzbekistan agro market ~$10B, 60% of farmers without access to financing
3. Solution: smart contract escrow, transparent terms, mobile dashboard
4. Traction: MVP on testnet, real farmer, signed agreement
5. Tech stack: NEAR Protocol, Rust contract, Node.js, SQLite
6. Roadmap: Uzbekistan → Central Asia → Global
7. CTA: demo URL + email

---

## Block 3 — Pitch scripts (3 languages)

**Format:** Markdown file `docs/pitch-script.md` with three sections.
**Duration:** 5–7 minutes
**Alignment:** each step synchronized with demo (Deploy → Fund → Cycle 1 → Cycle 2 → Cycle 3 → Complete)

### Script structure (same for all languages)

| Demo step | What to say | Duration |
| --- | --- | --- |
| Introduction | Problem: farmer in Uzbekistan, bank refused | 60 sec |
| Deploy | "Creating smart contract — terms recorded permanently" | 60 sec |
| Fund | "Investor deposits $50k — money locked in escrow" | 60 sec |
| Cycles 1-2 | "Farmer works, each cycle we record the result" | 90 sec |
| Cycle 3 + Complete | "Deal completed — everyone received their share, fully transparent" | 60 sec |
| Closing | Roadmap + CTA for investor | 60 sec |

### Languages

- `pitch-script-ru.md` — Russian
- `pitch-script-en.md` — English
- `pitch-script-uz.md` — Uzbek

---

## Block 4 — NEAR Foundation Package

### 4A — Grant Proposal (NEAR DevHub)

**Platform:** [devhub.near.org](https://devhub.near.org) (public forum, Markdown)
**Amount:** $30,000 USDC
**Milestone structure:**

| Milestone | Amount | Deliverable | Timeline |
| --- | --- | --- | --- |
| M1 | $10,000 | Mainnet deploy + auth (JWT, roles) | 4 weeks |
| M2 | $10,000 | Telegram notifications + Railway/Vercel prod | 4 weeks |
| M3 | $10,000 | First real deal on mainnet + report | 4 weeks |

**Proposal sections:**

1. **TL;DR** — one sentence
2. **Problem** — agro-financing in Central Asia, $10B market, 60% without access to capital
3. **Solution** — smart contract escrow on NEAR
4. **What's Built** — MVP on testnet, demo link, farmer ready to sign 2 Fidlot v5.9 agreements ($100k), PDF agreements ready (docs/60-40/)
5. **Why NEAR** — low fees, speed, developer-friendly
6. **Team** — solo founder + traction as compensation
7. **Milestones** — table above
8. **Budget breakdown** — how $30k is spent
9. **Risks & Mitigation**

**File:** `docs/near-grant-proposal.md`

### 4B — NEAR Horizon Profile

**Platform:** [app.near.org/horizon](https://app.near.org/horizon)
**Type:** Startup profile
**Sections:**

- Project name: AgriPartners
- Tagline: "Blockchain-secured agricultural investments in Central Asia"
- Description: 200 words
- Category: RWA / DeFi / Agriculture
- Stage: MVP
- Website: Vercel URL
- Demo: Railway URL
- GitHub: [github.com/farabek/agripartners](https://github.com/farabek/agripartners)

**File:** `docs/near-horizon-profile.md`

---

## Implementation Order

1. **Block 1** — Deployment (Railway + Turso + Vercel) → get live URLs
2. **Block 2** — One-pagers (use live URLs)
3. **Block 3** — Pitch scripts (reference live demo)
4. **Block 4** — NEAR Foundation package (includes all links and materials)

---

## File Structure

```
agripartners/
  backend/
    src/db/index.js          ← adapt for Turso async API
    src/db/turso.js          ← new Turso client
  frontend/
    pages/
      investor-brief-ru.html
      investor-brief-en.html
      farmer-brief-uz.html
      farmer-brief-ru.html
      platform-overview-en.html
  docs/
    pitch-script-ru.md
    pitch-script-en.md
    pitch-script-uz.md
    near-grant-proposal.md
    near-horizon-profile.md
    60-40/                   ← existing PDF agreements
```
