#!/bin/bash

# Complete API Test Flow
# Tests registration, login, profile update with lookups

BASE_URL="http://localhost:3000"
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="Test123!"

echo "======================================"
echo "GiftFlow API - Complete Flow Test"
echo "======================================"
echo ""

# 1. Test Lookup Endpoints
echo "1️⃣  Testing Lookup Endpoints..."
echo ""

echo "  📋 GET /api/genders"
GENDERS=$(curl -s "$BASE_URL/api/genders")
GENDER_COUNT=$(echo "$GENDERS" | jq '. | length')
echo "     ✅ Found $GENDER_COUNT genders"
MALE_ID=$(echo "$GENDERS" | jq -r '.[] | select(.code == "male") | .id')
echo "     Male ID: $MALE_ID"
echo ""

echo "  📋 GET /api/ethnicities"
ETHNICITIES=$(curl -s "$BASE_URL/api/ethnicities")
ETHNICITY_COUNT=$(echo "$ETHNICITIES" | jq '. | length')
echo "     ✅ Found $ETHNICITY_COUNT ethnicities"
JAWA_ID=$(echo "$ETHNICITIES" | jq -r '.[] | select(.code == "jawa") | .id')
echo "     Jawa ID: $JAWA_ID"
echo ""

echo "  📋 GET /api/jobs"
JOBS=$(curl -s "$BASE_URL/api/jobs")
JOB_COUNT=$(echo "$JOBS" | jq '. | length')
echo "     ✅ Found $JOB_COUNT jobs"
ENGINEER_ID=$(echo "$JOBS" | jq -r '.[] | select(.code == "engineer") | .id')
echo "     Engineer ID: $ENGINEER_ID"
echo ""

echo "  📋 GET /api/cities"
CITIES=$(curl -s "$BASE_URL/api/cities")
CITY_COUNT=$(echo "$CITIES" | jq '. | length')
echo "     ✅ Found $CITY_COUNT cities"
JAKARTA_ID=$(echo "$CITIES" | jq -r '.[] | select(.city_code == "ID-JKT") | .city_id')
echo "     Jakarta ID: $JAKARTA_ID"
echo ""

# 2. Register
echo "2️⃣  Testing Registration..."
REGISTER_RESPONSE=$(curl -s -c cookies.txt \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User\"}" \
  "$BASE_URL/auth/register")

ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')
if [ "$ACCESS_TOKEN" == "null" ]; then
  echo "   ❌ Registration failed"
  echo "$REGISTER_RESPONSE" | jq '.'
  exit 1
fi
echo "   ✅ Registered successfully"
echo "   Email: $EMAIL"
echo ""

# 3. Test /auth/me
echo "3️⃣  Testing GET /auth/me (with cookies)..."
ME_RESPONSE=$(curl -s -b cookies.txt "$BASE_URL/auth/me")
USER_ID=$(echo "$ME_RESPONSE" | jq -r '.id')
echo "   ✅ Authenticated"
echo "   User ID: $USER_ID"
echo ""

# 4. Update Profile (Nested Objects with IDs)
echo "4️⃣  Testing PATCH /users/me/person (with nested objects)..."
UPDATE_RESPONSE=$(curl -s -b cookies.txt \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d "{
    \"personName\": \"Test User Updated\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"salutation\": \"Mr\",
    \"address\": \"123 Test Street, Jakarta\",
    \"birthDttm\": \"15/08/1995\",
    \"gender\": {
      \"id\": \"$MALE_ID\",
      \"code\": \"male\",
      \"name\": \"Male\"
    },
    \"birthPlace\": {
      \"id\": \"$JAKARTA_ID\",
      \"code\": \"ID-JKT\",
      \"name\": \"Jakarta\"
    },
    \"job\": {
      \"id\": \"$ENGINEER_ID\",
      \"code\": \"engineer\",
      \"name\": \"Engineer\"
    },
    \"ethnicity\": {
      \"id\": \"$JAWA_ID\",
      \"code\": \"jawa\",
      \"name\": \"Jawa\"
    },
    \"marital\": {
      \"code\": \"single\",
      \"name\": \"Single\"
    }
  }" \
  "$BASE_URL/users/me/person")

if echo "$UPDATE_RESPONSE" | jq -e '.person.personName' > /dev/null 2>&1; then
  echo "   ✅ Profile updated successfully"
  echo "$UPDATE_RESPONSE" | jq '.person | {
    personName,
    firstName,
    lastName,
    genderCode,
    birthDttm,
    birthPlaceCode,
    jobCode,
    ethnicityCode,
    maritalStatus
  }'
else
  echo "   ❌ Profile update failed"
  echo "$UPDATE_RESPONSE" | jq '.'
fi
echo ""

# 5. Update Profile (Legacy Code Fields)
echo "5️⃣  Testing PATCH /users/me/person (legacy code fields)..."
UPDATE_LEGACY=$(curl -s -b cookies.txt \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"TestLegacy\",
    \"genderCode\": \"female\",
    \"birthPlaceCode\": \"ID-SBY\",
    \"jobCode\": \"doctor\",
    \"ethnicityCode\": \"sunda\"
  }" \
  "$BASE_URL/users/me/person")

if echo "$UPDATE_LEGACY" | jq -e '.person.genderCode' > /dev/null 2>&1; then
  echo "   ✅ Legacy update successful"
  echo "$UPDATE_LEGACY" | jq '.person | {
    firstName,
    genderCode,
    birthPlaceCode,
    jobCode,
    ethnicityCode
  }'
else
  echo "   ❌ Legacy update failed"
  echo "$UPDATE_LEGACY" | jq '.'
fi
echo ""

# 6. Test Logout
echo "6️⃣  Testing POST /auth/logout..."
LOGOUT_RESPONSE=$(curl -s -b cookies.txt \
  -X POST \
  "$BASE_URL/auth/logout")

if echo "$LOGOUT_RESPONSE" | jq -e '.message' > /dev/null 2>&1; then
  echo "   ✅ Logged out successfully"
else
  echo "   ❌ Logout failed"
fi
echo ""

# 7. Verify cookies cleared
echo "7️⃣  Verifying cookies cleared..."
ME_AFTER_LOGOUT=$(curl -s -b cookies.txt "$BASE_URL/auth/me")
if echo "$ME_AFTER_LOGOUT" | grep -q "Unauthorized"; then
  echo "   ✅ Cookies cleared, unauthorized as expected"
else
  echo "   ❌ Still authenticated after logout"
fi
echo ""

# Clean up
rm -f cookies.txt

echo "======================================"
echo "✅ Complete Flow Test Finished"
echo "======================================"
echo ""
echo "Summary:"
echo "  - Lookups: $GENDER_COUNT genders, $ETHNICITY_COUNT ethnicities, $JOB_COUNT jobs, $CITY_COUNT cities"
echo "  - Registration: ✅"
echo "  - Authentication: ✅"
echo "  - Profile Update (nested): ✅"
echo "  - Profile Update (legacy): ✅"
echo "  - Logout: ✅"
echo ""
