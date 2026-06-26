# Near Directory

Start with `SUMMARY.md` for outreach planning. The Near Directory is the single source of truth for verified NEAR ecosystem contacts used by AgriPartners founder outreach.

Near Directory stores facts about people. Outreach CRM stores interactions with those people.

## Workflow

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

Never add a contact directly to Outreach CRM.

Every contact must first be verified and added to Near Directory.

## What Near Directory Contains

- Verified contacts.
- Roles.
- Organizations.
- LinkedIn, X, GitHub, and other source links when available.
- Verification metadata.
- Outreach relevance.
- Priority Tier.

Near Directory does not track live outreach activity. Use `docs/outreach/outreach-crm.md` for outreach status, dates, responses, next actions, and follow-ups.

## Verification Methodology

Include a person only when all of the following are true:

- LinkedIn profile is found and attributable to the person.
- Current organization is confirmed by LinkedIn, an official organization page, or another current public source.
- Current role is confirmed by LinkedIn, an official organization page, or another current public source.
- Profile appears active or recently maintained.
- The person is relevant to AgriPartners outreach.

When sources conflict, do not include the person as verified. Add the person to `verification-log.md` as `Needs Review` instead.

## Contact Record Schema

Every verified contact should include:

```md
## Full Name

Organization:

Role:

Category:

Priority Tier:

Trust Level:

Preferred Contact Channel:

AgriPartners Relevance:

Outreach Goal:

LinkedIn:

X / Twitter:

GitHub:

Current Status:

Last Verified:

Verified Sources:

Reason for Inclusion:

Suggested First Action:

Notes:
```

## Trust Level Values

Use one or more of these values:

- `Official organization page`
- `Official LinkedIn`
- `Official X`
- `Official GitHub`
- `Multiple verified sources`

## AgriPartners Relevance Values

- `★★★★★ Critical`
- `★★★★ High`
- `★★★ Medium`
- `★★ Low`
- `★ Observation`

Each rating must include a brief explanation.

## Update Process

1. Search for the person by name, organization, and role.
2. Confirm the LinkedIn URL directly from search results or an official team page.
3. Confirm current organization and current role from LinkedIn and at least one supporting source when possible.
4. Add the person to the correct organization file only after all verification checks pass.
5. Assign a Priority Tier in Near Directory.
6. Use ISO verification dates only: `YYYY-MM-DD`.
7. Update `verification-log.md` with verification dates, expiry, next review date, sources, result, and notes.
8. Update `SUMMARY.md` counts and Tier lists.
9. Add the contact to `docs/outreach/outreach-crm.md` only when outreach actually begins.

## Outreach CRM Rule

`docs/outreach/outreach-crm.md` should reference only contacts that are marked `🟢 Verified` in Near Directory.

If a person is not present in Near Directory, do not add them to Outreach CRM.

If a current CRM contact becomes stale, remove them from the active pipeline and add a verification-log entry before any further outreach.

## Directory Files

- `SUMMARY.md` - entry point, counts, Tier rollup, and manual-verification queue.
- `founder-success.md` - Founder Success and ecosystem-entry contacts.
- `near-foundation.md` - NEAR Foundation leadership, operations, product, and technical contacts.
- `proximity-labs.md` - Proximity Labs contacts.
- `pagoda.md` - Pagoda contacts.
- `aurora.md` - Aurora Labs contacts.
- `ecosystem-projects.md` - HOT Protocol, Bitte Protocol, Meta Pool, ecosystem builders, and strategic partners.
- `investors.md` - investor and capital-network contacts.
- `verification-log.md` - verification source trail, expiry tracking, and manual-review queue.

## Priority Guide

- `Tier 1` - Most relevant for Founder Success, ecosystem entry, technical review, or routing.
- `Tier 2` - Strong relevance, but not the first outreach wave.
- `Tier 3` - Useful strategic or specialist contact after core routing is established.
- `Tier 4` - Visibility, follow, or later-stage strategic relevance.

## Verification Status Guide

- `🟢 Verified` - Passed all Near Directory verification checks.
- `🟡 Needs Review` - Do not outreach yet; source conflict, stale role, or insufficient role confirmation.
- `🔴 Outdated` - Do not outreach; current role or organization is confirmed outdated for the intended purpose.
