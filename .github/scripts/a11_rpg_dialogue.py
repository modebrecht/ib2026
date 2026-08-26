from pathlib import Path

p = Path('hw/A11.html')
s = p.read_text(encoding='utf-8')

# 1) RPG dialogue styling.
needle = ".speech .hello{font-size:.68rem;font-weight:950;letter-spacing:.14em;text-transform:uppercase;color:#7c3aed}.speech .line{font-size:1rem;line-height:1.45;font-weight:800;margin-top:.35rem}"
replacement = needle + "\n.speech .line.dialogue-hidden{display:none}.dialogue-next{display:flex;align-items:center;justify-content:center;width:46px;height:34px;margin:.7rem auto -.35rem;border:0;background:transparent;color:#2563eb;cursor:pointer;border-radius:.7rem;font-size:1.45rem;filter:drop-shadow(0 3px 5px rgba(37,99,235,.28));animation:dialogueBob 1.05s ease-in-out infinite}.dialogue-next:hover{color:#1d4ed8;background:#eff6ff}.dialogue-next:focus-visible{outline:3px solid rgba(37,99,235,.28);outline-offset:2px}.dialogue-next.hidden{display:none}.choice-area.dialogue-locked{display:none}.choice-area.dialogue-reveal{animation:dialogueReveal .3s cubic-bezier(.2,.9,.2,1)}"
assert needle in s, 'speech style anchor not found'
s = s.replace(needle, replacement, 1)

# Add keyframes to existing keyframes line.
needle = "@keyframes pop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}"
replacement = needle + "@keyframes dialogueBob{0%,100%{transform:translateY(-3px)}50%{transform:translateY(5px)}}@keyframes dialogueReveal{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}"
assert needle in s, 'keyframe anchor not found'
s = s.replace(needle, replacement, 1)

# Respect reduced motion if the page already has a media block; add a simple override before </style>.
needle = "</style>"
replacement = "@media(prefers-reduced-motion:reduce){.dialogue-next{animation:none!important}.choice-area.dialogue-reveal{animation:none!important}}\n" + needle
assert needle in s
s = s.replace(needle, replacement, 1)

# 2) Add clickable blue triangle inside speech bubble.
needle = '<div id="speech" class="speech"><div id="hello" class="hello">Guten Tag!</div><div id="speechText" class="line"></div></div>'
replacement = '<div id="speech" class="speech"><div id="hello" class="hello">Guten Tag!</div><div id="speechText" class="line dialogue-hidden"></div><button id="dialogueNext" class="dialogue-next" type="button" onclick="advanceDialogue()" aria-label="Weiter"><i class="fa-solid fa-caret-down"></i></button></div>'
assert needle in s, 'speech html anchor not found'
s = s.replace(needle, replacement, 1)

# 3) Lock choices until the customer has spoken.
needle = '<div class="choice-area"><div class="choice-title">Was empfiehlst du?</div><div id="choices" class="choices"></div></div>'
replacement = '<div id="choiceArea" class="choice-area dialogue-locked"><div class="choice-title">Was empfiehlst du?</div><div id="choices" class="choices"></div></div>'
assert needle in s, 'choice area anchor not found'
s = s.replace(needle, replacement, 1)

# 4) Add dialogue state variable.
needle = 'let index=0,done=[],answered=false;'
replacement = 'let index=0,done=[],answered=false,dialogueOpen=false;'
assert needle in s, 'state anchor not found'
s = s.replace(needle, replacement, 1)

# 5) Render greeting first. Customer request and choices stay hidden until click.
needle = "function render(){if(index>=CASES.length)return finish();answered=false;const c=CASES[index];$('playArea').classList.remove('hidden');$('result').classList.add('hidden');$('caseCounter').innerHTML=`<i class=\"fa-solid fa-user mr-1\"></i> Kundschaft ${index+1} / ${CASES.length}`;$('hello').textContent=c.hello;$('speechText').textContent=c.speech;$('feedback').innerHTML='';$('nextBtn').classList.remove('show');"
replacement = "function render(){if(index>=CASES.length)return finish();answered=false;dialogueOpen=false;const c=CASES[index];$('playArea').classList.remove('hidden');$('result').classList.add('hidden');$('caseCounter').innerHTML=`<i class=\"fa-solid fa-user mr-1\"></i> Kundschaft ${index+1} / ${CASES.length}`;$('hello').textContent=c.hello;$('speechText').textContent=c.speech;$('speechText').classList.add('dialogue-hidden');$('dialogueNext').classList.remove('hidden');$('choiceArea').classList.add('dialogue-locked');$('choiceArea').classList.remove('dialogue-reveal');$('feedback').innerHTML='';$('nextBtn').classList.remove('show');"
assert needle in s, 'render anchor not found'
s = s.replace(needle, replacement, 1)

# 6) Add dialogue advance function before choose().
needle = 'function choose(id,button){if(answered)return;'
replacement = "function advanceDialogue(){if(dialogueOpen)return;dialogueOpen=true;$('speechText').classList.remove('dialogue-hidden');$('dialogueNext').classList.add('hidden');$('choiceArea').classList.remove('dialogue-locked');$('choiceArea').classList.add('dialogue-reveal');}\nfunction choose(id,button){if(answered||!dialogueOpen)return;"
assert needle in s, 'choose anchor not found'
s = s.replace(needle, replacement, 1)

p.write_text(s, encoding='utf-8')
print('A11 RPG dialogue flow patched')
