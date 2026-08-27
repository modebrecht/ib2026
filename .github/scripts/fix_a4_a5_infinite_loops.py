from pathlib import Path

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

old_top="var counter=0,LOOP_MS=4300,activeController=null;"
assert old_top in s
s=s.replace(old_top,"var counter=0,LOOP_MS=4300;",1)

old_play="function play(){active=true;if(activeController&&activeController!==controller)activeController.setActive(false);activeController=controller;run();}"
new_play="function play(){active=true;run();}"
count_play=s.count(old_play)
assert count_play>=2, f'expected >=2 play handlers, found {count_play}'
s=s.replace(old_play,new_play)

old_set="function setActive(v){active=Boolean(v);if(!active){if(activeController===controller)activeController=null;clearTimers();running=false;return;}if(activeController&&activeController!==controller)activeController.setActive(false);activeController=controller;if(!running)run();}"
new_set="function setActive(v){active=Boolean(v);if(!active){clearTimers();running=false;return;}if(!running)run();}"
count_set=s.count(old_set)
assert count_set>=2, f'expected >=2 setActive handlers, found {count_set}'
s=s.replace(old_set,new_set)

assert 'activeController' not in s
assert s.count("function play(){active=true;run();}")>=2
assert s.count("if(active&&autoLoop)run();")>=2
p.write_text(s,encoding='utf-8')
print(f'Independent infinite loops enabled: play={count_play}, setActive={count_set}')
