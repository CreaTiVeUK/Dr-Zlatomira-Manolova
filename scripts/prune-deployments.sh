#!/usr/bin/env bash
#
# Prune old Vercel deployments, keeping the N most recent.
#
# Why this exists: Vercel bills Deployment/Functions Storage in GB-months --
# it sums the MAXIMUM stored bytes per day across the billing period. Every
# retained deployment therefore costs you a little every single day it exists.
# On Hobby there is no Deployment Retention Policy, so this is the manual
# equivalent.
#
#   DRY RUN (default):  ./prune-deployments.sh
#   FOR REAL:           DRY_RUN=0 ./prune-deployments.sh
#   KEEP MORE:          KEEP=10 DRY_RUN=0 ./prune-deployments.sh
#
# Requires: curl, jq, and the Vercel CLI (npm i -g vercel).
# Requires VERCEL_TOKEN -- create one at https://vercel.com/account/tokens

set -euo pipefail

KEEP="${KEEP:-5}"
PROJECT="${VERCEL_PROJECT:-drzlatomiramanolova-}"
TEAM_SLUG="${VERCEL_TEAM_SLUG:-creativeuks-projects}"
DRY_RUN="${DRY_RUN:-1}"

: "${VERCEL_TOKEN:?VERCEL_TOKEN is not set. Create one at https://vercel.com/account/tokens}"

for bin in curl jq vercel; do
  command -v "$bin" >/dev/null || { echo "Missing required command: $bin" >&2; exit 1; }
done

api() {
  curl -fsS -H "Authorization: Bearer ${VERCEL_TOKEN}" "https://api.vercel.com$1"
}

echo "Project : ${PROJECT}"
echo "Team    : ${TEAM_SLUG}"
echo "Keeping : ${KEEP} most recent"
echo

# --- Guard 1: never touch whatever is currently serving production -----------
LIVE_ID="$(api "/v9/projects/${PROJECT}?slug=${TEAM_SLUG}" \
  | jq -r '.targets.production.id // .targets.production.uid // empty')"
if [ -n "$LIVE_ID" ]; then
  echo "Live production deployment: ${LIVE_ID} (protected)"
else
  echo "WARNING: could not determine the live production deployment." >&2
  echo "Refusing to delete anything without that guard. Exiting." >&2
  exit 1
fi
echo

# --- Collect every deployment, following pagination --------------------------
ALL="$(mktemp)"; trap 'rm -f "$ALL" "$ALL.sorted"' EXIT
UNTIL=""
while :; do
  RESP="$(api "/v7/deployments?projectId=${PROJECT}&slug=${TEAM_SLUG}&limit=100${UNTIL}")"
  echo "$RESP" | jq -c '.deployments[]' >> "$ALL"
  NEXT="$(echo "$RESP" | jq -r '.pagination.next // empty')"
  [ -z "$NEXT" ] && break
  UNTIL="&until=${NEXT}"
done

TOTAL="$(wc -l < "$ALL" | tr -d ' ')"
echo "Found ${TOTAL} deployments."

# --- Guard 2: skip anything mid-flight. Guard 3: keep the N newest. ----------
jq -s -r --argjson keep "$KEEP" --arg live "$LIVE_ID" '
  map(select(.state | IN("BUILDING","QUEUED","INITIALIZING") | not))
  | sort_by(.created) | reverse
  | .[$keep:]
  | map(select(.uid != $live))
  | .[] | [.uid, .url, .created, .state, (.target // "preview")] | @tsv
' "$ALL" > "$ALL.sorted"

DOOMED="$(wc -l < "$ALL.sorted" | tr -d ' ')"
if [ "$DOOMED" -eq 0 ]; then
  echo "Nothing to prune. Already at or below ${KEEP}."
  exit 0
fi

echo "Would delete ${DOOMED}:"
while IFS=$'\t' read -r uid url created state target; do
  age="$(( ( $(date +%s) - created/1000 ) / 86400 ))"
  printf '  %-12s %-4sd  %-10s %s\n' "$state" "$age" "$target" "$url"
done < "$ALL.sorted"
echo

if [ "$DRY_RUN" != "0" ]; then
  echo "DRY RUN -- nothing deleted. Re-run with DRY_RUN=0 to apply."
  exit 0
fi

# --- Delete, one at a time so a single failure cannot cascade ----------------
FAILED=0
while IFS=$'\t' read -r uid url created state target; do
  echo "Removing ${url}"
  if ! vercel remove "https://${url}" --yes --token "${VERCEL_TOKEN}" --scope "${TEAM_SLUG}"; then
    echo "  FAILED: ${url}" >&2
    FAILED=$((FAILED+1))
  fi
done < "$ALL.sorted"

echo
echo "Done. Deleted $((DOOMED-FAILED)) of ${DOOMED}; ${KEEP} most recent kept."
[ "$FAILED" -gt 0 ] && exit 1 || exit 0
