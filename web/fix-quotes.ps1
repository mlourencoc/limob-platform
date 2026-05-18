# fix-quotes.ps1
# Corrige aspas simples duplicadas ('') causadas pelo PowerShell here-string
# Execute dentro de: C:\Users\malou\limob-platform\web

$base = $PSScriptRoot

$extensions = @("*.ts", "*.tsx", "*.css", "*.js", "*.mjs")
$dirs = @("app", "components", "lib", "types")

$fixed = 0

foreach ($dir in $dirs) {
    $fullDir = Join-Path $base $dir
    if (!(Test-Path $fullDir)) { continue }

    foreach ($ext in $extensions) {
        Get-ChildItem -Path $fullDir -Recurse -Filter $ext | ForEach-Object {
            $content = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)

            # Corrigir aspas duplicadas em imports: from ''x'' -> from 'x'
            # e qualquer ocorrência de '' que não seja escape intencional
            $newContent = $content -replace "''", "'"

            if ($newContent -ne $content) {
                [System.IO.File]::WriteAllText($_.FullName, $newContent, [System.Text.Encoding]::UTF8)
                Write-Host "  corrigido: $($_.FullName.Replace($base, ''))" -ForegroundColor Green
                $fixed++
            }
        }
    }
}

# Corrigir também os arquivos na raiz
foreach ($ext in $extensions) {
    Get-ChildItem -Path $base -Filter $ext | ForEach-Object {
        $content = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
        $newContent = $content -replace "''", "'"
        if ($newContent -ne $content) {
            [System.IO.File]::WriteAllText($_.FullName, $newContent, [System.Text.Encoding]::UTF8)
            Write-Host "  corrigido: $($_.Name)" -ForegroundColor Green
            $fixed++
        }
    }
}

Write-Host ""
Write-Host "=== $fixed arquivo(s) corrigido(s) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Limpando cache..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

Write-Host "Pronto! Rode: npm run dev" -ForegroundColor Green
