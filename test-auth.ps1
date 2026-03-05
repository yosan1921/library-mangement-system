$body = @{
    username = "testmember"
    password = "password123"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    Write-Host "Testing authentication..."
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/members/authenticate" -Method POST -Body $body -Headers $headers
    Write-Host "Success! Response:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error occurred:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
    }
}