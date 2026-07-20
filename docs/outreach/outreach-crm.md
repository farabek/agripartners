<!-- markdownlint-configure-file { "MD013": false } -->

# AgriPartners Relationship CRM

Last reconciled: 2026-07-20 (Asia/Tashkent)

This document is the single source of truth for AgriPartners investor relations, NEAR ecosystem
outreach, partnerships, and business development. An interaction is complete only after it is
recorded here.

Profile verification evidence may remain in [`near-directory/`](near-directory/README.md), but all
contact identity fields, relationship state, history, and next actions must also be represented in
this CRM.

## Session protocol

At the start of every outreach session:

1. Read this file.
2. Review the pipeline summary and actions due today.
3. Check overdue next actions before starting new outreach.
4. Continue from the latest recorded state.

After every meaningful interaction:

1. Add a dated entry to the contact's interaction history.
2. Update the relationship status when the interaction changes the state.
3. Recalculate the Relationship Score and assign exactly one Pipeline Stage.
4. Update the Next Touch Date, Next Action, and Next Touch Reason.
5. Refresh the dashboard counters and Weekly Business Development Review.

Before ending every outreach session, verify that all contacts and interactions from the session
are recorded, every contact has one current status, and every contact has a dated next action.

## Controlled values

Categories: `Investor`, `NEAR`, `Partner`, `Founder`, `Advisor`, `Farmer`, `Other`.

Priorities: `A+`, `High`, `Medium`, `Low`.

Relationship statuses:

- `Research`
- `Following`
- `Posts Liked`
- `Commented`
- `Invitation Sent (Pending)`
- `Connected`
- `Connected — Intro Message Sent`
- `First Conversation`
- `Active Conversation`
- `Follow-up Required`
- `Opportunity`
- `Partnership`
- `Investor`
- `Closed`

Use the most advanced current state as the contact's single status. Preserve earlier states in the
interaction history.

### Permanent Contact ID registry

- Assigned IDs are immutable and must never be reused, renumbered, or reassigned.
- The next new contact must receive **`NEAR-020`**.
- The `NEAR` prefix is retained for the permanent sequence even when a future contact belongs to a
  different category.

| Contact ID | Full Name |
| --- | --- |
| NEAR-001 | Joseph Beverley |
| NEAR-002 | David Mirzadeh |
| NEAR-003 | Philipp Suarez |
| NEAR-004 | Josh Ford |
| NEAR-005 | Bowen Shen |
| NEAR-006 | Alexander Scharrer |
| NEAR-007 | Taras Dovgal |
| NEAR-008 | David Norris |
| NEAR-009 | Abhishek Vaidyanathan |
| NEAR-010 | Bianca Guimaraes-Chadwick |
| NEAR-011 | Vitalii Yevlakhov |
| NEAR-012 | Iker Alustiza Beitia |
| NEAR-013 | Matt Kummell |
| NEAR-014 | Danny Carpentier Balough |
| NEAR-015 | Dillon Freeman |
| NEAR-016 | Harshit Tiwari |
| NEAR-017 | Charlie Bussat |
| NEAR-018 | Aminu Bin Ibrahim |
| NEAR-019 | Clemens Scherf |

### Relationship Score

| Score | Meaning |
| ---: | --- |
| 0 | Identified |
| 1 | Profile reviewed |
| 2 | Following |
| 3 | Posts liked |
| 4 | Commented |
| 5 | Invitation sent |
| 6 | Connected |
| 7 | First conversation |
| 8 | Regular communication |
| 9 | Trusted relationship |
| 10 | Partner, investor, or strategic contact |

The score reflects the strongest evidenced relationship milestone. A message without a reply does
not by itself establish a conversation.

### Relationship Pipeline

Every contact belongs to exactly one stage:

```text
Research
  -> Following
  -> Liked Posts
  -> Commented
  -> Invitation Sent
  -> Connected
  -> Conversation
  -> Warm Relationship
  -> Opportunity
  -> Meeting
  -> Partnership
```

Pipeline Stage is separate from Relationship Status. Status captures the current operational
condition, such as `Follow-up Required`; Pipeline Stage captures relationship maturity.

## Relationship Dashboard

Snapshot date: 2026-07-20. Counts reflect the last recorded evidence and must be reconciled against
LinkedIn before any new action.

| Metric | Count |
| --- | ---: |
| Total Contacts | 19 |
| Research | 0 |
| Following | 0 |
| Liked Posts | 0 |
| Commented | 0 |
| Invitation Pending | 14 |
| Connected | 4 |
| Conversations | 1 |
| Warm Relationships | 0 |
| Meetings | 0 |
| Partnerships | 0 |
| Investor Opportunities | 0 |
| Partnership Opportunities | 0 |
| Grant Opportunities | 0 |
| Contacts requiring action this week | 15 |
| Overdue Follow-ups | 1 |

### Contacts grouped by status

| Status | Count | Contacts |
| --- | ---: | --- |
| Invitation Sent (Pending) | 14 | Joseph Beverley; David Mirzadeh; Josh Ford; Bowen Shen; Taras Dovgal; David Norris; Abhishek Vaidyanathan; Bianca Guimaraes-Chadwick; Matt Kummell; Danny Carpentier Balough; Dillon Freeman; Harshit Tiwari; Aminu Bin Ibrahim; Clemens Scherf |
| Connected | 3 | Alexander Scharrer; Vitalii Yevlakhov; Charlie Bussat |
| Conversation Started | 1 | Iker Alustiza Beitia |
| Follow-up Required | 1 | Philipp Suarez |

### Contacts grouped by pipeline stage

