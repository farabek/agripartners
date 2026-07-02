# Protection Reserve — Decision Memo v1

| Поле | Значение |
| --- | --- |
| Версия документа | Draft v1.0 |
| Дата | 2026-06-30 |
| Статус | Требует Product / Finance / Legal / Operations / Engineering review |
| Mainnet decision | `NO-GO` до закрытия blockers |
| Следующий review | После получения замечаний владельцев решений |

## 1. Назначение документа

Этот memo фиксирует продуктовые решения, предлагаемые правила и блокирующие открытые вопросы по механизму Protection Reserve.

Документ нужен, чтобы:

- не смешивать утверждённую финансовую модель с юридически неутверждёнными предположениями;
- превратить открытые вопросы в проверяемые требования;
- создать единый источник требований для договоров, backend, базы данных, portal UI и smart contract;
- определить условия, при которых механизм можно или нельзя использовать с реальными средствами.

Этот memo не является договором, юридическим заключением, публичной офертой или обещанием выплаты.

## 2. Статусы решений

| Статус | Значение |
| --- | --- |
| `CONFIRMED_PRODUCT` | Подтверждённое продуктовое или финансовое решение для текущей модели |
| `PROPOSED_V1` | Предлагаемое правило для проектирования и обсуждения |
| `LEGAL_OPEN` | Требуется заключение квалифицированного юриста по выбранной юрисдикции |
| `BLOCKED` | Реализация с реальными средствами запрещена до закрытия вопроса |
| `SUPERSEDED` | Решение заменено новой версией memo |

Статус `CONFIRMED_PRODUCT` не заменяет юридическое согласование, если решение затрагивает владение, custody, списание или перевод средств.

## 3. Область v1

Memo применяется только к текущим пилотным моделям:

- Fidlot v5.9;
- Hissar / VariantB v2.1;
- первоначальная инвестиция модели — `$50,000`;
- разделение прибыли — 60% фермеру / 40% инвестору;
- стандартная Performance Fee — 20% только от доли инвестора.

Будущая модель не может автоматически использовать 44%, 53%, `$10,000` или текущий release schedule без отдельного расчёта и новой версии правил.

## 4. Реестр решений

| ID | Решение | Статус | Владелец решения | Условие завершения |
| --- | --- | --- | --- | --- |
| `PR-001` | Внешний термин — `Protection Reserve`; слово `escrow` не использовать как окончательную юридическую квалификацию | `CONFIRMED_PRODUCT` | Product | Обновлять терминологию единообразно |
| `PR-002` | Ставка определяется моделью: Fidlot 44%, Hissar 53% | `CONFIRMED_PRODUCT` | Finance/Product | Хранить модель и версию вместе со ставкой |
| `PR-003` | База взноса — валовая 60-процентная доля фермера до операционных расходов, относимых на долю фермера | `CONFIRMED_PRODUCT` | Finance | Формула должна быть одинаковой в договоре и коде |
| `PR-004` | Performance Fee не удерживается из доли фермера, резерва или возврата капитала | `CONFIRMED_PRODUCT` | Finance/Product | Закрепить в каждом договоре |
| `PR-005` | Резерв формируется только из фактически заработанной доли фермера и накапливается постепенно | `CONFIRMED_PRODUCT` | Finance | Прогноз не отражать как фактически внесённый баланс |
| `PR-006` | Для текущих моделей необходимый остаток: `max($10,000; $50,000 − investor cash received)` | `CONFIRMED_PRODUCT` | Finance/Product | Юридически определить состав `investor cash received` |
| `PR-007` | В no-loss модели весь подтверждённый излишек сверх необходимого остатка предполагается разблокировать фермеру | `CONFIRMED_PRODUCT` | Product | Исполнение заблокировано до approval и legal rules |
| `PR-008` | Последние `$10,000` удерживаются до завершения обязательств, урегулирования убытков и споров | `CONFIRMED_PRODUCT` | Finance/Product | Определить юридический completion checklist |
| `PR-009` | В Hissar циклах 3–6 по `$2,500` возвращается инвестору до 60/40 split как частичный возврат капитала без Performance Fee | `CONFIRMED_PRODUCT` | Finance/Product | Закрепить в Hissar contract schedule |
| `PR-010` | Распределение фактической продажи стада должно определяться договором; `$26,600` не является гарантированной ценой | `PROPOSED_V1` | Product/Legal | Согласовать expenses, valuation и отклонения цены |
| `PR-011` | Reserve может использоваться только после процедуры Confirmed Loss и не более подтверждённого убытка и доступного баланса | `PROPOSED_V1` | Legal/Risk | Утвердить evidence и authority |
| `PR-012` | Просроченный обязательный отчёт, default или открытый спор приостанавливает release | `PROPOSED_V1` | Operations/Legal | Утвердить сроки notice и cure |
| `PR-013` | Release не должен исполняться одним неаудируемым admin-действием | `PROPOSED_V1` | Security/Operations | Утвердить maker-checker или multisig |
| `PR-014` | Юридическая принадлежность заблокированных средств не определена финансовой моделью | `LEGAL_OPEN` | Legal | Письменное legal opinion и договорная конструкция |
| `PR-015` | Должна существовать процедура возражения и appeal для инвестора и фермера | `PROPOSED_V1` | Legal/Operations | Утвердить сроки, роли и финальную authority |
| `PR-016` | Каждый contribution, claim, decision, release и payment должен иметь immutable audit reference | `PROPOSED_V1` | Engineering/Finance | Утвердить event и ledger schema |
| `PR-017` | Early termination требует отдельного settlement waterfall | `LEGAL_OPEN` | Legal/Finance | Утвердить порядок оценки активов и claims |
| `PR-018` | Механизм не является страховкой или гарантией доходности, капитала, payout или settlement | `CONFIRMED_PRODUCT` | Product/Legal | Показывать disclosure во всех основных views |
| `PR-019` | Projected USD schedule и live NEAR balances должны отображаться раздельно | `CONFIRMED_PRODUCT` | Product/Engineering | Не выполнять неявную конвертацию |
| `PR-020` | Каждая сделка должна фиксировать `model_version` и `reserve_policy_version` | `PROPOSED_V1` | Product/Engineering | Добавить immutable version fields |

