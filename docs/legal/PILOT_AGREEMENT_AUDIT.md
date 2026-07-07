# Pilot Agreement Audit

Status: Analysis

Owner: Product / Legal

Version: 1.0

Last reviewed: 2026-07-07

Related architecture: [Platform Contract Architecture](PLATFORM_CONTRACT_ARCHITECTURE.md)

## Purpose

This document audits the existing Fidlot and Hissar pilot agreement materials against the
AgriPartners Platform Contract Architecture. It is an analysis document only. It does not rewrite
any agreement, generate any new agreement, or modify any PDF, DOCX, frontend, backend, database, or
smart contract file.

## Scope and Method

The audit reviewed the canonical editable pilot model documents under `docs/60-40/source/en/` and
the surrounding business architecture documents that define the target platform model. The published
PDFs under `docs/60-40/pdf/` were treated as generated publications and were not modified.

The reviewed pilot documents are financial-model and farmer-guide materials. They contain economic
terms, operating assumptions, reserve mechanics, and party contribution summaries, but they do not
currently read as fully executed legal agreements with named legal entities and signatures.

## Part 1 - Agreements Reviewed

### Pilot 1 - Fidlot Model

| Field | Audit finding |
| --- | --- |
| File name | `docs/60-40/source/en/Agri-Farmer-Fidlot-v5.9-6040-EN.docx` |
| Related published PDF | `docs/60-40/pdf/en/Agri-Farmer-Fidlot-v5.9-6040-EN.pdf` |
| Related investor model | `docs/60-40/source/en/Agri-Investor-Fidlot-v5.9-6040-EN.docx` |
| Document purpose | Farmer-facing financial model / guide for Fidlot livestock fattening |
| Agreement type | Current material functions as a farmer operating model, not a complete signed legal agreement |
| Language | English source reviewed; Russian generated counterpart also exists |
| Current parties | AgriPartners / company and Farmer; no named legal entities or signature parties are shown |

### Pilot 2 - Hissar Sheep Model

| Field | Audit finding |
| --- | --- |
| File name | `docs/60-40/source/en/Agri-Farmer-VariantB-v2.1-6040-EN.docx` |
| Related published PDF | `docs/60-40/pdf/en/Agri-Farmer-VariantB-v2.1-6040-EN.pdf` |
| Related investor model | `docs/60-40/source/en/Agri-Investor-VariantB-v2.1-6040-EN.docx` |
| Document purpose | Farmer-facing financial model / guide for Hissar Sheep Breeding, VariantB v2.1 |
| Agreement type | Current material functions as a farmer operating model, not a complete signed legal agreement |
| Language | English source reviewed; Russian generated counterpart also exists |
| Current parties | AgriPartners / company and Farmer; no named legal entities or signature parties are shown |

## Part 2 - Agreement Structure

### Fidlot Structure

| Element | Current content |
| --- | --- |
| Parties | AgriPartners funds assets and working capital; Farmer provides land, labor, and operations |
| Purpose | Livestock fattening model using 50 young animals, a feedlot facility, and working capital |
| Funding | Company funds initial livestock, feedlot facility, and working reserve |
| Capital amount | USD 50,000 total: USD 20,000 initial livestock, USD 18,000 feedlot facility, USD 12,000 working reserve |
| Production cycles | 7 cycles of 5 months each |
| Farmer obligations | Provide land, labor, and operating management; pay worker salary and transport from farmer share |
| Reporting obligations | Reporting failure is mentioned as a reason to suspend reserve release, but detailed report content and cadence are not defined in the document |
| Revenue model | Sales revenue from 50 animals at USD 1,000 per head; net profit split 60/40 |
| Settlement logic | Investor share is 40% less 20% performance fee; farmer share is 60% less farmer expenses and reserve contribution; reserve rate is 44% of farmer share |
| Risk allocation | Projection disclaimer; reserve is not insurance or guarantee; Confirmed Loss, overdue report, default, or dispute may reduce or suspend release |
| Signatures | No signature block found in the reviewed source text |

### Hissar Sheep Structure

