# Investment Participation Agreement Specification

Status: Planning

Owner: Product / Legal

Version: 1.0

Language: English

Last reviewed: 2026-07-07

PDF export readiness: Ready for draft PDF export after link check and disclaimer verification. This
specification is not a final legal agreement.

Related documents:

- [Platform Contract Architecture](PLATFORM_CONTRACT_ARCHITECTURE.md)
- [Pilot Agreement Audit](PILOT_AGREEMENT_AUDIT.md)

## Purpose

This document defines the product and document architecture for the future **Investment
Participation Agreement**. It does not create the final legal agreement and does not provide legal
terms ready for production use.

The Investment Participation Agreement is the primary legal agreement between:

- Investor;
- AgriPartners Platform Operator.

Its purpose is to govern the Investor's participation in a selected agricultural investment project
through AgriPartners.

## 1. Purpose

The Investment Participation Agreement should establish the investor-facing relationship for one
approved agricultural project or pilot. It should explain what the Investor is participating in, how
the selected project is identified, what information the Investor may access, how reporting and
settlement are handled, and how risk is disclosed.

The agreement should be designed around the AgriPartners platform model:

- Investor participates through AgriPartners.
- AgriPartners operates the platform and manages the project relationship.
- Farmer performs agricultural work under a separate Farm Operating Agreement.
- Investor and Farmer do not contract directly with each other.

## 2. Parties

### Investor

The Investor is the person or entity participating in a selected agricultural investment project
through AgriPartners. The Investor is expected to complete all required onboarding, eligibility,
identity, risk, and source-of-funds checks before participation is approved.

### AgriPartners Platform Operator

The AgriPartners Platform Operator is the Investor's contractual counterparty. The operator manages
project onboarding, documentation, reporting access, treasury records, settlement workflow, and
communications with the Investor.

### Farmer Is Not a Party

The Farmer is not a party to the Investment Participation Agreement. The Farmer signs a separate
Farm Operating Agreement with AgriPartners. Any farmer duties, production obligations, operating
responsibilities, and farmer-side settlement mechanics belong in the Farm Operating Agreement or its
project schedules.

## 3. Agreement Scope

The Investment Participation Agreement should cover:

- project participation;
- investment amount;
- selected pilot or project;
- project duration;
- expected production cycles;
- reporting access;
- settlement process;
- platform responsibilities.

The agreement should be project-specific. It should identify the selected project, the Investor's
approved participation amount, the expected lifecycle, the relevant disclosure documents, and the
settlement framework applicable to that project.

## 4. Investor Rights

Expected investor rights should include:

- access to the project dashboard;
- access to approved project reports;
- access to treasury records made available to investors;
- access to settlement information;
- access to projected and realized ROI information, with clear status labels;
- notifications about material project updates, reporting events, and settlement events;
- access to applicable project documents and disclosures.

Investor rights should be role-based and disclosure-controlled. The agreement should not give the
Investor direct operating control over the Farmer or direct instruction rights against the Farmer.

## 5. Investor Responsibilities

Expected investor responsibilities should include:

- provide approved investment funds through permitted payment or platform channels;
- comply with platform rules and account requirements;
- complete onboarding requirements;
- provide accurate identity, eligibility, tax, payment, and contact information where required;
- acknowledge investment risks;
- review applicable disclosures before participation;
- keep account credentials and wallet access, if applicable, secure;
- avoid representing projected returns as guaranteed returns.

## 6. Platform Responsibilities

AgriPartners Platform Operator responsibilities should include:

- manage project onboarding;
- execute or maintain the relevant farmer agreement;
- monitor project progress;
- collect reports and evidence from the Farmer or Pilot Farm;
- maintain treasury and project records;
- perform the settlement workflow;
- provide investor reporting;
- maintain role-based access to documents and project information;
- communicate material project status updates;
- manage exceptions, disputes, delays, and operational reviews through approved procedures.

The final agreement should distinguish platform responsibilities from guarantees. AgriPartners may
coordinate, verify, report, and settle according to approved processes, but projected ROI should not
be described as guaranteed.

## 7. Financial Model

The Investment Participation Agreement should reference a project-specific financial model. The
business flow is:

```text
Investment
-> Funding
-> Production
-> Reports
-> Returns
-> Settlement
-> Distribution
```

### Business Flow Description

