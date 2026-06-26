# Outreach CRM

This file tracks active founder outreach activity for AgriPartners Alpha v1.2.

Outreach CRM is a working pipeline. It records outreach status, dates, responses, next actions, and follow-ups. It does not store profile data that already belongs in Near Directory.

Use `docs/outreach/near-directory/` as the canonical source for verified contact information, including organization, role, LinkedIn, source links, relevance, and Tier.

## Workflow Rule

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

## CRM Fields

- **Contact Name:** Person being contacted.
- **Directory Reference:** Link to the Near Directory file and section for the verified contact.
- **Outreach Status:** Current outreach pipeline state.
- **Date Added:** Date the person entered Outreach CRM.
- **Last Contact:** Most recent outreach action or `No contact yet`.
- **Last Response:** Most recent reply or `No response yet`.
- **Next Action:** Immediate next action.
- **Notes:** Operational notes only. Keep profile facts in Near Directory.

## Outreach Status Values

- Not Contacted
- Following
- Connected
- Conversation
- Feedback
- Meeting
- Partner

## Active Outreach Pipeline

| Contact | Directory Reference | Outreach Status | Date Added | Last Contact | Last Response | Next Action | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Joseph Beverley | [founder-success.md#joseph-beverley](near-directory/founder-success.md#joseph-beverley) | Following | 2026-06-25 | 2026-06-25 | No response yet | Monitor posts and engage | Followed on LinkedIn. Tier 1 Founder Success entry point; use Near Directory for role and source details. |
| David Mirzadeh | [near-foundation.md#david-mirzadeh](near-directory/near-foundation.md#david-mirzadeh) | Following | 2026-06-25 | Invite sent on 2026-06-25 | No response yet | Send short intro after acceptance | Existing outreach activity retained as operational record; full profile details live in Near Directory. |
| Philipp Suarez | [near-foundation.md#philipp-suarez](near-directory/near-foundation.md#philipp-suarez) | Following | 2026-06-25 | Invite sent on 2026-06-25 | No response yet | Send short intro after acceptance | Finance-track contact. Full profile details live in Near Directory. |
| Josh Ford | [near-foundation.md#josh-ford](near-directory/near-foundation.md#josh-ford) | Following | 2026-06-25 | Invite sent and followed on 2026-06-25 | No response yet | Monitor posts and engage; send DevX/product feedback intro after acceptance | Tier 2 DevX/Product contact. Full profile details live in Near Directory. |
| Bowen Shen | [proximity-labs.md#bowen-shen](near-directory/proximity-labs.md#bowen-shen) | Following | 2026-06-25 | Invite sent on 2026-06-25 | No response yet | Monitor posts and engage; send DeFi/RWA fit intro after acceptance | Proximity Labs contact. Full profile details live in Near Directory. |

## Backfill Required

The following historical CRM entries are not active Outreach CRM records under the new architecture because they are not yet verified in Near Directory.

Do not continue outreach until each person is verified, added to Near Directory, assigned a Tier, and then re-added here as an operational CRM record.

| Contact | Previous CRM State | Required Action | Notes |
| :--- | :--- | :--- | :--- |
| [Taras Dovgal](https://www.linkedin.com/in/tarasdovgal/?locale=en) | Invite sent on 2026-06-25 | Verify current ecosystem relevance before next follow-up | Screenshot shows current profile as Business Co-Founder @ NoVPS, so keep out of active CRM until relevance is confirmed. |

Other unverified historical candidates are tracked only in `near-directory/verification-log.md` and `near-directory/SUMMARY.md`.

## Follow-Up Template

```text
Hi [Name], just following up in case this is relevant. I am building AgriPartners, an Alpha v1.2 platform on NEAR Testnet for transparent agricultural investment workflows. I would value a short feedback conversation if this connects with your work.
```
