# AgriPartners v2 Operating Model

Status: Canonical target business architecture for AgriPartners v2.

This document defines the commercial and operational relationships for AgriPartners v2. It does not change application logic, backend APIs, smart contracts, or the current Alpha implementation. Legal activation of this model depends on company registration, approved contracts, banking arrangements, compliance review, and pilot readiness.

## Operating Model

```text
External Investor
        |
        | contractual relationship and funding
        v
AgriPartners OÜ
        |
        | farmer agreement and fiat disbursement
        v
Farmer
```

AgriPartners OÜ is the central operating company and the intended legal counterparty for both sides of each transaction:

- the investor contracts with AgriPartners OÜ, not with a farmer;
- the farmer contracts with AgriPartners OÜ, not with an investor;
- AgriPartners OÜ coordinates onboarding, agreements, fund flows, records, reporting, and settlement;
- there is no direct contractual or payment relationship between an external investor and a farmer.

Until AgriPartners OÜ is registered and the required legal and operational controls are approved, this is a target model only. No document in this repository authorizes accepting or deploying real funds.

## Core Principles

1. **One counterparty on each side.** Investors and farmers interact only with AgriPartners OÜ.
2. **Fiat-only farmer experience.** Farmers receive and return funds in fiat currency through approved banking or payment channels.
3. **No farmer cryptocurrency exposure.** Farmers do not need wallets, tokens, private keys, cryptocurrency knowledge, or blockchain transactions.
4. **Blockchain is infrastructure, not the commercial product.** NEAR supports transparency, an audit trail, automation, and settlement records.
5. **Legal and banking records remain authoritative.** An on-chain record supplements approved contracts, bank statements, accounting records, and reconciliations; it does not replace them.
6. **Controlled operations before scale.** Each phase must pass documented readiness gates before real volume or broader market access is introduced.

## Participant Responsibilities

### External Investor

The investor:

- completes the required identity, eligibility, risk, and source-of-funds checks;
- enters into an agreement with AgriPartners OÜ;
- transfers funds only to an approved AgriPartners OÜ account or payment channel;
- receives disclosures, project reporting, and settlement information from AgriPartners OÜ;
- has no direct instruction, payment, or enforcement relationship with the farmer.

### AgriPartners OÜ

AgriPartners OÜ:

- owns the investor and farmer relationships;
- approves farmers and agricultural projects;
- executes separate investor-facing and farmer-facing agreements;
- receives, safeguards, allocates, and reconciles funds under approved controls;
- disburses fiat funds to farmers and receives fiat repayments or proceeds;
- maintains the authoritative participant, contract, banking, accounting, and operational records;
- provides reporting and manages exceptions, disputes, and settlement;
- may anchor selected lifecycle and settlement records to NEAR when legally and operationally appropriate.

### Farmer

The farmer:

- contracts only with AgriPartners OÜ;
- receives approved financing from AgriPartners OÜ in fiat;
- uses funds for the agreed agricultural purpose;
- submits operational evidence and reports to AgriPartners;
- returns principal, proceeds, fees, or other agreed amounts to AgriPartners OÜ in fiat;
- does not interact with investors, cryptocurrency, wallets, tokens, or smart contracts.

## Money, Information, and Record Flows

### Funding

```text
Investor -- fiat --> AgriPartners OÜ -- fiat --> Farmer
```

AgriPartners OÜ verifies contractual and operational conditions before accepting or disbursing funds. Investor funds are not represented as moving directly to the farmer.

### Return and Settlement

```text
Farmer -- fiat --> AgriPartners OÜ -- contractual settlement --> Investor
```

AgriPartners OÜ receives and reconciles farmer payments before calculating and executing any investor settlement under the applicable agreement. The precise payment instruments, safeguarding structure, fees, taxes, currency conversion, and timing require legal, banking, and accounting approval.

The [Financial Operating Model](FINANCIAL_OPERATING_MODEL.md) defines the intended funding,
crypto-to-fiat conversion, farmer disbursement, farmer return, reconciliation, and investor
settlement flows, including the roles of banking and licensed CASP / Exchange partners.

### Reporting