| Pipeline Stage | Count | Contact IDs | Contacts |
| --- | ---: | --- | --- |
| Invitation Sent | 14 | NEAR-001; NEAR-002; NEAR-004; NEAR-005; NEAR-007; NEAR-008; NEAR-009; NEAR-010; NEAR-013; NEAR-014; NEAR-015; NEAR-016; NEAR-018; NEAR-019 | Joseph Beverley; David Mirzadeh; Josh Ford; Bowen Shen; Taras Dovgal; David Norris; Abhishek Vaidyanathan; Bianca Guimaraes-Chadwick; Matt Kummell; Danny Carpentier Balough; Dillon Freeman; Harshit Tiwari; Aminu Bin Ibrahim; Clemens Scherf |
| Connected | 4 | NEAR-003; NEAR-006; NEAR-011; NEAR-017 | Philipp Suarez; Alexander Scharrer; Vitalii Yevlakhov; Charlie Bussat |
| Conversation | 1 | NEAR-012 | Iker Alustiza Beitia |

## Weekly Business Development Review

Review period: **2026-07-20 through 2026-07-26** (Asia/Tashkent).

### Contacts requiring action

| Contact ID | Contact | Priority | Next Touch | Next Action | Reason |
| --- | --- | --- | --- | --- | --- |
| NEAR-003 | Philipp Suarez | Medium | 2026-07-13 | Check for a reply; if none, send the single prepared follow-up | The follow-up remains pending and overdue; no reply or sent follow-up is recorded |
| NEAR-002 | David Mirzadeh | Medium | 2026-07-13 | Check acceptance; after acceptance, send a short routing intro | No confirmed status change is available for the pending invitation |
| NEAR-004 | Josh Ford | Medium | 2026-07-13 | Check invitation state and relevant posts | No confirmed status change is available for the pending invitation |
| NEAR-005 | Bowen Shen | Medium | 2026-07-13 | Check invitation state and relevant posts | No confirmed status change is available for the pending invitation |
| NEAR-006 | Alexander Scharrer | High | 2026-07-16 | Review recent activity and identify a natural engagement point | The invitation is accepted; continue relationship-first engagement without pitching |
| NEAR-013 | Matt Kummell | High | 2026-07-19 | Check whether the invitation was accepted | Review the new pending invitation within the current weekly review period |
| NEAR-014 | Danny Carpentier Balough | High | 2026-07-19 | Check whether the invitation was accepted | Review the new pending invitation within the current weekly review period |
| NEAR-015 | Dillon Freeman | High | 2026-07-19 | Check whether the invitation was accepted | Review the new pending invitation within the current weekly review period |
| NEAR-016 | Harshit Tiwari | High | 2026-07-19 | Check whether the invitation was accepted | Review the new pending invitation within the current weekly review period |
| NEAR-017 | Charlie Bussat | High | 2026-07-23 | Review recent activity and identify a natural engagement point | The invitation is accepted; continue relationship-first engagement without pitching |
| NEAR-001 | Joseph Beverley | High | 2026-07-20 | Check whether the invitation was accepted; do not message before acceptance | Wait for a response to the personalized invitation |
| NEAR-008 | David Norris | Medium | 2026-07-20 | Check whether the invitation was accepted; do not message before acceptance | Wait for a response to the personalized invitation |
| NEAR-009 | Abhishek Vaidyanathan | High | 2026-07-20 | Check whether the invitation was accepted | Strategic legal stakeholder for RWA, tokenized assets, compliance, and NEAR Foundation relationships |
| NEAR-010 | Bianca Guimaraes-Chadwick | High | 2026-07-20 | Check whether the invitation was accepted | NEAR Ecosystem legal stakeholder for RWA and compliance relationships |
| NEAR-011 | Vitalii Yevlakhov | High | 2026-07-23 | Review recent activity and identify a natural engagement point | The invitation is accepted; continue relationship-first engagement without pitching |

### Pending invitations

| Contact ID | Contact | Invitation Date | Next Touch |
| --- | --- | --- | --- |
| NEAR-002 | David Mirzadeh | 2026-06-25 | 2026-07-13 |
| NEAR-004 | Josh Ford | 2026-06-25 | 2026-07-13 |
| NEAR-005 | Bowen Shen | 2026-06-25 | 2026-07-13 |
| NEAR-007 | Taras Dovgal | 2026-06-25 | 2026-08-13 |
| NEAR-001 | Joseph Beverley | 2026-07-13 | 2026-07-20 |
| NEAR-008 | David Norris | 2026-07-13 | 2026-07-20 |
| NEAR-009 | Abhishek Vaidyanathan | 2026-07-13 | 2026-07-20 |
| NEAR-010 | Bianca Guimaraes-Chadwick | 2026-07-13 | 2026-07-20 |
| NEAR-013 | Matt Kummell | 2026-07-17 | 2026-07-19 |
| NEAR-014 | Danny Carpentier Balough | 2026-07-17 | 2026-07-19 |
| NEAR-015 | Dillon Freeman | 2026-07-17 | 2026-07-19 |
| NEAR-016 | Harshit Tiwari | 2026-07-18 | 2026-07-19 |
| NEAR-018 | Aminu Bin Ibrahim | 2026-07-20 | 2026-07-27 |
| NEAR-019 | Clemens Scherf | 2026-07-20 | 2026-07-27 |

### Outreach activity recorded this week

| Contact ID | Contact | Activity Date | Activity |
| --- | --- | --- | --- |
| NEAR-018 | Aminu Bin Ibrahim | 2026-07-20 | LinkedIn connection invitation sent; pending |
| NEAR-019 | Clemens Scherf | 2026-07-20 | LinkedIn connection invitation sent; pending |
| NEAR-012 | Iker Alustiza Beitia | 2026-07-20 | Iker initiated the conversation and recommended connecting with other NEAR builders and successful ecosystem projects; response sent |

### Newly connected contacts

| Contact ID | Contact | Connection Date | Current State | Next Touch |
| --- | --- | --- | --- | --- |
| NEAR-012 | Iker Alustiza Beitia | 2026-07-16 | Conversation started; response sent 2026-07-20 | 2026-07-27 |
| NEAR-011 | Vitalii Yevlakhov | 2026-07-20 | Invitation accepted; no message sent | 2026-07-23 |
| NEAR-017 | Charlie Bussat | 2026-07-20 | Invitation accepted; no message sent | 2026-07-23 |

