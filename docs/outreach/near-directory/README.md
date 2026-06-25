# NEAR Ecosystem Directory 2026

Start with `SUMMARY.md` for the current verified-contact count, tier breakdown, and manual-verification queue.

This directory is the single source of truth for AgriPartners founder outreach into the NEAR ecosystem.

It replaces ad-hoc contact lists with a curated CRM knowledge base of people whose LinkedIn profile, current organization, current role, profile activity, and relevance to AgriPartners have been checked before inclusion.

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

Outreach Status:

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

## Outreach Status Values

- `Not Contacted`
- `Following`
- `Connected`
- `Conversation`
- `Feedback`
- `Meeting`
- `Partner`

Default: `Not Contacted`.

## Update Process

1. Search for the person by name, organization, and role.
2. Confirm the LinkedIn URL directly from search results or an official team page.
3. Confirm current organization and current role from LinkedIn and at least one supporting source when possible.
4. Add the person to the correct organization file only after all verification checks pass.
5. Use ISO verification dates only: `YYYY-MM-DD`.
6. Update `verification-log.md` with the source used, result, and notes.
7. Update `SUMMARY.md` counts and tier lists.
8. Re-check Tier 1 contacts before every outreach wave.

## CRM Usage

`docs/outreach/outreach-crm.md` should reference only contacts that are marked `🟢 Verified` in this directory.

If a person is not present here, do not add them to the CRM outreach queue until they are verified and added to the directory.

If a current CRM contact becomes stale, remove them from the active queue and add a verification-log entry before any further outreach.

## Directory Files

- `SUMMARY.md` — entry point, counts, tier rollup, and manual-verification queue.
- `founder-success.md` — Founder Success and ecosystem-entry contacts.
- `near-foundation.md` — NEAR Foundation leadership, operations, product, and technical contacts.
- `proximity-labs.md` — Proximity Labs contacts.
- `pagoda.md` — Pagoda contacts.
- `aurora.md` — Aurora Labs contacts.
- `ecosystem-projects.md` — HOT Protocol, Bitte Protocol, Meta Pool, ecosystem builders, and strategic partners.
- `investors.md` — investor and capital-network contacts.
- `verification-log.md` — verification source trail and manual-review queue.

## Priority Guide

- `Tier 1` — Most relevant for Founder Success, ecosystem entry, technical review, or routing.
- `Tier 2` — Strong relevance, but not the first outreach wave.
- `Tier 3` — Useful strategic or specialist contact after core routing is established.
- `Tier 4` — Visibility, follow, or later-stage strategic relevance.

## Status Guide

- `🟢 Verified` — Passed all directory verification checks.
- `🟡 Needs Review` — Do not outreach yet; source conflict, stale role, or insufficient role confirmation.
- `🔴 Outdated` — Do not outreach; current role or organization is confirmed outdated for the intended purpose.
