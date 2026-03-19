#!/usr/bin/env bash
# =============================================================================
# Mythril Symbolic Execution Analysis — FreeLanceDAO
# =============================================================================
#
# PREREQUISITES:
#   pip install mythril --break-system-packages
#   npm run compile   (artifacts must exist before running)
#
# USAGE:
#   bash scripts/mythril.sh                        # analyse all contracts
#   bash scripts/mythril.sh FreelanceDAOStaking    # analyse one contract
#
# NOTE: Mythril performs deep symbolic execution. Each contract may take
#       10–30 minutes. Set TIMEOUT below to adjust per-contract limit.
#
# =============================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

REPORT_DIR="$PROJECT_ROOT/reports/mythril"
mkdir -p "$REPORT_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TIMEOUT=300   # seconds per contract (increase for deeper analysis)
MAX_DEPTH=50  # transaction depth

# ── solc remapping config ─────────────────────────────────────────────────────
SOLC_JSON="$PROJECT_ROOT/mythril-solc.json"
if [ ! -f "$SOLC_JSON" ]; then
cat > "$SOLC_JSON" << 'JSON'
{
  "remappings": [
    "@openzeppelin=node_modules/@openzeppelin",
    "@chainlink=node_modules/@chainlink"
  ],
  "optimizer": {
    "enabled": true,
    "runs": 200
  }
}
JSON
  echo "[mythril] Created mythril-solc.json"
fi

# ── contract list ─────────────────────────────────────────────────────────────
ALL_CONTRACTS=(
  "FreelanceDAOStaking"
  "FreelanceDAOEscrowV2"
  "FreelanceDAODisputeV2"
  "FreelanceDAOProposals"
)

# Allow single-contract override: bash scripts/mythril.sh FreelanceDAOStaking
if [ $# -ge 1 ]; then
  CONTRACTS=("$1")
else
  CONTRACTS=("${ALL_CONTRACTS[@]}")
fi

# ── header ────────────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo "  FreeLanceDAO — Mythril Symbolic Execution"
echo "  Date      : $(date)"
echo "  Timeout   : ${TIMEOUT}s per contract"
echo "  Max depth : ${MAX_DEPTH} transactions"
echo "  Reports   : $REPORT_DIR"
echo "============================================================"
echo ""

PASS=0
FAIL=0
ISSUES=0

for CONTRACT in "${CONTRACTS[@]}"; do
  SOL_FILE="contracts/${CONTRACT}.sol"
  JSON_OUT="$REPORT_DIR/${CONTRACT}_${TIMESTAMP}.json"
  TXT_OUT="$REPORT_DIR/${CONTRACT}_${TIMESTAMP}.txt"

  if [ ! -f "$SOL_FILE" ]; then
    echo "  [SKIP] $SOL_FILE not found"
    continue
  fi

  echo "── Analysing: $CONTRACT ──────────────────────────────────────"
  echo "   Source : $SOL_FILE"
  echo "   Output : $TXT_OUT"
  echo ""

  START=$(date +%s)

  # Run Mythril — exit code non-zero means issues found (not a script error)
  set +e
  myth analyze "$SOL_FILE" \
    --solc-json "$SOLC_JSON" \
    --execution-timeout "$TIMEOUT" \
    --max-depth "$MAX_DEPTH" \
    --solv 0.8.24 \
    -o jsonv2 \
    > "$JSON_OUT" 2>&1

  MYTH_EXIT=$?
  set -e

  END=$(date +%s)
  ELAPSED=$((END - START))

  # Also produce human-readable txt from json
  if command -v jq &> /dev/null && [ -s "$JSON_OUT" ]; then
    jq -r '
      .issues[]? |
      "  [" + .severity + "] " + .title + "\n" +
      "  SWC: " + (.swc_id // "N/A") + "\n" +
      "  Desc: " + (.description.head // "") + "\n" +
      "  File: " + ((.filename // "") + ":" + ((.lineno // 0) | tostring)) + "\n"
    ' "$JSON_OUT" > "$TXT_OUT" 2>/dev/null || cp "$JSON_OUT" "$TXT_OUT"
  else
    cp "$JSON_OUT" "$TXT_OUT"
  fi

  # Count issues from JSON
  if command -v jq &> /dev/null && [ -s "$JSON_OUT" ]; then
    N_ISSUES=$(jq '.issues | length' "$JSON_OUT" 2>/dev/null || echo 0)
  else
    N_ISSUES=0
  fi

  ISSUES=$((ISSUES + N_ISSUES))

  if [ "$MYTH_EXIT" -eq 0 ]; then
    echo "  ✅ No issues detected  (${ELAPSED}s)"
    PASS=$((PASS + 1))
  else
    echo "  ⚠️  ${N_ISSUES} potential issue(s) found  (${ELAPSED}s)"
    echo "  Review: $TXT_OUT"
    FAIL=$((FAIL + 1))
  fi

  echo ""
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo "============================================================"
echo "  SUMMARY"
echo "  Contracts analysed : $((PASS + FAIL))"
echo "  Clean              : $PASS"
echo "  With findings      : $FAIL"
echo "  Total findings     : $ISSUES"
echo ""
echo "  Full reports in    : $REPORT_DIR"
echo "============================================================"
echo ""

# Exit non-zero if any issues found — useful for CI pipelines
[ "$ISSUES" -eq 0 ] || exit 1