## 5. Подтверждённая финансовая база

### 5.1. Fidlot v5.9

- ставка Protection Reserve — 44%;
- семь циклов;
- расчётные взносы — `$50,820`;
- минимальный остаток до завершения — `$10,000`;
- полный no-loss schedule определён в договорном приложении.

### 5.2. Hissar / VariantB v2.1

- ставка Protection Reserve — 53%;
- шесть циклов;
- расчётные взносы — `$50,752.80`;
- минимальный остаток до завершения — `$10,000`;
- в циклах 3–6 действует отдельный возврат капитала `$2,500`;
- полный no-loss schedule определён в договорном приложении.

### 5.3. Формулы

```text
Reserve contribution =
farmer gross 60% profit share × model reserve rate
```

```text
Farmer cash for the stage =
farmer gross share
− farmer operating expenses
− reserve contribution
+ approved reserve release
```

```text
Required reserve =
max($10,000; $50,000 − investor cash actually received)
```

Для `investor cash actually received` предлагается учитывать только фактические, подтверждённые и неотозванные денежные выплаты:

- распределение прибыли инвестору;
- возврат капитала;
- фактическую чистую выручку от продажи активов, выплаченную инвестору.

Начисленные, но не выплаченные суммы не должны уменьшать required reserve.

## 6. Предлагаемый release workflow v1

### 6.1. Условия создания release proposal

Release proposal может быть создан только после выполнения всех условий:

1. цикл имеет статус `Completed`;
2. обязательный farmer report представлен;
3. report прошёл операционную проверку;
4. investor receipts сверены с ledger и платёжными доказательствами;
5. отсутствует открытый loss claim;
6. отсутствует dispute, default или действующий release freeze;
7. required reserve рассчитан по активной версии policy;
8. release amount не превышает фактически доступный Reserve.

### 6.2. Расчёт

```text
Release candidate =
max(0; available reserve − required reserve)
```

`Release candidate` не является автоматически выплачиваемой суммой. До approval он имеет статус `PROPOSED`.

### 6.3. Предлагаемые статусы release

```text
PROPOSED
→ UNDER_REVIEW
→ APPROVED
→ EXECUTION_PENDING
→ PAID
```

Альтернативные статусы:

```text
REJECTED
SUSPENDED
CANCELLED
FAILED
```

### 6.4. Approval

Для v1 предлагается maker-checker:

