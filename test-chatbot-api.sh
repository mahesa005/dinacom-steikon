#!/bin/bash

# Test Chatbot API
# Usage: bash test-chatbot-api.sh

# Configuration
BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Testing AI Chatbot API"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Simple question about patient count
echo "1. Testing: Berapa jumlah pasien dengan risiko tinggi?"
echo "POST $BASE_URL/api/ai/chatbot"
echo ""

QUESTION_1='{
  "question": "Berapa jumlah pasien dengan risiko tinggi?",
  "conversationHistory": []
}'

echo "Request:"
echo "$QUESTION_1" | jq '.'
echo ""

RESPONSE_1=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$QUESTION_1" \
  "$BASE_URL/api/ai/chatbot")

HTTP_STATUS=$(echo "$RESPONSE_1" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE_1" | sed -e 's/HTTP_STATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "=========================================="
echo ""

# Test 2: Question about specific patient
echo "2. Testing: Siapa pasien yang paling membutuhkan perhatian?"
echo "POST $BASE_URL/api/ai/chatbot"
echo ""

QUESTION_2='{
  "question": "Siapa pasien yang paling membutuhkan perhatian khusus saat ini?",
  "conversationHistory": []
}'

echo "Request:"
echo "$QUESTION_2" | jq '.'
echo ""

RESPONSE_2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$QUESTION_2" \
  "$BASE_URL/api/ai/chatbot")

HTTP_STATUS=$(echo "$RESPONSE_2" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE_2" | sed -e 's/HTTP_STATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "=========================================="
echo ""

# Test 3: Statistical analysis question
echo "3. Testing: Bagaimana tren kasus stunting?"
echo "POST $BASE_URL/api/ai/chatbot"
echo ""

QUESTION_3='{
  "question": "Bagaimana tren kasus stunting berdasarkan usia dan jenis kelamin?",
  "conversationHistory": []
}'

echo "Request:"
echo "$QUESTION_3" | jq '.'
echo ""

RESPONSE_3=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$QUESTION_3" \
  "$BASE_URL/api/ai/chatbot")

HTTP_STATUS=$(echo "$RESPONSE_3" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE_3" | sed -e 's/HTTP_STATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "=========================================="
echo ""

# Test 4: Follow-up conversation
echo "4. Testing: Follow-up conversation with history"
echo "POST $BASE_URL/api/ai/chatbot"
echo ""

QUESTION_4='{
  "question": "Apa rekomendasi tindakan untuk mereka?",
  "conversationHistory": [
    {
      "role": "user",
      "message": "Siapa pasien yang paling membutuhkan perhatian?"
    },
    {
      "role": "assistant",
      "message": "Berdasarkan data, ada beberapa pasien dengan risiko tinggi yang memerlukan perhatian khusus."
    }
  ]
}'

echo "Request:"
echo "$QUESTION_4" | jq '.'
echo ""

RESPONSE_4=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$QUESTION_4" \
  "$BASE_URL/api/ai/chatbot")

HTTP_STATUS=$(echo "$RESPONSE_4" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE_4" | sed -e 's/HTTP_STATUS\:.*//g')

echo "Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "=========================================="
echo ""

# Summary
echo "Test Summary:"
echo "- All chatbot API tests completed!"
echo "- Check responses for AI-generated insights and suggested questions"
echo ""
