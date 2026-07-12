# AgriPartners Relationship CRM

Last reconciled: 2026-07-12 (Asia/Tashkent)

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

Priorities: `High`, `Medium`, `Low`.

Relationship statuses:

- `Research`
- `Following`
- `Posts Liked`
- `Commented`
- `Invitation Sent (Pending)`
- `Connected`
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
- The next new contact must receive **`NEAR-008`**.
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

Snapshot date: 2026-07-12. Counts reflect the last recorded evidence and must be reconciled against
LinkedIn before any new action.

| Metric | Count |
| --- | ---: |
| Total Contacts | 7 |
| Research | 0 |
| Following | 1 |
| Liked Posts | 0 |
| Commented | 0 |
| Invitation Pending | 5 |
| Connected | 1 |
| Conversations | 0 |
| Warm Relationships | 0 |
| Meetings | 0 |
| Partnerships | 0 |
| Investor Opportunities | 0 |
| Partnership Opportunities | 0 |
| Contacts requiring action this week | 6 |
| Overdue Follow-ups | 1 |

### Contacts grouped by status

| Status | Count | Contacts |
| --- | ---: | --- |
| Following | 1 | Joseph Beverley |
| Invitation Sent (Pending) | 5 | David Mirzadeh; Josh Ford; Bowen Shen; Alexander Scharrer; Taras Dovgal |
| Follow-up Required | 1 | Philipp Suarez |

### Contacts grouped by pipeline stage

| Pipeline Stage | Count | Contact IDs | Contacts |
| --- | ---: | --- | --- |
| Following | 1 | NEAR-001 | Joseph Beverley |
| Invitation Sent | 5 | NEAR-002; NEAR-004; NEAR-005; NEAR-006; NEAR-007 | David Mirzadeh; Josh Ford; Bowen Shen; Alexander Scharrer; Taras Dovgal |
| Connected | 1 | NEAR-003 | Philipp Suarez |

## Weekly Business Development Review

Review period: **2026-07-06 through 2026-07-12** (Asia/Tashkent).

### Contacts requiring action

| Contact ID | Contact | Priority | Next Touch | Next Action | Reason |
| --- | --- | --- | --- | --- | --- |
| NEAR-003 | Philipp Suarez | Medium | 2026-07-03 (overdue) | Check for a reply; if none, send the single prepared follow-up | The planned follow-up date passed without a recorded reply or follow-up |
| NEAR-002 | David Mirzadeh | Medium | 2026-07-12 | Check acceptance; after acceptance, send a short routing intro | Confirm whether the pending invitation has changed state |
| NEAR-004 | Josh Ford | Medium | 2026-07-12 | Check invitation state and relevant posts | Confirm acceptance and identify an authentic DevX engagement point |
| NEAR-005 | Bowen Shen | Medium | 2026-07-12 | Check invitation state and relevant posts | Confirm acceptance before any DeFi/RWA fit introduction |
| NEAR-006 | Alexander Scharrer | High | 2026-07-12 | Verify LinkedIn URL/profile and check invitation state | Complete missing profile data and reconcile the pending invitation |
| NEAR-007 | Taras Dovgal | Low | 2026-07-12 | Verify relevance and invitation state; do not follow up until verified | Current NEAR/RWA relevance is uncertain |

### Pending invitations

| Contact ID | Contact | Invitation Date | Next Touch |
| --- | --- | --- | --- |
| NEAR-002 | David Mirzadeh | 2026-06-25 | 2026-07-12 |
| NEAR-004 | Josh Ford | 2026-06-25 | 2026-07-12 |
| NEAR-005 | Bowen Shen | 2026-06-25 | 2026-07-12 |
| NEAR-006 | Alexander Scharrer | 2026-07-03 | 2026-07-12 |
| NEAR-007 | Taras Dovgal | 2026-06-25 | 2026-07-12 |

### People needing follow-up

| Contact ID | Contact | Due Date | Follow-up State |
| --- | --- | --- | --- |
| NEAR-003 | Philipp Suarez | 2026-07-03 | Overdue; verify no reply before sending prepared follow-up |

### New opportunities

None recorded. A pending invitation or job title is not an opportunity without supporting
interaction evidence.

### Inactive contacts (>30 days)

