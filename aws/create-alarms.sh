#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# ChargeMate CloudWatch Alarms Setup
# Author: Neeranjan (HE38983) - Site Reliability Engineer
# Purpose: Create monitoring alarms on AWS CloudWatch
# Run this ONCE after AWS deployment
# ═══════════════════════════════════════════════════════════════

AWS_REGION="eu-west-2"
EB_ENV_NAME="chargemate-production"
ALERT_EMAIL="bikrambk24@example.com"

echo "Setting up CloudWatch Alarms for ChargeMate..."
echo ""

# Create SNS topic for alerts
echo "1. Creating SNS alert topic..."

SNS_ARN=$(aws sns create-topic \
  --name chargemate-alerts \
  --region $AWS_REGION \
  --query 'TopicArn' \
  --output text)

echo "   SNS Topic: $SNS_ARN"

# Subscribe email to alerts
aws sns subscribe \
  --topic-arn $SNS_ARN \
  --protocol email \
  --notification-endpoint $ALERT_EMAIL \
  --region $AWS_REGION

echo "   ✅ Alert email subscribed: $ALERT_EMAIL"
echo ""

# Alarm 1: High CPU
echo "2. Creating CPU alarm..."

aws cloudwatch put-metric-alarm \
  --alarm-name "ChargeMate-HighCPU" \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ElasticBeanstalk \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions $SNS_ARN \
  --dimensions Name=EnvironmentName,Value=$EB_ENV_NAME \
  --region $AWS_REGION

echo "   ✅ CPU alarm created (threshold: 80%)"

# Alarm 2: High Memory
echo "3. Creating Memory alarm..."

aws cloudwatch put-metric-alarm \
  --alarm-name "ChargeMate-HighMemory" \
  --alarm-description "Alert when memory exceeds 85%" \
  --metric-name MemoryUtilization \
  --namespace System/Linux \
  --statistic Average \
  --period 300 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions $SNS_ARN \
  --region $AWS_REGION

echo "   ✅ Memory alarm created (threshold: 85%)"

# Alarm 3: Environment Health
echo "4. Creating Environment Health alarm..."

aws cloudwatch put-metric-alarm \
  --alarm-name "ChargeMate-EnvironmentHealth" \
  --alarm-description "Alert when environment health degrades" \
  --metric-name EnvironmentHealth \
  --namespace AWS/ElasticBeanstalk \
  --statistic Average \
  --period 60 \
  --threshold 20 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions $SNS_ARN \
  --dimensions Name=EnvironmentName,Value=$EB_ENV_NAME \
  --region $AWS_REGION

echo "   ✅ Environment health alarm created"

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ All CloudWatch alarms created successfully"
echo "📧 Check your email to confirm SNS subscription"
echo "═══════════════════════════════════════════════════"

