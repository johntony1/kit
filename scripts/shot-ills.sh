#!/bin/sh
# Screenshot empty state pieces in the dot lab (dev server must be running on :5173).
#   scripts/shot-ills.sh bank,broken /abs/path/out.png [px per dot, default 3.4]
set -e
KEYS="$1"; OUT="$2"; PX="${3:-3.4}"
N=$(printf '%s' "$KEYS" | tr ',' '\n' | grep -c .)
H=$(( N * 400 + 20 ))
TMP=$(mktemp -d)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
  --user-data-dir="$TMP" --window-size=1900,$H --virtual-time-budget=9000 --screenshot="$OUT" \
  "http://localhost:5173/dots.html?px=$PX#$KEYS" >/dev/null 2>&1
rm -rf "$TMP"
echo "$OUT"
