$KEY = "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"
$URL = "https://openrouter.ai/api/v1/chat/completions"

$lobos = @{
    "CRITICO"    = "google/gemma-3-4b-it:free"
    "CRIATIVO"   = "google/gemma-3n-e4b-it:free"
    "ANALITICO"  = "liquid/lfm-2.5-1.2b-instruct:free"
    "PRAGMATICO" = "openai/gpt-oss-120b:free"
    "FILOSOFICO" = "nvidia/nemotron-3-nano-30b-a3b:free"
}

$body = @{
    messages   = @(@{ role = "user"; content = "Responde em 1 frase: o que és?" })
    max_tokens = 60
}

foreach ($lobo in $lobos.GetEnumerator()) {
    $body.model = $lobo.Value
    $json = $body | ConvertTo-Json -Depth 5
    Write-Host "`n[LOBO $($lobo.Key)] - $($lobo.Value)" -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    try {
        $res = Invoke-RestMethod -Uri $URL -Method POST `
            -Headers @{"Authorization"="Bearer $KEY"; "Content-Type"="application/json"} `
            -Body $json
        Write-Host "✅ $($res.choices[0].message.content)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ ERRO: $_" -ForegroundColor Red
    }
}
Write-Host "`n--- Teste concluído ---" -ForegroundColor Yellow
