from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Broaden the hardware section description now that A10-A14 cover storage,
# buying advice, interfaces and Green IT as well.
s = s.replace(
    '<p class="kachel-subtitle">Computeraufbau &amp; Komponenten</p>',
    '<p class="kachel-subtitle">Hardware · Kaufberatung · Green IT</p>',
    1,
)

# Make the A11 title match the actual worksheet more closely.
s = s.replace(
    '<span class="task-number">A11</span><span class="task-name">Kaufberatung</span>',
    '<span class="task-number">A11</span><span class="task-name">Kaufberatung im Tech Shop</span>',
    1,
)

# Extend staggered entrance animation to the newly added tasks.
old_delay = '.hw-task-list .task-card:nth-child(2){animation-delay:.035s}.hw-task-list .task-card:nth-child(3){animation-delay:.07s}.hw-task-list .task-card:nth-child(4){animation-delay:.105s}.hw-task-list .task-card:nth-child(5){animation-delay:.14s}.hw-task-list .task-card:nth-child(6){animation-delay:.175s}.hw-task-list .task-card:nth-child(7){animation-delay:.21s}.hw-task-list .task-card:nth-child(8){animation-delay:.245s}.hw-task-list .task-card:nth-child(9){animation-delay:.28s}'
new_delay = old_delay + '.hw-task-list .task-card:nth-child(10){animation-delay:.315s}.hw-task-list .task-card:nth-child(11){animation-delay:.35s}.hw-task-list .task-card:nth-child(12){animation-delay:.385s}.hw-task-list .task-card:nth-child(13){animation-delay:.42s}.hw-task-list .task-card:nth-child(14){animation-delay:.455s}'
assert old_delay in s, 'task animation delay anchor missing'
s = s.replace(old_delay, new_delay, 1)

# Add completion detection for A10-A14 directly after A9.
anchor = """          const a9Data = localStorage.getItem('onedrive_a9_eva_scenarios_8sek');
          if (a9Data) {
            const parsed = JSON.parse(a9Data);
            if (parsed && Number(parsed.bestScore) >= 8) markDone('title-A9');
          }
"""
insert = anchor + """

          const a10Data = localStorage.getItem('onedrive_a10_storage_scenarios_9sek_v2');
          if (a10Data) {
            const parsed = JSON.parse(a10Data);
            if (parsed && Number(parsed.bestScore) >= 7) markDone('title-A10');
          }

          const a11Data = localStorage.getItem('onedrive_a11_shop_9sek_v5');
          if (a11Data) {
            const parsed = JSON.parse(a11Data);
            if (parsed && Array.isArray(parsed.done) && parsed.done.length >= 5) markDone('title-A11');
          }

          const a12Data = localStorage.getItem('onedrive_a12_schnittstellen_9sek');
          if (a12Data) {
            const parsed = JSON.parse(a12Data);
            const choices = parsed && parsed.choices ? parsed.choices : {};
            const expected = {
              'usb-a':'data','usb-c':'data','hdmi':'av','dp':'av','rj45':'network','audio':'av',
              'vga':'av','dvi':'av','usb-b':'data','micro-usb':'data','lightning':'data','power':'power'
            };
            if (Object.keys(expected).every(function(key) { return choices[key] === expected[key]; })) markDone('title-A12');
          }

          const a13Data = localStorage.getItem('onedrive_a13_green_it_learning_v1');
          if (a13Data) {
            const parsed = JSON.parse(a13Data);
            const st = parsed && parsed.state ? parsed.state : {};
            const vals = parsed && parsed.vals ? parsed.vals : {};
            if (st.task2 === true && st.task3 === true && st.procure === true && st.recycle === true && String(vals.oldDevices || '') !== '') markDone('title-A13');
          }

          const a14Data = localStorage.getItem('onedrive_a14_green_it_scenarios_9sek_v1');
          if (a14Data) {
            const parsed = JSON.parse(a14Data);
            if (parsed && Number(parsed.bestScore) >= 10) markDone('title-A14');
          }
"""
assert anchor in s, 'A9 completion anchor missing'
s = s.replace(anchor, insert, 1)

p.write_text(s, encoding='utf-8')
print('Root index updated for A10-A14')
