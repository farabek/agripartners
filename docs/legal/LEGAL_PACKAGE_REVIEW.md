# Legal Package Review

Status: Review

Owner: Product / Legal

Version: 1.0

Language: English

Last reviewed: 2026-07-07

PDF export readiness: Ready for draft PDF export after link check and review of findings status.
Exported PDFs should remain marked as review material.

Related documents:

- [Master Roadmap v2](../MASTER_ROADMAP_V2.md)
- [Product Book](../PRODUCT_BOOK.md)
- [Architecture](../ARCHITECTURE.md)
- [Roadmap](../ROADMAP.md)
- [Releases](../RELEASES.md)
- [Documentation Guide](../DOCUMENTATION_GUIDE.md)
- [Documentation Authority Matrix](../DOCUMENTATION_AUTHORITY_MATRIX.md)
- [Platform Contract Architecture](PLATFORM_CONTRACT_ARCHITECTURE.md)
- [Pilot Agreement Audit](PILOT_AGREEMENT_AUDIT.md)
- [Investment Participation Agreement Draft v1](INVESTMENT_PARTICIPATION_AGREEMENT.md)

## Executive Summary

The AgriPartners legal and strategic documentation is now broadly consistent around the platform
operator model:

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

The reviewed documents consistently state that Investors participate through AgriPartners and do
not contract directly with Farmers. Farmers work under separate Farm Operating Agreements. Treasury,
Settlement, reporting, and NEAR records are described as platform-controlled workflows and
supporting records rather than substitutes for contracts, banking, accounting, or compliance.

This review also identified and corrected integration gaps in the Product Book, Master Roadmap v2,
Documentation Guide, Documentation Authority Matrix, and the Investment Participation Agreement
relationship diagram.

## Documents Reviewed

Minimum required documents reviewed:

- `docs/MASTER_ROADMAP_V2.md`
- `docs/PRODUCT_BOOK.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/RELEASES.md`
- `docs/DOCUMENTATION_GUIDE.md`
- `docs/DOCUMENTATION_AUTHORITY_MATRIX.md`
- `docs/legal/PLATFORM_CONTRACT_ARCHITECTURE.md`
- `docs/legal/PILOT_AGREEMENT_AUDIT.md`
- `docs/legal/INVESTMENT_PARTICIPATION_AGREEMENT.md`

Additional legal-package context reviewed:

- `docs/legal/INVESTMENT_PARTICIPATION_AGREEMENT_SPEC.md`

## Part 1 - Terminology Audit

| Term | Current consistency | Finding |
| --- | --- | --- |
| AgriPartners Platform Operator | Mostly consistent | Used clearly in legal docs; Product Book still also uses AgriPartners Operator for product role, which is acceptable if role context is clear |
| Investment Participation Agreement | Consistent | Used as the investor-facing agreement between Investor and AgriPartners Platform Operator |
| Farm Operating Agreement | Consistent | Used as the farmer-facing agreement between AgriPartners and Farmer / Pilot Farm |
| Project Disclosure Sheet | Consistent as future document | Listed in legal package and roadmap; not yet created |
| Risk Disclosure | Consistent as future document | Listed as future standalone risk document and referenced by IPA draft |
| Treasury | Consistent | Treated as records/workflow, not legal or banking authority |
| Settlement | Consistent | Treated as calculation/reconciliation/distribution workflow requiring controls |
| Pilot Project | Mostly consistent | Used in legal docs; older product/business docs sometimes use Project, Pilot 1.0, or pilot model depending on scope |
| Investor | Consistent | Capitalized role in product and legal documents |
| Farmer | Consistent | Capitalized role in product and legal documents |
| Operator | Mostly consistent | Product docs use AgriPartners Operator; legal docs use AgriPartners Platform Operator |
| Project Lifecycle | Consistent | Used across roadmap, architecture, and platform documents |

### Normalization Applied

- Updated the Investment Participation Agreement relationship diagram to use **AgriPartners
  Platform Operator** instead of only **AgriPartners**.
- Added legal-package references to Product Book and Master Roadmap v2.
- Added `docs/legal/` guidance to Documentation Guide.
- Registered the legal folder and legal-package documents in Documentation Authority Matrix.

## Part 2 - Documentation Cross References

