from pathlib import Path

path = Path('hw/A10.html')
text = path.read_text(encoding='utf-8')

css_anchor = '@media(max-width:640px)'
premium_css = '''
.premium-float{transform-box:fill-box;transform-origin:center;animation:premiumFloat 3.6s ease-in-out infinite}.premium-float.d2{animation-delay:-1.2s}.premium-float.d3{animation-delay:-2.4s}.premium-pulse{transform-box:fill-box;transform-origin:center;animation:premiumPulse 2.2s ease-in-out infinite}.premium-scan{animation:premiumScan 2.8s ease-in-out infinite}.premium-speed{stroke-dasharray:10 8;animation:premiumDash 1.05s linear infinite}.premium-blink{animation:premiumBlink 2.4s ease-in-out infinite}.premium-spin{transform-box:fill-box;transform-origin:center;animation:diskSpin 2.4s linear infinite}.premium-slide{animation:premiumSlide 3.2s ease-in-out infinite}.premium-rise{animation:premiumRise 3s ease-in-out infinite}.premium-card{transform-box:fill-box;transform-origin:center;animation:premiumCard 3.3s ease-in-out infinite}.premium-card.d2{animation-delay:-1.1s}.premium-card.d3{animation-delay:-2.2s}
@keyframes premiumFloat{0%,100%{transform:translateY(5px)}50%{transform:translateY(-7px)}}@keyframes premiumPulse{0%,100%{transform:scale(.97);opacity:.82}50%{transform:scale(1.035);opacity:1}}@keyframes premiumScan{0%,100%{transform:translateX(-18px);opacity:.25}50%{transform:translateX(24px);opacity:1}}@keyframes premiumDash{to{stroke-dashoffset:-36}}@keyframes premiumBlink{0%,100%{opacity:.35}45%,65%{opacity:1}}@keyframes premiumSlide{0%,100%{transform:translateX(-5px)}50%{transform:translateX(8px)}}@keyframes premiumRise{0%{transform:translateY(16px);opacity:.25}45%,70%{transform:translateY(0);opacity:1}100%{transform:translateY(-10px);opacity:.3}}@keyframes premiumCard{0%,100%{transform:translateY(5px) rotate(-1deg)}50%{transform:translateY(-6px) rotate(1deg)}}
'''
if '.premium-float{' not in text:
    if css_anchor not in text:
        raise SystemExit('CSS anchor not found')
    text = text.replace(css_anchor, premium_css + css_anchor, 1)

start = text.find('function art(id){const arts={')
if start < 0:
    raise SystemExit('art() start not found')
end_marker = '};return arts[id]||arts.game}'
end = text.find(end_marker, start)
if end < 0:
    raise SystemExit('art() end not found')
end += len(end_marker)

