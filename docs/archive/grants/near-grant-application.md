# NEAR Foundation Grant Application

AgriPartners — ready answers for grants.near.org

Status: Draft; must be revalidated against current program requirements before submission.

Financial architecture: AgriPartners OÜ in Estonia is the sole recipient of any approved grant or
crypto funding. Cryptocurrency stops at AgriPartners OÜ and is converted through approved
crypto-to-fiat infrastructure before any Uzbekistan activity is financed. The Uzbekistan Feedlot
Operator receives and returns fiat only. The Farmer product role has no wallet, token,
crypto-payment, smart-contract-payment, or on-chain transaction requirement.

---

## Project Name

AgriPartners

---

## One-liner (Tweet-size description)

Agricultural investment workflow platform using NEAR for Estonia-side audit and automation
infrastructure while financing Uzbekistan operations exclusively through fiat.

---

## Project Website / Demo

- Dashboard: [agripartners.vercel.app](https://agripartners.vercel.app)
- API: [agripartners.onrender.com](https://agripartners.onrender.com)
- GitHub: [github.com/farabek/agripartners](https://github.com/farabek/agripartners)

---

## Problem

Small livestock farmers in emerging markets — particularly Central Asia — can face limited access
to working capital. Collateral requirements and paper-based investment records can make financing,
oversight, and accountability difficult.

This draft does not assert a global farmer count or livestock-market value. Any quantified market
claim added for submission requires a current, reviewable source.

---

## Solution

AgriPartners supplements, but never replaces, governing agreements and authoritative financial
records with transparent workflow states and approved NEAR audit references. External Investors
contract with AgriPartners OÜ. If approved crypto assets are received, they stop at AgriPartners
OÜ in Estonia and are converted through approved crypto-to-fiat infrastructure before Project
funds move to Uzbekistan.

**How it works:**

1. External Investor enters an approved agreement and funds AgriPartners OÜ through an approved
   fiat or crypto route.
2. Any approved crypto asset is converted to fiat in the Estonia layer and reconciled against
   provider, bank, accounting, and internal records.
3. AgriPartners OÜ sends fiat to the Uzbekistan Feedlot Operator under a separate written
   agreement by approved bank or payment transfer.
4. The Operator confirms cleared receipt, pays Project expenses in fiat, and submits operational
   evidence through the non-crypto Farmer product experience.
5. The Operator returns proceeds in fiat to AgriPartners OÜ; AgriPartners reconciles the receipt
   before Investor Settlement.
6. NEAR may record approved hashes, workflow states, and audit references on the Investor and
   Estonia side, but no on-chain record proves fiat settlement by itself.

**Investment model — Fidlot v5.9 (60/40 split):**

- Investor: $50,000 → ~$82,000 (+64% ROI, 21.9% simple annualized ROI over 35 months)
- Farmer: $0 upfront → $96,250 cash + $18,000 feedlot asset
- Platform fee: 20% of investor share only — farmer pays nothing

---

## Why NEAR Protocol?

- Low-cost infrastructure for approved Estonia-side audit and automation events
- Fast finality for timestamped workflow-state and evidence references
- Carbon-neutral blockchain — aligned with agricultural sustainability
- Developer-friendly infrastructure without requiring Uzbekistan participants to use blockchain
- Active RWA ecosystem and grant support

---

## Current Status & Traction

| Component | Status |
| --- | --- |
| Smart contract (Rust, near-sdk 5.7) | ✅ Deployed on testnet |
| Backend API (Node.js + PostgreSQL) | ✅ Live on Render |
| Investor + farmer dashboard | ✅ Live on Vercel |
| JWT auth with farmer/investor/admin roles | ✅ Implemented |
| Legacy full lifecycle crypto demo (fund → 7 cycles → payout) | ✅ Historical Testnet Alpha evidence |
| Security audit | ⏳ Pending funding |
| Production financial architecture | ⏳ Stage 2 Slices 1–2 database foundations complete; further migration and legal/financial readiness required |

The smart contract, Farmer wallet, Farmer withdrawal, NEAR funding, and automated payout behavior
above is **Legacy Testnet Alpha — historical technical demonstration, not the target production
financial architecture**.

**Traction evidence boundary:**
This draft does not treat any signed-agreement or committed-deal amount as repository-verified.
Any traction claim used in a submission requires owner-approved evidence suitable for external
disclosure.

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
| NEAR audit-infrastructure review | $10,000 | Review Estonia-side audit, automation, signer, privacy, and evidence-boundary design |
| Infrastructure (2 years) | $3,000 | Render hosting, PostgreSQL (Neon), domain, SSL, NEAR mainnet gas |
| Legal & first pilot | $5,000 | Review investor agreement, Uzbekistan Feedlot Operator agreement, and Estonia-to-Uzbekistan fiat route |
| Developer salary (6 months) | $15,000 | Founder at $2,500/month — Stage 2 migration, investor/Estonia NEAR infrastructure, maintenance |
| Company incorporation (Estonia e-Residency) | $3,000 | Legal entity for platform operations — e-Residency + LLC registration (OÜ, Osaühing — Estonian equivalent of LLC) |
| AI development tools (1 year) | $1,000 | Claude Pro, GitHub Copilot — used daily for development |
| Operational reserve | $3,000 | Buffer for unexpected issues and investor/farmer meetings |
| **TOTAL** | **$40,000** | |

---

## Milestones

### Milestone 1 — Architecture and Security Review (Month 1–2) · $10,000

- [ ] Select and engage NEAR-ecosystem security firm
- [ ] Complete the Stage 2 financial-boundary and NEAR audit-infrastructure review
- [ ] Resolve all critical and high findings
- [ ] Publish audit report publicly on GitHub

### Milestone 2 — Estonia-side Infrastructure (Month 2–3) · $8,000

- [ ] Integrate NEAR Wallet Selector for investor self-custody
- [ ] Remove all Uzbekistan-facing wallet, crypto, withdrawal, and on-chain requirements
- [ ] Validate approved crypto-to-fiat and fiat bank/payment evidence states
- [ ] Complete legal, banking, accounting, compliance, and pilot readiness gates

### Milestone 3 — Growth (Month 3–6) · $22,000

- [ ] Validate controlled pilot workflows only after all readiness gates pass
- [ ] Add Telegram notifications for cycle events
- [ ] Add VariantB model (sheep breeding) support
- [ ] First platform revenue (fee from completed cycles)
- [ ] Publish case study: farmer results after first cycle

---

## Impact on NEAR Ecosystem

1. **RWA workflow infrastructure** — Demonstrates how NEAR can support audit and automation without replacing legal and fiat settlement evidence
2. **Non-crypto participant inclusion** — Lets the Uzbekistan Feedlot Operator and Farmers use a fiat-only product workflow
3. **Responsible architecture** — Keeps crypto on the External Investor and AgriPartners OÜ Estonia side
4. **Open source** — Full contract and platform code on GitHub for other builders to fork and adapt
5. **Proof of concept** — Shows NEAR can power real financial infrastructure in emerging markets beyond DeFi

---

## Anything Else

AgriPartners is not positioned as a DeFi protocol or speculative token. This draft makes no
externally verified claim about signed agreements or committed deal value; such claims require
owner-approved supporting evidence before submission.

The Alpha is functional as a historical Testnet technical demonstration. It is not production
financial infrastructure. Production consideration requires Stage 2 implementation migration,
AgriPartners OÜ registration, approved agreements, banking/payment and crypto-to-fiat partners,
accounting and reconciliation controls, compliance review, security review, and Pilot readiness.

Demo: [agripartners.vercel.app](https://agripartners.vercel.app)
GitHub: [github.com/farabek/agripartners](https://github.com/farabek/agripartners)
Contact: [farhodmuhamadiev4@gmail.com](mailto:farhodmuhamadiev4@gmail.com)
