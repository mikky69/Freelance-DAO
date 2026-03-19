#!/usr/bin/env bash
# ============================================================
# Slither Static Analysis Script — FreeLanceDAO
# ============================================================
# Prerequisites:
#   pip install slither-analyzer
#   npm run compile  (must have artifacts first)
# ============================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

REPORT_DIR="$PROJECT_ROOT/reports"
mkdir -p "$REPORT_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "======================================"
echo "  FreeLanceDAO — Slither Analysis"
echo "  $(date)"
echo "======================================"

CONTRACTS=(
  "contracts/FreelanceDAOStaking.sol"
  "contracts/FreelanceDAOProposals.sol"
  "contracts/FreelanceDAOEscrowV2.sol"
  "contracts/FreelanceDAODisputeV2.sol"
)

for CONTRACT in "${CONTRACTS[@]}"; do
  NAME=$(basename "$CONTRACT" .sol)
  OUT_JSON="$REPORT_DIR/slither_${NAME}_${TIMESTAMP}.json"
  OUT_TXT="$REPORT_DIR/slither_${NAME}_${TIMESTAMP}.txt"

  echo ""
  echo "── Analysing $NAME ──"

  slither "$CONTRACT" \
    --hardhat-artifacts-directory artifacts \
    --json "$OUT_JSON" \
    --exclude-informational \
    --exclude-optimization \
    --filter-paths "node_modules,test,mocks" \
    2>&1 | tee "$OUT_TXT" || true

  echo "  Report: $OUT_TXT"
done

echo ""
echo "======================================"
echo "  Summary report: $REPORT_DIR"
echo "  Run: slither . --print human-summary"
echo "======================================"