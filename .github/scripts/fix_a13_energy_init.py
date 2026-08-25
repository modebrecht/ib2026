from pathlib import Path
p=Path('hw/A13.html')
s=p.read_text(encoding='utf-8')
s=s.replace('function calc(){const m=', 'function calc(mark=true){const m=', 1)
s=s.replace(";state.task3=true;$('feedback3').textContent='✓ Rechner ausprobiert.';save();updateProgress()}", ";if(mark){state.task3=true;$('feedback3').textContent='✓ Rechner ausprobiert.';save();updateProgress()}}", 1)
s=s.replace("renderProcure();load();calc();state.task3=JSON.parse(localStorage.getItem(K)||'{}').state?.task3||false;if(!state.task3)", "renderProcure();load();calc(false);if(!state.task3)", 1)
p.write_text(s,encoding='utf-8')
print('A13 energy calculator now completes only after user interaction')
