from pathlib import Path

html=Path('tk2/A3.html')
js=Path('tk2/a3-app.js')

s=html.read_text(encoding='utf-8')
anchor="    .choice-row input:focus{border-color:#818cf8;box-shadow:0 0 0 3px rgba(99,102,241,.14)}\n"
insert=anchor+"    .choice-row input.is-invalid{border-color:#ef4444;background:rgba(127,29,29,.12);box-shadow:0 0 0 3px rgba(239,68,68,.12)}\n"
assert anchor in s
s=s.replace(anchor,insert,1)
html.write_text(s,encoding='utf-8')

s=js.read_text(encoding='utf-8')
anchor="  function syncOneDriveStep(progress){\n"
fn="""  function syncChoiceValidation(progress){\n    var enabled=progress.downloaded===true;\n    var keys=(progress.choices||[]).map(function(c){return duplicateKey(c.shortcut);});\n    document.querySelectorAll('.shortcut-choice').forEach(function(input,index){\n      var value=(progress.choices[index]&&progress.choices[index].shortcut)||'';\n      var key=keys[index];\n      var duplicate=key&&keys.filter(function(k){return k===key;}).length>1;\n      input.classList.toggle('is-invalid',enabled&&value.trim()!==''&&(!shortcutValid(value)||duplicate));\n    });\n    document.querySelectorAll('.shortcut-reason').forEach(function(input,index){\n      var value=(progress.choices[index]&&progress.choices[index].reason)||'';\n      input.classList.toggle('is-invalid',enabled&&value.trim()!==''&&!reasonValid(value));\n    });\n  }\n\n"""
assert anchor in s
s=s.replace(anchor,fn+anchor,1)
old="""    syncChoiceStep(progress);\n    syncOneDriveStep(progress);\n"""
new="""    syncChoiceStep(progress);\n    syncChoiceValidation(progress);\n    syncOneDriveStep(progress);\n"""
assert old in s
s=s.replace(old,new,1)
js.write_text(s,encoding='utf-8')
print('A3 invalid inputs now turn red')