| Element | Current content |
| --- | --- |
| Parties | AgriPartners funds assets and working capital; Farmer provides land, labor, and herd management |
| Purpose | Hissar sheep breeding model using 38 breeding ewes, a sheep shelter, and OpEx reserve |
| Funding | Company funds breeding ewes, sheep shelter, and OpEx reserve |
| Capital amount | USD 50,000 total: USD 26,600 for 38 breeding ewes, USD 18,000 sheep shelter, USD 5,400 OpEx reserve |
| Production cycles | 6 cycles of 6 months each |
| Farmer obligations | Provide land, labor, and herd management; pay salary and transport from farmer share |
| Reporting obligations | Reporting failure is mentioned as a reason to suspend reserve release, but detailed report content and cadence are not defined in the document |
| Revenue model | Sales revenue from 34 young animals at USD 900 each; net profit split 60/40 |
| Settlement logic | Investor share is 40% less 20% performance fee; cycles 3-6 include USD 2,500 herd capital payment before split; farmer reserve rate is 53% |
| Risk allocation | Projection disclaimer; reserve is not insurance or guarantee; Confirmed Loss, overdue report, default, or dispute may reduce or suspend release |
| Signatures | No signature block found in the reviewed source text |

## Part 3 - Platform Compatibility Review

### Fidlot Compatibility

| Major section | Classification | Explanation |
| --- | --- | --- |
| Title and document identity | Minor Update | The current title is a Farmer Guide; the future platform name can be applied after legal drafting |
| Program overview | Compatible | Describes company funding and farmer operations, matching the operator-to-farmer side |
| Party contribution table | Minor Update | Supports platform separation, but "company" should become the defined AgriPartners Platform Operator |
| Funding schedule | Compatible | Clearly identifies company-funded assets and working capital |
| Cycle economics | Compatible | Strong operating schedule for a farm operating agreement appendix |
| Farmer obligations | Minor Update | Core obligations are present but need legal drafting detail, standards, remedies, and evidence requirements |
| Reporting obligations | Requires Revision | Reporting consequences are referenced, but required reports, cadence, format, evidence, review, and cure periods are not defined |
| Revenue split | Compatible | 60/40 net-profit structure is clear as business logic |
| Performance fee | Minor Update | Fee logic belongs primarily in investor-facing economics and settlement disclosures; farmer-facing effect should be limited to farm settlement mechanics |
| Protection reserve | Requires Revision | Reserve mechanics are useful but need legal ownership, custody, release authority, default handling, and dispute treatment |
| Risk language | Minor Update | Projection and no-guarantee language is useful, but a full risk disclosure should be separated for investors |
| Signatures | Requires Revision | No execution block, named legal parties, dates, authority, governing law, or signature fields are present |

### Hissar Sheep Compatibility

| Major section | Classification | Explanation |
| --- | --- | --- |
| Title and document identity | Minor Update | The current title is a Farmer Guide / VariantB model; the future platform name should be applied after legal drafting |
| Program overview | Compatible | Describes company funding and farmer herd management, matching the operator-to-farmer side |
| Party contribution table | Minor Update | Supports platform separation, but "company" should become the defined AgriPartners Platform Operator |
| Funding schedule | Compatible | Clearly identifies company-funded ewes, shelter, and OpEx reserve |
| Cycle economics | Compatible | Strong operating schedule for a farm operating agreement appendix |
| Farmer obligations | Minor Update | Core obligations are present but need legal drafting detail, livestock-care standards, remedies, and evidence requirements |
| Reporting obligations | Requires Revision | Reporting consequences are referenced, but required reports, cadence, format, evidence, review, and cure periods are not defined |
| Revenue split | Compatible | 60/40 net-profit structure is clear as business logic |
| Herd capital payment | Minor Update | The USD 2,500 cycles 3-6 capital-return treatment is clear, but should be expressed in both farmer settlement and investor agreement schedules |
| Performance fee | Minor Update | Fee logic belongs primarily in investor-facing economics and settlement disclosures; farmer-facing effect should be limited to farm settlement mechanics |
| Protection reserve | Requires Revision | Reserve mechanics are useful but need legal ownership, custody, release authority, default handling, and dispute treatment |
| Risk language | Minor Update | Projection and no-guarantee language is useful, but a full risk disclosure should be separated for investors |
| Signatures | Requires Revision | No execution block, named legal parties, dates, authority, governing law, or signature fields are present |

## Part 4 - Mapping to Platform Architecture

Target structure:

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

### Parts That Already Support the Model

- Both pilot farmer documents identify AgriPartners / the company as the funding and coordinating
  side.
- Both documents identify the Farmer as the operating side providing land, labor, and management.
- Both documents avoid naming the investor as the farmer's direct contractual counterparty.
- Both documents contain enough operating economics to serve as schedules to a future Farm
  Operating Agreement.
- Both documents contain reserve and settlement logic that can be mapped to operator-controlled
  settlement.

### Parts Requiring Terminology Updates

