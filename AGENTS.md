<!-- markdownlint-configure-file { "MD013": false } -->

# AgriPartners Workspace Instructions

## Mandatory workstream classification

Substantial repository tasks belong to one primary workstream:

1. **AgriPartners Product** — product, engineering, UX/UI, QA, demo workflows, and product
   documentation.
2. **NEAR Ecosystem & Investor Relations** — outreach, relationships, investors, partners,
   meetings, and CRM operations.
3. **Grants & Strategy** — grant research, applications, funding readiness, milestones, evidence,
   and strategic funding planning.

Before material changes, report the primary workstream, objective, canonical documents to read,
and any affected secondary workstream. Select the primary workstream from the outcome requested by
the user, minimize secondary-workstream changes, and never treat classification as authorization
to expand scope.

Alpha v1.2 is the current presentation release. Prefer focused refinement supporting funding,
relationships, grants, demonstrations, or pilot readiness. Do not begin Beta-02, new Commercial
Operations backend architecture, large production systems, or speculative features without
explicit user authorization.

Use existing canonical plans instead of creating parallel roadmaps, trackers, or sources of truth.
The complete operating model, authority boundaries, current planning ownership, and reporting
rules are defined in
[`docs/governance/WORKSTREAM_OPERATING_MODEL.md`](docs/governance/WORKSTREAM_OPERATING_MODEL.md).

## Mandatory Estonia-to-Uzbekistan financial boundary

This boundary is permanent and non-negotiable. It applies to product design, implementation,
documentation, diagrams, presentations, grants, investment materials, demos, and future plans.

1. **AgriPartners OÜ** in Estonia is the central operating company and the legal counterparty for
   every **External Investor**.
2. Only AgriPartners OÜ may receive approved crypto assets from External Investors, NEAR ecosystem
   programs, grant programs, or other authorized funding sources.
3. Cryptocurrency stops at AgriPartners OÜ in Estonia. Before any Uzbekistan activity is financed,
   AgriPartners OÜ must convert approved crypto assets through **approved crypto-to-fiat
   infrastructure** and confirm cleared fiat using authoritative provider, bank, accounting, and
   reconciliation records.
4. AgriPartners OÜ finances the **Uzbekistan Feedlot Operator** under a separate written agreement
   only by **fiat bank or payment transfer** in USD, EUR, UZS, or another permitted fiat currency.
5. Uzbekistan-based Feedlot operators, Farmers, suppliers, employees, and other local participants
   must not receive, hold, convert, transfer, or return cryptocurrency within the AgriPartners
   operating model. Every payment, proceed, repayment, and settlement from Uzbekistan to
   AgriPartners OÜ must also use approved fiat banking or payment channels.
6. Direct cryptocurrency transfers between External Investors and Uzbekistan-based operators,
   Farmers, suppliers, employees, or other local participants are prohibited.
7. **NEAR audit and automation infrastructure** may be used only on the External Investor and
   Estonia side for approved transactions, automation, hashes, workflow states, transparency, and
   audit trails. An on-chain record never replaces governing agreements, bank statements,
   accounting records, reconciliation records, or authoritative evidence that fiat cleared.
8. Never design or implement Uzbekistan-facing cryptocurrency wallets, tokens, crypto-payment or
   crypto-conversion interfaces, smart-contract payment requirements, or blockchain transaction
   requirements. The Uzbekistan Feedlot Operator and the Farmer product role must have a fiat-only,
   non-crypto user experience and operational workflow.
9. **Uzbekistan Feedlot Operator** means the legal and operational entity receiving and returning
   fiat under its separate agreement with AgriPartners OÜ. **Farmer** means a non-crypto product
   role used for operational work, reporting, evidence, and confirmations; it is not a crypto
   recipient, wallet owner, or on-chain financial actor.
10. Preserve the financial-state distinction between Investor Funding received by AgriPartners
    OÜ, crypto-to-fiat conversion in the Estonia layer, fiat disbursement to the Uzbekistan Feedlot
    Operator, Operator confirmation, Project expenses, fiat proceeds returned from Uzbekistan,
    and Investor Settlement.

