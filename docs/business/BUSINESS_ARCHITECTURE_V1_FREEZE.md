# AgriPartners Business Architecture v1.0 Freeze

Status: Frozen

Freeze date: 2026-07-02

## Purpose

This document records the official freeze of AgriPartners Business Architecture v1.0. The freeze
establishes a stable business baseline for legal, operational, compliance, platform, and Pilot
work.

The freeze confirms the accepted architecture decisions below. It does not authorize real-funds
activity, approve a financial provider, complete company registration, replace legal review, or
change application behavior.

## Scope of the Freeze

The freeze covers:

- the participant and counterparty model;
- the provider-neutral financial flow;
- the Farmer fiat-only boundary;
- the role of NEAR and blockchain infrastructure;
- the relationship between Master Investment Models and Projects;
- the definition and boundary of Pilot 1.0;
- the information-disclosure and confidentiality model;
- the Marketplace terminology and roadmap position;
- the deferral of Investor Protection activation;
- the seven-phase business roadmap.

The freeze applies to the business architecture expressed by the core documents listed below.
Supporting, historical, audience-specific, legal, operational, compliance, and technical
documents must remain compatible with this baseline.

## Core Business Documents

### Canonical Business Architecture

- [AgriPartners v2 Operating Model](OPERATING_MODEL.md)
- [RFC-003: Financial Operating Model](FINANCIAL_OPERATING_MODEL.md)
- [Information Disclosure Policy](INFORMATION_DISCLOSURE_POLICY.md)

### Master Investment Models

- [Feedlot Master Investment Model](investment-models/FEEDLOT_MASTER_INVESTMENT_MODEL.md)
- [Hissar Sheep Master Investment Model](investment-models/HISSAR_SHEEP_MASTER_INVESTMENT_MODEL.md)

### Pilot 1.0

- [Pilot 1.0 Plan](../platform/pilot/PILOT_1_PLAN.md)
- [Pilot Readiness Checklist](../platform/pilot/PILOT_READINESS_CHECKLIST.md)
- [Pilot Operations Guide](../platform/pilot/PILOT_OPERATIONS_GUIDE.md)

### Architecture Review and Roadmap

- [Business Architecture Audit v1.0](BUSINESS_ARCHITECTURE_AUDIT_V1.md)
- [English Roadmap](../pitch-deck/09-roadmap.md)
- [Russian Roadmap](../pitch-deck/19-roadmap-ru.md)

### Documentation Entry Points

- [AgriPartners README](../../README.md)
- [Documentation Index](../README.md)
- [Platform Documentation](../platform/README.md)

## Accepted Architecture Decisions

### 1. Central Counterparty

The External Investor invests through AgriPartners OÜ. AgriPartners OÜ is the legal counterparty
to the Investor and the Farmer. The Investor and Farmer do not contract or transfer funds
directly to one another.

### 2. Provider-Neutral Financial Flow

The accepted funding flow is:

```text
External Investor
        |
        v
AgriPartners OÜ
        |
        v
Selected financial infrastructure
(bank, payment institution, licensed CASP,
or other compliant provider)
        |
        v
USD / EUR / Local Currency
        |
        v
Farmer
```

Investors may use supported crypto assets through approved AgriPartners investment
infrastructure. No specific financial provider or conversion implementation is selected by this
freeze.

The accepted return flow is:

```text
Farmer
        |
        v
USD / EUR / Local Currency
        |
        v
AgriPartners OÜ
        |
        v
Investor Settlement
```

### 3. Farmer Fiat-Only Boundary

Farmers receive and return only USD, EUR, or an approved local fiat currency. Farmers never use
cryptocurrency, crypto wallets, smart contracts, or blockchain directly. Cryptocurrency, when
supported and approved, is limited to the investment infrastructure between the Investor and
AgriPartners OÜ.

### 4. Financial Implementation Dependencies

The exact payment, custody, conversion, safeguarding, and settlement implementation depends on:

- AgriPartners OÜ company registration;
- banking relationships;
- payment and licensed crypto-asset partners;
- approved agreements;
- accounting and tax treatment;
- compliance controls;
- legal review in each relevant jurisdiction.

### 5. Role of NEAR

