from pathlib import Path
p=Path('tk2/tasten.html')
s=p.read_text(encoding='utf-8')
old="function favoriteShareUrl(ids=favoriteShareIds()){const u=new URL(location.href);u.search='';u.hash=`f=${encodeFavoriteIds(ids)}`;return u.toString()}"
new="function favoriteShareUrl(ids=favoriteShareIds()){return `https://ib2026.vercel.app/tk2/tasten.html#f=${encodeFavoriteIds(ids)}`}"
assert old in s, 'favoriteShareUrl anchor missing'
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('share URL pinned to Vercel production')
