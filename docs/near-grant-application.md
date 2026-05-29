# NEAR Foundation Grant Application

AgriPartners — готовые ответы для grants.near.org

---

## Project Name

AgriPartners

---

## One-liner (Tweet-size description)

Blockchain platform that tokenizes livestock investment deals on NEAR Protocol — giving emerging-market farmers access to capital and investors verified on-chain returns of +64% ROI.

---

## Project Website / Demo

- Dashboard: [agripartners.vercel.app](https://agripartners.vercel.app)
- API: [agripartners.onrender.com](https://agripartners.onrender.com)
- GitHub: [github.com/farabek/agripartners](https://github.com/farabek/agripartners)

---

## Problem

Small livestock farmers in emerging markets — particularly Central Asia — have no access to working capital. Banks require collateral they don't have. Investment deals are structured on paper, which creates opacity, fraud risk, and zero accountability for either side.

This locks 500M+ smallholder farmers out of growth, despite the global livestock market being worth $1.5 trillion annually.

---

## Solution

AgriPartners replaces paper investment agreements with NEAR smart contracts. Every deal term — profit split, cycle schedule, payout amounts — is encoded on-chain. Payouts to investor and farmer execute automatically at the end of each cycle with no manual intervention.

**How it works:**

1. Platform deploys a NEAR smart contract with all deal parameters
2. Investor sends funds — locked in contract until payout
3. Farmer raises and sells livestock over 5-month cycles
4. At cycle end: investor and farmer receive their shares automatically
5. After 7 cycles (35 months): capital returned, feedlot asset transferred to farmer

**Investment model — Fidlot v5.9 (60/40 split):**

- Investor: $50,000 → ~$82,000 (+64% ROI, 21.9% APR over 35 months)
- Farmer: $0 upfront → $96,250 cash + $18,000 feedlot asset
- Platform fee: 20% of investor share only — farmer pays nothing

---

## Why NEAR Protocol?

- Near-zero transaction fees (<$0.001) — critical for micropayments per cycle
- 1-second finality — essential for real-time deal tracking
- Carbon-neutral blockchain — aligned with agricultural sustainability
- Human-readable account IDs — accessible for non-crypto farmers
- Active RWA ecosystem and grant support

---

## Current Status & Traction

| Component | Status |
| --- | --- |
| Smart contract (Rust, near-sdk 5.7) | ✅ Deployed on testnet |
| Backend API (Node.js + PostgreSQL) | ✅ Live on Render |
| Investor + farmer dashboard | ✅ Live on Vercel |
| JWT auth with farmer/investor/admin roles | ✅ Implemented |
| Full lifecycle demo (fund → 7 cycles → payout) | ✅ Completed on testnet |
| Security audit | ⏳ Pending funding |
| Mainnet launch | ⏳ Pending audit |

**Real-world traction:**
A livestock farmer has signed a Letter of Intent for 2 deals at $50,000 each = **$100,000 in committed deals**, pending mainnet launch.

---

## Team

**Farhod Muhamadiev** — Founder & Full-Stack Developer

- Built the entire platform solo: Rust smart contract, REST API, JWT auth, investor/farmer dashboard
- Delivered working testnet demo in under 3 months
- Direct relationships with livestock farmers in Central Asia
- Contact: [farhodmuhamadiev4@gmail.com](mailto:farhodmuhamadiev4@gmail.com) · github.com/farabek

---

## Requested Amount

Requested amount: **$40,000 USD**

| Budget Line | Amount | Details |
| --- | --- | --- |
| Smart contract security audit | $10,000 | Independent audit by NEAR-ecosystem firm (e.g. OtterSec) — required before mainnet |
| Infrastructure (2 years) | $3,000 | Render hosting, PostgreSQL (Neon), domain, SSL, NEAR mainnet gas |
| Legal & first deal | $5,000 | Legal review of smart contract terms, notarization of 2 farmer agreements |
| Developer salary (6 months) | $15,000 | Founder at $2,500/month — mainnet deployment, NEAR Wallet integration, maintenance |
| Company incorporation (Estonia e-Residency) | $3,000 | Legal entity for platform operations — e-Residency + LLC registration (OÜ, Osaühing — Estonian equivalent of LLC) |
| AI development tools (1 year) | $1,000 | Claude Pro, GitHub Copilot — used daily for development |
| Operational reserve | $3,000 | Buffer for unexpected issues and investor/farmer meetings |
| **TOTAL** | **$40,000** | |

---

## Milestones

### Milestone 1 — Security Audit (Month 1–2) · $10,000

- [ ] Select and engage NEAR-ecosystem security firm
- [ ] Complete full smart contract audit
- [ ] Resolve all critical and high findings
- [ ] Publish audit report publicly on GitHub

### Milestone 2 — Mainnet Launch (Month 2–3) · $8,000

- [ ] Deploy audited contract to NEAR mainnet
- [ ] Integrate NEAR Wallet Selector for investor self-custody
- [ ] Launch first 2 live deals ($100,000 total)
- [ ] Legal agreements signed and notarized

### Milestone 3 — Growth (Month 3–6) · $22,000

- [ ] Reach 5 active deals on mainnet
- [ ] Add Telegram notifications for cycle events
- [ ] Add VariantB model (sheep breeding) support
- [ ] First platform revenue (fee from completed cycles)
- [ ] Publish case study: farmer results after first cycle

---

## Impact on NEAR Ecosystem

1. **RWA on NEAR** — Demonstrates real-world asset tokenization with actual revenue-generating deals, not synthetic finance
2. **New users** — Brings farmers and agro-investors to NEAR who have never used blockchain before
3. **TVL** — $100k in committed deals at launch; target $500k by end of Year 1
4. **Open source** — Full contract and platform code on GitHub for other builders to fork and adapt
5. **Proof of concept** — Shows NEAR can power real financial infrastructure in emerging markets beyond DeFi

---

## Anything Else

AgriPartners is not a DeFi protocol or a speculative token — it is a real business with real farmers, real livestock, and real signed agreements. The $100,000 in committed deals is not projected — a farmer has already agreed to the terms and is waiting for mainnet to sign.

The platform is fully functional today on testnet. The only blocker to launching real deals is a security audit. This grant directly removes that blocker.

Demo: [agripartners.vercel.app](https://agripartners.vercel.app)
GitHub: [github.com/farabek/agripartners](https://github.com/farabek/agripartners)
Contact: [farhodmuhamadiev4@gmail.com](mailto:farhodmuhamadiev4@gmail.com)