None. The oldest recorded last interaction is 2026-06-25, 17 days before the snapshot date.

### Actions due or overdue

| Contact | Priority | Current status | Required action | Recommended date |
| --- | --- | --- | --- | --- |
| Philipp Suarez | Medium | Follow-up Required | Check for a reply; if none, send the single prepared follow-up | 2026-07-12 (overdue from 2026-07-03) |
| David Mirzadeh | Medium | Invitation Sent (Pending) | Check whether the invitation was accepted; update CRM before messaging | 2026-07-12 |
| Josh Ford | Medium | Invitation Sent (Pending) | Check invitation state and recent relevant posts | 2026-07-12 |
| Bowen Shen | Medium | Invitation Sent (Pending) | Check invitation state and recent relevant posts | 2026-07-12 |
| Alexander Scharrer | High | Invitation Sent (Pending) | Verify LinkedIn URL/profile and check invitation state | 2026-07-12 |
| Taras Dovgal | Low | Invitation Sent (Pending) | Verify current relevance and invitation state; do not follow up until verified | 2026-07-12 |

### Active conversations

None recorded.

### Partnership opportunities

None recorded. Do not infer an opportunity from a pending invitation.

### Investor opportunities

None recorded. Do not infer an investor opportunity from a finance or capital-markets role.

## Contact register

