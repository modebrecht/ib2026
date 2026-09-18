#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
OUT="$ROOT/dist"
A8_SOURCE="$ROOT/tk2/A8"

rm -rf "$OUT"
mkdir -p "$OUT"

# Copy the student-facing static site into a clean Vercel output directory.
# tk2/A8 is intentionally included: it is the canonical checked-in A8 source.
tar \
  --exclude='./.git' \
  --exclude='./.github' \
  --exclude='./.vercel' \
  --exclude='./.vercelignore' \
  --exclude='./.gitignore' \
  --exclude='./dist' \
  --exclude='./_site' \
  --exclude='./e2e' \
  --exclude='./node_modules' \
  --exclude='./playwright-report' \
  --exclude='./test-results' \
  --exclude='./scripts' \
  --exclude='./vercel.json' \
  -cf - . | tar -xf - -C "$OUT"

# Fail before deploy if the checked-in canonical A8 runtime is incomplete.
for file in \
  index.html sections-data.js skill-hotkeys.js \
  modern-ui.css modern-exercises.css modern-game.css modern-battle.css modern-report.css \
  apexcharts.min.js favicon.svg premium-motion.js battle-motion.js knight-premium-motion.js \
  arena-dev-fix.js arena-dev-tuning.css a8-dev-polish.js battle-continuity.js battle-balance.js \
  gear-visuals.js pdf-report.js SOURCE.md; do
  test -s "$OUT/tk2/A8/$file"
done
test -s "$OUT/tk2/A8/assets/arena-scene.svg"
test -s "$OUT/tk2/A8/assets/enemy-bergtroll.png"

for file in \
  sections-data.js skill-hotkeys.js premium-motion.js battle-motion.js knight-premium-motion.js \
  arena-dev-fix.js a8-dev-polish.js battle-continuity.js battle-balance.js gear-visuals.js pdf-report.js; do
  node --check "$OUT/tk2/A8/$file"
done

grep -Fq "doc.save('A8-' + safeFileName(student) + '.pdf');" "$OUT/tk2/A8/pdf-report.js"
grep -Fq '<script src="battle-continuity.js?v=6a655e2b"></script>' "$OUT/tk2/A8/index.html"
grep -Fq '<script src="battle-balance.js?v=6588df3e"></script>' "$OUT/tk2/A8/index.html"
grep -Fq 'SHORTCUT_QUEST_BATTLE_ENGINE_V2' "$OUT/tk2/A8/index.html"
grep -Fq 'SHORTCUT_QUEST_ENEMY_ITEMS' "$OUT/tk2/A8/index.html"
grep -Fq 'A8 NARRATIVE FLY LIFECYCLE FIX 2026' "$OUT/tk2/A8/index.html"
grep -Fq 'A8 PREMIUM HD BATTLE MOTION 2026' "$OUT/tk2/A8/battle-motion.js"
grep -Fq 'A8 PREMIUM KNIGHT MOTION 2026' "$OUT/tk2/A8/knight-premium-motion.js"
grep -Fq 'BATTLE UI SKILL BAR PREMIUM PASS 2026' "$OUT/tk2/A8/modern-battle.css"
grep -Fq 'BATTLE UI SKILL CARD FIT FIX 2026' "$OUT/tk2/A8/modern-battle.css"
grep -Fq 'BATTLE SKILL CONTENT HIERARCHY FIX 2026' "$OUT/tk2/A8/modern-battle.css"

# Vercel must deploy the exact checked-in A8 tree: copy + validate, never mutate.
diff -qr "$A8_SOURCE" "$OUT/tk2/A8"

echo "Vercel static bundle ready: $(find "$OUT/tk2/A8" -type f | wc -l | tr -d ' ') A8 files from checked-in tk2/A8"
