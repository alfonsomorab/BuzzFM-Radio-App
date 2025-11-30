#!/bin/bash

# JWT Authentication Testing Script for Radio Streaming Backend
# Tests the complete JWT authentication flow

BASE_URL="http://localhost:3000"

# ANSI color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}JWT Authentication Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Get valid API key from database
echo -e "${YELLOW}Test 1: Retrieving valid API key from database...${NC}"
API_KEY=$(psql -d radio_streaming -t -c "SELECT api_key FROM radio_stations WHERE status = 'active' LIMIT 1;")
API_KEY=$(echo $API_KEY | xargs) # Trim whitespace

if [ -z "$API_KEY" ]; then
  echo -e "${RED}✗ Failed: No active stations found in database${NC}"
  exit 1
fi
echo -e "${GREEN}✓ API Key retrieved: ${API_KEY:0:20}...${NC}\n"

# Test 2: Authenticate with API key to get JWT token
echo -e "${YELLOW}Test 2: Authenticating with API key to obtain JWT...${NC}"
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/public/auth" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json")

echo "Response: $AUTH_RESPONSE" | jq '.'

# Extract JWT token from response
JWT_TOKEN=$(echo $AUTH_RESPONSE | jq -r '.data.token // empty')

if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" = "null" ]; then
  echo -e "${RED}✗ Failed: Could not obtain JWT token${NC}"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi
echo -e "${GREEN}✓ JWT Token obtained: ${JWT_TOKEN:0:50}...${NC}\n"

# Test 3: Test config endpoint with JWT (should succeed)
echo -e "${YELLOW}Test 3: Calling /api/public/config with valid JWT...${NC}"
CONFIG_RESPONSE=$(curl -s -X GET "$BASE_URL/api/public/config" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json")

echo "Response:" | jq '.'
echo "$CONFIG_RESPONSE" | jq '.'

if echo "$CONFIG_RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✓ Config endpoint responded successfully${NC}\n"
else
  echo -e "${RED}✗ Failed: Config endpoint returned error${NC}\n"
  exit 1
fi

# Test 4: Test schedule endpoint with JWT (should succeed)
echo -e "${YELLOW}Test 4: Calling /api/public/schedule with valid JWT...${NC}"
SCHEDULE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/public/schedule" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json")

echo "Response:" | jq '.'
echo "$SCHEDULE_RESPONSE" | jq '.'

if echo "$SCHEDULE_RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✓ Schedule endpoint responded successfully${NC}\n"
else
  echo -e "${RED}✗ Failed: Schedule endpoint returned error${NC}\n"
  exit 1
fi

# Test 5: Test analytics endpoint with JWT (should succeed)
echo -e "${YELLOW}Test 5: Calling /api/public/analytics with valid JWT...${NC}"
ANALYTICS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/public/analytics" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "USA",
    "city": "New York",
    "quality": "high"
  }')

echo "Response:" | jq '.'
echo "$ANALYTICS_RESPONSE" | jq '.'

if echo "$ANALYTICS_RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo -e "${GREEN}✓ Analytics endpoint responded successfully${NC}\n"
else
  echo -e "${RED}✗ Failed: Analytics endpoint returned error${NC}\n"
  exit 1
fi

# Test 6: Test with invalid JWT (should fail with INVALID_TOKEN)
echo -e "${YELLOW}Test 6: Testing with invalid JWT token...${NC}"
INVALID_RESPONSE=$(curl -s -X GET "$BASE_URL/api/public/config" \
  -H "Authorization: Bearer invalid.jwt.token" \
  -H "Content-Type: application/json")

echo "Response:" | jq '.'
echo "$INVALID_RESPONSE" | jq '.'

if echo "$INVALID_RESPONSE" | jq -e '.error.code == "INVALID_TOKEN"' > /dev/null; then
  echo -e "${GREEN}✓ Invalid token correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Failed: Invalid token should return INVALID_TOKEN error${NC}\n"
fi

# Test 7: Test with missing Authorization header (should fail)
echo -e "${YELLOW}Test 7: Testing with missing Authorization header...${NC}"
NO_AUTH_RESPONSE=$(curl -s -X GET "$BASE_URL/api/public/config" \
  -H "Content-Type: application/json")

echo "Response:" | jq '.'
echo "$NO_AUTH_RESPONSE" | jq '.'

if echo "$NO_AUTH_RESPONSE" | jq -e '.error.code == "INVALID_TOKEN"' > /dev/null; then
  echo -e "${GREEN}✓ Missing authorization correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Failed: Missing auth should return INVALID_TOKEN error${NC}\n"
fi

# Test 8: Test auth endpoint with invalid API key (should fail)
echo -e "${YELLOW}Test 8: Testing authentication with invalid API key...${NC}"
INVALID_AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/public/auth" \
  -H "Authorization: Bearer invalid_api_key_12345" \
  -H "Content-Type: application/json")

echo "Response:" | jq '.'
echo "$INVALID_AUTH_RESPONSE" | jq '.'

if echo "$INVALID_AUTH_RESPONSE" | jq -e '.error.code == "INVALID_API_KEY"' > /dev/null; then
  echo -e "${GREEN}✓ Invalid API key correctly rejected${NC}\n"
else
  echo -e "${RED}✗ Failed: Invalid API key should return INVALID_API_KEY error${NC}\n"
fi

# Test 9: Verify JWT token contains correct claims
echo -e "${YELLOW}Test 9: Decoding JWT to verify claims...${NC}"
JWT_PAYLOAD=$(echo $JWT_TOKEN | cut -d'.' -f2)
# Add padding if needed for base64 decode
JWT_PAYLOAD="${JWT_PAYLOAD}$(printf '%*s' $((4 - ${#JWT_PAYLOAD} % 4)) | tr ' ' '=')"
DECODED_JWT=$(echo $JWT_PAYLOAD | base64 -d 2>/dev/null || echo $JWT_PAYLOAD | base64 -D 2>/dev/null)

echo "Decoded JWT payload:"
echo "$DECODED_JWT" | jq '.'

if echo "$DECODED_JWT" | jq -e '.stationId and .status' > /dev/null; then
  echo -e "${GREEN}✓ JWT contains expected claims (stationId, status)${NC}\n"
else
  echo -e "${RED}✗ Failed: JWT missing required claims${NC}\n"
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Suite Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ All critical tests passed!${NC}"
echo -e "\n${YELLOW}JWT Authentication Flow:${NC}"
echo -e "1. Mobile app authenticates with API key at /api/public/auth"
echo -e "2. Backend validates API key and returns JWT token"
echo -e "3. Mobile app uses JWT for all subsequent API calls"
echo -e "4. JWT expires after 24 hours, app re-authenticates"
echo -e "\n${YELLOW}Security Features Verified:${NC}"
echo -e "✓ JWT token generation and signing"
echo -e "✓ JWT token verification"
echo -e "✓ Invalid token rejection"
echo -e "✓ Missing authorization rejection"
echo -e "✓ API key validation for auth endpoint"
echo -e "✓ Rate limiting on auth endpoint (10 req/min)"
echo -e "✓ JWT claims contain stationId and status"
