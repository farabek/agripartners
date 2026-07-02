# AgriPartners Platform Documentation

This directory contains the official documentation describing the AgriPartners platform.

The canonical AgriPartners v2 business architecture is defined in the [Operating Model](../business/OPERATING_MODEL.md). It places AgriPartners OÜ between external investors and farmers as the legal and operational counterparty for both.

These documents explain:

- platform vision;
- business model;
- funding model;
- investor workflow;
- farmer workflow;
- treasury architecture;
- blockchain integration;
- stakeholder benefits;
- roadmap.

## Current Documents

### AgriPartners Platform Explained

English:

- PLATFORM_EXPLAINED_EN.docx
- PLATFORM_EXPLAINED_EN.pdf

Russian:

- PLATFORM_EXPLAINED_RU.docx
- PLATFORM_EXPLAINED_RU.pdf

## Document Formats

Markdown (.md)
Canonical editable source (to be introduced in future).

DOCX (.docx)
Editable review format.

PDF (.pdf)
Distribution and presentation format.

## Usage

These documents are intended for:

- investors;
- NEAR ecosystem;
- strategic partners;
- accelerators;
- financial institutions;
- regulators;
- government organizations;
- farmers.

The platform documentation should be used to explain AgriPartners and support discussions with external stakeholders.

## AgriPartners v2 Business Boundary

```text
External Investor -> AgriPartners OÜ -> Farmer
```

- Investors interact only with AgriPartners OÜ.
- Farmers interact only with AgriPartners OÜ.
- Farmers receive and return fiat currency and never interact with cryptocurrency.
- NEAR is technical infrastructure for transparency, audit trails, automation, and settlement records.
- Legal agreements, banking, accounting, and reconciliation remain authoritative.

## Pilot 1.0

- [Pilot 1.0 Plan](pilot/PILOT_1_PLAN.md)
- [Pilot Readiness Checklist](pilot/PILOT_READINESS_CHECKLIST.md)
- [Pilot Operations Guide](pilot/PILOT_OPERATIONS_GUIDE.md)

## Important Positioning

AgriPartners is currently an Alpha platform on NEAR Testnet.

It should not be described as:

- a production investment platform;
- a custody provider;
- a live payout or settlement system;
- a Mainnet financial system;
- a regulated investment product.

## Investor Protection Framework

- [Investor Protection Framework](investor-protection/README.md)

Documents the protection reserve concept, the Fidlot 44% model, the Hissar / VariantB 53% model, staged release schedules, draft contract terms, legal notes, and open questions.

The framework remains valid as exploratory documentation but is deferred. It is not part of Pilot 1.0, Pilot 2.0, or the initial Production Ready scope. Phase 6 addresses design and readiness; activation is considered only within an approved Phase 7 Marketplace.

## Business Roadmap

1. Phase 1 — Alpha
2. Phase 2 — Company Registration
3. Phase 3 — Pilot 1.0
4. Phase 4 — Pilot 2.0
5. Phase 5 — Production Ready
6. Phase 6 — Investor Protection
7. Phase 7 — Marketplace

## Planned Structure

This directory is intended to grow into the following structure over time:

```text
docs/
`-- platform/
    README.md

    PLATFORM_EXPLAINED_EN.md
    PLATFORM_EXPLAINED_EN.docx
    PLATFORM_EXPLAINED_EN.pdf

    PLATFORM_EXPLAINED_RU.md
    PLATFORM_EXPLAINED_RU.docx
    PLATFORM_EXPLAINED_RU.pdf

    FAQ_EN.md
    FAQ_RU.md

    FUNDING_MODEL_EN.md
    FUNDING_MODEL_RU.md

    TREASURY_EN.md
    TREASURY_RU.md

    ARCHITECTURE_EN.md
    ARCHITECTURE_RU.md

    ROADMAP_EN.md
    ROADMAP_RU.md
```
