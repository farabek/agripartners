# RFC-003: AgriPartners Financial Operating Model

Status: Official target financial operating model for AgriPartners.

## 1. Purpose

This document defines the financial operating model of AgriPartners. It describes the intended
movement of investment funds through the AgriPartners ecosystem, assigns financial
responsibilities, and separates the legal and fiat relationships from the supporting blockchain
infrastructure.

This model does not by itself authorize the acceptance, conversion, custody, transfer, or
settlement of real funds. Activation of any financial route depends on AgriPartners OÜ company
registration, approved agreements, banking and payment arrangements, licensed partners,
compliance controls, and legal review in every relevant jurisdiction.

## 2. Financial Participants

### External Investor

The External Investor invests through AgriPartners OÜ under an approved investor agreement. The
investor sends funds only through payment or digital-asset channels formally approved by
AgriPartners OÜ and receives project reporting and settlement from AgriPartners.

### AgriPartners OÜ

AgriPartners OÜ is the legal counterparty to both the External Investor and the Farmer. It
controls the approved financial workflow, contracts with service providers, authorizes fund
movements, maintains records, performs reconciliation, and communicates financial status to the
participants.

### Farmer

The Farmer contracts only with AgriPartners OÜ. The Farmer receives project funding and returns
the agreed amounts only in fiat currency, such as USD, EUR, or an approved local currency. The
Farmer does not receive, hold, convert, or return cryptocurrency and is not required to use a
crypto wallet or smart contract.

### Banking Partner

The Banking Partner provides an approved corporate bank or payment account and the fiat payment
rails used for farmer disbursement, farmer repayment, operating payments, and investor settlement
where applicable. Bank records are authoritative evidence for fiat account movements.

### Licensed CASP / Exchange Partner

A licensed Crypto-Asset Service Provider (CASP) or Exchange Partner may provide approved
conversion, execution, custody, transfer, and compliance services between a supported crypto
asset and fiat currency. Its exact role, licensing status, jurisdiction, safeguarding model,
limits, and responsibilities must be verified and contractually approved before use.

The CASP / Exchange Partner is a service provider to AgriPartners OÜ. It does not become the
farmer's counterparty, and the Farmer does not interact with it.

### NEAR Infrastructure

NEAR provides technical infrastructure for approved corporate-wallet activity, transparency,
event history, audit trail, automation, and settlement records. NEAR is not a legal entity,
financial institution, banking partner, exchange, custodian, or counterparty.

## 3. Core Financial Principles

- Investors invest through AgriPartners.
- AgriPartners OÜ is the legal counterparty to the investor.
- AgriPartners OÜ is the legal counterparty to the farmer.
- Farmers receive and return funds only in fiat currency, such as USD, EUR, or an approved local
  currency.
- Farmers do not use cryptocurrency, crypto wallets, or smart contracts.
- NEAR is used as technical infrastructure for transparency, event history, audit trail, and
  automation.
- Legal agreements, approved accounting records, and banking or payment records remain
  authoritative.
- Every financial movement must be attributable to an approved participant, agreement, project,
  purpose, authorization, and reconciliation record.

## 4. Investor-to-Farmer Funding Flow

The intended funding route is:

```text
External Investor
        |
        v
AgriPartners OÜ
        |
        v
Corporate Wallet / NEAR Infrastructure
        |
        v
USDT or supported crypto asset
        |
        v
Licensed CASP / Exchange Partner
        |
        v
Corporate Bank / Payment Account
        |
        v
USD / fiat transfer
        |
        v
Farmer
```

Under this route:

1. The investor participates under an agreement with AgriPartners OÜ.
2. An approved crypto asset is received or managed through an authorized AgriPartners corporate
   wallet and recorded using NEAR infrastructure where applicable.
3. AgriPartners OÜ instructs an approved licensed CASP / Exchange Partner to convert the supported
   crypto asset into fiat.
4. Fiat proceeds are credited to an approved AgriPartners OÜ corporate bank or payment account.
5. AgriPartners OÜ authorizes and reconciles the fiat transfer to the Farmer.
6. The Farmer receives fiat only and does not participate in the crypto or conversion stages.

