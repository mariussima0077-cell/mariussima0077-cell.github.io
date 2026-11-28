#!/bin/bash
# v16-267 (freeze at Alex: "u is not defined" stopped the battles): finds names used but never declared in the game's JS files.
# Usage: bash tools/check_undef.sh   → prints suspicious names (the list of known globals shared between the files is ignored).
cd "$(dirname "$0")/.." || exit 1
KNOWN='TFORGE|TDYNO|TE_SFX|VIP_PTS|__TUT|showSplash|GOTO|STREET|TE|__TE|SHOP2|GPX|CC|TEQ|GFX|CAMPAIGN|CLOUD|DGK|TALL|EVT|ONLINE|SEC'
for f in battle.js forge.js online.js events.js grandprix.js street.js shop2.js classic.js tutorial.js cloud.js; do
  npx -y eslint@8 --no-eslintrc --env browser,es2022 --parser-options ecmaVersion:2023 --rule '{"no-undef":"error"}' -f unix "$f" 2>/dev/null \
   | grep "no-undef" | grep -v -E "'($KNOWN)' is not defined"
done
echo "check done"
