#!/bin/bash

# Admin API Testing Script
# Tests all Phase 3 admin endpoints with authentication

set -e  # Exit on error

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Admin API Testing Suite - Phase 3${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print test result
print_result() {
  local test_name="$1"
  local status="$2"
  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  if [ "$status" = "PASS" ]; then
    echo -e "${GREEN}✓${NC} $test_name"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}✗${NC} $test_name"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

# Function to extract cookie from response
extract_cookie() {
  local response="$1"
  echo "$response" | grep -i "set-cookie:" | head -1 | sed 's/set-cookie: //i' | cut -d ';' -f 1
}

echo -e "${YELLOW}Step 1: Authentication${NC}"
echo "Testing NextAuth login endpoint..."

# Test 1: Login with admin credentials
LOGIN_RESPONSE=$(curl -s -i -X POST "$API_URL/auth/callback/credentials" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@radioplatform.com",
    "password": "Admin123!",
    "redirect": false
  }')

SESSION_COOKIE=$(extract_cookie "$LOGIN_RESPONSE")

if [ -n "$SESSION_COOKIE" ]; then
  print_result "Admin login successful" "PASS"
  echo -e "   Session: ${SESSION_COOKIE:0:30}..."
else
  print_result "Admin login failed" "FAIL"
  echo "Login response:"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

# Test 2: Invalid credentials
INVALID_LOGIN=$(curl -s -X POST "$API_URL/auth/callback/credentials" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@radioplatform.com",
    "password": "WrongPassword",
    "redirect": false
  }')

if echo "$INVALID_LOGIN" | grep -q "error"; then
  print_result "Invalid credentials rejected" "PASS"
else
  print_result "Invalid credentials not rejected" "FAIL"
fi

echo ""
echo -e "${YELLOW}Step 2: Station Management${NC}"
echo "Testing station CRUD endpoints..."

# Test 3: List all stations
STATIONS_LIST=$(curl -s -X GET "$API_URL/admin/stations" \
  -H "Cookie: $SESSION_COOKIE")

if echo "$STATIONS_LIST" | grep -q '"success":true'; then
  print_result "GET /api/admin/stations" "PASS"
  STATION_COUNT=$(echo "$STATIONS_LIST" | grep -o '"total":[0-9]*' | cut -d ':' -f 2)
  echo -e "   Found $STATION_COUNT stations"
else
  print_result "GET /api/admin/stations" "FAIL"
fi

# Extract first station ID for subsequent tests
STATION_ID=$(echo "$STATIONS_LIST" | grep -o '"id":"[^"]*"' | head -1 | cut -d '"' -f 4)
echo -e "   Using station ID: $STATION_ID"

# Test 4: Get station by ID
STATION_DETAIL=$(curl -s -X GET "$API_URL/admin/stations/$STATION_ID" \
  -H "Cookie: $SESSION_COOKIE")

if echo "$STATION_DETAIL" | grep -q '"success":true'; then
  print_result "GET /api/admin/stations/[id]" "PASS"
else
  print_result "GET /api/admin/stations/[id]" "FAIL"
fi

# Test 5: Create new station
NEW_STATION=$(curl -s -X POST "$API_URL/admin/stations" \
  -H "Cookie: $SESSION_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Radio Station",
    "slug": "test-radio-station",
    "contactEmail": "test@testradio.com",
    "streamUrlPrimary": "https://streaming.example.com/test",
    "description": "A test radio station created by automated testing",
    "musicGenre": "Various"
  }')

if echo "$NEW_STATION" | grep -q '"success":true'; then
  print_result "POST /api/admin/stations (create)" "PASS"
  NEW_STATION_ID=$(echo "$NEW_STATION" | grep -o '"id":"[^"]*"' | head -1 | cut -d '"' -f 4)
  NEW_API_KEY=$(echo "$NEW_STATION" | grep -o '"apiKey":"[^"]*"' | cut -d '"' -f 4)
  echo -e "   Created station ID: $NEW_STATION_ID"
  echo -e "   API Key: ${NEW_API_KEY:0:20}..."
else
  print_result "POST /api/admin/stations (create)" "FAIL"
  NEW_STATION_ID=""
fi

# Test 6: Update station
if [ -n "$NEW_STATION_ID" ]; then
  UPDATE_STATION=$(curl -s -X PUT "$API_URL/admin/stations/$NEW_STATION_ID" \
    -H "Cookie: $SESSION_COOKIE" \
    -H "Content-Type: application/json" \
    -d '{
      "description": "Updated test description",
      "musicGenre": "Test Genre Updated"
    }')

  if echo "$UPDATE_STATION" | grep -q '"success":true'; then
    print_result "PUT /api/admin/stations/[id] (update)" "PASS"
  else
    print_result "PUT /api/admin/stations/[id] (update)" "FAIL"
  fi
fi

# Test 7: Suspend station
if [ -n "$NEW_STATION_ID" ]; then
  SUSPEND_STATION=$(curl -s -X POST "$API_URL/admin/stations/$NEW_STATION_ID/suspend" \
    -H "Cookie: $SESSION_COOKIE" \
    -H "Content-Type: application/json" \
    -d '{"reason": "Testing suspension feature"}')

  if echo "$SUSPEND_STATION" | grep -q '"status":"suspended"'; then
    print_result "POST /api/admin/stations/[id]/suspend" "PASS"
  else
    print_result "POST /api/admin/stations/[id]/suspend" "FAIL"
  fi
fi

# Test 8: Activate station
if [ -n "$NEW_STATION_ID" ]; then
  ACTIVATE_STATION=$(curl -s -X POST "$API_URL/admin/stations/$NEW_STATION_ID/activate" \
    -H "Cookie: $SESSION_COOKIE")

  if echo "$ACTIVATE_STATION" | grep -q '"status":"active"'; then
    print_result "POST /api/admin/stations/[id]/activate" "PASS"
  else
    print_result "POST /api/admin/stations/[id]/activate" "FAIL"
  fi
fi

# Test 9: Delete station
if [ -n "$NEW_STATION_ID" ]; then
  DELETE_STATION=$(curl -s -X DELETE "$API_URL/admin/stations/$NEW_STATION_ID" \
    -H "Cookie: $SESSION_COOKIE")

  if echo "$DELETE_STATION" | grep -q '"success":true'; then
    print_result "DELETE /api/admin/stations/[id]" "PASS"
  else
    print_result "DELETE /api/admin/stations/[id]" "FAIL"
  fi
fi

# Test 10: Pagination and filtering
FILTERED_STATIONS=$(curl -s -X GET "$API_URL/admin/stations?status=active&page=1&pageSize=10" \
  -H "Cookie: $SESSION_COOKIE")

if echo "$FILTERED_STATIONS" | grep -q '"success":true'; then
  print_result "GET /api/admin/stations (with filters)" "PASS"
else
  print_result "GET /api/admin/stations (with filters)" "FAIL"
fi

echo ""
echo -e "${YELLOW}Step 3: Payment Management${NC}"
echo "Testing payment endpoints..."

# Test 11: List payments
PAYMENTS_LIST=$(curl -s -X GET "$API_URL/admin/payments" \
  -H "Cookie: $SESSION_COOKIE")

if echo "$PAYMENTS_LIST" | grep -q '"success":true'; then
  print_result "GET /api/admin/payments" "PASS"
  PAYMENT_COUNT=$(echo "$PAYMENTS_LIST" | grep -o '"total":[0-9]*' | cut -d ':' -f 2)
  echo -e "   Found $PAYMENT_COUNT payments"
else
  print_result "GET /api/admin/payments" "FAIL"
fi

# Extract payment ID for testing
PAYMENT_ID=$(echo "$PAYMENTS_LIST" | grep -o '"id":"[^"]*"' | head -1 | cut -d '"' -f 4)

# Test 12: Get payment by ID
if [ -n "$PAYMENT_ID" ]; then
  PAYMENT_DETAIL=$(curl -s -X GET "$API_URL/admin/payments/$PAYMENT_ID" \
    -H "Cookie: $SESSION_COOKIE")

  if echo "$PAYMENT_DETAIL" | grep -q '"success":true'; then
    print_result "GET /api/admin/payments/[id]" "PASS"
  else
    print_result "GET /api/admin/payments/[id]" "FAIL"
  fi
fi

# Test 13: Create payment
CREATE_PAYMENT=$(curl -s -X POST "$API_URL/admin/payments" \
  -H "Cookie: $SESSION_COOKIE" \
  -H "Content-Type: application/json" \
  -d "{
    \"stationId\": \"$STATION_ID\",
    \"amount\": 9900,
    \"status\": \"paid\",
    \"notes\": \"Test payment from automated testing\",
    \"extendSubscriptionDays\": 30
  }")

if echo "$CREATE_PAYMENT" | grep -q '"success":true'; then
  print_result "POST /api/admin/payments (create)" "PASS"
  NEW_PAYMENT_ID=$(echo "$CREATE_PAYMENT" | grep -o '"id":"[^"]*"' | head -1 | cut -d '"' -f 4)
  echo -e "   Created payment ID: $NEW_PAYMENT_ID"
else
  print_result "POST /api/admin/payments (create)" "FAIL"
fi

# Test 14: Upcoming renewals
UPCOMING_RENEWALS=$(curl -s -X GET "$API_URL/admin/payments/upcoming?days=30" \
  -H "Cookie: $SESSION_COOKIE")

if echo "$UPCOMING_RENEWALS" | grep -q '"success":true'; then
  print_result "GET /api/admin/payments/upcoming" "PASS"
  EXPIRING_COUNT=$(echo "$UPCOMING_RENEWALS" | grep -o '"totalStations":[0-9]*' | cut -d ':' -f 2)
  echo -e "   Stations expiring in 30 days: $EXPIRING_COUNT"
else
  print_result "GET /api/admin/payments/upcoming" "FAIL"
fi

# Test 15: Filter payments by status
PAID_PAYMENTS=$(curl -s -X GET "$API_URL/admin/payments?status=paid" \
  -H "Cookie: $SESSION_COOKIE")

if echo "$PAID_PAYMENTS" | grep -q '"success":true'; then
  print_result "GET /api/admin/payments (filter by status)" "PASS"
else
  print_result "GET /api/admin/payments (filter by status)" "FAIL"
fi

echo ""
echo -e "${YELLOW}Step 4: Email Management${NC}"
echo "Testing email endpoints..."

# Test 16: List email templates
EMAIL_TEMPLATES=$(curl -s -X GET "$API_URL/admin/emails/templates" \
  -H "Cookie: $SESSION_COOKIE")

if echo "$EMAIL_TEMPLATES" | grep -q '"success":true'; then
  print_result "GET /api/admin/emails/templates" "PASS"
  TEMPLATE_COUNT=$(echo "$EMAIL_TEMPLATES" | grep -o '"total":[0-9]*' | cut -d ':' -f 2)
  echo -e "   Found $TEMPLATE_COUNT email templates"
else
  print_result "GET /api/admin/emails/templates" "FAIL"
fi

# Test 17: Send test email
TEST_EMAIL=$(curl -s -X POST "$API_URL/admin/emails/test" \
  -H "Cookie: $SESSION_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "template": "7-day"
  }')

if echo "$TEST_EMAIL" | grep -q '"sent":true'; then
  print_result "POST /api/admin/emails/test" "PASS"

  # Check for Ethereal preview URL
  if echo "$TEST_EMAIL" | grep -q '"preview"'; then
    PREVIEW_URL=$(echo "$TEST_EMAIL" | grep -o '"preview":"[^"]*"' | cut -d '"' -f 4)
    echo -e "   ${BLUE}Preview URL:${NC} $PREVIEW_URL"
  fi
else
  print_result "POST /api/admin/emails/test" "FAIL"
fi

# Test 18: Send subscription reminder
SEND_REMINDER=$(curl -s -X POST "$API_URL/admin/emails/reminder" \
  -H "Cookie: $SESSION_COOKIE" \
  -H "Content-Type: application/json" \
  -d "{
    \"stationId\": \"$STATION_ID\",
    \"type\": \"7-day\",
    \"customMessage\": \"This is a test reminder from automated testing.\"
  }")

if echo "$SEND_REMINDER" | grep -q '"sent":true'; then
  print_result "POST /api/admin/emails/reminder" "PASS"

  # Check for Ethereal preview URL
  if echo "$SEND_REMINDER" | grep -q '"preview"'; then
    PREVIEW_URL=$(echo "$SEND_REMINDER" | grep -o '"preview":"[^"]*"' | cut -d '"' -f 4)
    echo -e "   ${BLUE}Preview URL:${NC} $PREVIEW_URL"
  fi
else
  print_result "POST /api/admin/emails/reminder" "FAIL"
fi

echo ""
echo -e "${YELLOW}Step 5: Authorization Tests${NC}"
echo "Testing role-based access control..."

# Test 19: Unauthenticated request (no cookie)
UNAUTH_REQUEST=$(curl -s -X GET "$API_URL/admin/stations")

if echo "$UNAUTH_REQUEST" | grep -q '"code":"UNAUTHORIZED"'; then
  print_result "Unauthenticated request blocked" "PASS"
else
  print_result "Unauthenticated request not blocked" "FAIL"
fi

# Test 20: Login as station user
STATION_LOGIN=$(curl -s -X POST "$API_URL/auth/callback/credentials" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@magicfm.com",
    "password": "Station123!",
    "redirect": false
  }')

STATION_COOKIE=$(extract_cookie "$STATION_LOGIN")

if [ -n "$STATION_COOKIE" ]; then
  # Test 21: Station user trying to access admin endpoint
  FORBIDDEN_REQUEST=$(curl -s -X GET "$API_URL/admin/stations" \
    -H "Cookie: $STATION_COOKIE")

  if echo "$FORBIDDEN_REQUEST" | grep -q '"code":"FORBIDDEN"'; then
    print_result "Station user blocked from admin endpoints" "PASS"
  else
    print_result "Station user not blocked from admin endpoints" "FAIL"
  fi
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "\n${GREEN}✓ All tests passed!${NC}\n"
  exit 0
else
  echo -e "\n${RED}✗ Some tests failed!${NC}\n"
  exit 1
fi