| Stage | Business meaning |
| --- | --- |
| Investment | Investor commits an approved amount through AgriPartners for a selected project |
| Funding | AgriPartners allocates project funding according to approved controls and project documents |
| Production | Farmer performs agricultural work under the Farm Operating Agreement |
| Reports | Farmer reports and project evidence are reviewed and made available according to disclosure rules |
| Returns | Project revenue, proceeds, or return events are recorded and reviewed |
| Settlement | AgriPartners calculates and reconciles settlement under the applicable project documents |
| Distribution | Approved investor distribution is made or recorded according to the settlement workflow |

This section describes business architecture only. The final legal agreement must define the
approved payment channels, timing, fees, tax treatment, currency rules, reconciliation standards,
and distribution conditions after legal, banking, accounting, and compliance review.

## 8. Risk Framework

The Investment Participation Agreement should reference or attach a detailed Risk Disclosure. Risk
categories should include:

- Agricultural Risk;
- Weather Risk;
- Livestock Risk;
- Market Risk;
- Operational Risk;
- Blockchain Risk;
- Liquidity Risk;
- Force Majeure.

Projected ROI is not guaranteed. Agricultural production, sale prices, animal health, market
conditions, reporting quality, operational execution, payment infrastructure, blockchain tooling,
regulatory requirements, and force majeure events may affect project outcome, timing, settlement,
and distributions.

## 9. Relationship Model

The future Investment Participation Agreement should preserve the platform contract architecture:

```text
Investor
|
v
Investment Participation Agreement
|
v
AgriPartners Platform Operator
|
v
Farm Operating Agreement
|
v
Farmer
```

The Investor and Farmer have no direct contractual relationship under this model. The Investor's
relationship is with AgriPartners Platform Operator. The Farmer's relationship is with
AgriPartners Platform Operator under the separate Farm Operating Agreement.

Investor-facing screens, documents, notifications, treasury records, and settlement views should
avoid language implying that the Investor directly funds, controls, supervises, or contracts with
the Farmer.

## 10. Required Annexes

Future annexes should include:

- Project Disclosure Sheet;
- Financial Model;
- Production Schedule;
- Settlement Schedule;
- Risk Disclosure;
- Reporting Framework.

### Annex Roles

| Annex | Purpose |
| --- | --- |
| Project Disclosure Sheet | Identifies the project, operator, farmer/pilot farm, duration, economics, risks, and status |
| Financial Model | Shows projected investment amount, costs, revenue, ROI, fees, and payout assumptions |
| Production Schedule | Defines expected cycles, milestones, activity periods, and production events |
| Settlement Schedule | Defines expected settlement timing, calculation inputs, status labels, and distribution process |
| Risk Disclosure | Describes project, agricultural, market, operational, platform, liquidity, and blockchain risks |
| Reporting Framework | Defines report cadence, report types, evidence, access rules, and update notifications |

## 11. Agreement Metadata

The Investment Participation Agreement should include standard metadata:

- Version;
- Agreement ID;
- Project ID;
- Investor ID;
- Date;
- Jurisdiction;
- Language;
- Digital Signature.

Additional metadata may include document status, template version, annex version, operator entity,
review status, effective date, expiration or completion date, and document-center access status.

## 12. Future Integration

The Investment Participation Agreement should eventually integrate with the platform as follows.

### Investor Portal

The Investor Portal should show agreement status, project identity, Investor participation amount,
documents, disclosures, reporting access, notifications, and settlement visibility.

### Operator Workspace

The Operator Workspace should show agreement status, document checklist, onboarding status,
signature status, annex completeness, project funding state, reporting state, exceptions, and
settlement readiness.

### Treasury

Treasury views should reference the agreement and project IDs when showing funding, recorded
returns, reconciliation, settlement status, and distribution records.

### Document Center

The Document Center should store or reference the signed agreement, annexes, disclosure documents,
version history, signature status, access permissions, and download or audit history.

### NEAR Transaction History

NEAR transaction history may show selected transaction references, wallet-authentication records,
contract calls, or lifecycle anchors where approved. NEAR records should supplement platform,
legal, banking, accounting, and reconciliation records; they should not replace them.

### Project Documentation

Project documentation should link the Investment Participation Agreement to the Project Disclosure
Sheet, Financial Model, Production Schedule, Settlement Schedule, Risk Disclosure, Reporting
Framework, and the relevant Farm Operating Agreement status.

## 13. Important Disclaimer

This specification is a product architecture document. It is not legal advice. The final agreement
must be prepared and reviewed by qualified legal counsel before production use.
