#!/usr/bin/env bash
# Retry the DatoCMS downloads until the origin quota resets (all 54 URLs return a
# 109-byte "Monthly bandwidth limit exceeded" page while the account is over quota).
# Verifies real bytes so a failed run leaves nothing broken in public/sites/rifki/datocms.
set -euo pipefail

cd "$(dirname "$0")/../.."
out=public/sites/rifki/datocms
urls=docs/research/rifki/datocms-urls.txt
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$out"

ok=0
while read -r url; do
  [ -z "$url" ] && continue
  name=${url##*/}
  curl -sfL "$url" -o "$tmp/$name" || continue
  size=$(wc -c <"$tmp/$name")
  # error pages are 109 bytes of ASCII; require a real magic number
  if head -c 200 "$tmp/$name" | grep -qi 'bandwidth limit'; then continue; fi
  case "$name" in
    *.svg) head -c 5 "$tmp/$name" | grep -q '<' || continue ;;
    *.png) head -c 8 "$tmp/$name" | grep -q 'PNG' || continue ;;
    *.jpg|*.jpeg) head -c 3 "$tmp/$name" | grep -q $'\xff\xd8\xff' || continue ;;
    *.webp) head -c 12 "$tmp/$name" | grep -q 'WEBP' || continue ;;
  esac
  mv "$tmp/$name" "$out/$name"
  ok=$((ok + 1))
done <"$urls"

echo "downloaded $ok assets into $out"