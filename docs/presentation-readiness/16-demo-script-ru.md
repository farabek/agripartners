# Demo Script

## Audience

Этот script написан для NEAR ecosystem reviewers, investors, accelerators и strategic partners.

Target duration: 5-7 minutes.

## Script

Здравствуйте, это AgriPartners Alpha v1.

AgriPartners - agricultural real-world asset platform, которая соединяет investors с vetted farm projects и дает обеим сторонам transparent workflow для funding, reporting, ROI tracking и NEAR-based verification.

Проблема, которую мы решаем, простая: farmers need working capital, но investors часто не видят, что происходит после того, как money leaves their account. Agricultural deals обычно отслеживаются через private documents, manual reports и offline trust. AgriPartners превращает это в structured digital workflow.

Я покажу demo в девяти шагах: login, marketplace, two pilot deals, farmer reports, ROI dashboard, portfolio dashboard, funding progress и withdraw.

Сначала NEAR wallet login. Investor входит через wallet-linked session, что дает account-based access без traditional username-password investor system. Это важно, потому что long-term product needs blockchain-linked identity, contract interaction и transaction verification.

Теперь открываем Marketplace. Здесь investors могут review agricultural pilot opportunities. Current demo has two profiles: Fidlot Livestock Project и Hissar Sheep Breeding Project. Marketplace показывает investment amount, ROI, APR, cycles, status и compact funding progress.

Первый pilot - Fidlot Livestock Project. Это completed-state example. Он показывает `$50,000` investment, `7` cycles, `64%` ROI, `21.9%` APR и completed status. В investor view мы видим funding progress, farmer reporting, returned capital и event history. Returned amount is `$82,000`, with `$0` outstanding. Это clean example completed agricultural cycle.

Второй pilot - Hissar Sheep Breeding Project. Это active-state example. Он также имеет `$50,000` investment amount, `6` cycles, `63.3%` projected ROI и `21.1%` APR. Он active, поэтому dashboard показывает outstanding projected returns и operating-cycle view. Здесь investors понимают, что still in progress, а не видят только static deal document.

Далее farmer reports. AgriPartners - не только financial dashboard. Он connects capital to farm execution. В deal detail view investors видят cycle status, report status, submitted farmer reports, amount used, evidence links when available и event history. Это operational transparency layer.

Теперь возвращаемся к Investor Analytics Dashboard. ROI and returns section summarizes projected portfolio return, capital returned, outstanding returns, return completion rate и average projected ROI. Важно, что projected returns clearly presented as projections, not guarantees.

Dashboard также включает portfolio management layer. Он показывает total invested, projected returns, returned capital, outstanding amount, profit realized, capital returned percentage, portfolio performance, portfolio health, recent activity, deal performance, active investments и completed investments. Это дает investor 30-second answer: how much is allocated, what has returned, what is outstanding, and which deals need attention.

Funding progress visible both on marketplace cards and inside deal detail. В full funding panel investors видят funding goal, amount raised, remaining amount, funding percentage, investor count и days remaining. Если live funding data unavailable in Alpha v1, UI derives demo-safe values from existing deal data. Это сохраняет demo clear without requiring new backend or contract logic.

Finally, withdraw. Investor detail view включает withdrawal action, который демонстрирует smart contract interaction на NEAR Testnet. Where available, flow can show a transaction hash. Это не final production finance workflow; это Testnet validation of the direction.

Причина, почему NEAR важен: product needs wallet identity, low-cost transactions, contract programmability и verifiable deal events. Today we show wallet auth, smart contract interaction, withdrawal и verification. Future phases могут расширить это до funding pools, return distribution и on-chain cycle events.

В summary, AgriPartners Alpha v1 демонстрирует full shape agricultural RWA platform: investors discover farm deals, inspect funding progress, track farmer reports, monitor ROI and returns, manage portfolio health и verify blockchain-linked activity on NEAR.
