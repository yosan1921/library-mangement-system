#!/bin/bash

# Admin API Testing Script
# This script tests all admin-related API endpoints

API_URL="http://localhost:8080/api"

echo "=========================================="
echo "Admin API Testing Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Initialize test data
echo -e "${YELLOW}Test 1: Initialize test data${NC}"
curl -X POST "${API_URL}/init/test-data" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# Test 2: Check users
echo -e "${YELLOW}Test 2: Check existing users${NC}"
curl -X GET "${API_URL}/init/check-users" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# Test 3: Login as admin
echo -e "${YELLOW}Test 3: Login as admin${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
echo "$LOGIN_RESPONSE" | jq '.'
ADMIN_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.id')
echo -e "Admin ID: ${GREEN}${ADMIN_ID}${NC}\n"

# Test 4: Get all admins
echo -e "${YELLOW}Test 4: Get all admins${NC}"
curl -X GET "${API_URL}/admins" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n" | jq '.'

# Test 5: Get active admins
echo -e "${YELLOW}Test 5: Get active admins${NC}"
curl -X GET "${API_URL}/admins/active" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n" | jq '.'

# Test 6: Get admin by ID
echo -e "${YELLOW}Test 6: Get admin by ID${NC}"
curl -X GET "${API_URL}/admins/${ADMIN_ID}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n" | jq '.'

# Test 7: Get all permissions
echo -e "${YELLOW}Test 7: Get all permissions${NC}"
curl -X GET "${API_URL}/admins/permissions" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n" | jq '.'

# Test 8: Get permissions for ADMIN role
echo -e "${YELLOW}Test 8: Get permissions for ADMIN role${NC}"
curl -X GET "${API_URL}/admins/permissions/role/ADMIN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n" | jq '.'

# Test 9: Create new admin
echo -e "${YELLOW}Test 9: Create new admin${NC}"
NEW_ADMIN_RESPONSE=$(curl -s -X POST "${API_URL}/admins?createdBy=admin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testadmin",
    "password": "test123",
    "fullName": "Test Admin",
    "email": "testadmin@library.com",
    "phone": "1234567890",
    "role": "ADMIN",
    "permissions": ["MANAGE_BOOKS", "MANAGE_MEMBERS", "VIEW_REPORTS"]
  }')
echo "$NEW_ADMIN_RESPONSE" | jq '.'
NEW_ADMIN_ID=$(echo "$NEW_ADMIN_RESPONSE" | jq -r '.id')
echo -e "New Admin ID: ${GREEN}${NEW_ADMIN_ID}${NC}\n"

# Test 10: Update admin profile
echo -e "${YELLOW}Test 10: Update admin profile${NC}"
curl -X PUT "${API_URL}/admins/${NEW_ADMIN_ID}/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Test Admin",
    "email": "updated@library.com",
    "phone": "9876543210"
  }' \
  -w "\nStatus: %{http_code}\n\n" | jq '.'

# Test 11: Change password
echo -e "${YELLOW}Test 11: Change password${NC}"
curl -X PUT "${API_URL}/admins/${NEW_ADMIN_ID}/password" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "test123",
    "newPassword": "newpass123"
  }' \
  -w "\nStatus: %{http_code}\n\n" | jq '.'

# Test 12: Deactivate admin
echo -e "${YELLOW}Test 12: Deactivate admin${NC}"
curl -X POST "${API_URL}/admins/${NEW_ADMIN_ID}/deactivate" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n" | jq '.'

# Test 13: Activate admin
echo -e "${YELLOW}Test 13: Activate admin${NC}"
curl -X POST "${API_URL}/admins/${NEW_ADMIN_ID}/activate" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n" | jq '.'

# Test 14: Delete admin
echo -e "${YELLOW}Test 14: Delete admin${NC}"
curl -X DELETE "${API_URL}/admins/${NEW_ADMIN_ID}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${GREEN}=========================================="
echo "All tests completed!"
echo -e "==========================================${NC}"
