from pathlib import Path
import re

p = Path('tk2/tasten.html')
text = p.read_text(encoding='utf-8')

pattern = re.compile(r"function updateMemoryDimensions\(\)\{.*?\}\nfunction crownSvg", re.S)
replacement = r'''function updateMemoryDimensions(){
  const board=$('#memoryBoard'),count=memory.cards.length;
  if(!board||!count)return;
  const boardWidth=board.clientWidth||Math.max(280,window.innerWidth-32);
  const gap=window.innerWidth<480?6:10;
  let cols;
  if(window.innerWidth<560){
    cols=2;
  }else if(window.innerWidth<860){
    cols=Math.min(4,Math.max(2,Math.ceil(Math.sqrt(count))));
  }else{
    if(count<=8) cols=4;
    else if(count<=16) cols=4;
    else if(count<=20) cols=5;
    else cols=6;
  }
  cols=Math.min(cols,count);
  const maxCard=window.innerWidth<560?190:220;
  const minCard=window.innerWidth<560?118:132;
  let cardW=(boardWidth-gap*(cols-1))/cols;
  if(cardW<minCard){
    while(cols>2 && (boardWidth-gap*(cols-2))/(cols-1)>=minCard) cols--;
    cardW=(boardWidth-gap*(cols-1))/cols;
  }
  cardW=Math.min(maxCard,cardW);
  const cardH=cardW*1.25;
  board.style.gridTemplateColumns=`repeat(${cols},${Math.floor(cardW)}px)`;
  board.style.justifyContent='center';
  board.style.alignItems='start';
  board.style.gap=`${gap}px`;
  const font=Math.max(window.innerWidth<560?14:15,Math.min(26,Math.round(cardW*.115)));
  document.documentElement.style.setProperty('--card-text',`${font}px`);
  $$('.mem-card',board).forEach(c=>{
    c.style.width=`${Math.floor(cardW)}px`;
    c.style.height=`${Math.floor(cardH)}px`;
  });
}
function crownSvg'''
text, n = pattern.subn(replacement, text, count=1)
if n != 1:
    raise SystemExit(f'updateMemoryDimensions replacement failed: {n}')

# Prevent hard/ultra from looking cramped: the active view can scroll vertically instead of shrinking cards.
if '.mem-board{display:grid;' not in text:
    raise SystemExit('mem-board CSS marker missing')
text = text.replace('.mem-board{display:grid;gap:8px;width:100%;transition:all .3s cubic-bezier(.4,0,.2,1);padding:2px 0 18px}', '.mem-board{display:grid;gap:8px;width:100%;transition:all .3s cubic-bezier(.4,0,.2,1);padding:2px 0 28px;align-content:start}', 1)

for marker in ['else if(count<=20) cols=5;', 'else cols=6;', 'const minCard=window.innerWidth<560?118:132;', 'Math.max(window.innerWidth<560?14:15']:
    if marker not in text:
        raise SystemExit(f'missing expected marker: {marker}')

p.write_text(text, encoding='utf-8')
