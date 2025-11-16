# Test Google Sheets Integration
# Run this script: .\test-google-sheets.ps1

$GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrLmgGq_jVC5WgZvDwn8jnHv7hDYVLOd80RAbmhuKhNtUErW7vXPAMAOHNAhCqEfth/exec"

Write-Host "🧪 Testing Google Sheets Integration..." -ForegroundColor Cyan
Write-Host "📤 Sending test data to: $GOOGLE_SCRIPT_URL" -ForegroundColor Yellow
Write-Host ""

# Create test data
$testData = @{
    timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
    date = (Get-Date -Format "dd/MM/yyyy")
    time = (Get-Date -Format "HH:mm:ss")
    email = "test-command@example.com"
    name = "Test from Command Line"
    phone = "1234567890"
    category = "Test Category"
    selectedPlan = "Test Plan"
    selectedPlanPrice = "100 DA"
    planSelectedDate = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
    action = "Command Line Test"
    cookiesAccepted = $true
    test = $true
    message = "Testing Google Sheets integration from PowerShell command line"
    city = "Test City"
    country = "Test Country"
    ip = "192.168.1.1"
} | ConvertTo-Json

Write-Host "📋 Test Data:" -ForegroundColor Cyan
Write-Host $testData
Write-Host ""

try {
    Write-Host "⏳ Sending request..." -ForegroundColor Yellow
    
    # Send POST request
    $response = Invoke-WebRequest -Uri $GOOGLE_SCRIPT_URL -Method POST -Body $testData -ContentType "application/json" -UseBasicParsing
    
    Write-Host ""
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Open your Google Sheet" -ForegroundColor White
    Write-Host "2. Look for a new row with email: test-command@example.com" -ForegroundColor White
    Write-Host "3. Check the action column for: Command Line Test" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 405) {
            Write-Host ""
            Write-Host "⚠️ Method Not Allowed - This might mean:" -ForegroundColor Yellow
            Write-Host "- The Web App URL might be incorrect" -ForegroundColor Yellow
            Write-Host "- The Web App might not be deployed correctly" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Cyan
    Write-Host "1. Check that GOOGLE_SCRIPT_URL is correct" -ForegroundColor White
    Write-Host "2. Verify your Google Apps Script is deployed as Web App" -ForegroundColor White
    Write-Host "3. Make sure 'Who has access' is set to 'Anyone'" -ForegroundColor White
    Write-Host "4. Check that the Web App is published (not just saved)" -ForegroundColor White
    Write-Host ""
}
