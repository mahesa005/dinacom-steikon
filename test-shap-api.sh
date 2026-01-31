#!/bin/bash

# Test SHAP Analysis API
# Usage: bash test-shap-api.sh [nomorPasien]

# Configuration
BASE_URL="http://localhost:3000"
NOMOR_PASIEN="${1:-P-001}"  # Default to P-001 if not provided

echo "=========================================="
echo "Testing SHAP Analysis API"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Nomor Pasien: $NOMOR_PASIEN"
echo ""

# Test 1: Check if analysis exists (GET)
echo "1. Checking existing SHAP analysis..."
echo "GET $BASE_URL/api/bayi/$NOMOR_PASIEN/shap-analysis"
echo ""

GET_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET \
  "$BASE_URL/api/bayi/$NOMOR_PASIEN/shap-analysis")

HTTP_STATUS=$(echo "$GET_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$GET_RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "=========================================="
echo ""

# Test 2: Generate new SHAP analysis (POST)
echo "2. Generating new SHAP analysis..."
echo "POST $BASE_URL/api/bayi/$NOMOR_PASIEN/shap-analysis"
echo ""

# Mock SHAP data (will be replaced by real Python ML model data)
MOCK_SHAP_DATA='{
  "shapResult": {
    "is_stunting": 1,
    "stunting_risk": "HIGH",
    "confidence": 0.75,
    "shap_values": {
      "mother_height_cm": 0.25,
      "father_height_cm": 0.20,
      "mother_edu_level": 0.22,
      "father_edu_level": 0.18,
      "toilet_standard": 0.30,
      "waste_mgmt_std": 0.28
    },
    "input_features": {
      "mother_height_cm": 148,
      "father_height_cm": 162,
      "mother_edu_level": 1,
      "father_edu_level": 1,
      "toilet_standard": 0,
      "waste_mgmt_std": 0
    }
  }
}'

echo "Request Body:"
echo "$MOCK_SHAP_DATA" | jq '.'
echo ""

POST_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$MOCK_SHAP_DATA" \
  "$BASE_URL/api/bayi/$NOMOR_PASIEN/shap-analysis")

HTTP_STATUS=$(echo "$POST_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$POST_RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "=========================================="
echo ""

# Test 3: Verify the generated analysis (GET again)
echo "3. Verifying generated SHAP analysis..."
echo "GET $BASE_URL/api/bayi/$NOMOR_PASIEN/shap-analysis"
echo ""

GET_RESPONSE_2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET \
  "$BASE_URL/api/bayi/$NOMOR_PASIEN/shap-analysis")

HTTP_STATUS=$(echo "$GET_RESPONSE_2" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$GET_RESPONSE_2" | sed -e 's/HTTP_STATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "=========================================="
echo ""

# Summary
echo "Test Summary:"
echo "- Patient Number: $NOMOR_PASIEN"
echo "- Test completed!"
echo ""
echo "To test with different patient:"
echo "  bash test-shap-api.sh P-002"
echo ""
