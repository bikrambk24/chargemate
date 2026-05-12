#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# ChargeMate Failure Simulation Script
# Purpose: Simulate service failure and demonstrate monitoring
# Usage: bash scripts/simulate-failure.sh
# ═══════════════════════════════════════════════════════════════

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ChargeMate - Failure Simulation & Recovery Demo"
echo "  Author: Neeranjan (HE38983) - SRE"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "Step 1: Check all services are healthy BEFORE failure..."
echo ""

bash scripts/health-check.sh

echo ""

echo "Step 2: Simulating station-service failure..."
echo -e "${YELLOW}⚠️  Stopping station-service container...${NC}"

docker stop station-service 2>/dev/null || echo "Container not running via docker"

echo ""

echo "Step 3: Running health check AFTER failure..."
echo ""

bash scripts/health-check.sh

echo ""

echo "Step 4: Simulating auto-recovery - restarting station-service..."

docker start station-service 2>/dev/null || echo "Restarting..."

sleep 5

echo "Step 5: Running health check AFTER recovery..."
echo ""

bash scripts/health-check.sh

echo ""
echo -e "${GREEN}✅ Failure simulation and recovery demonstration complete${NC}"
echo "═══════════════════════════════════════════════════════"