The exact implementation depends on company registration, banking setup, the selected payment or
CASP / Exchange Partner, supported assets and currencies, contractual allocation of custody and
safeguarding duties, tax and accounting treatment, compliance controls, and legal review. Until
these conditions are approved, the route is a target design rather than an active production
funding rail.

Alternative fiat-only investor funding routes may be used when approved. They must preserve the
same counterparty, authorization, recordkeeping, reconciliation, and farmer fiat-only principles.

## 5. Farmer Return Flow

The intended farmer return route is:

```text
Farmer
        |
        v
USD / fiat repayment
        |
        v
AgriPartners OÜ
        |
        v
Financial reconciliation
        |
        v
Investor settlement
```

The Farmer repays only to an approved AgriPartners OÜ bank or payment account. AgriPartners OÜ
matches the cleared receipt to the Farmer, project, agreement, and expected amount; records it in
the approved financial ledger; resolves any variance; calculates the contractual allocation; and
authorizes investor settlement.

Receipt from the Farmer, completion of reconciliation, and payment to the Investor are separate
financial states and must be reported separately. The investor settlement method and currency
must follow the investor agreement, approved payment rails, applicable law, and completed
reconciliation.

## 6. Company Responsibilities

AgriPartners OÜ is responsible for:

- investor agreements;
- farmer agreements;
- project administration;
- capital tracking;
- financial reconciliation;
- reporting;
- investor communication;
- compliance preparation;
- project monitoring.

These responsibilities also include approving service providers and accounts, maintaining
segregation of duties, controlling corporate wallets and signers, retaining supporting records,
managing financial exceptions, and ensuring that participant communications accurately
distinguish projected, recorded, received, converted, paid, and reconciled states.

## 7. Revenue Model

Possible AgriPartners revenue sources include:

- a platform fee;
- a project management fee;
- a success fee;
- future Marketplace service fees.

This document does not define final fee percentages, calculation bases, payment priority, timing,
tax treatment, or allocation between participants. Those terms must be established in approved
commercial models and agreements and disclosed before they apply to a participant.

## 8. Blockchain Role

NEAR is not the legal counterparty and does not replace legal agreements, bank accounts,
accounting records, licensed financial service providers, or compliance controls.

NEAR may provide:

- transparency for approved financial and project events;
- automation of approved workflow steps;
- settlement records and references;
- a timestamped audit trail and event history.

An on-chain record does not by itself prove that fiat funds cleared, that legal settlement
occurred, or that a participant's contractual obligation was satisfied. On-chain events must be
reconciled with the authoritative contractual, banking, payment-partner, and accounting records.
Personal data and confidential financial information must not be placed on a public blockchain.

## 9. Pilot Phase

Pilot 1.0 and Pilot 2.0 use this financial operating model in a controlled way before any public
Marketplace launch. Each pilot must operate within approved participant, project, currency,
asset, exposure, and transaction limits.

Pilot controls include legal and partner approval, participant onboarding, verified payment
instructions, dual authorization, manual oversight, bank and ledger reconciliation, documented
reporting, exception handling, and a formal go/no-go decision. A crypto conversion route may be
used in a pilot only if every required company, legal, banking, licensed-partner, custody,
compliance, accounting, and technical condition has been approved.

Pilot use does not establish that the model is production-ready or available to the public.

## 10. Future Marketplace

Future phases may introduce:

- a Protection Reserve;
- escrow;
- smart contract v2;
- capital pools;
- institutional investors;
- additional compliance requirements.

These capabilities are outside Pilot 1.0. They are not active merely because they are described
in roadmap or design documentation. Each requires separate legal, financial, operational,
security, compliance, and technical approval before implementation or public communication as an
available service.

## 11. Cross References

- [AgriPartners v2 Operating Model](OPERATING_MODEL.md)
- [Information Disclosure Policy](INFORMATION_DISCLOSURE_POLICY.md)
- [Pilot 1.0 Plan](../platform/pilot/PILOT_1_PLAN.md)
- [Pilot Readiness Checklist](../platform/pilot/PILOT_READINESS_CHECKLIST.md)
- [Pilot Operations Guide](../platform/pilot/PILOT_OPERATIONS_GUIDE.md)
- [Investor Protection Framework](../platform/investor-protection/README.md)