NEAR is technical infrastructure for transparency, event history, audit trail, automation, and
supplementary settlement records. NEAR is not a legal counterparty, bank, payment institution,
custodian, exchange, or replacement for legal agreements and authoritative financial records.

### 6. Master Investment Model and Project Relationship

A Master Investment Model is a reusable business and operating model. A Project is one
independent, separately approved and contracted implementation of a Master Investment Model.

Feedlot and Hissar Sheep are the official Master Investment Models in Business Architecture v1.0.
Each Project requires its own participants, amount, adaptation, disclosures, approvals,
agreements, records, risks, and settlement.

### 7. Separate Project Agreements

Every Project is implemented through a separate legally signed Farmer Agreement and the other
agreements and schedules required for that Project. A Master Investment Model is not a legal
agreement and does not amend an original agricultural agreement.

### 8. Pilot 1.0 Definition

Pilot 1.0 is one complete investment Project lifecycle:

```text
Project Creation
        |
        v
Funding
        |
        v
Farmer Confirmation
        |
        v
Production Cycles
        |
        v
Reports
        |
        v
Settlement
        |
        v
Project Completion
```

Pilot 1.0 is not a single Production Cycle. It may use a smaller investment amount, for example
USD 1,000, while preserving the complete Project lifecycle, control model, reporting, and
settlement.

### 9. Information Disclosure

AgriPartners follows the Transparency First principle while protecting personal data,
confidential agreements, internal analysis, banking information, compliance records, and
commercial interests. Disclosure is controlled by participant, purpose, Project stage, legal
basis, and the Information Disclosure Policy.

### 10. Marketplace Terminology

Marketplace refers only to the future public platform phase, Phase 7. The current Alpha
opportunity-discovery interface is the Opportunity Catalog and is not a live Marketplace.
Pilot 1.0 and Pilot 2.0 are pre-Marketplace phases.

### 11. Investor Protection

Investor Protection documentation remains valid exploratory design work. Design and readiness
are addressed in Phase 6. Activation is not part of Pilot 1.0, Pilot 2.0, or the initial
Production Ready scope and may occur only through an approved Phase 7 Marketplace.

### 12. Business Roadmap

The accepted business roadmap is:

1. Phase 1 — Alpha;
2. Phase 2 — Company Registration;
3. Phase 3 — Pilot 1.0;
4. Phase 4 — Pilot 2.0;
5. Phase 5 — Production Ready;
6. Phase 6 — Investor Protection;
7. Phase 7 — Marketplace.

## Items Not Frozen

The following remain versioned, approval-dependent decisions:

- company formation, authority, and governance details;
- exact bank, payment institution, CASP, exchange, or other provider;
- supported assets, currencies, payment rails, custody, conversion, and safeguarding structure;
- legal agreement language, governing law, licensing, tax, and compliance implementation;
- Project economics, budgets, fees, ROI, duration, and Production Cycle parameters;
- Farmer and Investor eligibility for a specific Project;
- Pilot 1.0 go/no-go approval and funding limits;
- Investor Protection, escrow, capital pools, and Marketplace implementation details;
- frontend, backend, database, API, smart contract, and infrastructure design.

These items may be developed without changing the frozen business architecture when they remain
compatible with the accepted decisions.

## RFC Change Control

Any future change to a frozen Business Architecture v1.0 decision must go through documented RFC
review before the canonical documents are changed.

The RFC must:

- identify the frozen decision being changed;
- explain the business reason and expected outcome;
- list affected Business, Legal, Operations, Platform, Compliance, and Marketplace documents;
- assess participant, financial, disclosure, Pilot, roadmap, legal, and technical impact;
- define migration or compatibility considerations;
- receive explicit approval from authorized AgriPartners decision-makers.

Editorial corrections, link repairs, translations, and clarifications that do not change a frozen
decision may be made without a new architecture RFC. If there is doubt whether a change is
architectural, it must be treated as an RFC candidate.

## Freeze Statement

AgriPartners Business Architecture v1.0 is officially frozen as of 2026-07-02.

All future business architecture changes require RFC review and approval. Legal, operational,
compliance, and technical implementation must remain aligned with this frozen baseline until a
later approved RFC supersedes it.
