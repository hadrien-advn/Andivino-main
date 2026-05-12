$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$archiveName = 'andivino-site-handoff.zip'
$archivePath = Join-Path $root $archiveName
$staging = Join-Path $env:TEMP ('andivino-handoff-' + [Guid]::NewGuid().ToString('N'))

$excludedDirs = @(
  'node_modules',
  'storage',
  '.git',
  'dist',
  'build'
)

$excludedFiles = @(
  '.env',
  $archiveName
)

$excludedExtensions = @(
  '.log',
  '.tmp',
  '.zip'
)

function Should-Skip($item) {
  $fullName = $item.FullName
  $parts = $fullName -split '[\\/]'

  foreach ($dir in $excludedDirs) {
    if ($parts -contains $dir) {
      return $true
    }
  }

  if (-not $item.PSIsContainer) {
    if ($excludedFiles -contains $item.Name) {
      return $true
    }
    if ($excludedExtensions -contains $item.Extension) {
      return $true
    }
  }

  return $false
}

if (Test-Path $archivePath) {
  Remove-Item -LiteralPath $archivePath -Force
}

New-Item -ItemType Directory -Path $staging | Out-Null

try {
  Get-ChildItem -LiteralPath $root -Force | Where-Object { -not (Should-Skip $_) } | ForEach-Object {
    $destination = Join-Path $staging $_.Name
    if ($_.PSIsContainer) {
      Copy-Item -LiteralPath $_.FullName -Destination $destination -Recurse -Force -Container
      Get-ChildItem -LiteralPath $destination -Recurse -Force | Where-Object { Should-Skip $_ } | ForEach-Object {
        Remove-Item -LiteralPath $_.FullName -Recurse -Force
      }
    } else {
      Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
    }
  }

  Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $archivePath -Force
  Write-Host "Archive creee : $archivePath"
  Write-Host 'Archive sans .env, node_modules, storage, logs ni zip precedent.'
} finally {
  if (Test-Path $staging) {
    Remove-Item -LiteralPath $staging -Recurse -Force
  }
}