| Cross-reference expectation | Status | Notes |
| --- | --- | --- |
| MASTER_ROADMAP_V2 references PRODUCT_BOOK | Acceptable | Master Roadmap references Product Book in documentation status |
| MASTER_ROADMAP_V2 references Legal Package | Updated | Added IPA spec and IPA draft to completed legal readiness |
| PRODUCT_BOOK references Platform Contract Architecture | Updated | Added Legal Package Planning section and links |
| ARCHITECTURE references Treasury | Already present | Architecture references Treasury visibility, Treasury records, and financial-state boundaries |
| DOCUMENTATION_GUIDE references Legal folder | Updated | Added Legal Documentation Folder section |
| AUTHORITY_MATRIX references new legal documents | Updated | Added `docs/legal/` coverage and Legal section |

## Part 3 - Canonical Source Review

| Document | Role | Review result |
| --- | --- | --- |
| `docs/MASTER_ROADMAP_V2.md` | Strategic roadmap | Clear cross-domain strategic role; detailed authorities remain elsewhere |
| `docs/PRODUCT_BOOK.md` | Product definition and ecosystem entry point | Clear; now links to legal-package planning |
| `docs/ARCHITECTURE.md` | Technical architecture | Clear; does not redefine legal or business authority |
| `docs/ROADMAP.md` | Software delivery roadmap | Clear; keeps real-funds and legal approvals out of software-release authority |
| `docs/RELEASES.md` | Release index | Clear; release status does not imply legal, Mainnet, or real-funds approval |
| `docs/DOCUMENTATION_GUIDE.md` | Documentation procedure | Clear; now includes legal-folder guidance |
| `docs/DOCUMENTATION_AUTHORITY_MATRIX.md` | Documentation authority registry | Updated to include legal documents and legal ownership |
| `docs/legal/PLATFORM_CONTRACT_ARCHITECTURE.md` | Legal architecture | Clear planning authority for platform contract model |
| `docs/legal/PILOT_AGREEMENT_AUDIT.md` | Historical analysis | Clear analysis role; distinguishes model guides from production legal agreements |
| `docs/legal/INVESTMENT_PARTICIPATION_AGREEMENT.md` | Legal draft | Clear Architecture Draft; not production contract |

## Part 4 - Legal Package Integration

The reviewed documentation reflects the platform model:

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

No reviewed document was found to intentionally contradict this model. Older business and product
documents sometimes use shorter labels such as AgriPartners, AgriPartners Operator, Project, or
Pilot 1.0. These are acceptable where they describe product or business roles rather than legal
contract names.

The most important boundary is consistently preserved: no direct Investor-to-Farmer contractual or
payment relationship is authorized.

## Part 5 - Historical vs Platform Documents

The documentation now clearly distinguishes:

- historical pilot model documents and generated PDFs;
- platform legal architecture and future agreement documents.

The Pilot Agreement Audit is the strongest source for this distinction. It states that current
Fidlot and Hissar farmer materials are valuable economic and operating-model inputs, but they are
not complete production-ready platform agreements.

Readers should understand:

- original pilot documents remain historical and business-model references;
- future platform agreements should implement the two-contract architecture;
- new platform legal documents require qualified legal counsel review before production use.

## Part 6 - Documentation Structure

Current `docs/legal/` structure is flat and acceptable for the current package size:

- `PLATFORM_CONTRACT_ARCHITECTURE.md`
- `PILOT_AGREEMENT_AUDIT.md`
- `INVESTMENT_PARTICIPATION_AGREEMENT_SPEC.md`
- `INVESTMENT_PARTICIPATION_AGREEMENT.md`
- `LEGAL_PACKAGE_REVIEW.md`

Recommended logical organization, without moving files:

| Group | Current / future files |
| --- | --- |
| Architecture | `PLATFORM_CONTRACT_ARCHITECTURE.md` |
| Analysis and reviews | `PILOT_AGREEMENT_AUDIT.md`, `LEGAL_PACKAGE_REVIEW.md` |
| Investor agreement package | `INVESTMENT_PARTICIPATION_AGREEMENT_SPEC.md`, `INVESTMENT_PARTICIPATION_AGREEMENT.md`, future Project Disclosure Sheet, future Risk Disclosure |
| Farmer agreement package | future Farm Operating Agreement v2 documents |
| Platform policies | future Terms of Use, Privacy Policy, Capital Flow Guide |

