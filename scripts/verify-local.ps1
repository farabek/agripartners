[CmdletBinding()]
param(
    [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repositoryRoot 'backend'
$frontendPath = Join-Path $repositoryRoot 'frontend'
$contractPath = Join-Path $repositoryRoot 'contract'

function Invoke-ExternalCommand {
    param(
        [Parameter(Mandatory)]
        [string]$WorkingDirectory,

        [Parameter(Mandatory)]
        [string]$Command,

        [Parameter(Mandatory)]
        [string[]]$Arguments
    )

    Push-Location -LiteralPath $WorkingDirectory
    try {
        & $Command @Arguments | Out-Host
        $commandExitCode = $LASTEXITCODE
        return $commandExitCode
    }
    finally {
        Pop-Location
    }
}

Write-Host 'AgriPartners local verification'
Write-Host "Repository: $repositoryRoot"

if (-not $SkipInstall) {
    Write-Host "`n[1/8] Installing backend dependencies with npm ci"
    $exitCode = Invoke-ExternalCommand -WorkingDirectory $backendPath -Command 'npm' -Arguments @('ci')
    if ($exitCode -ne 0) {
        throw "Backend dependency installation failed with exit code $exitCode."
    }
}
else {
    Write-Host "`n[1/8] Backend dependency installation skipped by request"
}

Write-Host "`n[2/8] Running backend test suite"
$exitCode = Invoke-ExternalCommand -WorkingDirectory $backendPath -Command 'npm' -Arguments @('run', 'lint')
if ($exitCode -ne 0) { throw 'Backend lint failed.' }
$exitCode = Invoke-ExternalCommand -WorkingDirectory $backendPath -Command 'npm' -Arguments @('test')
if ($exitCode -ne 0) {
    throw 'Backend tests failed.'
}

Write-Host "`n[3/8] Auditing backend dependencies (high and critical findings block)"
$exitCode = Invoke-ExternalCommand -WorkingDirectory $backendPath -Command 'npm' -Arguments @('run', 'audit:security')
if ($exitCode -ne 0) { throw 'Backend dependency security audit failed.' }

if (-not $SkipInstall) {
    Write-Host "`n[4/8] Installing frontend dependencies with npm ci"
    $exitCode = Invoke-ExternalCommand -WorkingDirectory $frontendPath -Command 'npm' -Arguments @('ci')
    if ($exitCode -ne 0) {
        throw "Frontend dependency installation failed with exit code $exitCode."
    }
}
else {
    Write-Host "`n[4/8] Frontend dependency installation skipped by request"
}

Write-Host "`n[5/8] Auditing frontend dependencies (high and critical findings block)"
$exitCode = Invoke-ExternalCommand -WorkingDirectory $frontendPath -Command 'npm' -Arguments @('run', 'audit:security')
if ($exitCode -ne 0) { throw 'Frontend dependency security audit failed.' }

Write-Host "`n[6/8] Building frontend production bundle"
$exitCode = Invoke-ExternalCommand -WorkingDirectory $frontendPath -Command 'npm' -Arguments @('run', 'lint')
if ($exitCode -ne 0) { throw 'Frontend lint failed.' }
$exitCode = Invoke-ExternalCommand -WorkingDirectory $frontendPath -Command 'npm' -Arguments @('run', 'build')
if ($exitCode -ne 0) {
    throw "Frontend production build failed with exit code $exitCode."
}

Write-Host "`n[7/8] Compiling and testing Rust contract library"
if ($IsWindows -or $env:OS -eq 'Windows_NT') {
    $exitCode = Invoke-ExternalCommand -WorkingDirectory $contractPath -Command 'cargo' -Arguments @('fmt', '--check')
    if ($exitCode -ne 0) { throw 'Rust contract formatting check failed.' }
    Write-Warning 'near-vm-runner unit tests are not Windows-compatible; authoritative cargo test/clippy/WASM checks run in Ubuntu CI.'
}
else {
    $exitCode = Invoke-ExternalCommand -WorkingDirectory $contractPath -Command 'cargo' -Arguments @('test')
    if ($exitCode -ne 0) { throw 'Rust contract tests failed.' }
}

Write-Host "`n[8/8] Checking Git whitespace errors"
$exitCode = Invoke-ExternalCommand -WorkingDirectory $repositoryRoot -Command 'git' -Arguments @('diff', '--check')
if ($exitCode -ne 0) {
    throw "git diff --check failed with exit code $exitCode."
}

Write-Host "`nLocal verification PASSED." -ForegroundColor Green
Write-Host 'Confirm Vercel Preview is Ready before merging frontend-affecting changes.'