- "Company" should be replaced or defined as "AgriPartners Platform Operator" or the final legal
  entity name once approved.
- "Farmer" should be defined as the named farmer, farm, or pilot farm.
- "Investor share" should be treated carefully in farmer documents so it does not imply direct
  investor-farmer privity.
- "Paid in USDC" belongs in investor-facing documents or operator settlement documentation, not in
  farmer-facing operating terms unless the farmer has no crypto exposure.
- "Fidlot" and "VariantB" should be mapped to official pilot names and versioned schedules.

### Parts Requiring Structural Changes

- Named parties, execution clauses, signature blocks, governing law, dispute process, notices, and
  authority to sign must be added in future legal agreements.
- Investor-facing investment terms, risk disclosure, reporting access, projected ROI, and no direct
  farmer relationship should be moved into or repeated in an Investment Participation Agreement.
- Farmer reporting duties should be expanded into operational covenants with report cadence,
  evidence standards, deadlines, review rights, and cure/default consequences.
- Reserve mechanics need legal treatment for custody, beneficial ownership, release conditions,
  losses, disputes, and accounting.
- Capital-flow diagrams and project disclosure sheets should be separate supporting documents rather
  than embedded only in the financial model.

## Part 5 - Required Future Changes

### Fidlot Future Change Table

| Section | Current | Future | Action |
| --- | --- | --- | --- |
| Title | Farmer Guide, Fidlot Livestock Fattening v5.9 | Fidlot Livestock Operating Agreement or schedule | Future Version |
| Parties | AgriPartners / company and Farmer | Named AgriPartners operator entity and named Pilot Farm | Rename Party |
| Program overview | Business summary and funding description | Recitals plus operating scope | Keep |
| Funding | USD 50,000 asset and working reserve schedule | Funding receipt and permitted use schedule | Keep |
| Capital amount | USD 50,000 model amount | Project-specific funded amount | Future Version |
| Production cycles | 7 x 5-month cycles | Binding cycle schedule with modification rules | Keep |
| Farmer obligations | Land, labor, operations, salary, transport | Detailed operational covenants | Future Version |
| Reporting | Consequences mentioned only | Report cadence, format, evidence, verification, cure periods | Future Version |
| Investor ROI / payout | Appears in related investor model | Investment Participation Agreement | Move To Investor Agreement |
| Performance fee | Economic term tied to investor share | Investor agreement and settlement schedule; limited farmer-facing reference | Split Into New Agreement |
| Protection reserve | Modeled 44% reserve | Legally defined reserve mechanism or deferred future mechanism | Future Version |
| Risk disclaimer | Projection and no-offer language | Separate Risk Disclosure plus agreement disclaimers | Split Into New Agreement |
| Signatures | Not present | Signature blocks, authority, dates, governing law | Future Version |

### Hissar Sheep Future Change Table

| Section | Current | Future | Action |
| --- | --- | --- | --- |
| Title | Farmer Guide, Hissar Sheep Breeding VariantB v2.1 | Hissar Sheep Breeding Operating Agreement or schedule | Future Version |
| Parties | AgriPartners / company and Farmer | Named AgriPartners operator entity and named Pilot Farm | Rename Party |
| Program overview | Business summary and funding description | Recitals plus operating scope | Keep |
| Funding | USD 50,000 ewe, shelter, and OpEx schedule | Funding receipt and permitted use schedule | Keep |
| Capital amount | USD 50,000 model amount | Project-specific funded amount | Future Version |
| Production cycles | 6 x 6-month cycles | Binding cycle schedule with modification rules | Keep |
| Farmer obligations | Land, labor, herd management, salary, transport | Detailed operational covenants | Future Version |
| Reporting | Consequences mentioned only | Report cadence, format, evidence, verification, cure periods | Future Version |
| Investor ROI / payout | Appears in related investor model | Investment Participation Agreement | Move To Investor Agreement |
| Herd capital payment | USD 2,500 in cycles 3-6 before split | Farmer settlement schedule and investor capital-return schedule | Split Into New Agreement |
| Performance fee | Economic term tied to investor share | Investor agreement and settlement schedule; limited farmer-facing reference | Split Into New Agreement |
| Protection reserve | Modeled 53% reserve | Legally defined reserve mechanism or deferred future mechanism | Future Version |
| Risk disclaimer | Projection and no-offer language | Separate Risk Disclosure plus agreement disclaimers | Split Into New Agreement |
| Signatures | Not present | Signature blocks, authority, dates, governing law | Future Version |

## Part 6 - Recommended Naming

