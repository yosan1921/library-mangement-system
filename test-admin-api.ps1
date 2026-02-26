# Admin API Testing Script (PowerShell)
# This script tests all admin-related API endpoints

$API_URL = "http://localhost:8080/api"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Admin API Testing Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Initialize test data
Write-Host "Test 1: Initialize test data" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/init/test-data" -Method Post -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: Success" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Check users
Write-Host "Test 2: Check existing users" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/init/check-users" -Method Get -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: Success" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Login as admin
Write-Host "Test 3: Login as admin" -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $loginResponse | ConvertTo-Json -Depth 10
    $ADMIN_ID = $loginResponse.id
    Write-Host "Admin ID: $ADMIN_ID" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get all admins
Write-Host "Test 4: Get all admins" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/admins" -Method Get -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: Success" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get active admins
Write-Host "Test 5: Get active admins" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/admins/active" -Method Get -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: Success" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Get admin by ID
Write-Host "Test 6: Get admin by ID" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/admins/$ADMIN_ID" -Method Get -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: Success" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get all permissions
Write-Host "Test 7: Get all permissions" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/admins/permissions" -Method Get -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: Success" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 8: Get permissions for ADMIN role
Write-Host "Test 8: Get permissions for ADMIN role" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/admins/permissions/role/ADMIN" -Method Get -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: Success" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 9: Create new admin
Write-Host "Test 9: Create new admin" -ForegroundColor Yellow
try {
    $newAdminBody = @{
        username = "testadmin"
        password = "test123"
        fullName = "Test Admin"
        email = "testadmin@library.com"
        phone = "1234567890"
        role = "ADMIN"
        permissions = @("MANAGE_BOOKS", "MANAGE_MEMBERS", "VIEW_REPORTS")
    } | ConvertTo-Json
    
    $newAdminResponse = Invoke-RestMethod -Uri "$API_URL/admins?createdBy=admin" -Method Post -Body $newAdminBody -ContentType "application/json"
    $newAdminResponse | ConvertTo-Json -Depth 10
    $NEW_ADMIN_ID = $newAdminResponse.id
    Write-Host "New Admin ID: $NEW_ADMIN_ID" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 10: Update admin profile
Write-Host "Test 10: Update admin profile" -ForegroundColor Yellow
try {
    $updateBody = @{
        fullName = "Updated Test Admin"
        email = "updated@library.com"
        phone = "9876543210"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$API_URL/admins/$NEW_ADMIN_ID/profile" -Method Put -Body $updateBody -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: Success" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 11: Change password
Write-Host "Test 11: Change password" -ForegroundColor Yellow
try {
    $passwordBody = @{
        oldPassword = "test123"
        newPassword = "newpass123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$API_URL/admins/$NEW_ADMIN_ID/password" -Method Put -Body $passwordBody -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: Success" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 12: Deactivate admin
Write-Host "Test 12: Deactivate admin" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/admins/$NEW_ADMIN_ID/deactivate" -Method Post -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: Success" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 13: Activate admin
Write-Host "Test 13: Activate admin" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/admins/$NEW_ADMIN_ID/activate" -Method Post -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: Success" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 14: Delete admin
Write-Host "Test 14: Delete admin" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$API_URL/admins/$NEW_ADMIN_ID" -Method Delete -ContentType "application/json"
    Write-Host "Status: Success - Admin deleted" -ForegroundColor Green
} catch {
    Write-Host "Status: Failed - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "All tests completed!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
