# AgriPartners Platform Contract Architecture

Status: Planning

Owner: Product / Legal

Version: 1.0

Language: English

Last reviewed: 2026-07-07

PDF export readiness: Ready for draft PDF export after link check and counsel-review disclaimer
verification. Do not treat exported PDFs as production legal agreements.

## Purpose

This document defines the intended platform contract architecture for AgriPartners. It separates
the investor-facing legal relationship from the farmer-facing operating relationship so the product,
documentation, and future agreement set use one consistent model.

## 1. Contract Model Overview

AgriPartners operates as the platform operator and contracting intermediary for agricultural pilot
projects. The investor does not contract directly with the farmer. The farmer does not contract
directly with the investor.

The intended structure is:

```text
Investor
-> Investment Participation Agreement
-> AgriPartners Platform Operator
-> Farm Operating Agreement
-> Farmer / Pilot Farm
```

Under this model:

- AgriPartners presents selected pilot projects to investors through the platform.
- Investors participate in a specific pilot through AgriPartners, not through a direct farmer
  contract.
- AgriPartners enters into a separate operating agreement with the farmer or pilot farm.
- Farmer obligations, production reporting, and settlement duties are governed by the operating
  agreement between AgriPartners and the farmer.
- Investor disclosures, projected economics, reporting access, and settlement logic are governed by
  the investor agreement between AgriPartners and the investor.

## 2. Investor Agreement

The investor-facing agreement is the **Investment Participation Agreement**.

### Parties

- Investor
- AgriPartners

### Purpose

The Investment Participation Agreement allows an investor to participate in a specific agricultural
pilot project through AgriPartners as platform operator.

### Coverage

The Investment Participation Agreement should cover:

- selected pilot project;
- invested amount;
- projected ROI;
- risk disclosure;
- reporting access;
- settlement logic;
- confirmation that no direct farmer relationship is created.

### Relationship Boundaries

The investor's contractual counterparty is AgriPartners. The investor receives project information,
reporting visibility, and settlement rights through AgriPartners. The investor should not be
presented as directly funding, managing, supervising, or contracting with the farmer unless a future
legal structure expressly changes that model.

## 3. Farmer Agreement

The farmer-facing agreement is the **Farm Operating Agreement**.

### Parties

- AgriPartners
- Farmer / Pilot Farm

### Purpose

The Farm Operating Agreement governs how the farmer receives project funding and performs the
agricultural production obligations for a selected pilot project.

### Coverage

The Farm Operating Agreement should cover:

- funding receipt;
- production cycles;
- reporting duties;
- operational responsibilities;
- settlement / revenue share;
- project documentation.

### Relationship Boundaries

The farmer's contractual counterparty is AgriPartners. The farmer receives funding and operating
instructions under the Farm Operating Agreement and reports project progress to AgriPartners. The
farmer should not be presented as contracting directly with individual investors unless a future
legal structure expressly changes that model.

## 4. Pilot Agreement Mapping

Current pilot documents should be mapped to the farmer-facing operating-agreement side of the
platform architecture.

| Pilot | Current pilot operating document | Contract relationship |
| --- | --- | --- |
| Pilot 1 | Fidlot Livestock Operating Agreement | AgriPartners -> Pilot Farm |
| Pilot 2 | Hissar Sheep Breeding Operating Agreement | AgriPartners -> Pilot Farm |

These documents are operating agreements between AgriPartners and the relevant Pilot Farm. They
define project execution, farm duties, production reporting, and farmer-side settlement mechanics.
They are not direct investor-to-farmer contracts.

Investor participation in either pilot should be documented separately through an Investment
Participation Agreement or pilot-specific investor schedule between the investor and AgriPartners.

## 5. Required Document Set

The future legal and product-document package should include:

- Investment Participation Agreement
- Fidlot Livestock Operating Agreement
- Hissar Sheep Breeding Operating Agreement
- Risk Disclosure
- Terms of Use
- Privacy Policy
- Capital Flow Diagram
- Project Disclosure Sheet

### Document Roles

| Document | Primary audience | Purpose |
| --- | --- | --- |
| Investment Participation Agreement | Investor | Defines investor participation through AgriPartners |
| Fidlot Livestock Operating Agreement | AgriPartners and Pilot Farm | Defines Fidlot farmer-side operating obligations |
| Hissar Sheep Breeding Operating Agreement | AgriPartners and Pilot Farm | Defines Hissar farmer-side operating obligations |
| Risk Disclosure | Investor | Discloses project, agricultural, platform, and settlement risks |
| Terms of Use | Platform users | Defines general platform access and use terms |
| Privacy Policy | Platform users | Defines collection, use, storage, and handling of user data |
| Capital Flow Diagram | Investors, farmers, operator | Shows funding, operating, settlement, and payout flows |
| Project Disclosure Sheet | Investor | Summarizes project economics, parties, risks, reports, and status |

## 6. Platform UI Implications

The product experience should reflect the two-contract architecture and avoid implying a direct
investor-to-farmer contract.

### Investor View

The investor should see:

- Project Operator: AgriPartners
- Farmer: Pilot Farm
- Investment Agreement
- Farmer Operating Agreement
- Risk Disclosure
- Capital Flow

Investor-facing screens should make clear that AgriPartners is the project operator and legal
counterparty for investment participation. Farmer information can be shown for transparency, project
context, and reporting visibility, but the UI should avoid language suggesting the investor directly
contracts with or controls the farmer.

### Farmer View

The farmer should see:

- Farm Operating Agreement
- Funding Confirmation
- Production Duties
- Reporting Duties

Farmer-facing screens should focus on the farmer's obligations to AgriPartners: receipt of funding,
production-cycle execution, reporting, project documentation, and settlement or revenue-share duties.

### Operator View

The operator should see:

- agreement status;
- document checklist;
- funding and settlement status.

Operator-facing screens should support document completeness, agreement execution state, funding
confirmation, reporting progress, settlement status, and any exceptions requiring review.

## 7. Important Disclaimer

This document is a product and architecture planning document. It is not legal advice. Final
agreements must be reviewed by qualified legal counsel before real investor or farmer onboarding.
