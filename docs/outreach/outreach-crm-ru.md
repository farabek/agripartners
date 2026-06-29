# Outreach CRM

Этот файл отслеживает активный founder outreach для AgriPartners Alpha v1.2.

Outreach CRM - это рабочий pipeline. Здесь фиксируются статусы outreach, даты, ответы, следующие действия и follow-up. Профильные данные, которые уже хранятся в Near Directory, здесь не дублируются.

Канонический источник verified contact information - `docs/outreach/near-directory/`: organization, role, LinkedIn, source links, relevance и Tier.

## Правило workflow

Никогда не добавлять контакт напрямую в Outreach CRM.

Каждый контакт сначала должен быть проверен и добавлен в Near Directory.

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

## Поля CRM

- **Contact Name:** человек, с которым идет outreach.
- **Directory Reference:** ссылка на файл и секцию Near Directory для verified contact.
- **Outreach Status:** текущий pipeline state.
- **Date Added:** дата добавления в Outreach CRM.
- **Last Contact:** последнее outreach-действие или `No contact yet`.
- **Last Response:** последний ответ или `No response yet`.
- **Next Action:** ближайшее следующее действие.
- **Notes:** только operational notes. Факты профиля остаются в Near Directory.

## Значения Outreach Status

- `Not Contacted` - еще не контактировали.
- `Following` - подписались / наблюдаем / ожидаем acceptance.
- `Connected` - контакт принят.
- `Conversation` - идет переписка.
- `Feedback` - получен фидбек.
- `Meeting` - назначена или идет встреча.
- `Partner` - контакт перешел в партнерский трек.

## Active Outreach Pipeline

| Contact | Directory Reference | Outreach Status | Date Added | Last Contact | Last Response | Next Action | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Joseph Beverley | [founder-success.md#joseph-beverley](near-directory/founder-success.md#joseph-beverley) | Following | 2026-06-25 | 2026-06-25 | No response yet | Monitor posts and engage | Followed on LinkedIn. Tier 1 Founder Success entry point; role и source details хранятся в Near Directory. |
| David Mirzadeh | [near-foundation.md#david-mirzadeh](near-directory/near-foundation.md#david-mirzadeh) | Following | 2026-06-25 | Invite sent on 2026-06-25 | No response yet | Отправить короткое intro после acceptance | Existing outreach activity сохранена как operational record; profile details хранятся в Near Directory. |
| Philipp Suarez | [near-foundation.md#philipp-suarez](near-directory/near-foundation.md#philipp-suarez) | Intro sent | 2026-06-25 | LinkedIn intro отправлено 2026-06-29 в 18:51 | Ответа пока нет | Если ответа не будет, отправить один follow-up 2026-07-03 | Connection принято. Finance-track contact. Не отправлять новое сообщение раньше даты follow-up. Profile details хранятся в Near Directory. |
| Josh Ford | [near-foundation.md#josh-ford](near-directory/near-foundation.md#josh-ford) | Following | 2026-06-25 | Invite sent and followed on 2026-06-25 | No response yet | Monitor posts and engage; отправить DevX/product feedback intro после acceptance | Tier 2 DevX/Product contact. Profile details хранятся в Near Directory. |
| Bowen Shen | [proximity-labs.md#bowen-shen](near-directory/proximity-labs.md#bowen-shen) | Following | 2026-06-25 | Invite sent on 2026-06-25 | No response yet | Monitor posts and engage; отправить DeFi/RWA fit intro после acceptance | Proximity Labs contact. Profile details хранятся в Near Directory. |

### Подготовленный follow-up — Philipp Suarez

Отправить только при отсутствии ответа к **2026-07-03**:

> Hi Philipp,
>
> Just following up on my message. We’ve prepared a public AgriPartners demo, including model-specific investor protection and transparent farmer payment schedules:
>
> https://frontend-omega-woad-90.vercel.app
>
> Would you be open to a brief 15-minute introduction next week?
>
> Best, Farhod

После отправки обновить `Last Contact`, оставить `Last Response` фактическим и не отправлять следующий follow-up в течение семи дней.

## Требуется backfill

Следующие historical CRM entries не являются active Outreach CRM records в новой архитектуре, потому что они пока не verified в Near Directory.

Не продолжать outreach, пока каждый человек не будет проверен, добавлен в Near Directory, получит Tier и затем будет повторно добавлен сюда как operational CRM record.

| Contact | Previous CRM State | Required Action | Notes |
| :--- | :--- | :--- | :--- |
| [Taras Dovgal](https://www.linkedin.com/in/tarasdovgal/?locale=en) | Invite sent on 2026-06-25 | Verify current ecosystem relevance before next follow-up | Screenshot shows current profile as Business Co-Founder @ NoVPS, поэтому держим вне active CRM до подтверждения relevance. |

Другие unverified historical candidates отслеживаются только в `near-directory/verification-log.md` и `near-directory/SUMMARY.md`.

## Шаблон follow-up

Английский текст для LinkedIn follow-up:

```text
Hi [Name], just following up in case this is relevant. I am building AgriPartners, an Alpha v1.2 platform on NEAR Testnet for transparent agricultural investment workflows. I would value a short feedback conversation if this connects with your work.
```
