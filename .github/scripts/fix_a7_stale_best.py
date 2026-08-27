from pathlib import Path
p=Path('tk2/A7.html')
s=p.read_text(encoding='utf-8')
old="renderHome();renderLearn();fillMemoryCategories();startChallenge();startHunt();renderFavorites();updateFavoriteUI();renderStats();renderEvidence();$('#best').textContent=state.best;applyPrefs();readSharedFavoritesFromHash();"
new="renderHome();renderLearn();fillMemoryCategories();startChallenge();startHunt();renderFavorites();updateFavoriteUI();renderStats();renderEvidence();applyPrefs();readSharedFavoritesFromHash();"
assert old in s, 'stale #best initialization marker missing'
s=s.replace(old,new,1)
assert "$('#best').textContent" not in s
assert 'id="best"' not in s
p.write_text(s,encoding='utf-8')
print('removed stale #best write from A7 initialization')