### People needing follow-up

| Contact ID | Contact | Due Date | Follow-up State |
| --- | --- | --- | --- |
| NEAR-003 | Philipp Suarez | 2026-07-13 | Still pending and overdue from 2026-07-03; verify no reply before sending prepared follow-up |

### New opportunities

None recorded. A pending invitation or job title is not an opportunity without supporting
interaction evidence.

### Inactive contacts (>30 days)

None. The oldest recorded last interaction is 2026-06-25, 25 days before the snapshot date.

### Actions due this week or overdue

| Contact | Priority | Current status | Required action | Recommended date |
| --- | --- | --- | --- | --- |
| Philipp Suarez | Medium | Follow-up Required | Check for a reply; if none, send the single prepared follow-up | 2026-07-13 (overdue from 2026-07-03) |
| David Mirzadeh | Medium | Invitation Sent (Pending) | Check whether the invitation was accepted; update CRM before messaging | 2026-07-13 |
| Josh Ford | Medium | Invitation Sent (Pending) | Check invitation state and recent relevant posts | 2026-07-13 |
| Bowen Shen | Medium | Invitation Sent (Pending) | Check invitation state and recent relevant posts | 2026-07-13 |
| Alexander Scharrer | High | Connected | Review recent activity and identify a natural engagement point | 2026-07-16 |
| Matt Kummell | High | Invitation Sent (Pending) | Check whether the invitation was accepted | 2026-07-19 |
| Danny Carpentier Balough | High | Invitation Sent (Pending) | Check whether the invitation was accepted | 2026-07-19 |
| Dillon Freeman | High | Invitation Sent (Pending) | Check whether the invitation was accepted | 2026-07-19 |
| Harshit Tiwari | High | Invitation Sent (Pending) | Check whether the invitation was accepted | 2026-07-19 |
| Charlie Bussat | High | Connected | Review recent activity and identify a natural engagement point | 2026-07-23 |
| Joseph Beverley | High | Invitation Sent (Pending) | Check whether the invitation was accepted; do not message before acceptance | 2026-07-20 |
| David Norris | Medium | Invitation Sent (Pending) | Check whether the invitation was accepted; do not message before acceptance | 2026-07-20 |
| Abhishek Vaidyanathan | High | Invitation Sent (Pending) | Check whether the invitation was accepted | 2026-07-20 |
| Bianca Guimaraes-Chadwick | High | Invitation Sent (Pending) | Check whether the invitation was accepted | 2026-07-20 |
| Vitalii Yevlakhov | High | Connected | Review recent activity and identify a natural engagement point | 2026-07-23 |

### Active conversations

| Contact ID | Contact | Started | Current State | Next Touch |
| --- | --- | --- | --- | --- |
| NEAR-012 | Iker Alustiza Beitia | 2026-07-20 | Iker recommended connecting with other NEAR builders and successful ecosystem projects; response sent | 2026-07-27 |

### Partnership opportunities

None recorded. Do not infer an opportunity from a pending invitation.

### Grant opportunities

None recorded. Do not infer an opportunity from ecosystem relevance or a sent introduction.

### Investor opportunities

None recorded. Do not infer an investor opportunity from a finance or capital-markets role.

## Contact register

