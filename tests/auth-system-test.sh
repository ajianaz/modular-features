#!/bin/bash

# Comprehensive Test Suite for Unified Authentication System
# Tests both Custom Auth and Better Auth with RS256 implementation

set -e  # Exit on any error

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
TEST_RESULTS_DIR="./test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEST_LOG_FILE="$TEST_RESULTS_DIR/auth-test-$TIMESTAMP.log"
SUMMARY_FILE="$TEST_RESULTS_DIR/test-summary-$TIMESTAMP.json"

# Test user credentials
TEST_EMAIL="testuser@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_NAME="Test User"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Global variables for tokens
CUSTOM_ACCESS_TOKEN=""
CUSTOM_REFRESH_TOKEN=""
BETTER_ACCESS_TOKEN=""
BETTER_REFRESH_TOKEN=""

# Create results directory
mkdir -p "$TEST_RESULTS_DIR"

# Initialize log file
echo "Unified Authentication System Test Suite - $(date)" > "$TEST_LOG_FILE"
echo "===============================================" >> "$TEST_LOG_FILE"

# Utility functions
log() {
    echo -e "$1" | tee -a "$TEST_LOG_FILE"
}

log_info() {
    log "${BLUE}[INFO]${NC} $1"
}

log_success() {
    log "${GREEN}[SUCCESS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    log "${RED}[ERROR]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    log "${YELLOW}[WARNING]${NC} $1"
}

# Test execution function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="$3"
    local description="$4"

    ((TOTAL_TESTS++))
    log_info "Running test: $test_name"
    log "Description: $description"

    # Execute the command and capture output
    local response
    local http_status

    if response=$(eval "$test_command" 2>&1); then
        http_status=$(echo "$response" | grep -o 'HTTP/[0-9.]* [0-9]*' | tail -1 | awk '{print $2}' || echo "000")

        if [ "$http_status" = "$expected_status" ]; then
            log_success "Test passed: $test_name (Status: $http_status)"
            echo "SUCCESS: $test_name" >> "$TEST_LOG_FILE"
            echo "Command: $test_command" >> "$TEST_LOG_FILE"
            echo "Response: $response" >> "$TEST_LOG_FILE"
            echo "---" >> "$TEST_LOG_FILE"
            return 0
        else
            log_error "Test failed: $test_name (Expected: $expected_status, Got: $http_status)"
            echo "FAILED: $test_name" >> "$TEST_LOG_FILE"
            echo "Command: $test_command" >> "$TEST_LOG_FILE"
            echo "Response: $response" >> "$TEST_LOG_FILE"
            echo "---" >> "$TEST_LOG_FILE"
            return 1
        fi
    else
        log_error "Test failed: $test_name (Command execution failed)"
        echo "FAILED: $test_name" >> "$TEST_LOG_FILE"
        echo "Command: $test_command" >> "$TEST_LOG_FILE"
        echo "Error: $response" >> "$TEST_LOG_FILE"
        echo "---" >> "$TEST_LOG_FILE"
        return 1
    fi
}

# Extract token from response
extract_token() {
    local response="$1"
    echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 || echo ""
}

extract_refresh_token() {
    local response="$1"
    echo "$response" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4 || echo ""
}

# Check if API is running
check_api_health() {
    log_info "Checking API health..."

    if curl -s -f "$API_BASE_URL" > /dev/null; then
        log_success "API is running at $API_BASE_URL"
        return 0
    else
        log_error "API is not accessible at $API_BASE_URL"
        return 1
    fi
}

# Setup test data
setup_test_data() {
    log_info "Setting up test data..."

    # Register test user for custom auth
    local register_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST "$API_BASE_URL/api/auth/custom/register" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\"}")

    local status=$(echo "$register_response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    local body=$(echo "$register_response" | sed -E 's/HTTPSTATUS:[0-9]*$//')

    if [ "$status" = "200" ] || [ "$status" = "409" ]; then
        log_success "Test user setup completed (status: $status)"
    else
        log_warning "Test user setup returned status: $status"
        log "Response: $body"
    fi
}

# Cleanup test data
cleanup_test_data() {
    log_info "Cleaning up test data..."

    # Logout users if tokens exist
    if [ ! -z "$CUSTOM_ACCESS_TOKEN" ]; then
        curl -s -X POST "$API_BASE_URL/api/auth/custom/logout" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $CUSTOM_ACCESS_TOKEN" \
            -d "{\"refreshToken\":\"$CUSTOM_REFRESH_TOKEN\"}" > /dev/null || true
    fi

    if [ ! -z "$BETTER_ACCESS_TOKEN" ]; then
        curl -s -X POST "$API_BASE_URL/api/auth/better/sign-out" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $BETTER_ACCESS_TOKEN" > /dev/null || true
    fi

    log_success "Cleanup completed"
}

# Generate test summary
generate_summary() {
    log_info "Generating test summary..."

    cat > "$SUMMARY_FILE" << EOF
{
  "testSuite": "Unified Authentication System",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "apiBaseUrl": "$API_BASE_URL",
  "results": {
    "total": $TOTAL_TESTS,
    "passed": $PASSED_TESTS,
    "failed": $FAILED_TESTS,
    "successRate": $(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)
  },
  "configuration": {
    "rs256Enabled": "${ENABLE_RS256_TOKENS:-false}",
    "testEmail": "$TEST_EMAIL"
  }
}
EOF

    log "Test Summary:"
    log "Total Tests: $TOTAL_TESTS"
    log "Passed: $PASSED_TESTS"
    log "Failed: $FAILED_TESTS"
    log "Success Rate: $(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)%"
    log "Detailed log: $TEST_LOG_FILE"
    log "Summary JSON: $SUMMARY_FILE"
}

# Main execution
main() {
    log_info "Starting Unified Authentication System Test Suite"
    log_info "API Base URL: $API_BASE_URL"
    log_info "Results Directory: $TEST_RESULTS_DIR"

    # Check if API is running
    if ! check_api_health; then
        log_error "Cannot proceed with tests - API is not accessible"
        exit 1
    fi

    # Setup test data
    setup_test_data

    # Run test suites
    source ./tests/token-generation-tests.sh
    source ./tests/token-validation-tests.sh
    source ./tests/auth-flow-tests.sh
    source ./tests/jwks-endpoint-tests.sh
    source ./tests/interoperability-tests.sh
    source ./tests/security-tests.sh

    # Cleanup
    cleanup_test_data

    # Generate summary
    generate_summary

    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