art_fn = r'''function art(id){
const scenes={
game:`
<g>
  <ellipse cx="220" cy="218" rx="150" ry="14" fill="#0f172a" opacity=".12"/>
  <rect x="74" y="46" width="292" height="151" rx="22" fill="#172033"/>
  <rect x="89" y="60" width="262" height="121" rx="13" fill="url(#screenGrad)"/>
  <g class="premium-slide"><rect x="108" y="78" width="148" height="82" rx="12" fill="#0f172a" opacity=".9"/><circle cx="181" cy="119" r="27" fill="#7c3aed"/><path d="M157 139c13-30 34-48 54-47 21 1 34 17 45 45l-22 12-21-24-19 16-37-2Z" fill="#22c55e"/><circle cx="174" cy="109" r="7" fill="#fff"/><circle cx="204" cy="109" r="7" fill="#fff"/></g>
  <g class="premium-pulse"><rect x="273" y="79" width="58" height="34" rx="9" fill="#ffffff" opacity=".92"/><text x="302" y="101" text-anchor="middle" font-size="14" font-weight="900" fill="#0f172a">120</text></g>
  <rect x="109" y="169" width="221" height="7" rx="3.5" fill="#334155"/><path class="premium-speed" d="M121 188h64M194 188h49M253 188h72" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/><rect x="150" y="197" width="140" height="10" rx="5" fill="#94a3b8"/><rect x="132" y="207" width="176" height="7" rx="3.5" fill="#64748b"/>
</g>`,
poweroff:`
<g>
  <ellipse cx="220" cy="219" rx="142" ry="13" fill="#0f172a" opacity=".1"/><rect x="76" y="43" width="230" height="153" rx="21" fill="#172033"/><rect x="91" y="58" width="200" height="119" rx="12" fill="#dbeafe"/>
  <g class="power-fade"><rect x="111" y="78" width="72" height="58" rx="10" fill="#fff"/><rect x="191" y="78" width="80" height="25" rx="8" fill="#ede9fe"/><rect x="191" y="111" width="80" height="25" rx="8" fill="#d1fae5"/><path d="M121 125l19-21 14 13 9-11 13 19h-55Z" fill="#38bdf8"/></g>
  <rect x="142" y="196" width="96" height="9" rx="4.5" fill="#94a3b8"/>
  <g class="premium-pulse"><circle cx="352" cy="117" r="43" fill="#fee2e2"/><circle cx="352" cy="117" r="26" fill="#ef4444"/><path d="M352 99v21" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M338 108a18 18 0 1 0 28 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/></g>
  <g class="premium-rise"><circle cx="316" cy="68" r="6" fill="#94a3b8" opacity=".55"/><circle cx="337" cy="54" r="4" fill="#94a3b8" opacity=".4"/><circle cx="359" cy="72" r="5" fill="#94a3b8" opacity=".5"/></g>
</g>`,
windows:`
<g>
  <ellipse cx="220" cy="221" rx="154" ry="12" fill="#0f172a" opacity=".11"/><rect x="78" y="35" width="284" height="151" rx="20" fill="#172033"/><rect x="92" y="49" width="256" height="123" rx="11" fill="url(#screenGrad)"/>
  <g class="premium-pulse" transform="translate(173 72)"><rect width="42" height="34" rx="3" fill="#2563eb"/><rect x="47" width="42" height="34" rx="3" fill="#38bdf8"/><rect y="39" width="42" height="34" rx="3" fill="#2563eb"/><rect x="47" y="39" width="42" height="34" rx="3" fill="#38bdf8"/></g>
  <rect x="124" y="155" width="191" height="7" rx="3.5" fill="#bfdbfe"/><rect class="boot-bar" x="124" y="155" width="191" height="7" rx="3.5" fill="#2563eb"/><path d="M145 191h150l36 24H109l36-24Z" fill="#64748b"/><path d="M160 197h120l18 11H142l18-11Z" fill="#cbd5e1"/>
  <g class="premium-spin" transform="translate(344 54)"><circle cx="0" cy="0" r="23" fill="#10b981"/><path d="M0-12a12 12 0 1 1-10 5" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M-13-12l8 1-3 8Z" fill="#fff"/></g>
</g>`,
photos:`
<g>
  <ellipse cx="220" cy="221" rx="155" ry="13" fill="#0f172a" opacity=".1"/><path d="M84 180h272l32 37H52l32-37Z" fill="#64748b"/><rect x="93" y="41" width="254" height="143" rx="20" fill="#172033"/><rect x="107" y="55" width="226" height="114" rx="11" fill="#f8fafc"/>
  <g class="premium-card"><rect x="125" y="72" width="83" height="67" rx="10" fill="#dbeafe"/><circle cx="184" cy="91" r="8" fill="#f59e0b"/><path d="M134 130l23-27 17 17 11-14 14 24h-65Z" fill="#10b981"/></g>
  <g class="premium-card d2"><rect x="215" y="68" width="91" height="72" rx="10" fill="#ede9fe"/><circle cx="241" cy="91" r="8" fill="#ec4899"/><path d="M224 132l18-20 15 13 13-20 27 27h-73Z" fill="#7c3aed"/></g>
  <g class="premium-card d3"><rect x="170" y="116" width="94" height="43" rx="9" fill="#d1fae5"/><path d="M179 151l20-19 15 12 12-14 28 21h-75Z" fill="#0284c7"/></g>
  <g class="premium-pulse"><circle cx="363" cy="73" r="24" fill="#2563eb"/><path d="M351 74l8 8 16-20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>
</g>`,
archive:`
<g>
  <ellipse cx="220" cy="218" rx="151" ry="13" fill="#0f172a" opacity=".1"/><rect x="74" y="69" width="177" height="124" rx="19" fill="#172033"/>
  <g class="premium-card"><path d="M99 95h48l12 13h65v54H99Z" fill="#f59e0b"/><rect x="109" y="119" width="104" height="30" rx="6" fill="#fef3c7"/></g><g class="premium-card d2"><path d="M107 82h43l12 12h57v48h-112Z" fill="#38bdf8" opacity=".9"/></g><g class="premium-card d3"><path d="M116 72h38l10 11h50v43h-98Z" fill="#10b981" opacity=".82"/></g>
  <g class="premium-float"><rect x="278" y="68" width="112" height="85" rx="20" fill="#fff" opacity=".96"/><text x="334" y="108" text-anchor="middle" font-size="29" font-weight="950" fill="#0f172a">4 TB</text><text x="334" y="130" text-anchor="middle" font-size="11" font-weight="800" fill="#64748b">viel Platz</text></g>
  <g class="premium-pulse"><circle cx="335" cy="181" r="28" fill="#f59e0b"/><text x="335" y="190" text-anchor="middle" font-size="28" font-weight="950" fill="#fff">$</text></g>
</g>`,
oldpc:`
<g>
  <ellipse cx="220" cy="219" rx="151" ry="13" fill="#0f172a" opacity=".1"/><rect x="60" y="46" width="142" height="158" rx="20" fill="#172033"/><circle cx="84" cy="71" r="6" fill="#22c55e"/><rect x="83" y="92" width="95" height="19" rx="5" fill="#64748b"/><rect x="83" y="124" width="95" height="19" rx="5" fill="#64748b"/><rect x="83" y="156" width="95" height="19" rx="5" fill="#64748b"/>
  <g transform="translate(245 51)"><rect width="135" height="145" rx="23" fill="#172033"/><circle cx="67" cy="70" r="48" fill="#94a3b8"/><g class="premium-spin"><circle cx="67" cy="70" r="35" fill="#f8fafc"/><circle cx="67" cy="70" r="18" fill="#dbeafe"/><circle cx="67" cy="70" r="7" fill="#64748b"/><path d="M67 34v20M67 86v20M31 70h20M83 70h20" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/></g><g class="arm-scan"><path d="M65 72h54" stroke="#f59e0b" stroke-width="8" stroke-linecap="round"/><circle cx="118" cy="72" r="9" fill="#f59e0b"/></g></g>
  <g class="premium-blink"><path d="M210 91c14-10 23-10 34 0M210 116c14-10 23-10 34 0M210 141c14-10 23-10 34 0" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round"/></g>
</g>`,
tabs:`
<g>
  <ellipse cx="220" cy="221" rx="154" ry="12" fill="#0f172a" opacity=".1"/><rect x="63" y="39" width="314" height="158" rx="21" fill="#172033"/><rect x="77" y="53" width="286" height="129" rx="11" fill="#f8fafc"/>
  <g class="premium-slide"><rect x="87" y="63" width="34" height="14" rx="6" fill="#dbeafe"/><rect x="125" y="63" width="31" height="14" rx="6" fill="#ede9fe"/><rect x="160" y="63" width="31" height="14" rx="6" fill="#d1fae5"/><rect x="195" y="63" width="30" height="14" rx="6" fill="#fef3c7"/><rect x="229" y="63" width="32" height="14" rx="6" fill="#fee2e2"/><rect x="265" y="63" width="31" height="14" rx="6" fill="#dbeafe"/><rect x="300" y="63" width="29" height="14" rx="6" fill="#ede9fe"/><rect x="333" y="63" width="20" height="14" rx="6" fill="#d1fae5"/></g>
  <rect x="91" y="91" width="121" height="72" rx="10" fill="#2563eb"/><rect x="222" y="91" width="126" height="32" rx="9" fill="#dbeafe"/><rect x="222" y="131" width="126" height="32" rx="9" fill="#ede9fe"/>
  <g class="premium-pulse"><circle cx="350" cy="98" r="20" fill="#f59e0b"/><path d="M350 86v14" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="350" cy="108" r="3" fill="#fff"/></g><path d="M157 198h126l31 19H126l31-19Z" fill="#94a3b8"/>
</g>`,
upgrade:`
<g>
  <ellipse cx="220" cy="221" rx="159" ry="12" fill="#0f172a" opacity=".11"/><rect x="88" y="28" width="264" height="139" rx="19" fill="#172033"/><rect x="102" y="42" width="236" height="112" rx="10" fill="url(#screenGrad)"/>
  <circle cx="220" cy="96" r="34" fill="#2563eb"/><path d="M220 73v25l18 11" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="220" cy="96" r="4" fill="#fff"/><path class="premium-speed" d="M119 65h42M113 87h55M120 112h38" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
  <g class="premium-pulse"><rect x="278" y="61" width="44" height="30" rx="9" fill="#ecfdf5"/><path d="M290 78l7 7 13-17" fill="none" stroke="#10b981" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>
  <path d="M75 169h290l39 49H36l39-49Z" fill="#475569"/><path d="M90 178h260l24 30H66l24-30Z" fill="#cbd5e1"/><g fill="#94a3b8"><rect x="111" y="184" width="25" height="7" rx="2"/><rect x="142" y="184" width="25" height="7" rx="2"/><rect x="173" y="184" width="25" height="7" rx="2"/><rect x="204" y="184" width="25" height="7" rx="2"/><rect x="235" y="184" width="25" height="7" rx="2"/><rect x="266" y="184" width="25" height="7" rx="2"/><rect x="297" y="184" width="25" height="7" rx="2"/></g><rect x="187" y="195" width="66" height="15" rx="6" fill="#f8fafc"/>
</g>`,
backup:`
<g>
  <ellipse cx="220" cy="219" rx="151" ry="13" fill="#0f172a" opacity=".1"/><rect x="67" y="59" width="207" height="132" rx="21" fill="#172033"/><rect x="82" y="74" width="177" height="102" rx="12" fill="#f8fafc"/>
  <g class="premium-rise"><rect x="100" y="91" width="141" height="19" rx="8" fill="#dbeafe"/><rect x="100" y="118" width="141" height="19" rx="8" fill="#ede9fe"/><rect x="100" y="145" width="141" height="19" rx="8" fill="#d1fae5"/></g>
  <g class="premium-float"><rect x="302" y="73" width="89" height="111" rx="20" fill="#475569"/><circle cx="347" cy="126" r="27" fill="#94a3b8"/><path d="M330 126h34M347 109v34" stroke="#f8fafc" stroke-width="5" stroke-linecap="round"/><circle cx="347" cy="165" r="5" fill="#22c55e"/></g>
  <path class="premium-speed" d="M273 105h25M270 128h28M276 151h22" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/><g class="premium-pulse"><circle cx="311" cy="196" r="23" fill="#10b981"/><path d="M299 197l8 8 16-20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>
</g>`,
video:`
<g>
  <ellipse cx="220" cy="221" rx="158" ry="12" fill="#0f172a" opacity=".1"/><rect x="59" y="35" width="321" height="161" rx="22" fill="#172033"/><rect x="73" y="49" width="293" height="132" rx="12" fill="#f8fafc"/><rect x="89" y="65" width="171" height="70" rx="10" fill="#0f172a"/>
  <circle cx="174" cy="100" r="22" fill="#7c3aed"/><path d="M168 88l19 12-19 12Z" fill="#fff"/>
  <g class="timeline-move"><rect x="89" y="146" width="67" height="13" rx="5" fill="#2563eb"/><rect x="162" y="146" width="51" height="13" rx="5" fill="#10b981"/><rect x="219" y="146" width="82" height="13" rx="5" fill="#f59e0b"/><rect x="112" y="165" width="103" height="7" rx="3.5" fill="#ec4899"/><rect x="222" y="165" width="75" height="7" rx="3.5" fill="#38bdf8"/></g>
  <g class="premium-pulse"><rect x="276" y="65" width="73" height="23" rx="8" fill="#ede9fe"/><rect x="276" y="96" width="73" height="23" rx="8" fill="#dbeafe"/><rect x="276" y="127" width="73" height="23" rx="8" fill="#d1fae5"/></g><path d="M161 197h117l31 20H130l31-20Z" fill="#94a3b8"/>
</g>`
};
return `<svg viewBox="0 0 440 250" aria-hidden="true">
<defs><linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0f2fe"/><stop offset=".52" stop-color="#f8fafc"/><stop offset="1" stop-color="#ede9fe"/></linearGradient><linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dbeafe"/><stop offset="1" stop-color="#ede9fe"/></linearGradient><filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#0f172a" flood-opacity=".18"/></filter></defs>
<rect width="440" height="250" rx="24" fill="url(#bgGrad)"/><circle class="premium-float" cx="65" cy="42" r="38" fill="#38bdf8" opacity=".11"/><circle class="premium-float d2" cx="381" cy="42" r="48" fill="#7c3aed" opacity=".09"/><path d="M0 205C105 180 151 232 244 205c74-22 122-4 196 15v30H0Z" fill="#cbd5e1" opacity=".6"/><g filter="url(#softShadow)">${scenes[id]||scenes.game}</g><rect x="16" y="16" width="408" height="218" rx="19" fill="none" stroke="#fff" stroke-opacity=".6"/>
</svg>`
}'''

text = text[:start] + art_fn + text[end:]

checks = [
    'const scenes={', 'game:`', 'poweroff:`', 'windows:`', 'photos:`', 'archive:`',
    'oldpc:`', 'tabs:`', 'upgrade:`', 'backup:`', 'video:`',
    'M75 169h290l39 49H36l39-49Z', 'premium-float', 'premium-speed', 'softShadow',
    'Welches Bauteil könnte dafür verantwortlich sein?'
]
for check in checks:
    if check not in text:
        raise SystemExit('Validation failed: ' + check)
if text.count('function art(id){') != 1:
    raise SystemExit('Unexpected art() count')

path.write_text(text, encoding='utf-8')