| Contact ID | Full Name | Organization | Position | LinkedIn URL | Country | Category | Priority | Relationship Score | Pipeline Stage | Status | Last Interaction | Next Touch Date | Next Action | Next Touch Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| NEAR-001 | Joseph Beverley | NEAR Foundation | Founder Success Manager | [LinkedIn](https://www.linkedin.com/in/joey-be/) | Unknown | NEAR | High | 5 | Invitation Sent | Invitation Sent (Pending) | Personalized invitation sent 2026-07-13 | 2026-07-20 | Check whether the invitation was accepted; do not message before acceptance | Wait for a response to the personalized invitation |
| NEAR-002 | David Mirzadeh | NEAR Foundation | Chief of Staff | [LinkedIn](https://www.linkedin.com/in/mirzdame/) | Unknown | NEAR | Medium | 5 | Invitation Sent | Invitation Sent (Pending) | Invitation sent 2026-06-25 | 2026-07-13 | Check acceptance; after acceptance, send a short routing intro | No confirmed status change is available for the pending invitation |
| NEAR-003 | Philipp Suarez | NEAR Foundation | Head of Finance | [LinkedIn](https://www.linkedin.com/in/philipp-suarez-83ab4593/) | Unknown | NEAR | Medium | 6 | Connected | Follow-up Required | Follow-up status verified 2026-07-13 | 2026-07-13 | Check for reply; if none, send the single prepared follow-up | The follow-up remains pending and overdue; no reply or sent follow-up is recorded |
| NEAR-004 | Josh Ford | NEAR Protocol | Senior Product Manager, DevX | [LinkedIn](https://www.linkedin.com/in/thisisjoshford) | Unknown | NEAR | Medium | 5 | Invitation Sent | Invitation Sent (Pending) | Invitation sent and followed 2026-06-25 | 2026-07-13 | Check acceptance and relevant posts; intro after acceptance | No confirmed status change is available for the pending invitation |
| NEAR-005 | Bowen Shen | Proximity Labs | Chief Chess Player | [LinkedIn](https://www.linkedin.com/in/bowen-shen-558479a0/) | Unknown | NEAR | Medium | 5 | Invitation Sent | Invitation Sent (Pending) | Invitation sent 2026-06-25 | 2026-07-13 | Check acceptance and relevant posts; send fit intro only after acceptance | No confirmed status change is available for the pending invitation |
| NEAR-006 | Alexander Scharrer | NEAR Foundation | Head of Capital Markets | Unknown (verification required) | Unknown | NEAR | High | 6 | Connected | Connected | Invitation accepted 2026-07-13 | 2026-07-16 | Review recent activity and identify a natural engagement point | Continue relationship-first engagement after the confirmed acceptance |
| NEAR-007 | Taras Dovgal | NoVPS (last observed; unverified) | Business Co-Founder (last observed; unverified) | [LinkedIn](https://www.linkedin.com/in/tarasdovgal/?locale=en) | Unknown | Other | Low | 5 | Invitation Sent | Invitation Sent (Pending) | Priority and relevance reviewed 2026-07-13 | 2026-08-13 | Reassess current ecosystem relevance before any follow-up | Current NEAR/RWA relevance remains uncertain; low priority is retained |
| NEAR-008 | David Norris | NEAR Foundation | CFO & CSO | [LinkedIn](https://ae.linkedin.com/in/davidnorrisaca) | Unknown | NEAR | Medium | 5 | Invitation Sent | Invitation Sent (Pending) | Personalized invitation sent 2026-07-13 | 2026-07-20 | Check whether the invitation was accepted; do not message before acceptance | Wait for a response to the personalized invitation |
| NEAR-009 | Abhishek Vaidyanathan | NEAR Foundation | Chief Legal Officer | [LinkedIn](https://www.linkedin.com/in/abhishek-vaidyanathan-10056528/) | Canada | NEAR | High | 5 | Invitation Sent | Invitation Sent (Pending) | LinkedIn invitation sent without a note 2026-07-13 | 2026-07-20 | Check whether the invitation was accepted | Strategic legal stakeholder for RWA, tokenized assets, compliance, and NEAR Foundation relationships |
| NEAR-010 | Bianca Guimaraes-Chadwick | NEAR Foundation | General Counsel | Unknown (not provided) | United Kingdom | NEAR | High | 5 | Invitation Sent | Invitation Sent (Pending) | LinkedIn invitation sent without a note 2026-07-13 | 2026-07-20 | Check whether the invitation was accepted | NEAR Ecosystem legal stakeholder for RWA and compliance relationships |
| NEAR-011 | Vitalii Yevlakhov | NEAR Foundation | Lead Business Development and Ecosystem in SEA Region | [LinkedIn](https://www.linkedin.com/in/vitalii-y-b72779106/) | Bangkok, Thailand | NEAR | High | 6 | Connected | Connected | LinkedIn invitation accepted 2026-07-20 | 2026-07-23 | Review recent activity and identify a natural engagement point | Continue relationship-first engagement after the confirmed acceptance; no message is recorded |
| NEAR-012 | Iker Alustiza Beitia | NEAR Foundation | Partner Engineer | [LinkedIn](https://www.linkedin.com/in/iker-alustiza-beitia-68803a2b/) | Spain | NEAR | High | 7 | Conversation | Conversation Started | Iker initiated the conversation and recommended connecting with other NEAR builders and successful ecosystem projects; response sent 2026-07-20 | 2026-07-27 | Check whether Iker shared any specific builder or project recommendations | Continue ecosystem outreach independently while leaving space for specific recommendations from Iker |
| NEAR-013 | Matt Kummell | NEAR Foundation / S&P Global | Advisor at NEAR Foundation; Head of Business Acceleration & Special Projects at S&P Global | [LinkedIn](https://www.linkedin.com/in/kummell/) | Unknown | NEAR | High | 5 | Invitation Sent | Invitation Sent (Pending) | LinkedIn connection invitation sent 2026-07-17 | 2026-07-19 | Check whether the invitation was accepted | Review the new pending invitation within the current weekly review period |
| NEAR-014 | Danny Carpentier Balough | NEAR Foundation | Director, Product Marketing and GTM Strategy | [LinkedIn](https://www.linkedin.com/in/danny-carpentier-balough/) | Unknown | NEAR | High | 5 | Invitation Sent | Invitation Sent (Pending) | LinkedIn connection invitation sent 2026-07-17 | 2026-07-19 | Check whether the invitation was accepted | Review the new pending invitation within the current weekly review period |
| NEAR-015 | Dillon Freeman | NEAR Foundation | Partnerships | [LinkedIn](https://www.linkedin.com/in/dillonfreeman1/) | Unknown | NEAR | High | 5 | Invitation Sent | Invitation Sent (Pending) | LinkedIn connection invitation sent 2026-07-17 | 2026-07-19 | Check whether the invitation was accepted | Review the new pending invitation within the current weekly review period |
| NEAR-016 | Harshit Tiwari | NEAR Foundation | Vice President of Growth | [LinkedIn](https://www.linkedin.com/in/harshit-tiwari-is-near/) | Unknown | NEAR | High | 5 | Invitation Sent | Invitation Sent (Pending) | LinkedIn connection invitation sent 2026-07-18 | 2026-07-19 | Check whether the invitation was accepted | Review the new pending invitation within the current weekly review period |
| NEAR-017 | Charlie Bussat | NEAR Foundation / near.com | Head of Marketing | [LinkedIn](https://www.linkedin.com/in/charliebussat/) | Unknown | NEAR | High | 6 | Connected | Connected | LinkedIn invitation accepted 2026-07-20 | 2026-07-23 | Review recent activity and identify a natural engagement point | Continue relationship-first engagement after the confirmed acceptance; no message is recorded |
| NEAR-018 | Aminu Bin Ibrahim | Startbench Limited | Managing Director; Economist; Web3 & AI; Enterprise Solutions Architect | [LinkedIn](https://www.linkedin.com/in/aminubi/) | Unknown | NEAR | A+ | 5 | Invitation Sent | Invitation Sent (Pending) | LinkedIn connection invitation sent 2026-07-20 | 2026-07-27 | Check whether the invitation was accepted; do not message before acceptance | Build a relationship around former NEAR grant technical review and early-stage Web3 mentorship without making a funding request |
| NEAR-019 | Clemens Scherf | Coinbase | Growth Lead, Western Europe and UK | [LinkedIn](https://www.linkedin.com/in/clemens-scherf/) | Unknown | NEAR | A+ | 5 | Invitation Sent | Invitation Sent (Pending) | LinkedIn connection invitation sent 2026-07-20 | 2026-07-27 | Check whether the invitation was accepted; do not message before acceptance | Build a relationship around former NEAR ecosystem relations and venture building plus current European Web3 growth experience without making a funding request |

## Interaction history

### Joseph Beverley

- **2026-06-25 — New contact identified / profile reviewed:** Verified as Founder Success Manager at
  NEAR Foundation through LinkedIn and NEAR ecosystem sources. Added as a high-priority Founder
  Success routing contact.
- **2026-06-25 — Followed:** Followed on LinkedIn. No message or reply recorded.
- **2026-07-13 — Connection request sent:** Personalized LinkedIn invitation sent. No acceptance
  or reply is recorded.

Next action: Check whether the invitation was accepted. Do not message before acceptance.
Recommended date: **2026-07-20**.

### David Mirzadeh

- **2026-06-25 — New contact identified / profile reviewed:** Verified as Chief of Staff at NEAR
  Foundation. Classified as a routing contact.
- **2026-06-25 — Connection request sent:** LinkedIn invitation sent. No acceptance or reply is
  recorded.

Next action: Check whether the invitation was accepted. If accepted, update the CRM first and send
a short routing-oriented introduction. No confirmed status change is available. Recommended date:
**2026-07-13**.

### Philipp Suarez

- **2026-06-25 — New contact identified / profile reviewed:** LinkedIn screenshot verified Head of
  Finance at NEAR Foundation.
- **2026-06-25 — Connected:** Existing LinkedIn connection recorded as accepted.
- **2026-06-29 18:51 — Message sent:** Introductory LinkedIn message sent. No reply is recorded.
- **2026-07-03 — Status changed:** Follow-up became due because no reply was recorded by the planned
  date. The follow-up itself is not recorded as sent.
- **2026-07-13 — Follow-up status verified:** The connection and previously sent intro remain
  confirmed. No reply or sent follow-up is recorded, so the follow-up is still pending.

Next action: Check the conversation for a reply. If there is none, send the single prepared
follow-up below and immediately record it. Recommended date: **2026-07-13**.

Prepared follow-up:

> Hi Philipp,
>
> Just following up on my message. We've prepared a public AgriPartners demo, including
> model-specific investor protection and transparent farmer payment schedules:
>
> [AgriPartners public demo](https://frontend-omega-woad-90.vercel.app)
>
> Would you be open to a brief 15-minute introduction next week?
>
> Best, Farhod

After sending, do not send another follow-up for at least seven days.

### Josh Ford

- **2026-06-25 — New contact identified / profile reviewed:** Verified as Senior Product Manager,
  DevX at NEAR Protocol and marked as a developer-experience feedback contact.
- **2026-06-25 — Followed:** Followed on LinkedIn.
- **2026-06-25 — Connection request sent:** LinkedIn invitation sent. No acceptance or reply is
  recorded.

Next action: Check invitation state and recent relevant posts. If accepted, update the CRM before
sending a DevX/product-feedback introduction. No confirmed status change is available.
Recommended date: **2026-07-13**.

### Bowen Shen

- **2026-06-25 — New contact identified / profile reviewed:** Verified as Chief Chess Player at
  Proximity Labs and identified as relevant to NEAR ecosystem and DeFi/RWA fit.
- **2026-06-25 — Connection request sent:** LinkedIn invitation sent. No acceptance or reply is
  recorded.

Next action: Check invitation state and recent relevant posts. Send a short DeFi/RWA fit message
only after acceptance. No confirmed status change is available. Recommended date:
**2026-07-13**.

### Alexander Scharrer

- **2026-07-03 — New contact identified / profile reviewed:** Recorded as Head of Capital Markets at
  NEAR Foundation. The canonical LinkedIn URL was not preserved and still requires verification.
- **2026-07-03 — Connection request sent:** Personalized LinkedIn invitation sent; no acceptance or
  reply is recorded. Invitation note: "Hi Alexander, I'm building AgriPartners, an RWA agriculture
  platform on NEAR. I'd be glad to connect and exchange ideas around tokenized real-world assets."
- **2026-07-13 — Connected:** LinkedIn invitation acceptance confirmed. No message or reply after
  acceptance is recorded.

Next action: Review recent activity and identify a natural engagement point. Do not pitch
immediately after acceptance. Recommended date: **2026-07-16**.

### Taras Dovgal

- **2026-06-25 — New contact identified / profile reviewed:** Historical record retained. The
  profile was observed as Business Co-Founder at NoVPS, creating uncertainty about current NEAR/RWA
  relevance.
- **2026-06-25 — Connection request sent:** Historical invitation recorded. No acceptance or reply
  is recorded.
- **2026-06-25 — Status reviewed:** Marked as requiring relevance verification before any further
  outreach.
- **2026-07-13 — Priority and relevance reviewed:** Low priority is retained. Current NEAR/RWA
  relevance and invitation acceptance remain unconfirmed; no follow-up is authorized.

Next action: Reassess current role, relevance, and invitation state. Do not send a follow-up unless
relevance is confirmed. Recommended date: **2026-08-13**.

### David Norris

- **2026-06-25 — Profile verified outside the active CRM:** Near Directory recorded David Norris
  as CFO & CSO at NEAR Foundation and relevant to financial-model, treasury-transparency, and
  sustainability framing. This verification record predates his permanent CRM entry.
- **2026-07-13 — Added to canonical CRM:** Assigned permanent Contact ID `NEAR-008`; the prior Near
  Directory identity and relevance record remains intact.
- **2026-07-13 — Connection request sent:** Personalized LinkedIn invitation sent. No acceptance or
  reply is recorded.

Next action: Check whether the invitation was accepted. Do not message before acceptance.
Recommended date: **2026-07-20**.

### Abhishek Vaidyanathan

- **2026-07-13 — Added to canonical CRM:** Assigned permanent Contact ID `NEAR-009`. Confirmed
  identity details recorded as Chief Legal Officer at NEAR Foundation, located in Toronto,
  Ontario, Canada. No profile-review action is inferred or recorded.
- **2026-07-13 — Connection request sent without a note:** A standard LinkedIn invitation was sent
  without a personalized note because the monthly LinkedIn limit for personalized invitations
  was exhausted. LinkedIn displayed “Invitation sent to Abhishek.” Current LinkedIn status is
  Pending. No acceptance or reply is recorded.

Next action: Check whether the invitation was accepted. Recommended date: **2026-07-20**. This
contact is a strategic legal stakeholder for RWA, tokenized assets, compliance, and NEAR Foundation
relationships.

### Bianca Guimaraes-Chadwick

- **2026-07-13 — Added to canonical CRM:** Assigned permanent Contact ID `NEAR-010`. Confirmed
  identity details recorded as General Counsel at NEAR Foundation, located in the United Kingdom.
  No profile-review action is inferred or recorded. LinkedIn URL was not provided.
- **2026-07-13 — Connection request sent without a note:** A LinkedIn connection invitation was
  sent without a personalized note because the monthly LinkedIn custom invitation limit had
  already been reached. Current LinkedIn status is Pending. No acceptance or reply is recorded.

Next action: Check whether the invitation was accepted. Recommended date: **2026-07-20**. Track:
NEAR Ecosystem / Legal / RWA / Compliance.

<!-- markdownlint-disable-next-line MD026 -->
### Vitalii Yevlakhov

- **2026-07-16 — Profile reviewed in detail:** Verified as Lead Business Development and Ecosystem
  in SEA Region at NEAR Foundation, located in Bangkok, Thailand. Strategic relevance includes
  NEAR ecosystem navigation, business development, ecosystem partnerships, APAC/SEA growth,
  regional introductions, and potential grant direction. Experience relevant to this assessment
  includes NEAR Intents, HOT Wallet, institutional business development, and ecosystem scaling.
- **2026-07-16 — Connection request sent:** LinkedIn invitation sent through the standard
  connection flow without a personalized note.
- **2026-07-16 — Invitation state confirmed:** Invitation is Pending. No acceptance, message, or
  response is recorded.
- **2026-07-20 — Connected:** LinkedIn invitation acceptance confirmed. No message, reply,
  conversation, opportunity, introduction, or meeting is recorded.

Next action: Review recent activity and identify a natural engagement point. Recommended date:
**2026-07-23**. Continue relationship-first engagement without pitching.

### Iker Alustiza Beitia

- **2026-07-16 — Profile reviewed:** Verified as Partner Engineer at NEAR Foundation in Spain.
  Relevant to technical partnerships, partner engineering, infrastructure success, ecosystem
  integration, technical navigation, integration guidance, and product-fit feedback for the
  AgriPartners Alpha prototype on NEAR Testnet.
- **2026-07-16 — Connection request sent:** LinkedIn invitation sent.
- **2026-07-16 — Connected:** Invitation accepted on the same date.
- **2026-07-16 — First introduction message sent:** Message sent; no response is recorded.
- **2026-07-20 — Conversation Started:** Iker initiated the conversation and recommended
  connecting with other NEAR builders and successful ecosystem projects. Response sent.

Exact first message:

> Hi Iker,
>
> Thank you for connecting.
>
> I'm building AgriPartners, a blockchain-based investment platform for agricultural projects
> using NEAR.
>
> We've already completed an Alpha prototype on NEAR Testnet and are now preparing for ecosystem
> partnerships and grant opportunities.
>
> I'd be happy to stay connected and learn more about the NEAR ecosystem.
>
> Best regards,
> Farhod

Next action: Check whether Iker shared any specific builder or project recommendations.
Recommended date: **2026-07-27**. Continue ecosystem outreach independently while leaving space
for specific recommendations from Iker. Do not infer a partnership opportunity, grant opportunity,
offered introduction, or meeting without new evidence.

### Matt Kummell

- **2026-07-17 — Added to canonical CRM / profile reviewed:** Assigned permanent Contact ID
  `NEAR-013`. Current roles recorded as Advisor at NEAR Foundation and Head of Business
  Acceleration & Special Projects at S&P Global; previous NEAR role was Chief Commercial Officer.
  Relevant areas are Commercial Strategy / Partnerships / RWA / Institutional Finance. Former
  NEAR Foundation CCO, currently Advisor. Relevant to RWA, TradFi/DeFi, commercial strategy, and
  institutional partnerships. Mutual connection: Alexander Scharrer.
- **2026-07-17 — Connection request sent:** LinkedIn connection invitation sent. Current status is
  Pending. No acceptance, message, or response is recorded.

Next action: Check whether the invitation was accepted. Recommended date: **2026-07-19**.

### Danny Carpentier Balough

- **2026-07-17 — Added to canonical CRM / profile reviewed:** Assigned permanent Contact ID
  `NEAR-014`. Verified as Director, Product Marketing and GTM Strategy at NEAR Foundation.
  Relevant areas are GTM / Product Marketing / Enterprise / Government / Ecosystem Growth. Current
  NEAR Foundation employee who defines GTM strategy for consumer, enterprise, and government
  markets. Active in NEAR Protocol and NEAR AI communications. Mutual connection: Alexander
  Scharrer.
- **2026-07-17 — Connection request sent:** LinkedIn connection invitation sent. Current status is
  Pending. No acceptance, message, or response is recorded.

Next action: Check whether the invitation was accepted. Recommended date: **2026-07-19**.

### Dillon Freeman

- **2026-07-17 — Added to canonical CRM / profile reviewed:** Assigned permanent Contact ID
  `NEAR-015`. LinkedIn display name is Dillon F. Verified in Partnerships at NEAR Foundation.
  Relevant areas are Partnerships / Ecosystem / Integrations / Pilot Opportunities. Directly
  relevant to AgriPartners because he works in Partnerships at NEAR Foundation. Mutual connections
  include Vitalii, Iker, and at least one other contact.
- **2026-07-17 — Connection request sent:** LinkedIn connection invitation sent. Current status is
  Pending. No acceptance, message, or response is recorded.

Next action: Check whether the invitation was accepted. Recommended date: **2026-07-19**.

### Harshit Tiwari

- **2026-07-18 — Added to canonical CRM / profile reviewed:** Assigned permanent Contact ID
  `NEAR-016`. Verified as Vice President of Growth at NEAR Foundation, responsible for growth and
  distribution across core offerings including NEAR Intents and Smart Accounts. Previous NEAR
  Foundation roles include Head of Ecosystem Strategy and Senior Web3 BD Lead. Relevant areas are
  Growth / Ecosystem Strategy / Distribution / Business Development / GTM. Mutual connection:
  Alexander Scharrer. LinkedIn also shows Philipp Suarez and other NEAR Foundation contacts as
  possible introduction paths.
- **2026-07-18 — Connection request sent:** LinkedIn connection invitation sent. Current status is
  Pending. No acceptance, message, or response is recorded.

Next action: Check whether the invitation was accepted. Recommended date: **2026-07-19**.

### Charlie Bussat

- **2026-07-18 — Added to canonical CRM / profile reviewed:** Assigned permanent Contact ID
  `NEAR-017`. Verified as Head of Marketing at NEAR Foundation, focused on near.com and Web3
  go-to-market; public LinkedIn headline is Head of Marketing & Growth at near.com. Relevant areas
  are Marketing / Growth / Web3 GTM / DeFi / Cross-chain / Ecosystem Promotion. Experience includes
  blockchain marketing, DeFi, cross-chain products, community initiatives, and partner growth.
  Mutual connection: Alexander Scharrer.
- **2026-07-18 — Connection request sent:** LinkedIn connection invitation sent. Current status is
  Pending. No acceptance, message, or response is recorded.
- **2026-07-20 — Connected:** LinkedIn invitation acceptance confirmed. No message, reply,
  conversation, opportunity, introduction, or meeting is recorded.

Next action: Review recent activity and identify a natural engagement point. Recommended date:
**2026-07-23**. Continue relationship-first engagement without pitching.

### Aminu Bin Ibrahim

- **2026-07-20 — Added to canonical CRM / profile reviewed:** Assigned permanent Contact ID
  `NEAR-018`. Current role is Managing Director at Startbench Limited, with additional positioning
  as Economist, Web3 & AI professional, and Enterprise Solutions Architect. Former Grant Program
  Technical Reviewer at NEAR Foundation from 2022-01 through 2025-05. Contact category: Grants /
  Technical Review / Startup Mentorship. Priority: A+. Strategically relevant because he evaluated
  grant applications and interviewed projects, making his experience valuable for understanding
  grant readiness, technical-review expectations, documentation quality, and common reasons
  projects succeed or fail in grant pipelines.
- **2026-07-20 — Connection request sent:** LinkedIn connection invitation sent. Current status is
  Pending. No acceptance, message, conversation, or response is recorded.

Next action: Check whether the invitation was accepted. Recommended date: **2026-07-27**. If
accepted, build the relationship around his experience reviewing NEAR grants and supporting
early-stage Web3 projects; do not begin with a funding request.

### Clemens Scherf

- **2026-07-20 — Added to canonical CRM / profile reviewed:** Assigned permanent Contact ID
  `NEAR-019`. Current role is Growth Lead, Western Europe and UK, at Coinbase. Previous roles
  include Venture Builder at NEAR Protocol and Ecosystem Relations at NEAR Foundation. Contact
  category: Ecosystem / Growth / Partnerships. Priority: A+. Strategically relevant for NEAR
  ecosystem navigation, partnerships, market expansion, Web3 positioning, and strategic
  introductions, combining former NEAR ecosystem-relations and venture-building experience with
  current responsibility for scaling Web3 adoption in Europe.
- **2026-07-20 — Connection request sent:** LinkedIn connection invitation sent. Current status is
  Pending. No acceptance, message, conversation, or response is recorded.

Next action: Check whether the invitation was accepted. Recommended date: **2026-07-27**. If
accepted, build the relationship around his NEAR ecosystem background and current European Web3
growth experience; do not begin with a funding request.

## Legacy Outreach History (Read-only)

This section preserves the complete pre-migration Outreach CRM structure and wording from the last
committed version. It is a read-only historical reference and must not be used as a second active
CRM. The dashboard, contact register, pipeline, and interaction history above are the canonical
current records.

### Legacy purpose and data ownership

This file tracks active founder outreach activity for AgriPartners Alpha v1.2.

Outreach CRM is a working pipeline. It records outreach status, dates, responses, next actions, and follow-ups. It does not store profile data that already belongs in Near Directory.

Use `docs/outreach/near-directory/` as the canonical source for verified contact information, including organization, role, LinkedIn, source links, relevance, and Tier.

### Legacy Workflow Rule

Never add a contact directly to Outreach CRM.

Every contact must first be verified and added to Near Directory.

Workflow:

```text
Discover Contact
        ↓
Verify Contact
        ↓
Add to Near Directory
        ↓
Assign Tier
        ↓
Begin Outreach
        ↓
Track in Outreach CRM
```

### Legacy CRM Fields

- **Contact Name:** Person being contacted.
- **Directory Reference:** Link to the Near Directory file and section for the verified contact.
- **Outreach Status:** Current outreach pipeline state.
- **Date Added:** Date the person entered Outreach CRM.
- **Last Contact:** Most recent outreach action or `No contact yet`.
- **Last Response:** Most recent reply or `No response yet`.
- **Next Action:** Immediate next action.
- **Notes:** Operational notes only. Keep profile facts in Near Directory.

### Legacy Outreach Status Values

- Not Contacted
- Following
- Connected
- Conversation
- Feedback
- Meeting
- Partner

### Previous Active Outreach Pipeline

| Contact | Directory Reference | Outreach Status | Date Added | Last Contact | Last Response | Next Action | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Joseph Beverley | [founder-success.md#joseph-beverley](near-directory/founder-success.md#joseph-beverley) | Following | 2026-06-25 | 2026-06-25 | No response yet | Monitor posts and engage | Followed on LinkedIn. Tier 1 Founder Success entry point; use Near Directory for role and source details. |
| David Mirzadeh | [near-foundation.md#david-mirzadeh](near-directory/near-foundation.md#david-mirzadeh) | Following | 2026-06-25 | Invite sent on 2026-06-25 | No response yet | Send short intro after acceptance | Existing outreach activity retained as operational record; full profile details live in Near Directory. |
| Philipp Suarez | [near-foundation.md#philipp-suarez](near-directory/near-foundation.md#philipp-suarez) | Intro sent | 2026-06-25 | LinkedIn intro sent on 2026-06-29 at 18:51 | No response yet | If there is no response, send one follow-up on 2026-07-03 | Connection accepted. Finance-track contact. Do not send another message before the follow-up date. Full profile details live in Near Directory. |
| Josh Ford | [near-foundation.md#josh-ford](near-directory/near-foundation.md#josh-ford) | Following | 2026-06-25 | Invite sent and followed on 2026-06-25 | No response yet | Monitor posts and engage; send DevX/product feedback intro after acceptance | Tier 2 DevX/Product contact. Full profile details live in Near Directory. |
| Bowen Shen | [proximity-labs.md#bowen-shen](near-directory/proximity-labs.md#bowen-shen) | Following | 2026-06-25 | Invite sent on 2026-06-25 | No response yet | Monitor posts and engage; send DeFi/RWA fit intro after acceptance | Proximity Labs contact. Full profile details live in Near Directory. |
| Alexander Scharrer | Pending Near Directory entry | Following | 2026-07-03 | Personalized LinkedIn connection request sent on 2026-07-03; invitation pending | No response yet | Wait for connection acceptance; if accepted, do not pitch immediately—monitor posts and engage naturally | NEAR Foundation, Head of Capital Markets. Category: NEAR Foundation / Capital Markets. Priority: P1 / High. Strategic goal: Company Funding / Capital Markets / RWA positioning. Invitation note: "Hi Alexander, I'm building AgriPartners, an RWA agriculture platform on NEAR. I'd be glad to connect and exchange ideas around tokenized real-world assets." |

#### Legacy Prepared Follow-up — Philipp Suarez

Send only if there is no response by **2026-07-03**:

> Hi Philipp,
>
> Just following up on my message. We’ve prepared a public AgriPartners demo, including model-specific investor protection and transparent farmer payment schedules:
>
> [AgriPartners public demo](https://frontend-omega-woad-90.vercel.app)
>
> Would you be open to a brief 15-minute introduction next week?
>
> Best, Farhod

After sending, update `Last Contact`, keep `Last Response` factual, and do not send another follow-up during the following seven days.

### Legacy Backfill Required

The following historical CRM entries are not active Outreach CRM records under the new architecture because they are not yet verified in Near Directory.

Do not continue outreach until each person is verified, added to Near Directory, assigned a Tier, and then re-added here as an operational CRM record.

| Contact | Previous CRM State | Required Action | Notes |
| :--- | :--- | :--- | :--- |
| [Taras Dovgal](https://www.linkedin.com/in/tarasdovgal/?locale=en) | Invite sent on 2026-06-25 | Verify current ecosystem relevance before next follow-up | Screenshot shows current profile as Business Co-Founder @ NoVPS, so keep out of active CRM until relevance is confirmed. |

Other unverified historical candidates are tracked only in `near-directory/verification-log.md` and `near-directory/SUMMARY.md`.

### Legacy Follow-Up Template

```text
Hi [Name], just following up in case this is relevant. I am building AgriPartners, an Alpha v1.2 platform on NEAR Testnet for transparent agricultural investment workflows. I would value a short feedback conversation if this connects with your work.
```

## Reconciliation checklist

- [x] All known contacts with recorded outreach interactions are included.
- [x] Every tracked contact has one current relationship status.
- [x] Every tracked contact has a next action and recommended date.
- [x] Every tracked contact has one permanent Contact ID.
- [x] Every tracked contact has a Relationship Score from 0 through 10.
- [x] Every tracked contact belongs to exactly one Pipeline Stage.
- [x] Every tracked contact has a Next Touch Date, Next Action, and Next Touch Reason.
- [x] Dashboard counters reconcile to the nineteen contact-register records.
- [x] Weekly review lists reconcile to the snapshot date and recorded next-touch dates.
- [x] Historical interactions from the prior operational CRM are retained.
- [x] The complete pre-migration CRM structure and wording are retained as read-only history.
- [x] Pending invitations, active conversations, partnership opportunities, and investor
  opportunities are explicitly summarized.
- [x] Reconcile the confirmed 2026-07-13 LinkedIn outreach state without inferring responses.
- [x] Record the verified 2026-07-16 activity for Vitalii Yevlakhov and Iker Alustiza Beitia without
  inferring responses or opportunities.
- [x] Record the 2026-07-17 LinkedIn invitations for Matt Kummell, Danny Carpentier Balough, and
  Dillon Freeman without inferring acceptances, responses, or opportunities.
- [x] Record the 2026-07-18 LinkedIn invitations for Harshit Tiwari and Charlie Bussat without
  inferring acceptances, responses, or opportunities.
- [x] Record the 2026-07-20 LinkedIn invitations for Aminu Bin Ibrahim and Clemens Scherf without
  inferring acceptances, messages, responses, conversations, or opportunities.
- [x] Record the confirmed 2026-07-20 invitation acceptances for Vitalii Yevlakhov and Charlie
  Bussat without inferring messages, responses, conversations, or opportunities.
- [ ] Check the still-pending invitation states for David Mirzadeh, Josh Ford, and Bowen Shen.
- [ ] Verify Alexander Scharrer's canonical LinkedIn URL.