- `maker` создаёт proposal и прикладывает расчёт;
- `checker` независимо проверяет evidence и сумму;
- один и тот же account не может выполнить обе роли;
- on-chain execution разрешается только для `APPROVED` proposal;
- любое изменение суммы требует нового approval.

Окончательная схема authority остаётся `BLOCKED` до юридического и security review.

## 7. Предлагаемый Confirmed Loss workflow

### 7.1. Статусы

```text
DRAFT
→ SUBMITTED
→ EVIDENCE_REQUIRED
→ UNDER_REVIEW
→ CONFIRMED | REJECTED | DISPUTED
→ SETTLED
```

### 7.2. Минимальный evidence package

- deal и cycle identifier;
- дата и описание события;
- количество и идентификация затронутых активов;
- первичная стоимость;
- подтверждённая остаточная стоимость или salvage;
- страховые и иные recovery proceeds;
- фото, документы или inspection report;
- автор и время подачи;
- reviewer и decision rationale.

### 7.3. Максимальная компенсация

```text
Reserve use =
min(
  Confirmed Loss net of recoveries,
  available and legally usable reserve,
  contractual compensation cap
)
```

Admin не должен иметь возможность заменить этот workflow одним произвольным числом убытка.

## 8. Reporting, default и dispute

До отдельного решения предлагаются следующие состояния:

| Состояние | Эффект |
| --- | --- |
| Report submitted | Release всё ещё требует review |
| Report overdue | Новые releases приостановлены |
| Cure period active | Contribution может учитываться, release не исполняется |
| Default declared | Все releases приостановлены; применяется settlement review |
| Loss claim open | Затронутая сумма блокируется |
| Dispute open | Release не исполняется до решения |

Открытые параметры:

- report due date;
- notice period;
- cure period;
- кто признаёт default;
- кто может открыть и закрыть dispute;
- какие действия разрешены во время freeze.

## 9. Legal и custody blockers

До работы с реальными средствами должны быть письменно определены:

1. владелец заблокированных средств;
2. держатель и контролирующая сторона;
3. применимая юрисдикция;
4. необходимость segregated account, custodian, trustee или escrow agent;
5. защита от требований кредиторов;
6. authority на списание в пользу инвестора;
7. authority на release фермеру;
8. порядок исполнения судебных и регуляторных требований;
9. treatment при insolvency, termination и dispute.

Пока эти вопросы открыты, `Protection Reserve` является продуктовым и финансовым термином, а не окончательной юридической квалификацией.

## 10. Versioning

Каждая сделка должна неизменно хранить:

```text
model_key
model_version
reserve_policy_version
reserve_rate
calculation_currency
minimum_reserve_rule
created_at
```

Изменение policy не должно ретроактивно менять старую сделку. Для изменения условий требуется новая версия и явное согласие сторон.

## 11. Go / No-Go

### Разрешено сейчас

- публичная демонстрация прогнозного schedule;
- Shadow Reserve Ledger без реального движения средств;
- тестирование calculation engine;
- сбор feedback;
- юридическое и security проектирование.

### Запрещено до закрытия blockers

- позиционировать механизм как страхование или гарантию;
- утверждать окончательного владельца заблокированных средств;
- автоматически списывать Reserve по введённому admin числу;
- исполнять staged release реальных средств;
- считать UI projection фактическим contract balance;
- запускать mainnet release workflow.

## 12. Требуемые approvals

| Область | Ответственный | Статус |
| --- | --- | --- |
| Финансовая модель Fidlot/Hissar | Product + Finance | Частично подтверждено |
| Contract language | Legal | Open |
| Custody и ownership | Legal | Blocker |
| Loss governance | Legal + Risk + Operations | Blocker |
| Release approvals | Security + Operations | Open |
| Technical architecture | Engineering | После утверждения memo |
| Mainnet readiness | Security + Legal + Engineering | Blocker |

## 13. Следующее действие

1. Получить комментарии Finance, Legal, Operations и Engineering.
2. Для каждого `PROPOSED_V1` установить `CONFIRMED_PRODUCT`, `LEGAL_OPEN` или `REJECTED`.
3. Закрыть blockers `PR-014`, `PR-015` и `PR-017`.
4. Выпустить Decision Memo v1.0 с датой и approvers.
5. Использовать утверждённые ID как требования для Shadow Reserve Ledger и contract v2.
