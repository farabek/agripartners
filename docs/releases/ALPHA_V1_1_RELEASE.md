<!-- markdownlint-configure-file { "MD013": false } -->

# AgriPartners Alpha v1.1 Release

| Release field | Value |
| --- | --- |
| Release name | Alpha v1.1 |
| Release status | Completed |
| Release date | 2026-07-12 |
| Repository | AgriPartners |

## 1. Executive Summary

AgriPartners Alpha v1.1 is the first end-to-end demonstration of the platform. It brings the
investor, farmer, and project-operator journeys into one coherent product experience supported by
demonstration project data and automated validation.

The release runs as an Alpha demonstration on NEAR Testnet. It does not accept live investments,
hold production funds, provide production custody, or execute production settlement. Fidlot and
Hissar are demonstration pilot models used to show different project lifecycle states; neither is
a live commercial investment.

## 2. Product Scope

| Module | Completed Alpha v1.1 scope |
| --- | --- |
| Home | Public, self-guided introduction with Alpha/Testnet guardrails and investor navigation. |
| Investor Workspace | Shared project workspace with financial, production, reporting, returns, document, and history views. |
| Opportunity Catalog | Comparison and entry point for the Fidlot and Hissar demonstration models. |
| Investor Dashboard | Demonstration portfolio overview, project comparison, modeled metrics, and project navigation. |
| Farmer Portal MVP | Assigned-project context, funding confirmation, production-cycle visibility, and report workflow. |
| Reports | Demonstration report states and structures for future operational reporting. |
| Returns | Projected and recorded return presentation using conservative Alpha financial terminology. |
| Settlement | Demonstration settlement context without production payment or custody claims. |
| Commercial Operations | Permanent planned module for future verified reporting, photographs, evidence, and workflow. |
| Admin Portal | Project oversight, lifecycle operations, report review, return records, and Treasury visibility. |
| Wallet Authentication | NEAR Testnet wallet-aware authentication alongside the existing role-aware access model. |
| Onboarding | Profile and role onboarding for wallet-connected users. |
| Documentation | Governed product, architecture, investor, demonstration, release, and archive packages. |

## 3. Demonstration Pilots

### Fidlot

Fidlot is the completed demonstration workflow. It illustrates an end-to-end sequence covering
investment context, funding, reporting, returns, and settlement. Its completed state demonstrates
product lifecycle presentation only; it is not a completed commercial pilot and does not establish
realized commercial performance.

### Hissar

Hissar is the active demonstration workflow. It illustrates ongoing monitoring, project updates,
production context, and the future reporting journey. Its active state is demonstration data and
does not represent live production monitoring or a funded commercial pilot.

Both projects are demonstration pilot models. Neither represents deployed investor capital, a
live commercial investment, or verified commercial operations.

## 4. Commercial Readiness

Alpha v1.1 includes a permanent **Commercial Operations** module in both investor demonstration
workspaces. The module is in the **Planned** Alpha state and is intentionally prepared to receive
verified evidence after the first funded commercial pilot begins.

Its four product areas are:

- **Commercial Reporting:** planned farmer updates, progress reports, veterinary reports, feeding
  records, cycle summaries, and financial summaries.
- **Project Gallery:** planned verified photographs covering livestock arrival, infrastructure,
  feeding, veterinary inspection, growth milestones, and cycle completion.
- **Commercial Evidence Library:** planned invoices, certificates, insurance records, feed records,
  logistics confirmations, and bank or settlement confirmations.
- **Commercial Reporting Workflow:** an illustrative future lifecycle from confirmed funding to
  returns and settlement.

No commercial report, photograph, file, transaction, or completed commercial event is represented
in the current Alpha state.

## 5. Technology Summary

