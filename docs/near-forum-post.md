# NEAR Forum Post — forum.near.org

## Section: Proposals (or DevHub / Ecosystem)

---

## POST TITLE

**[Proposal] AgriPartners — Tokenizing Livestock Investment on NEAR | RWA | $100k in Signed Deals | Seeking $40k Grant**

---

## POST BODY

---

### Summary

Hi NEAR community 👋

I'm Farhod, a developer from Central Asia. I built **AgriPartners** — a platform that tokenizes livestock investment deals as NEAR smart contracts.

The short version: a real farmer is ready to sign contracts worth **$100,000** the moment we launch on mainnet. The only blocker is a security audit. We're applying for a **$40,000 grant** to cover the audit and a 6-month runway.

Live demo: **[agripartners.vercel.app](https://agripartners.vercel.app)**
GitHub: **[github.com/farabek/agripartners](https://github.com/farabek/agripartners)**

---

### The Problem We're Solving

In Central Asia and many emerging markets, smallholder livestock farmers are locked in a vicious cycle:

- They have land, skills, and market access — but **zero working capital**
- Banks require collateral they don't have
- Private investment deals happen on paper — opaque, unenforceable, full of fraud risk
- Result: farmers stay small, investors stay away

This isn't a niche problem. There are **500M+ smallholder farmers** globally, operating in a **$1.5 trillion** livestock market that traditional finance barely touches.

---

### What AgriPartners Does

We replace paper investment agreements with NEAR smart contracts.

**The model (Fidlot v5.9):**

- Investor funds a deal: **$50,000**
- Farmer raises 50 heads of cattle over 7 cycles × 5 months = **35 months**
- Profit splits 60/40 (farmer/investor) — automatically, on-chain
- Platform fee: 20% of investor share only. Farmer pays **nothing**

**Returns:**

- Investor: $50,000 → ~$82,000 · **+64% ROI · 21.9% APR**
- Farmer: $0 invested → $96,250 cash + $18,000 feedlot asset = **$114,250 total**

Every payment, every cycle, every payout — recorded on NEAR.

---

### Why NEAR?

We evaluated several blockchains and chose NEAR for:

- **Near-zero fees** (<$0.001 per tx) — critical for per-cycle micropayments
- **1-second finality** — essential for real-time deal tracking
- **Human-readable accounts** — farmers don't need to deal with hex addresses
- **Carbon-neutral** — aligned with agricultural sustainability narratives
- **Active RWA ecosystem** — NEAR is where real-world assets are being built

---

### What We've Built (Testnet)

Everything is live and working today:

| Component                                                     | Status       |
| ------------------------------------------------------------- | ------------ |
| Rust smart contract (near-sdk 5.7, ~127KB WASM)               | ✅ Testnet   |
| State machine: Initialized → Funded → CycleActive → Completed | ✅ Tested    |
| Backend API (Node.js + PostgreSQL + JWT auth)                 | ✅ Live      |
| Farmer + investor dashboard with role-based access            | ✅ Live      |
| Full lifecycle demo: fund → 7 cycles → automated payout       | ✅ Completed |
| 21 unit tests + 3 integration tests                           | ✅ Passing   |

You can see the platform live right now: **[agripartners.vercel.app](https://agripartners.vercel.app)**

The code is open source: **[github.com/farabek/agripartners](https://github.com/farabek/agripartners)**

---

### Real Traction

This is not just a concept or slideware.

A livestock farmer I work with directly has agreed to sign **2 deals at $50,000 each = $100,000 in committed volume** — pending our mainnet launch. The agreements are based on PDF contracts we've already prepared and reviewed together.

The platform is ready. The farmer is ready. The only blocker is the security audit required before deploying with real funds.

---

### Team

**Farhod Muhamadiev** — Founder & Full-Stack Developer

Built everything solo in under 3 months:

- Rust smart contract with full state machine
- REST API with JWT authentication and role-based access
- Investor/farmer portal with real-time on-chain data
- End-to-end testnet demo

I have direct relationships with farmers in the region and understand the agricultural finance gap from the ground up.

📧 [farhodmuhamadiev4@gmail.com](mailto:farhodmuhamadiev4@gmail.com)
💻 github.com/farabek

---

### Funding Ask: $40,000

| Line                            | Amount      | Purpose                                                 |
| ------------------------------- | ----------- | ------------------------------------------------------- |
| Smart contract security audit   | $10,000     | OtterSec or equivalent NEAR-ecosystem firm              |
| Infrastructure (2 years)        | $3,000      | Render, Neon PostgreSQL, domain, NEAR gas               |
| Legal & first deal              | $5,000      | Notarization, legal review of 2 agreements              |
| Developer salary (6 months)     | $15,000     | $2,500/mo — mainnet deploy, wallet integration, support |
| Company incorporation (Estonia) | $3,000      | e-Residency + OÜ (LLC), legal entity for platform       |
| AI dev tools (1 year)           | $1,000      | Claude Pro, GitHub Copilot                              |
| Operational reserve             | $3,000      | Buffer for unexpected needs                             |
| **Total**                       | **$40,000** |                                                         |

---

### Milestones

**Month 1–2:** Security audit → publish report
**Month 2–3:** Mainnet deploy → NEAR Wallet integration → first 2 live deals ($100k)
**Month 3–6:** Running first 2 live deals → Telegram notifications → first platform revenue → case study

---

### Impact on NEAR

- **Real RWA on NEAR** — not synthetic DeFi, actual livestock with actual revenue
- **New users** — farmers and agro-investors who've never touched blockchain
- **TVL** — $100k at launch, targeting $500k going forward
- **Open source** — full codebase available for others to fork
- **Case study** — proof that NEAR can power real financial infrastructure in emerging markets

---

### Looking For

Beyond funding, I'd love to connect with:

- NEAR builders who've worked on RWA or DeFi lending
- Anyone with experience in agricultural finance or microfinance on blockchain
- Feedback on the smart contract design and security model

Happy to share the contract code, run a live demo, or answer any questions below 👇

---

_AgriPartners · May 2026 · [farhodmuhamadiev4@gmail.com](mailto:farhodmuhamadiev4@gmail.com)_
_📱 [t.me/farhodmuhamadiev68](https://t.me/farhodmuhamadiev68) · WhatsApp: +998 99 047 10 25_
_Demo: agripartners.vercel.app · GitHub: github.com/farabek/agripartners_