| Contact ID | Full Name | Organization | Position | LinkedIn URL | Country | Category | Priority | Relationship Score | Pipeline Stage | Status | Last Interaction | Next Touch Date | Next Action | Next Touch Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| NEAR-001 | Joseph Beverley | NEAR Foundation | Founder Success Manager | [LinkedIn](https://www.linkedin.com/in/joey-be/) | Unknown | NEAR | High | 2 | Following | Following | Followed on 2026-06-25 | 2026-07-14 | Review profile/posts and engage only when relevant | Maintain a relevant, authentic Founder Success relationship |
| NEAR-002 | David Mirzadeh | NEAR Foundation | Chief of Staff | [LinkedIn](https://www.linkedin.com/in/mirzdame/) | Unknown | NEAR | Medium | 5 | Invitation Sent | Invitation Sent (Pending) | Invitation sent 2026-06-25 | 2026-07-12 | Check acceptance; after acceptance, send a short routing intro | Confirm whether the pending invitation has changed state |
| NEAR-003 | Philipp Suarez | NEAR Foundation | Head of Finance | [LinkedIn](https://www.linkedin.com/in/philipp-suarez-83ab4593/) | Unknown | NEAR | Medium | 6 | Connected | Follow-up Required | Intro sent 2026-06-29 | 2026-07-03 | Check for reply; if none, send the single prepared follow-up | The planned follow-up is overdue and no reply is recorded |
| NEAR-004 | Josh Ford | NEAR Protocol | Senior Product Manager, DevX | [LinkedIn](https://www.linkedin.com/in/thisisjoshford) | Unknown | NEAR | Medium | 5 | Invitation Sent | Invitation Sent (Pending) | Invitation sent and followed 2026-06-25 | 2026-07-12 | Check acceptance and relevant posts; intro after acceptance | Confirm acceptance and identify an authentic DevX engagement point |
| NEAR-005 | Bowen Shen | Proximity Labs | Chief Chess Player | [LinkedIn](https://www.linkedin.com/in/bowen-shen-558479a0/) | Unknown | NEAR | Medium | 5 | Invitation Sent | Invitation Sent (Pending) | Invitation sent 2026-06-25 | 2026-07-12 | Check acceptance and relevant posts; send fit intro only after acceptance | Confirm acceptance before any DeFi/RWA fit introduction |
| NEAR-006 | Alexander Scharrer | NEAR Foundation | Head of Capital Markets | Unknown (verification required) | Unknown | NEAR | High | 5 | Invitation Sent | Invitation Sent (Pending) | Personalized invitation sent 2026-07-03 | 2026-07-12 | Verify profile URL and acceptance; do not pitch immediately after acceptance | Complete missing profile data and reconcile the invitation state |
| NEAR-007 | Taras Dovgal | NoVPS (last observed; unverified) | Business Co-Founder (last observed; unverified) | [LinkedIn](https://www.linkedin.com/in/tarasdovgal/?locale=en) | Unknown | Other | Low | 5 | Invitation Sent | Invitation Sent (Pending) | Historical invitation sent 2026-06-25 | 2026-07-12 | Verify current ecosystem relevance and invitation state before any follow-up | Current NEAR/RWA relevance is uncertain |

## Interaction history

### Joseph Beverley

- **2026-06-25 — New contact identified / profile reviewed:** Verified as Founder Success Manager at
  NEAR Foundation through LinkedIn and NEAR ecosystem sources. Added as a high-priority Founder
  Success routing contact.
- **2026-06-25 — Followed:** Followed on LinkedIn. No message or reply recorded.

Next action: Review the profile and recent posts; engage only when there is a relevant, authentic
reason. Recommended date: **2026-07-14**.

### David Mirzadeh

- **2026-06-25 — New contact identified / profile reviewed:** Verified as Chief of Staff at NEAR
  Foundation. Classified as a routing contact.
- **2026-06-25 — Connection request sent:** LinkedIn invitation sent. No acceptance or reply is
  recorded.

Next action: Check whether the invitation was accepted. If accepted, update the CRM first and send
a short routing-oriented introduction. Recommended date: **2026-07-12**.

### Philipp Suarez

- **2026-06-25 — New contact identified / profile reviewed:** LinkedIn screenshot verified Head of
  Finance at NEAR Foundation.
- **2026-06-25 — Connected:** Existing LinkedIn connection recorded as accepted.
- **2026-06-29 18:51 — Message sent:** Introductory LinkedIn message sent. No reply is recorded.
- **2026-07-03 — Status changed:** Follow-up became due because no reply was recorded by the planned
  date. The follow-up itself is not recorded as sent.

Next action: Check the conversation for a reply. If there is none, send the single prepared
follow-up below and immediately record it. Recommended date: **2026-07-12**.

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
sending a DevX/product-feedback introduction. Recommended date: **2026-07-12**.

### Bowen Shen

- **2026-06-25 — New contact identified / profile reviewed:** Verified as Chief Chess Player at
  Proximity Labs and identified as relevant to NEAR ecosystem and DeFi/RWA fit.
- **2026-06-25 — Connection request sent:** LinkedIn invitation sent. No acceptance or reply is
  recorded.

Next action: Check invitation state and recent relevant posts. Send a short DeFi/RWA fit message
only after acceptance. Recommended date: **2026-07-12**.

### Alexander Scharrer

- **2026-07-03 — New contact identified / profile reviewed:** Recorded as Head of Capital Markets at
  NEAR Foundation. The canonical LinkedIn URL was not preserved and still requires verification.
- **2026-07-03 — Connection request sent:** Personalized LinkedIn invitation sent; no acceptance or
  reply is recorded. Invitation note: "Hi Alexander, I'm building AgriPartners, an RWA agriculture
  platform on NEAR. I'd be glad to connect and exchange ideas around tokenized real-world assets."

Next action: Verify the LinkedIn URL and current position, then check invitation state. If accepted,
observe and engage naturally before pitching. Recommended date: **2026-07-12**.

### Taras Dovgal

- **2026-06-25 — New contact identified / profile reviewed:** Historical record retained. The
  profile was observed as Business Co-Founder at NoVPS, creating uncertainty about current NEAR/RWA
  relevance.
- **2026-06-25 — Connection request sent:** Historical invitation recorded. No acceptance or reply
  is recorded.
- **2026-06-25 — Status reviewed:** Marked as requiring relevance verification before any further
  outreach.

Next action: Verify current role, relevance, and invitation state. Do not send a follow-up unless
relevance is confirmed. Recommended date: **2026-07-12**.

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
- [x] Dashboard counters reconcile to the seven contact-register records.
- [x] Weekly review lists reconcile to the snapshot date and recorded next-touch dates.
- [x] Historical interactions from the prior operational CRM are retained.
- [x] The complete pre-migration CRM structure and wording are retained as read-only history.
- [x] Pending invitations, active conversations, partnership opportunities, and investor
  opportunities are explicitly summarized.
- [ ] Reconcile today's LinkedIn state for the six contacts due on 2026-07-12.
- [ ] Verify Alexander Scharrer's canonical LinkedIn URL.
