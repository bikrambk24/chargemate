#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# ChargeMate Rollback Script
# Purpose: Rollback to previous working deployment on AWS
# Usage: bash scripts/rollback.sh
# ═══════════════════════════════════════════════════════════════

AWS_REGION="eu-west-2"
EB_APP_NAME="chargemate"
EB_ENV_NAME="chargemate-production"

# Colours
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "═══════════════════════════════════════════════════════"
echo "       ChargeMate - Rollback Script"
echo "       $(date '+%Y-%m-%d %H:%M:%S')"
echo "       Author: Neeranjan (HE38983) - SRE"
echo "═══════════════════════════════════════════════════════"
echo ""

# Step 1: Show current version
echo "📋 Current deployment:"

CURRENT=$(aws elasticbeanstalk describe-environments \
  --application-name $EB_APP_NAME \
  --environment-names $EB_ENV_NAME \
  --region $AWS_REGION \
  --query 'Environments[0].VersionLabel' \
  --output text 2>/dev/null)

echo "   Current version: $CURRENT"
echo ""

# Step 2: Get previous version
echo "📋 Available versions:"

aws elasticbeanstalk describe-application-versions \
  --application-name $EB_APP_NAME \
  --region $AWS_REGION \
  --query 'ApplicationVersions[*].[VersionLabel,DateCreated]' \
  --output table 2>/dev/null

echo ""

PREVIOUS=$(aws elasticbeanstalk describe-application-versions \
  --application-name $EB_APP_NAME \
  --region $AWS_REGION \
  --query 'ApplicationVersions[1].VersionLabel' \
  --output text 2>/dev/null)

if [ -z "$PREVIOUS" ] || [ "$PREVIOUS" = "None" ]; then
  echo -e "${RED}❌ No previous version found. Cannot rollback.${NC}"
  exit 1
fi

echo -e "${YELLOW}⚠️  Rolling back from: $CURRENT${NC}"
echo -e "${YELLOW}⚠️  Rolling back to:   $PREVIOUS${NC}"
echo ""

read -p "Confirm rollback? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Rollback cancelled."
  exit 0
fi

# Step 3: Execute rollback
echo ""
echo "🔄 Executing rollback to $PREVIOUS ..."

aws elasticbeanstalk update-environment \
  --application-name $EB_APP_NAME \
  --environment-name $EB_ENV_NAME \
  --version-label $PREVIOUS \
  --region $AWS_REGION

echo ""
echo "⏳ Waiting for rollback to complete..."

aws elasticbeanstalk wait environment-updated \
  --application-name $EB_APP_NAME \
  --environment-names $EB_ENV_NAME \
  --region $AWS_REGION 2>/dev/null

echo ""
echo -e "${GREEN}✅ Rollback to $PREVIOUS completed successfully${NC}"
echo ""
echo "═══════════════════════════════════════════════════════"