```text
Farmer --> operational evidence --> AgriPartners OÜ
AgriPartners OÜ --> verified reporting --> Investor
AgriPartners OÜ --> selected record anchors --> NEAR
```

AgriPartners validates reporting before presenting it as verified. Blockchain records must reference or hash only data approved for that purpose; confidential or personal data must not be placed on a public chain.

The [Information Disclosure Policy](INFORMATION_DISCLOSURE_POLICY.md) defines what project
information may be provided before and after investment, which records remain confidential, and
how farmer verification and redacted agreement disclosures are handled.

## Role of NEAR

NEAR is a technical infrastructure layer for:

- timestamped transparency records;
- an auditable history of approved lifecycle events;
- controlled workflow automation;
- settlement and reconciliation references.

NEAR is not:

- the legal counterparty;
- the farmer payment rail;
- a requirement for farmer participation;
- a substitute for banking, accounting, contracts, compliance, or dispute resolution;
- evidence by itself that a payment has legally or financially settled.

The choice of which records are written on-chain, by whom, and at what point is deferred to technical and legal design. The v2 operating model does not require changes to the current smart contracts.

## Minimum Control Model

Before handling real pilot funds, AgriPartners OÜ must define and approve:

- company authority and signing policy;
- investor and farmer onboarding checks;
- standard agreements and disclosures;
- bank accounts, payment approval limits, and segregation or safeguarding rules;
- project approval and disbursement conditions;
- accounting ledger and bank-to-ledger reconciliation;
- evidence, reporting, and data-retention standards;
- privacy, information security, and access controls;
- incident, late-payment, default, complaint, and dispute procedures;
- settlement approval and investor communication controls.

No single person should be able to approve a participant, release funds, alter the supporting record, and complete reconciliation without an independent check.

## Pilot 1.0 Boundary

Pilot 1.0 validates the operating process with a deliberately narrow scope:

- one approved agricultural project or cohort;
- a limited number of approved participants;
- fiat movement only for farmers;
- manual dual approval for every money movement;
- bank and internal ledger reconciliation;
- documented evidence and reporting cadence;
- NEAR used only for selected technical records where ready and appropriate;
- no public Marketplace offering.

The detailed execution plan is in [Pilot 1.0 Plan](../platform/pilot/PILOT_1_PLAN.md).

## Deferred Investor Protection

The existing [Investor Protection Framework](../platform/investor-protection/README.md) remains valid as exploratory documentation. It is not part of Pilot 1.0, Pilot 2.0, or the initial Production Ready operating scope. Productization, legal validation, and implementation are deferred to **Phase 7 — Marketplace**.

This deferral does not reduce the need for baseline legal, operational, treasury, disclosure, and risk controls in earlier phases.

## Business Roadmap

| Phase | Name | Business outcome |
| --- | --- | --- |
| 1 | Alpha | Validate the product concept, workflows, and documentation without representing a live investment service. |
| 2 | Company Registration | Establish AgriPartners OÜ and the legal, banking, accounting, governance, and contracting foundation. |
| 3 | Pilot 1.0 | Validate one tightly controlled end-to-end operating cycle with fiat farmer flows and manual controls. |
| 4 | Pilot 2.0 | Repeat the model with broader participation and improved, evidence-based operations. |
| 5 | Production Ready | Complete the controls, monitoring, security, compliance, support, and operational acceptance required for production consideration. |
| 6 | Investor Protection | Finalize the design and readiness of investor-protection mechanisms without yet launching a public Marketplace. |
| 7 | Marketplace | Introduce controlled Marketplace access only after prior gates, including investor-protection approval, are satisfied. |

Phase names describe business maturity, not the historical technical phase numbers used in older implementation documents.

## Decision Authority and Change Control

This document is the canonical source for the v2 business relationship model. Product, legal, operational, and communications documents should not describe:

- a direct investor-to-farmer relationship;
- crypto payments to or from farmers;
- farmers as blockchain users;
- NEAR as the legal settlement or custody layer;
- Investor Protection as active before its roadmap phase.

Any departure from these boundaries requires an explicit documented business decision plus legal and operational review.
