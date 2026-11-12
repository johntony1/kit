#!/bin/sh
# Screenshot a component in the lab (dev server must be running on :5173), in one theme.
#   scripts/shot-comp.sh add-money light /abs/path/out.png
set -e
KEY="$1"; THEME="${2:-light}"; OUT="$3"
TMP=$(mktemp -d)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
  --user-data-dir="$TMP" --window-size=1140,1420 --virtual-time-budget=6000 --screenshot="$OUT" \
  "http://localhost:5173/?theme=$THEME#/lab/$KEY" >/dev/null 2>&1
rm -rf "$TMP"
echo "$OUT"