Existing farmer-wallet, farmer-withdrawal, NEAR-funding, and smart-contract-payout code is
**Legacy Testnet Alpha — historical technical demonstration, not the target production financial
architecture**. Preserve it only as historical Alpha evidence until its approved implementation
migration; never present it as a current or target production flow. The canonical rules are in
[`docs/business/FINANCIAL_OPERATING_MODEL.md`](docs/business/FINANCIAL_OPERATING_MODEL.md) and
[`docs/business/OPERATING_MODEL.md`](docs/business/OPERATING_MODEL.md).

## Mandatory Relationship CRM workflow

For every investor-relations, NEAR ecosystem, partnership, or business-development task:

1. Read `docs/outreach/outreach-crm.md` before research or outreach.
2. Summarize the current pipeline and identify actions due today.
3. Continue from the recorded state; never recreate or discard prior relationship context.
4. Record every meaningful interaction immediately in the CRM. This includes discovery, profile
   review, follow, post engagement, invitation, acceptance, message, reply, follow-up, meeting,
   opportunity, and status change.
5. Do not treat an outreach action as complete until the contact record, interaction history,
   current status, and dated next action are updated.
6. Maintain every contact's permanent Contact ID, Relationship Score, Pipeline Stage, Next Touch
   Date, Next Action, and Next Touch Reason during every CRM update.
7. Never reuse, renumber, or change an assigned Contact ID. Allocate the next ID from the CRM's ID
   registry.
8. Refresh all dashboard counters and every Weekly Business Development Review list after any CRM
   change.
9. Before ending the session, reconcile all session activity against the CRM and save it.

`docs/outreach/outreach-crm.md` is the single source of truth. Near Directory files provide profile
verification evidence, but they do not replace the CRM.

## Outreach Strategy Rules

The objective is not to maximize the number of contacts.

The objective is to build long-term trusted relationships that support AgriPartners.

Before contacting any person:

1. Read the Relationship CRM.
2. Review the LinkedIn profile.
3. Review recent activity and posts.
4. Determine why this person is strategically important.
5. Prepare a personalized outreach message.

Never send generic outreach.

Every contact must have a strategic purpose.

Allowed strategic purposes include:

- Company Funding
- Pilot Investment
- NEAR Ecosystem
- Partnerships
- Institutional Capital
- RWA
- Agriculture
- Founder Network
- Advisor
- Media

If no strategic purpose exists, postpone outreach.

## Daily Outreach Rules

Maximum:

- 2 high-quality connection requests per day
- 2 meaningful follow-up messages per day

Quality is always preferred over quantity.

Mass outreach is prohibited.

## Relationship First Principle

Never ask for:

- funding
- grants
- meetings
- introductions
- investment

during the initial outreach unless there is already an active conversation.

The first objective is to build trust.

## Contact Qualification Rules

Before contacting any person, answer these questions:

1. Why is this person strategically important?
2. How can this person help AgriPartners?
3. Which strategic objective does this contact support?
4. What is the desired long-term relationship?

If these questions cannot be answered, postpone outreach.

## Business Development Principle

AgriPartners does not collect contacts.

AgriPartners builds relationships.

Every interaction should increase trust.

The Relationship CRM is not a contact database.

The Relationship CRM is the operational system for managing long-term relationships.

## Communication Principles

Every outreach message should be:

- Personalized
- Short
- Professional
- Respectful
- Relevant to the recipient's role

Never copy the same message to multiple people.

Every message should clearly explain why this specific person is being contacted.

## Session Rules

At the beginning of every Business Development session:

1. Read the Relationship CRM.
2. Review today's dashboard.
3. Identify contacts requiring action today.
4. Continue from the recorded CRM state.

Before ending every session:

1. Verify that every interaction has been recorded.
2. Verify that dashboard statistics are updated.
3. Verify that every active contact has a current status.
4. Verify that every active contact has a Next Touch Date and Next Action.
