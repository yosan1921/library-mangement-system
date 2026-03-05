# Backend Connectivity Test Script
Write-Host "Testing Library Management System Backend..." -ForegroundColor Green

# Test 1: Check if backend is running
Write-Host "`n1. Testing basic connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/test/credentials" -Method GET -ContentType "application/json"
    Write-Host "✓ Backend is accessible" -ForegroundColor Green
    Write-Host "Test credentials available:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Backend not accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure to start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd backendlab" -ForegroundColor Gray
    Write-Host "  ./mvnw spring-boot:run" -ForegroundColor Gray
    exit 1
}

# Test 2: Create test member
Write-Host "`n2. Creating/checking test member..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/test/create-test-member" -Method POST -ContentType "application/json"
    Write-Host "✓ Test member ready" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Failed to create test member: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test authentication
Write-Host "`n3. Testing member authentication..." -ForegroundColor Yellow
try {
    $authBody = @{
        username = "testmember"
        password = "password123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/members/authenticate" -Method POST -Body $authBody -ContentType "application/json"
    Write-Host "✓ Authentication successful!" -ForegroundColor Green
    Write-Host "Member ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "Username: $($response.username)" -ForegroundColor Cyan
    Write-Host "Email: $($response.email)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 4: Test with wrong credentials
Write-Host "`n4. Testing with invalid credentials..." -ForegroundColor Yellow
try {
    $authBody = @{
        username = "wronguser"
        password = "wrongpass"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/members/authenticate" -Method POST -Body $authBody -ContentType "application/json"
    Write-Host "✗ This should have failed!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected invalid credentials" -ForegroundColor Green
}

Write-Host "`nBackend test completed!" -ForegroundColor Green
Write-Host "`nIf all tests passed, the issue is likely in the frontend." -ForegroundColor Yellow
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open the frontend in a browser" -ForegroundColor Gray
Write-Host "2. Open Developer Tools (F12)" -ForegroundColor Gray
Write-Host "3. Go to Network tab" -ForegroundColor Gray
Write-Host "4. Try to login and check the network requests" -ForegroundColor Gray
Write-Host "5. Check Console tab for JavaScript errors" -ForegroundColor Gray