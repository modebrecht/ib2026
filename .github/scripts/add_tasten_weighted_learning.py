from pathlib import Path
p=Path('tk2/tasten.html')
s=p.read_text(encoding='utf-8')

old="const STORE={favorites:'ib-shortcut-favorites-v4',theme:'ib-shortcut-theme-v4',size:'ib-shortcut-size-v4',best:'ib-shortcut-best-v4'};"
new="const STORE={favorites:'ib-shortcut-favorites-v4',theme:'ib-shortcut-theme-v4',size:'ib-shortcut-size-v4',best:'ib-shortcut-best-v4',learning:'ib-shortcut-learning-v1'};"
assert old in s
s=s.replace(old,new,1)

anchor="function saveFavorites(){localStorage.setItem(STORE.favorites,JSON.stringify([...state.favorites]));updateFavoriteUI()}"
insert=r'''function saveFavorites(){localStorage.setItem(STORE.favorites,JSON.stringify([...state.favorites]));updateFavoriteUI()}
const learningStats=read(STORE.learning,{});
function learningStat(id){
  const raw=learningStats[id]||{};
  return {seen:Number(raw.seen)||0,correct:Number(raw.correct)||0,wrong:Number(raw.wrong)||0,pendingWrong:raw.pendingWrong===true};
}
function saveLearningStats(){localStorage.setItem(STORE.learning,JSON.stringify(learningStats))}
function markSeen(id){const st=learningStat(id);st.seen++;learningStats[id]=st;saveLearningStats()}
function markLearningResult(id,correct){const st=learningStat(id);if(correct){st.correct++;st.pendingWrong=false}else{st.wrong++;st.pendingWrong=true}learningStats[id]=st;saveLearningStats()}
function learningWeight(item,pool){
  const st=learningStat(item.id),maxSeen=Math.max(0,...pool.map(x=>learningStat(x.id).seen));
  const rarity=Math.min(.4,Math.max(0,(maxSeen-st.seen)*.10));
  const errorBonus=st.pendingWrong?.5:0;
  return 1+rarity+errorBonus;
}
function weightedPick(pool){
  if(!pool.length)return null;
  const weights=pool.map(item=>learningWeight(item,pool)),total=weights.reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(let i=0;i<pool.length;i++){r-=weights[i];if(r<=0)return pool[i]}
  return pool[pool.length-1];
}
function weightedSample(pool,count){
  const remaining=pool.slice(),result=[];
  while(remaining.length&&result.length<count){const pick=weightedPick(remaining);result.push(pick);remaining.splice(remaining.findIndex(x=>x.id===pick.id),1)}
  return result;
}'''
assert anchor in s
s=s.replace(anchor,insert,1)

old="function startChallenge(firstId=null){let pool=challengePool();if(!pool.length)pool=shortcuts.slice();let ids=shuffleArray(pool.map(s=>s.id));if(firstId&&ids.includes(firstId)){ids=ids.filter(id=>id!==firstId);ids.unshift(firstId)}const total=Math.min(10,ids.length);challenge.queue=ids.slice(0,total).map(id=>({id,main:true}));Object.assign(challenge,{index:0,phase:'main',score:0,directCorrect:0,streak:0,bestStreak:0,retries:0,answered:false,total});renderChallengeHUD();renderChallenge()}"
new="function startChallenge(firstId=null){let pool=challengePool();if(!pool.length)pool=shortcuts.slice();let chosen=weightedSample(pool,Math.min(10,pool.length));if(firstId&&pool.some(s=>s.id===firstId)&&!chosen.some(s=>s.id===firstId)){chosen[chosen.length-1]=pool.find(s=>s.id===firstId)}if(firstId&&chosen.some(s=>s.id===firstId)){chosen=chosen.filter(s=>s.id!==firstId);chosen.unshift(pool.find(s=>s.id===firstId))}const total=chosen.length;challenge.queue=chosen.map(s=>({id:s.id,main:true,seen:false}));Object.assign(challenge,{index:0,phase:'main',score:0,directCorrect:0,streak:0,bestStreak:0,retries:0,answered:false,total});renderChallengeHUD();renderChallenge()}"
assert old in s
s=s.replace(old,new,1)

old="function renderChallenge(){if(challenge.index>=challenge.queue.length){finishChallenge();return}challenge.answered=false;const q=challenge.queue[challenge.index],item=challengeItem();if(!item){challenge.index++;renderChallenge();return}const mainDone=challenge.queue.slice(0,challenge.index).filter(x=>x.main).length;"
new="function renderChallenge(){if(challenge.index>=challenge.queue.length){finishChallenge();return}challenge.answered=false;const q=challenge.queue[challenge.index],item=challengeItem();if(!item){challenge.index++;renderChallenge();return}if(q.main&&!q.seen){markSeen(item.id);q.seen=true}const mainDone=challenge.queue.slice(0,challenge.index).filter(x=>x.main).length;"
assert old in s
s=s.replace(old,new,1)

old="if(correct){challenge.streak++;challenge.bestStreak=Math.max(challenge.bestStreak,challenge.streak);if(q.main){challenge.directCorrect++;challenge.score+=100}haptic([12,24,18]);toast('Richtig ✓')}else{challenge.streak=0;challenge.retries++;challenge.queue.push({id:item.id,main:false});haptic([24,34,24]);toast('Kommt später nochmals')}"
new="if(correct){markLearningResult(item.id,true);challenge.streak++;challenge.bestStreak=Math.max(challenge.bestStreak,challenge.streak);if(q.main){challenge.directCorrect++;challenge.score+=100}haptic([12,24,18]);toast('Richtig ✓')}else{markLearningResult(item.id,false);challenge.streak=0;challenge.retries++;challenge.queue.push({id:item.id,main:false,seen:true});haptic([24,34,24]);toast('Kommt später nochmals')}"
assert old in s
s=s.replace(old,new,1)

old="const count=Math.min(4,pool.length),selected=shuffleArray(pool.slice()).slice(0,count),targetIndex=Math.floor(Math.random()*count);hunt.rows=selected.map((item,i)=>({item,shown:i===targetIndex?huntWrongShortcut(item,selected):item,isTarget:i===targetIndex,missed:false}));"
new="const count=Math.min(4,pool.length),selected=weightedSample(pool,count),targetIndex=Math.floor(Math.random()*count);selected.forEach(item=>markSeen(item.id));hunt.rows=selected.map((item,i)=>({item,shown:i===targetIndex?huntWrongShortcut(item,selected):item,isTarget:i===targetIndex,missed:false}));"
assert old in s
s=s.replace(old,new,1)

old="if(!row.isTarget){if(row.missed)return;row.missed=true;hunt.misses++;hunt.roundMisses++;hunt.streak=0;btn.classList.add('false-alarm');haptic([18,28,18]);toast('Diese Zuordnung stimmt');updateHuntHUD();return}hunt.solved=true;hunt.caught++;"
new="if(!row.isTarget){if(row.missed)return;row.missed=true;markLearningResult(row.item.id,false);hunt.misses++;hunt.roundMisses++;hunt.streak=0;btn.classList.add('false-alarm');haptic([18,28,18]);toast('Diese Zuordnung stimmt');updateHuntHUD();return}markLearningResult(row.item.id,true);hunt.solved=true;hunt.caught++;"
assert old in s
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('weighted learning randomizer patched')