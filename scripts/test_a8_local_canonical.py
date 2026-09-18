from pathlib import Path
import subprocess

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
    'battle-continuity.js?v=6a655e2b',
    'battle-balance.js?v=6588df3e',
    'premium-motion.js', 'battle-motion.js?v=5f9aa1a7',
    'knight-premium-motion.js?v=74934b8f', 'pdf-report.js',
    'arena-dev-tuning.css?v=6193079d',
    'SHORTCUT_QUEST_BATTLE_ENGINE_V2', 'SHORTCUT_QUEST_ENEMY_ITEMS'
):
    assert marker in html, f'missing canonical runtime marker: {marker}'

pdf = (A8 / 'pdf-report.js').read_text(encoding='utf-8')
assert "doc.save('A8-' + safeFileName(student) + '.pdf');" in pdf
assert ('A8_' + 'Shortcut_Quest_Lernnachweis_') not in pdf

balance = (A8 / 'battle-balance.js').read_text(encoding='utf-8')
assert 'enemy-item-consumed' in balance or 'consumed' in balance.lower(), 'enemy heal consumption fix missing'

# Migration/import helpers must not return as alternate A8 architecture.
obsolete_paths = (
    ROOT / '.github' / 'workflows' / ('patch-a8-' + 'battle-continuity.yml'),
    ROOT / 'scripts' / ('patch_a8_' + 'narrative_fly.py'),
    ROOT / 'scripts' / ('test_patch_a8_' + 'narrative_fly.py'),
    ROOT / 'tk2' / ('a8-' + 'pdf-report.js'),
)
leftovers = [str(path.relative_to(ROOT)) for path in obsolete_paths if path.exists()]
assert not leftovers, f'obsolete A8 infrastructure remains: {leftovers}'

legacy_build_tokens = (
    'shortcut' + '-quest',
    'SHORTCUT_' + 'QUEST_SHA',
    'A8_' + 'TMP',
    '/tmp/' + 'shortcut',
    'patch_a8_' + 'narrative_fly',
    'a8-' + 'pdf-report',
)
for relative in ('.github/workflows/pages-multibranch.yml', 'scripts/build-vercel-site.sh'):
    text = (ROOT / relative).read_text(encoding='utf-8')
    found = [token for token in legacy_build_tokens if token.lower() in text.lower()]
    assert not found, f'{relative} still contains legacy A8 build dependency: {found}'

# Key editable A8 runtime modules must exist only in the canonical A8 tree.
tracked = subprocess.check_output(['git', 'ls-files'], cwd=ROOT, text=True).splitlines()
for name in ('sections-data.js', 'skill-hotkeys.js', 'battle-balance.js', 'battle-continuity.js', 'pdf-report.js'):
    matches = sorted(path for path in tracked if Path(path).name == name)
    expected = [f'tk2/A8/{name}']
    assert matches == expected, f'duplicate editable A8 source for {name}: {matches}'

print('OK: canonical A8 source, runtime contracts, single-source architecture and legacy cleanup verified')
