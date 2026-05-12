#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# ChargeMate Test Runner
# Runs all tests across all services and generates coverage reports
# Author: Suju (HE39012) – QA & Automation Engineer
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         ChargeMate – Full Test Suite Runner              ║"
echo "║         QA Engineer: Suju (HE39012)                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

FAILED=0

# ── ESLint ────────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Running ESLint on Station Service..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd station-service || exit 1
npm run lint
if [ $? -ne 0 ]; then
  echo "⚠️  ESLint warnings found in station-service"
fi
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Running ESLint on Booking Service..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd booking-service || exit 1
npm run lint
if [ $? -ne 0 ]; then
  echo "⚠️  ESLint warnings found in booking-service"
fi
cd ..

# ── Station Service Tests ─────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Running Station Service Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd station-service || exit 1
npm test
if [ $? -ne 0 ]; then
  echo "❌ Station Service tests FAILED"
  FAILED=1
else
  echo "✅ Station Service tests PASSED"
fi
cd ..

# ── Booking Service Tests ─────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Running Booking Service Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd booking-service || exit 1
npm test
if [ $? -ne 0 ]; then
  echo "❌ Booking Service tests FAILED"
  FAILED=1
else
  echo "✅ Booking Service tests PASSED"
fi
cd ..

# ── Summary ───────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
if [ $FAILED -eq 0 ]; then
  echo "║  ✅  ALL TESTS PASSED – ChargeMate QA Complete          ║"
else
  echo "║  ❌  SOME TESTS FAILED – Check output above             ║"
fi
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

echo "Coverage reports saved to:"
echo "  → station-service/coverage/lcov-report/index.html"
echo "  → booking-service/coverage/lcov-report/index.html"
echo ""

exit $FAILED
