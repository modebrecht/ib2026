(function(){
  'use strict';

  function createDocTextScene(container, options){
    options = options || {};
    var mode = options.mode || 'copy';
    var autoplay = options.autoplay !== false;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timers = [];
    var running = false;

    container.innerHTML = `
      <div class="tk2-scene-shell" data-mode="${mode}">
        <svg class="tk2-doc-scene" viewBox="0 0 720 400" role="img" aria-label="Animation: Markierter Text wird mit Ctrl C kopiert und bleibt im Dokument erhalten.">
          <defs>
            <filter id="tk2-shadow" x="-30%" y="-30%" width="160%" height="170%">
              <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#020617" flood-opacity="0.42"/>
            </filter>
            <linearGradient id="tk2-window-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ffffff"/>
              <stop offset="1" stop-color="#f8fafc"/>
            </linearGradient>
            <linearGradient id="tk2-selection" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#60a5fa" stop-opacity="0.55"/>
              <stop offset="1" stop-color="#38bdf8" stop-opacity="0.34"/>
            </linearGradient>
            <linearGradient id="tk2-clipboard" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#172554"/>
              <stop offset="1" stop-color="#0f172a"/>
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="720" height="400" rx="28" fill="#07101f"/>
          <circle cx="640" cy="74" r="110" fill="#2563eb" opacity="0.07"/>
          <circle cx="88" cy="356" r="120" fill="#06b6d4" opacity="0.055"/>

          <g class="tk2-editor" filter="url(#tk2-shadow)">
            <rect x="40" y="34" width="470" height="326" rx="18" fill="url(#tk2-window-bg)"/>
            <rect x="40" y="34" width="470" height="42" rx="18" fill="#e2e8f0"/>
            <rect x="40" y="58" width="470" height="18" fill="#e2e8f0"/>
            <circle cx="64" cy="55" r="5" fill="#fb7185"/>
            <circle cx="82" cy="55" r="5" fill="#fbbf24"/>
            <circle cx="100" cy="55" r="5" fill="#34d399"/>
            <rect x="128" y="48" width="142" height="14" rx="7" fill="#cbd5e1"/>
            <text x="146" y="59" font-family="Arial,sans-serif" font-size="11" fill="#475569">Projektbericht.docx</text>

            <rect x="76" y="100" width="176" height="15" rx="7.5" fill="#0f172a" opacity="0.90"/>
            <rect x="76" y="133" width="352" height="10" rx="5" fill="#94a3b8" opacity="0.78"/>
            <rect x="76" y="157" width="312" height="10" rx="5" fill="#94a3b8" opacity="0.78"/>
            <rect x="76" y="181" width="344" height="10" rx="5" fill="#94a3b8" opacity="0.78"/>

            <g class="tk2-copy-source">
              <rect class="tk2-selection" x="72" y="209" width="0" height="34" rx="7" fill="url(#tk2-selection)"/>
              <text x="80" y="232" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#0f172a">wichtiger Text</text>
            </g>

            <rect x="76" y="263" width="332" height="10" rx="5" fill="#94a3b8" opacity="0.68"/>
            <rect x="76" y="287" width="276" height="10" rx="5" fill="#94a3b8" opacity="0.68"/>
            <rect x="76" y="311" width="308" height="10" rx="5" fill="#94a3b8" opacity="0.68"/>

            <g class="tk2-caret" opacity="0">
              <rect x="225" y="211" width="2.5" height="26" rx="1.25" fill="#2563eb"/>
            </g>
          </g>

          <g class="tk2-clipboard" transform="translate(558 112)" filter="url(#tk2-shadow)">
            <rect x="0" y="12" width="122" height="166" rx="22" fill="url(#tk2-clipboard)" stroke="#334155" stroke-width="2"/>
            <rect x="35" y="0" width="52" height="30" rx="11" fill="#334155"/>
            <rect x="22" y="48" width="78" height="8" rx="4" fill="#64748b"/>
            <rect x="22" y="69" width="65" height="8" rx="4" fill="#64748b"/>
            <rect class="tk2-clip-slot" x="20" y="100" width="82" height="35" rx="9" fill="#0b1220" stroke="#475569" stroke-width="1.5"/>
            <text class="tk2-clip-text" x="61" y="123" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#7dd3fc" opacity="0">wichtiger Text</text>
            <text x="61" y="158" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#94a3b8">Zwischenablage</text>
          </g>

          <g class="tk2-keys" transform="translate(552 302)" filter="url(#tk2-shadow)">
            <g class="tk2-key-ctrl">
              <rect x="0" y="0" width="72" height="48" rx="12" fill="#182235" stroke="#475569" stroke-width="2"/>
              <text x="36" y="30" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="800" fill="#dbeafe">Ctrl</text>
            </g>
            <text x="85" y="30" font-family="Arial,sans-serif" font-size="19" font-weight="800" fill="#64748b">+</text>
            <g class="tk2-key-c">
              <rect x="101" y="0" width="52" height="48" rx="12" fill="#182235" stroke="#475569" stroke-width="2"/>
              <text x="127" y="30" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="800" fill="#dbeafe">C</text>
            </g>
          </g>

          <g class="tk2-flying-copy" opacity="0">
            <rect x="72" y="209" width="160" height="34" rx="7" fill="#2563eb" opacity="0.18"/>
            <text x="80" y="232" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#7dd3fc">wichtiger Text</text>
          </g>

          <g class="tk2-success" transform="translate(528 64)" opacity="0">
            <rect x="0" y="0" width="166" height="34" rx="17" fill="#052e2b" stroke="#10b981" stroke-width="1.5"/>
            <circle cx="20" cy="17" r="8" fill="#10b981"/>
            <path d="M16 17l3 3 6-7" fill="none" stroke="#ecfdf5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="36" y="22" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#a7f3d0">Kopie gespeichert</text>
          </g>
        </svg>
      </div>
    `;

    var svg = container.querySelector('.tk2-doc-scene');
    var selection = svg.querySelector('.tk2-selection');
    var flying = svg.querySelector('.tk2-flying-copy');
    var clipText = svg.querySelector('.tk2-clip-text');
    var success = svg.querySelector('.tk2-success');
    var ctrlKey = svg.querySelector('.tk2-key-ctrl');
    var cKey = svg.querySelector('.tk2-key-c');

    function later(ms, fn){
      var id = window.setTimeout(fn, ms);
      timers.push(id);
    }

    function clearTimers(){
      timers.forEach(function(id){ window.clearTimeout(id); });
      timers = [];
    }

    function setTransition(el, value){ el.style.transition = value; }

    function reset(){
      clearTimers();
      running = false;
      setTransition(selection, 'none');
      selection.setAttribute('width', '0');
      setTransition(flying, 'none');
      flying.setAttribute('opacity', '0');
      flying.setAttribute('transform', 'translate(0 0) scale(1)');
      clipText.setAttribute('opacity', '0');
      success.setAttribute('opacity', '0');
      ctrlKey.setAttribute('transform', 'translate(0 0)');
      cKey.setAttribute('transform', 'translate(0 0)');
      ctrlKey.style.filter = '';
      cKey.style.filter = '';
    }

    function pressKey(group){
      group.setAttribute('transform', 'translate(0 4)');
      group.style.filter = 'drop-shadow(0 0 10px rgba(56,189,248,.75))';
      later(180, function(){
        group.setAttribute('transform', 'translate(0 0)');
        group.style.filter = '';
      });
    }

    function playCopy(){
      if(running) reset();
      running = true;

      later(120, function(){
        setTransition(selection, reduceMotion ? 'none' : 'width 620ms cubic-bezier(.22,.8,.25,1)');
        selection.setAttribute('width', '164');
      });

      later(980, function(){ pressKey(ctrlKey); });
      later(1120, function(){ pressKey(cKey); });

      later(1360, function(){
        flying.setAttribute('opacity', '1');
        setTransition(flying, reduceMotion ? 'none' : 'transform 760ms cubic-bezier(.2,.75,.24,1), opacity 180ms ease');
        flying.setAttribute('transform', 'translate(492 -86) scale(.58)');
      });

      later(2140, function(){
        flying.setAttribute('opacity', '0');
        clipText.setAttribute('opacity', '1');
        success.setAttribute('opacity', '1');
      });

      later(3600, function(){
        running = false;
        if(autoplay) play();
      });
    }

    function play(){
      reset();
      later(reduceMotion ? 0 : 180, function(){
        if(mode === 'copy') playCopy();
      });
    }

    reset();
    if(autoplay) play();

    return {
      play: play,
      reset: reset,
      setMode: function(nextMode){ mode = nextMode; play(); }
    };
  }

  window.createDocTextScene = createDocTextScene;
})();
