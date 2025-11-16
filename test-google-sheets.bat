@echo off
echo ========================================
echo  Testing Google Sheets Integration
echo ========================================
echo.

powershell -Command "$url = 'https://script.google.com/macros/s/AKfycbwrLmgGq_jVC5WgZvDwn8jnHv7hDYVLOd80RAbmhuKhNtUErW7vXPAMAOHNAhCqEfth/exec'; $data = '{\"timestamp\":\"' + (Get-Date -Format 'o') + '\",\"email\":\"test-command@example.com\",\"name\":\"Test from Command Line\",\"phone\":\"1234567890\",\"category\":\"Test Category\",\"selectedPlan\":\"Test Plan\",\"action\":\"Command Line Test\",\"cookiesAccepted\":true,\"test\":true,\"city\":\"Test City\",\"country\":\"Test Country\"}'; Write-Host '📤 Sending test data...' -ForegroundColor Yellow; try { $response = Invoke-WebRequest -Uri $url -Method POST -Body $data -ContentType 'application/json' -UseBasicParsing; Write-Host ''; Write-Host '✅ SUCCESS! Status Code:' $response.StatusCode -ForegroundColor Green; Write-Host 'Response:' $response.Content -ForegroundColor Green; Write-Host ''; Write-Host '📊 Next Steps:' -ForegroundColor Cyan; Write-Host '1. Open your Google Sheet' -ForegroundColor White; Write-Host '2. Look for email: test-command@example.com' -ForegroundColor White; Write-Host '3. Check action column: Command Line Test' -ForegroundColor White } catch { Write-Host ''; Write-Host '❌ ERROR!' $_.Exception.Message -ForegroundColor Red }"

echo.
echo ========================================
pause

