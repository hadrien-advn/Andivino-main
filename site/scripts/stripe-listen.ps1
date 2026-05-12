param(
  [switch]$Check
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root '.env'

if (-not (Test-Path $envPath)) {
  throw '.env introuvable. Creez-le depuis .env.example puis renseignez les cles Stripe.'
}

$envVars = @{}
Get-Content $envPath | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith('#') -or -not $line.Contains('=')) {
    return
  }

  $key, $value = $line.Split('=', 2)
  $envVars[$key.Trim()] = $value.Trim().Trim('"').Trim("'")
}

if (-not $envVars['STRIPE_SECRET_KEY'] -or -not $envVars['STRIPE_SECRET_KEY'].StartsWith('sk_test_')) {
  throw 'STRIPE_SECRET_KEY manquante ou invalide dans .env.'
}

$stripeCommand = Get-Command stripe -ErrorAction SilentlyContinue
$stripeExe = if ($stripeCommand) {
  $stripeCommand.Source
} else {
  $wingetStripe = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe'
  if (Test-Path $wingetStripe) {
    $wingetStripe
  } else {
    throw 'Stripe CLI est introuvable. Installez-le puis relancez ce script.'
  }
}

$port = if ($envVars['PORT']) { $envVars['PORT'] } else { '4242' }
$forwardTo = "localhost:$port/api/stripe/webhook"

$env:STRIPE_API_KEY = $envVars['STRIPE_SECRET_KEY']

if ($Check) {
  & $stripeExe --version
  Write-Host "Forward target: $forwardTo"
  Write-Host 'Configuration Stripe CLI locale OK.'
  exit 0
}

Write-Host "Ecoute des webhooks Stripe vers $forwardTo"
Write-Host 'Copiez le secret whsec_... affiche par Stripe dans STRIPE_WEBHOOK_SECRET, puis gardez ce terminal ouvert.'
& $stripeExe listen --forward-to $forwardTo
