from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
A8 = ROOT / 'tk2' / 'A8'
required = {
    'index.html', 'sections-data.js', 'skill-hotkeys.js', 'modern-ui.css',
    'modern-exercises.css', 'modern-game.css', 'modern-battle.css',
    'modern-report.css', 'apexcharts.min.js', 'favicon.svg',
    'premium-motion.js', 'battle-motion.js', 'knight-premium-motion.js',
    'arena-dev-fix.js', 'arena-dev-tuning.css', 'a8-dev-polish.js',
    'battle-continuity.js', 'battle-balance.js', 'gear-visuals.js',
    'pdf-report.js', 'SOURCE.md', 'assets'
}
missing = sorted(name for name in required if not (A8 / name).exists())
assert not missing, f'missing canonical A8 files: {missing}'
assert len(list((A8 / 'assets').iterdir())) >= 50, 'A8 asset inventory is incomplete'
html = (A8 / 'index.html').read_text(encoding='utf-8')
for marker in (
    'A8 NARRATIVE FLY LIFECYCLE FIX 2026',
    'battle-continuity.js?v=6a655e2b',
    'battle-balance.js?v=6588df3e',
    'premium-motion.js', 'battle-motion.js?v=5f9aa1a7',
    'knight-premium-motion.js?v=74934b8f', 'pdf-report.js',
    'arena-dev-tuning.css?v=6193079d',
    'SHORTCUT_QUEST_BATTLE_ENGINE_V2', 'SHORTCUT_QUEST_ENEMY_ITEMS'
):
    assert marker in html, f'missing index marker: {marker}'
pdf = (A8 / 'pdf-report.js').read_text(encoding='utf-8')
assert "doc.save('A8-' + safeFileName(student) + '.pdf');" in pdf
assert 'A8_Shortcut_Quest_Lernnachweis_' not in pdf
balance = (A8 / 'battle-balance.js').read_text(encoding='utf-8')
assert 'enemy-item-consumed' in balance or 'consumed' in balance.lower(), 'Vercel enemy heal consumption fix marker missing'
print('OK: canonical local A8 inventory and integrated runtime markers verified')
