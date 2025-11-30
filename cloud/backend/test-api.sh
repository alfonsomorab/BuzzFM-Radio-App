#!/bin/bash

# Test script for Public Mobile API endpoints
# Make sure the dev server is running: npm run dev

BASE_URL="http://localhost:3000"

# Get API key from seed data (Magic FM)
API_KEY="6021e5500f85c5795e26d46eacc99487efee86ce24fe14d60a9cd7c268d72a6a"

echo "🧪 Testing Radio Streaming Platform Public API"
echo "=============================================="
echo ""

# Test 1: Config endpoint
echo "📡 Test 1: GET /api/public/config"
echo "---"
curl -s -X GET "$BASE_URL/api/public/config" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# Test 2: Schedule endpoint (today)
echo "📅 Test 2: GET /api/public/schedule (today)"
echo "---"
curl -s -X GET "$BASE_URL/api/public/schedule" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# Test 3: Schedule endpoint (Monday - day 1)
echo "📅 Test 3: GET /api/public/schedule?date=2024-12-02 (Monday)"
echo "---"
curl -s -X GET "$BASE_URL/api/public/schedule?date=2024-12-02" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# Test 4: Analytics endpoint
echo "📊 Test 4: POST /api/public/analytics"
echo "---"
curl -s -X POST "$BASE_URL/api/public/analytics" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "United States",
    "city": "New York",
    "quality": "high",
    "sessionDuration": 300
  }' | jq '.'
echo ""
echo ""

# Test 5: Invalid API key
echo "❌ Test 5: Invalid API key"
echo "---"
curl -s -X GET "$BASE_URL/api/public/config" \
  -H "Authorization: Bearer invalid-api-key" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# Test 6: Missing Authorization header
echo "❌ Test 6: Missing Authorization header"
echo "---"
curl -s -X GET "$BASE_URL/api/public/config" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# Test 7: Suspended station (Rock Nation FM)
SUSPENDED_API_KEY="78e18fd295ed58a6e531c0f76912d417a27b403aed99c8a48ec61795d73c07d4"
echo "🚫 Test 7: Suspended station"
echo "---"
curl -s -X GET "$BASE_URL/api/public/config" \
  -H "Authorization: Bearer $SUSPENDED_API_KEY" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

echo "✅ API tests complete!"
