# ═══════════════════════════════════════════════════════════════
# ChargeMate Health Check Script
# Purpose: Check if all services are running and healthy
# Usage: bash scripts/health-check.sh
# ═══════════════════════════════════════════════════════════════

# Service URLs
STATION_URL="http://localhost:4001/health"
BOOKING_URL="http://localhost:4002/health"
FRONTEND_URL="http://localhost:3000"

# Colours for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No colour

# Track if any service failed
ALL_HEALTHY=true

echo ""
echo "═══════════════════════════════════════════════════════"
echo "       ChargeMate - Service Health Check"
echo "       $(date '+%Y-%m-%d %H:%M:%S')"
echo "       Author: Neeranjan (HE38983) - SRE"
echo "═══════════════════════════════════════════════════════"
echo ""

# Function to check a single service
check_service() {
  local SERVICE_NAME=$1
  local SERVICE_URL=$2

  echo -n "Checking $SERVICE_NAME at $SERVICE_URL ... "

  # Make HTTP request with 5 second timeout
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    --connect-timeout 5 \
    --max-time 10 \
    "$SERVICE_URL" 2>/dev/null)

  if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ HEALTHY (HTTP $HTTP_STATUS)${NC}"
  else
    echo -e "${RED}❌ UNHEALTHY (HTTP $HTTP_STATUS)${NC}"
    ALL_HEALTHY=false
  fi
}

# Check all services
check_service "Station Service " "$STATION_URL"
check_service "Booking Service " "$BOOKING_URL"
check_service "Frontend        " "$FRONTEND_URL"

echo ""
echo "───────────────────────────────────────────────────────"

# Final result
if [ "$ALL_HEALTHY" = true ]; then
  echo -e "${GREEN}✅ ALL SERVICES HEALTHY - ChargeMate is running${NC}"
  exit 0
else
  echo -e "${RED}❌ SOME SERVICES ARE DOWN - Check logs immediately${NC}"
  exit 1
fi

echo "═══════════════════════════════════════════════════════"
echo ""

