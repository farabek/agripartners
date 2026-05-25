# AgriPartners Demo Script
# Run: .\demo.ps1
# Requirements: backend running (npm start in backend/), frontend running (serve frontend -p 5500)

$API_BASE = "http://localhost:3000"
$API_KEY  = "agripartners-demo-key"
$HEADERS  = @{ "X-API-Key" = $API_KEY }

$INVESTMENT      = "10000000000000000000000000"  # 10 NEAR
$PROFIT          = "3000000000000000000000000"   # 3 NEAR
$CAPITAL_RETURN  = "4080000000000000000000000"   # 4.08 NEAR
$FARMER          = "farab.testnet"
$INVESTOR        = "farab.testnet"

function Step($msg)  { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "OK  $msg" -ForegroundColor Green }
function Err($msg)   { Write-Host "ERR $msg" -ForegroundColor Red }
function Pause($msg) { Read-Host "`n --> $msg [Enter]" | Out-Null }

Write-Host ""
Write-Host "AgriPartners Demo - NEAR Testnet" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

# 0. Check backend
Step "Checking backend"
try {
    Invoke-RestMethod "$API_BASE/health" -ErrorAction Stop | Out-Null
    Ok "Backend is running at $API_BASE"
} catch {
    Err "Backend is not available. Start it in a separate terminal:"
    Write-Host "    cd E:\agripartners\backend; npm start" -ForegroundColor White
    exit 1
}

# 1. Deploy deal
Step "1 / 5  Deploy smart contract"
Write-Host "  This takes 10-30 seconds (transaction on NEAR testnet)..." -ForegroundColor Gray

$dealBody = @{
    deal_type           = "Fidlot v5.9"
    farmer              = $FARMER
    investor            = $INVESTOR
    investment_amount   = $INVESTMENT
    farmer_split_pct    = 60
    investor_split_pct  = 40
    escrow_pct          = 44
    performance_fee_pct = 20
    cycle_duration_days = 1
    total_cycles        = 3
    capital_return_near = $CAPITAL_RETURN
} | ConvertTo-Json

try {
    $deal = Invoke-RestMethod "$API_BASE/api/admin/deals" -Method POST -Headers $HEADERS -Body $dealBody -ContentType "application/json" -ErrorAction Stop
} catch {
    Err "Deploy failed: $_"
    exit 1
}

$dealId = $deal.id
Ok "Contract: $($deal.contract_address)"
Ok "Deal ID:  $dealId"
Write-Host ""
Write-Host "  Dashboard: http://localhost:5500/#deals/$dealId" -ForegroundColor Yellow
Pause "Open dashboard, verify deal is visible. Continue"

# 2. Fund
Step "2 / 5  Fund investment"
Write-Host "  Investor deposits 10 NEAR into contract..." -ForegroundColor Gray
try {
    $funded = Invoke-RestMethod "$API_BASE/api/admin/deals/$dealId/fund" -Method POST -Headers $HEADERS -ErrorAction Stop
} catch {
    Err "Fund failed: $_"
    exit 1
}
Ok "Investment funded. TX: $($funded.tx_hash)"
Write-Host "  Click Refresh on dashboard - status changes to Funded" -ForegroundColor Yellow
Pause "Continue to cycles"

# 3-5. Cycles
for ($i = 1; $i -le 3; $i++) {
    Step "$($i + 2) / 5  Cycle $i"

    Write-Host "  Starting cycle $i..." -ForegroundColor Gray
    try {
        $started = Invoke-RestMethod "$API_BASE/api/admin/deals/$dealId/start-cycle" -Method POST -Headers $HEADERS -ErrorAction Stop
    } catch {
        Err "start-cycle failed: $_"
        exit 1
    }
    Ok "Cycle $i started. TX: $($started.tx_hash)"
    Write-Host "  Click Refresh - status: CycleActive, cycle $i" -ForegroundColor Yellow
    Pause "Show dashboard. Report cycle $i"

    $reportBody = @{ profit_near = $PROFIT; losses_near = "0" } | ConvertTo-Json
    try {
        $reported = Invoke-RestMethod "$API_BASE/api/admin/deals/$dealId/report-cycle" -Method POST -Headers $HEADERS -Body $reportBody -ContentType "application/json" -ErrorAction Stop
    } catch {
        Err "report-cycle failed: $_"
        exit 1
    }
    Ok "Cycle $i done. Status: $($reported.status)"

    if ($reported.status -eq "Completed" -or $reported.status -eq "Terminated") {
        Write-Host "  Click Refresh - final status: $($reported.status)" -ForegroundColor Yellow
        break
    }

    if ($i -lt 3) {
        Pause "Press Enter for cycle $($i + 1)"
    }
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Yellow
Write-Host "Demo complete!" -ForegroundColor Green
Write-Host "Dashboard: http://localhost:5500/#deals/$dealId" -ForegroundColor Yellow
Write-Host ""