### Pilot 1

Recommended official name: **Fidlot Livestock Operating Agreement**.

This name accurately reflects the intended future role of the Fidlot farmer-side document. It should
not be treated as the current legal title of the existing `Agri-Farmer-Fidlot-v5.9-6040-EN.docx`
file, which currently reads as a farmer guide and financial model. The name should be applied to a
future legally drafted version or to a formal agreement wrapper with the existing economics attached
as a schedule.

### Pilot 2

Recommended official name: **Hissar Sheep Breeding Operating Agreement**.

This name accurately reflects the intended future role of the Hissar farmer-side document. It should
not be treated as the current legal title of the existing `Agri-Farmer-VariantB-v2.1-6040-EN.docx`
file, which currently reads as a farmer guide and financial model. The name should be applied to a
future legally drafted version or to a formal agreement wrapper with the existing economics attached
as a schedule.

## Part 7 - Migration Strategy

### Option A - Keep Existing Agreements and Only Update Terminology

Advantages:

- Fastest path.
- Preserves existing financial model documents with minimal disruption.
- Useful for demo, presentation, and internal planning continuity.

Disadvantages:

- Does not solve missing legal-agreement structure.
- Does not add signature blocks, governing law, notices, default, dispute, or authority language.
- May leave investor-facing and farmer-facing terms mixed across model documents.

### Option B - Issue Version 2 Agreements

Advantages:

- Creates cleaner legal documents while preserving model continuity.
- Allows Fidlot and Hissar to become formal Farm Operating Agreements.
- Can add reporting duties, settlement mechanics, reserve treatment, signatures, and party names.

Disadvantages:

- Requires legal drafting and review.
- Requires version control across DOCX, PDF, product references, and disclosure materials.
- May still require separate investor participation documents and risk disclosures.

### Option C - Maintain Historical Agreements and Create New Platform Agreements

Advantages:

- Preserves existing documents as historical financial-model evidence.
- Cleanly separates future legal architecture from legacy model artifacts.
- Supports the full platform package: Investment Participation Agreement, Farm Operating
  Agreement, Risk Disclosure, Capital Flow Diagram, and Project Disclosure Sheet.
- Reduces risk of pretending current model guides are already signed production agreements.

Disadvantages:

- More work than terminology updates.
- Requires a document migration map so old and new materials do not conflict.
- Requires product/documentation discipline to distinguish historical model files from legal
  onboarding documents.

### Recommended Option

Recommend **Option C: Maintain historical agreements and create new platform agreements**.

The existing materials are valuable as canonical economic and operating-model sources, but they are
not yet complete legal agreements. Keeping them historical while creating new platform agreements is
the cleanest way to preserve evidence, protect continuity, and implement the new two-contract
architecture without overstating the legal readiness of the current files.

## Part 8 - Executive Summary

### Fundamental Compatibility

The current pilot materials are fundamentally compatible with the AgriPartners Platform Operator
model at the business and product architecture level, but they require legal-structure work before
they can function as production-ready platform agreements.

They already support the core separation:

- Investor participates through AgriPartners.
- AgriPartners coordinates funding, economics, reporting, and settlement.
- Farmer performs agricultural production obligations.
- Farmer-side economics can become operating schedules.

They are not yet complete because they do not fully define:

- named legal counterparties;
- no direct investor-farmer relationship;
- formal farmer operating covenants;
- reporting standards and evidence duties;
- legal treatment of reserves and settlement;
- execution, signatures, governing law, notices, default, and dispute handling.

### Compatibility Estimates

| Dimension | Estimate | Explanation |
| --- | ---: | --- |
| Legal structure | 55% | Relationship direction is mostly compatible, but legal execution structure is incomplete |
| Business structure | 85% | Funding, production cycles, economics, reserve logic, and farmer role are well developed |
| Product structure | 80% | The materials map well to Project Workspace, documents, funding, reports, and settlement states |
| Presentation readiness | 75% | Strong for demos and investor/farmer explanation, but should not be presented as final legal onboarding documents |

### Final Assessment

The current Fidlot and Hissar materials should be treated as historical and canonical business-model
inputs. They should inform future Farm Operating Agreements, Investment Participation Agreements,
Project Disclosure Sheets, and Risk Disclosures, but should not be used alone as production-ready
platform legal agreements.

## Important Disclaimer

This document is a product and architecture planning audit. It is not legal advice. Final
agreements, disclosures, risk language, settlement terms, and onboarding documents must be reviewed
by qualified legal counsel before real investor or farmer onboarding.