If the folder grows beyond roughly 10-12 active files, consider a future non-sprint refactor into
subfolders such as `architecture/`, `reviews/`, `investor/`, `farmer/`, and `policies/`. No file
movement is recommended in this sprint.

## Part 7 - Future Legal Package Checklist

### Completed

- [x] Platform Contract Architecture
- [x] Pilot Agreement Audit
- [x] Investment Participation Agreement Specification
- [x] Investment Participation Agreement Draft
- [x] Legal Package Review

### Planned

- [ ] Project Disclosure Sheet
- [ ] Risk Disclosure
- [ ] Farm Operating Agreement v2
- [ ] Terms of Use
- [ ] Privacy Policy
- [ ] Capital Flow Guide

## Consistency Findings

### Strengths

- The core no-direct-Investor-to-Farmer model is consistent.
- Treasury and Settlement are consistently treated as workflows requiring approval and
  reconciliation.
- NEAR is consistently described as infrastructure or supplementary records, not as legal,
  banking, accounting, custody, or settlement authority.
- The IPA draft and spec align closely with the Platform Contract Architecture.
- The Pilot Agreement Audit clearly separates historical pilot model documents from future
  platform legal agreements.

### Issues Found

| Issue | Severity | Status |
| --- | --- | --- |
| Product Book did not reference new legal-package documents | Medium | Fixed |
| Master Roadmap v2 did not include IPA spec or IPA draft in legal readiness | Medium | Fixed |
| Documentation Guide did not mention `docs/legal/` conventions | Low | Fixed |
| Authority Matrix did not include `docs/legal/` or legal package documents | Medium | Fixed |
| IPA relationship diagram used shorter AgriPartners label instead of AgriPartners Platform Operator | Low | Fixed |
| Some documents use AgriPartners Operator while legal docs use AgriPartners Platform Operator | Low | Accepted as role-context difference |
| Master Roadmap v2 next sprint names still mention earlier legal-package sprint numbering | Low | Recommendation for future roadmap refresh |

## Recommendations

1. Keep **AgriPartners Platform Operator** as the legal-contract term.
2. Keep **AgriPartners Operator** as an acceptable product-role term where the context is product
   workflow, not contract parties.
3. Add the future Project Disclosure Sheet and Risk Disclosure before treating investor materials
   as legally ready.
4. Draft Farm Operating Agreement v2 documents after the IPA draft is reviewed internally.
5. Add a Capital Flow Guide that connects investor funding, farmer disbursement, treasury records,
   settlement, and NEAR references.
6. Update the Master Roadmap sprint names during the next roadmap refresh so completed legal
   package work is not listed as an immediate future sprint.
7. Keep all legal documents marked Planning, Analysis, Review, or Architecture Draft until counsel
   review changes their status.

## Priority Fixes

| Priority | Fix | Owner |
| --- | --- | --- |
| P0 | Prepare standalone Risk Disclosure | Product / Legal |
| P0 | Prepare Project Disclosure Sheet template | Product / Legal |
| P1 | Draft Farm Operating Agreement v2 structure | Product / Legal + Operations |
| P1 | Create Capital Flow Guide | Product / Legal + Treasury / Operations |
| P1 | Define Document Center legal-document status model | Product |
| P2 | Refresh investor-facing materials against the legal package | Investor Relations |
| P2 | Review legal terminology across translated or generated documents | Product / Legal |

## Overall Readiness Assessment

| Area | Readiness | Explanation |
| --- | ---: | --- |
| Documentation | 88% | Core documents now cross-reference the legal package; remaining work is future checklist completion and roadmap refresh |
| Legal Architecture | 78% | Platform model is coherent and documented; final agreement terms and counsel review remain pending |
| Investor Readiness | 62% | IPA draft exists, but Risk Disclosure, Project Disclosure Sheet, and final counsel review are not complete |
| Platform Governance | 80% | Authority Matrix, Product Book, Documentation Guide, and Master Roadmap now recognize legal-package structure |

## Final Assessment

The AgriPartners documentation set is consistent enough to support continued legal-package
planning, investor-readiness preparation, and Beta product design. It is not yet ready for
production legal onboarding. The next legal work should focus on disclosure documents, farmer-side
agreement structure, and capital-flow documentation before any production legal review.

## Disclaimer

This review is a documentation and product-architecture consistency review. It is not legal advice.
All production legal documents must be prepared and reviewed by qualified legal counsel before
commercial use.
