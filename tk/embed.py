import shutil
import base64
import re

src_docx = r'C:\M4tty\GSU\dev\ib2026\tk\Tastenkombinationen_A3.docx'
dst_docx = r'C:\M4tty\GSU\dev\ib2026\8\Tastenkombinationen_A3.docx'

shutil.copy(src_docx, dst_docx)
print('Copied new docx to 8/Tastenkombinationen_A3.docx')

with open(src_docx, 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

with open(r'C:\M4tty\GSU\dev\ib2026\tk\b64_docx.txt', 'w') as out:
    out.write(b64)

for html_path in [r'C:\M4tty\GSU\dev\ib2026\8\A3.html', r'C:\M4tty\GSU\dev\ib2026\tk\A3.html']:
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove previous script tag if present
    content = re.sub(r'<script>window\.b64DocxData = ".*?";</script>\n?', '', content, flags=re.DOTALL)
    
    script_tag = f'<script>window.b64DocxData = "{b64}";</script>\n'
    content = content.replace('<!-- Global XP Engine -->', script_tag + '    <!-- Global XP Engine -->')
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated base64 in', html_path)