| Area | Alpha v1.1 summary | Reference |
| --- | --- | --- |
| Frontend | Role-based single-page experience for public, investor, farmer, and operator journeys. | [Architecture](../ARCHITECTURE.md) |
| Backend | Node.js services and routes for authentication, profiles, projects, reports, returns, and administration. | [Architecture](../ARCHITECTURE.md) |
| Database | PostgreSQL foundation for application records, lifecycle history, returns, and Treasury structures. | [Architecture](../ARCHITECTURE.md) |
| NEAR integration | Testnet wallet and contract integration used as Alpha execution evidence, not production accounting authority. | [NEAR Testnet Status](../near-testnet.md) |
| Authentication | Username/password and NEAR Testnet wallet-aware flows with role-based application access. | [Alpha v1.1 Release Review](alpha-v1.1-release-review.md) |
| Testing | Jest coverage across routes, services, migrations, portals, navigation, and frontend static behavior. | [Alpha v1.1 Release Notes](ALPHA_v1.1_RELEASE_NOTES.md) |

Detailed implementation authority remains with source code, migrations, configuration, tests, the
[Architecture](../ARCHITECTURE.md), and accepted architecture decisions.

## 6. Documentation

Alpha v1.1 is supported by a governed documentation system:

- The [Documentation Index](../DOCUMENTATION_INDEX.md) is the official documentation entry point.
- The [Documentation Authority Matrix](../DOCUMENTATION_AUTHORITY_MATRIX.md) defines ownership,
  authority, lifecycle, and archive boundaries.
- The [Product Book](../PRODUCT_BOOK.md) provides canonical product and business navigation.
- The [Investor Package](../investor/README.md) organizes investor-facing and diligence material.
- The [Presentation Master](../investor/00_PRESENTATION_MASTER.md) maintains the approved investor
  presentation narrative.
- The [Investor Demo Script](../investor/03_DEMO_SCRIPT.md) supports controlled demonstrations.
- The [Release Index](../RELEASES.md) maintains release navigation and history.
- The [Documentation Archive](../archive/README.md) preserves non-current material without giving
  it authority over the current product.

## 7. Validation

| Validation item | Result |
| --- | --- |
| Full backend test suite | Passed: 537/537 tests |
| Frontend production build | Passed |
| Frontend JavaScript syntax | Passed with `node --check frontend/app.js` |
| Whitespace validation | Passed with `git diff --check` |
| Release baseline working tree | Clean at the synchronized release baseline |
| GitHub synchronization | Release baseline HEAD synchronized with `origin/main` |
| Documentation-authoring working tree | Not clean: contains this new release record only |

The working-copy distinction is intentional: the synchronized release baseline is recorded
separately from the local state used to author this document.

## 8. Known Limitations

Alpha v1.1 intentionally does not include:

- live investments or capital acceptance;
- production custody or production financial authority;
- commercial reporting or verified commercial operations;
- real farmer photograph, document, or evidence uploads;
- production payout, settlement, or bank reconciliation;
- a commercial evidence review and verification workflow;
- a production evidence library or immutable evidence registry;
- production legal approval, compliance operations, or Mainnet readiness.

These limitations define the boundary between the completed Alpha demonstration and the planned
Beta commercial-readiness work.

## 9. Achievements

- Established a coherent self-guided investor journey from Home to portfolio and project detail.
- Completed shared investor workspaces for active and completed demonstration lifecycle states.
- Demonstrated the Farmer Portal MVP and project-reporting workflow.
- Established conservative returns, Treasury, reconciliation, and settlement terminology.
- Added the permanent Commercial Operations architecture for future verified evidence.
- Established documentation governance through the Index, Authority Matrix, Product Book, and
  archive system.
- Completed investor presentation material, demonstration guidance, and release documentation.
- Completed the product-readiness audit and automated release validation.

## 10. Next Phase

Beta-02 will move from planned commercial structure toward controlled operational readiness. The
phase is expected to focus on commercial reports, farmer uploads, evidence verification, commercial
evidence organization, and readiness for a real controlled pilot.

Beta-02 must preserve the distinction between demonstration material and verified operational
evidence. Evidence should appear only after it exists, has an accountable source, and has passed the
appropriate review process.

## 11. Release Statement

AgriPartners Alpha v1.1 establishes the first complete investor demonstration platform and the
product, technical, and documentation foundation for Beta commercial readiness.
