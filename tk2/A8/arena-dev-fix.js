(function () {
  'use strict';

  const STYLE_ID = 'a8ArenaDevFixStyles';
  const ARENA_BACKGROUND = "url('assets/arena-scene.svg?v=20260912-svg-arena')";
  const FALLBACK_SWORD = '<img src="assets/sword_steel.svg" alt="" aria-hidden="true">';

  const css = `
    /* A8 final vector arena composition. Loaded after battle-motion.js in DEV. */
    #battleView .battle-overview {
      display: block !important;
      margin: 0 !important;
    }

    #battleView .battle-center {
      width: 100% !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      gap: .55rem !important;
    }

    #battleView .battle-center-head {
      display: none !important;
    }

    #battleView .battle-stage-preview,
    #battleView .battle-arena {
      background-color: #07101a !important;
      background-image: ${ARENA_BACKGROUND} !important;
      background-size: cover !important;
      background-position: center center !important;
      background-repeat: no-repeat !important;
      filter: none !important;
    }

    #battleView .battle-stage-preview {
      --arena-ground-y: 112px;
      position: relative !important;
      width: 100% !important;
      height: clamp(500px, 48vw, 620px) !important;
      min-height: 500px !important;
      padding: 0 !important;
      overflow: hidden !important;
      isolation: isolate !important;
      border: 1px solid rgba(148,163,184,.18) !important;
      border-radius: 1.2rem !important;
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.025),
        inset 0 -90px 110px rgba(2,6,23,.32),
        0 24px 56px rgba(2,6,23,.35) !important;
    }

    #battleView .battle-stage-preview::before,
    #battleView .battle-stage-preview::after,
    #battleView .battle-arena::before,
    #battleView .battle-arena::after {
      content: none !important;
      display: none !important;
      background: none !important;
    }

    #battleView .battle-stage-preview .battle-stage-haze {
      display: none !important;
      opacity: 0 !important;
      background: transparent !important;
      background-image: none !important;
      filter: none !important;
      backdrop-filter: none !important;
      animation: none !important;
    }

    #battleView .battle-stage-preview .battle-stage-haze::before,
    #battleView .battle-stage-preview .battle-stage-haze::after {
      content: none !important;
      display: none !important;
      background: none !important;
    }

    #battleView .battle-stage-preview > .battle-side {
      position: absolute !important;
      top: 0 !important;
      bottom: 0 !important;
      z-index: 3 !important;
      width: 46% !important;
      min-width: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      display: block !important;
      pointer-events: none !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    #battleView .battle-stage-preview > .battle-side.hero { left: 0 !important; }
    #battleView .battle-stage-preview > .battle-side.enemy { right: 0 !important; }

    #battleView .battle-stage-preview .battle-side-head {
      position: absolute !important;
      top: 18px !important;
      z-index: 6 !important;
      min-width: 176px !important;
      max-width: 76% !important;
      padding: .52rem .68rem !important;
      border: 1px solid rgba(148,163,184,.2) !important;
      border-radius: .82rem !important;
      background: rgba(4,10,20,.62) !important;
      backdrop-filter: blur(10px) !important;
      box-shadow: 0 10px 28px rgba(2,6,23,.2) !important;
    }

    #battleView .battle-stage-preview .battle-side.hero .battle-side-head { left: 18px !important; }
    #battleView .battle-stage-preview .battle-side.enemy .battle-side-head { right: 18px !important; text-align: right !important; }

    #battleView .battle-stage-preview .battle-side-label {
      color: #8ea9c4 !important;
      font-size: .62rem !important;
      letter-spacing: .1em !important;
      text-transform: uppercase !important;
    }

    #battleView .battle-stage-preview .battle-side-head h3 {
      margin: .08rem 0 0 !important;
      color: #fff !important;
      font-size: clamp(.88rem, 1.4vw, 1.08rem) !important;
      text-shadow: 0 2px 10px rgba(0,0,0,.8) !important;
    }

    #battleView .battle-stage-preview .battle-side-tier,
    #battleView .battle-stage-preview .battle-trait {
      background: rgba(15,23,42,.52) !important;
      border-color: rgba(226,232,240,.13) !important;
      color: #d4deea !important;
    }

    #battleView .battle-stage-preview .battle-portrait,
    #battleView .battle-stage-preview .battle-portrait.hero,
    #battleView .battle-stage-preview .battle-portrait.enemy {
      position: absolute !important;
      left: 50% !important;
      bottom: var(--arena-ground-y) !important;
      width: min(330px, 72%) !important;
      height: 56% !important;
      margin: 0 !important;
      transform: translateX(-50%) !important;
      display: grid !important;
      place-items: end center !important;
      overflow: visible !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    #battleView .battle-stage-preview .battle-portrait::after {
      content: '' !important;
      display: block !important;
      position: absolute !important;
      left: 50% !important;
      bottom: -8px !important;
      z-index: 0 !important;
      width: 58% !important;
      height: 22px !important;
      transform: translateX(-50%) !important;
      border-radius: 50% !important;
      background: radial-gradient(ellipse at center, rgba(0,0,0,.52) 0%, rgba(0,0,0,.25) 52%, rgba(0,0,0,0) 78%) !important;
      filter: blur(5px) !important;
      pointer-events: none !important;
    }

    #battleView .battle-stage-preview .battle-side.hero .battle-portrait {
      width: min(310px, 68%) !important;
    }

    #battleView .battle-stage-preview .battle-side.enemy .battle-portrait {
      width: min(340px, 74%) !important;
    }

    #battleView .battle-stage-preview .battle-portrait-icon {
      position: relative !important;
      z-index: 2 !important;
      width: 100% !important;
      height: 100% !important;
      display: grid !important;
      place-items: end center !important;
      transform-origin: 50% 100% !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      box-shadow: none !important;
      will-change: transform !important;
    }

    #battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon {
      animation: a8KnightIdle 2.7s ease-in-out infinite !important;
    }

    #battleView .battle-stage-preview .battle-side.enemy .battle-portrait-icon {
      animation: a8EnemyIdle 2.15s ease-in-out infinite !important;
    }

    #battleView .battle-stage-preview .battle-portrait-icon > img,
    #battleView #battleEnemyPreviewIcon {
      position: relative !important;
      z-index: 2 !important;
      width: 100% !important;
      height: 100% !important;
      max-height: 100% !important;
      object-fit: contain !important;
      object-position: center bottom !important;
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      filter: drop-shadow(0 14px 16px rgba(0,0,0,.52)) !important;
    }

    /* Enemy PNGs carry transparent canvas below their feet. Correct the visible footline,
       while the static portrait/shadow wrapper remains on the shared arena baseline. */
    #battleView .battle-stage-preview .battle-side.enemy .battle-portrait-icon > img,
    #battleView .battle-stage-preview #battleEnemyPreviewIcon {
      transform: translateY(78px) !important;
    }

    #battleView .battle-stage-preview .a8-arena-weapon {
      position: absolute !important;
      z-index: 5 !important;
      width: clamp(78px, 9vw, 98px) !important;
      height: clamp(78px, 9vw, 98px) !important;
      display: grid !important;
      place-items: center !important;
      pointer-events: none !important;
      transform-origin: 50% 82% !important;
      filter: drop-shadow(0 6px 5px rgba(0,0,0,.45)) !important;
    }

    #battleView .battle-stage-preview .a8-arena-weapon > img,
    #battleView .battle-stage-preview .a8-arena-weapon > svg {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      object-fit: contain !important;
      overflow: visible !important;
    }

    #battleView .battle-stage-preview .a8-arena-weapon.weapon-left {
      left: 18% !important;
      bottom: -25% !important;
      transform: rotate(-28deg) scale(1.06) !important;
    }

    #battleView .battle-stage-preview .a8-arena-weapon.weapon-right {
      right: 18% !important;
      bottom: -25% !important;
      transform: rotate(28deg) scale(1.06) !important;
    }

    #battleView .battle-stage-preview .a8-arena-weapon[data-fallback="true"] > img {
      filter: saturate(.92) brightness(1.06) !important;
    }

    #battleView .battle-stage-preview .battle-statline {
      position: absolute !important;
      bottom: 86px !important;
      z-index: 7 !important;
      display: flex !important;
      gap: .3rem !important;
      justify-content: center !important;
      padding: .28rem !important;
      border-radius: .72rem !important;
      background: rgba(3,9,18,.54) !important;
      backdrop-filter: blur(8px) !important;
    }

    #battleView .battle-stage-preview .battle-side.hero .battle-statline { left: 20px !important; }
    #battleView .battle-stage-preview .battle-side.enemy .battle-statline { right: 20px !important; }

    #battleView .battle-stage-preview .battle-stat-badge {
      min-width: 48px !important;
      padding: .3rem .38rem !important;
      border-color: rgba(226,232,240,.14) !important;
      background: rgba(15,23,42,.6) !important;
      color: #b8c7d8 !important;
      font-size: .62rem !important;
    }

    #battleView .battle-stage-preview .battle-stat-badge strong {
      margin-left: .2rem !important;
      color: #fff !important;
    }

    #battleView .battle-stage-preview .battle-gear {
      display: none !important;
    }

    #battleView .battle-stage-preview .battle-crest-label {
      position: absolute !important;
      left: 50% !important;
      top: 46% !important;
      z-index: 8 !important;
      width: 78px !important;
      height: 78px !important;
      margin: 0 !important;
      transform: translate(-50%, -50%) !important;
      display: grid !important;
      place-items: center !important;
      border: 1px solid rgba(253,230,138,.54) !important;
      border-radius: 50% !important;
      background: radial-gradient(circle, rgba(245,158,11,.34), rgba(39,24,7,.56) 58%, rgba(3,8,15,.72)) !important;
      color: #fff0b5 !important;
      font-size: 1.1rem !important;
      font-weight: 950 !important;
      letter-spacing: .08em !important;
      text-shadow: 0 0 18px rgba(251,191,36,.55) !important;
      box-shadow: 0 0 0 7px rgba(245,158,11,.06), 0 12px 34px rgba(0,0,0,.38) !important;
      animation: a8VsPulse 2.4s ease-in-out infinite !important;
    }

    #battleView .battle-stage-preview > #battleStartBtn {
      position: absolute !important;
      left: 50% !important;
      bottom: 20px !important;
      z-index: 12 !important;
      width: min(460px, 46%) !important;
      min-height: 62px !important;
      transform: translateX(-50%) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: .65rem !important;
      padding: .9rem 1.25rem !important;
      border: 1px solid rgba(255,236,167,.72) !important;
      border-radius: 1rem !important;
      background: linear-gradient(180deg, #ffd55e 0%, #f5a30b 55%, #d77b05 100%) !important;
      color: #231506 !important;
      font-size: clamp(1rem, 1.8vw, 1.22rem) !important;
      font-weight: 950 !important;
      letter-spacing: .01em !important;
      text-transform: none !important;
      cursor: pointer !important;
      pointer-events: auto !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.66),
        inset 0 -3px 0 rgba(116,59,0,.28),
        0 12px 28px rgba(245,158,11,.28),
        0 0 36px rgba(245,158,11,.12) !important;
      transition: transform .18s ease, filter .18s ease, box-shadow .18s ease !important;
    }

    #battleView .battle-stage-preview > #battleStartBtn:hover:not(:disabled) {
      transform: translateX(-50%) translateY(-2px) scale(1.015) !important;
      filter: brightness(1.08) saturate(1.05) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.72),
        inset 0 -3px 0 rgba(116,59,0,.28),
        0 16px 34px rgba(245,158,11,.35),
        0 0 48px rgba(245,158,11,.18) !important;
    }

    #battleView .battle-stage-preview > #battleStartBtn:active:not(:disabled) {
      transform: translateX(-50%) translateY(1px) scale(.99) !important;
    }

    #battleView .battle-stage-preview > #battleStartBtn:disabled {
      filter: grayscale(.45) brightness(.72) !important;
      cursor: not-allowed !important;
      box-shadow: none !important;
    }

    #battleView .battle-stage-preview > #battleStartBtn svg {
      width: 25px !important;
      height: 25px !important;
      flex: 0 0 auto !important;
    }

    #battleView .battle-center-actions {
      gap: .5rem !important;
      padding: 0 .15rem !important;
    }

    #battleView .battle-meta-strip {
      display: none !important;
    }

    #battleView #battleLog { display: none !important; }

    @keyframes a8KnightIdle {
      0%, 100% { transform: translateY(0) rotate(-.1deg) scale(1); }
      48% { transform: translateY(-4px) rotate(.12deg) scale(1.008); }
    }

    @keyframes a8EnemyIdle {
      0%, 100% { transform: translateY(0) rotate(.12deg) scale(1); }
      50% { transform: translateY(-3px) rotate(-.18deg) scale(1.01); }
    }

    @keyframes a8VsPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
      50% { transform: translate(-50%, -50%) scale(1.055); filter: brightness(1.12); }
    }

    @media (max-width: 720px) {
      #battleView .battle-card { padding: .45rem !important; }
      #battleView .battle-stage-preview {
        --arena-ground-y: 118px;
        height: 500px !important;
        min-height: 500px !important;
        border-radius: 1rem !important;
        background-position: center center !important;
      }
      #battleView .battle-stage-preview > .battle-side { width: 50% !important; }
      #battleView .battle-stage-preview .battle-side-head {
        top: 12px !important;
        min-width: 0 !important;
        width: calc(100% - 20px) !important;
        max-width: none !important;
        padding: .44rem .5rem !important;
      }
      #battleView .battle-stage-preview .battle-side.hero .battle-side-head { left: 10px !important; }
      #battleView .battle-stage-preview .battle-side.enemy .battle-side-head { right: 10px !important; }
      #battleView .battle-stage-preview .battle-portrait {
        width: 94% !important;
        height: 58% !important;
      }
      #battleView .battle-stage-preview .battle-side.hero .battle-portrait { width: 88% !important; }
      #battleView .battle-stage-preview .battle-side.enemy .battle-portrait { width: 96% !important; }
      #battleView .battle-stage-preview .battle-side.enemy .battle-portrait-icon > img,
      #battleView .battle-stage-preview #battleEnemyPreviewIcon {
        transform: translateY(62px) !important;
      }
      #battleView .battle-stage-preview .a8-arena-weapon {
        width: 64px !important;
        height: 64px !important;
      }
      #battleView .battle-stage-preview .a8-arena-weapon.weapon-left { left: 14% !important; bottom: -20% !important; }
      #battleView .battle-stage-preview .a8-arena-weapon.weapon-right { right: 14% !important; bottom: -20% !important; }
      #battleView .battle-stage-preview .battle-statline {
        bottom: 92px !important;
        gap: .14rem !important;
        padding: .2rem !important;
      }
      #battleView .battle-stage-preview .battle-side.hero .battle-statline { left: 7px !important; }
      #battleView .battle-stage-preview .battle-side.enemy .battle-statline { right: 7px !important; }
      #battleView .battle-stage-preview .battle-stat-badge {
        min-width: 0 !important;
        padding: .25rem .28rem !important;
        font-size: .56rem !important;
      }
      #battleView .battle-stage-preview .battle-crest-label {
        top: 48% !important;
        width: 58px !important;
        height: 58px !important;
        font-size: .9rem !important;
      }
      #battleView .battle-stage-preview > #battleStartBtn {
        width: min(310px, 80%) !important;
        min-height: 58px !important;
        bottom: 18px !important;
        font-size: 1rem !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #battleView .battle-stage-preview .battle-portrait-icon,
      #battleView .battle-stage-preview .battle-crest-label {
        animation: none !important;
      }
    }
  `;

  function installStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  function syncArenaHeroWeapons() {
    const heroIcon = document.querySelector('#battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon');
    if (!heroIcon) return;

    const slots = [
      { source: document.getElementById('battleWeaponSlot1'), className: 'weapon-left' },
      { source: document.getElementById('battleWeaponSlot2'), className: 'weapon-right' }
    ];

    slots.forEach(({ source, className }) => {
      const equippedHtml = source && source.dataset.empty !== 'true' ? source.innerHTML.trim() : '';
      const html = equippedHtml || FALLBACK_SWORD;
      const signature = `${source?.dataset.empty === 'false' ? 'equipped' : 'fallback'}:${html}`;
      let layer = heroIcon.querySelector(`.a8-arena-weapon.${className}`);
      if (!layer) {
        layer = document.createElement('span');
        layer.className = `a8-arena-weapon ${className}`;
        layer.setAttribute('aria-hidden', 'true');
        heroIcon.appendChild(layer);
      }
      if (layer.dataset.signature !== signature) {
        layer.innerHTML = html;
        layer.dataset.signature = signature;
      }
      layer.dataset.fallback = equippedHtml ? 'false' : 'true';
    });
  }

  function composeArena() {
    const stage = document.getElementById('battleStagePreview');
    if (!stage) return;

    const overview = stage.closest('.battle-overview');
    const hero = overview?.querySelector('.battle-side.hero');
    const enemy = overview?.querySelector('.battle-side.enemy');
    const startButton = document.getElementById('battleStartBtn');

    stage.removeAttribute('aria-hidden');
    stage.setAttribute('aria-label', 'Arena: Shortcut Knight gegen den ausgewählten Gegner');

    if (hero && hero.parentElement !== stage) stage.appendChild(hero);
    if (enemy && enemy.parentElement !== stage) stage.appendChild(enemy);
    if (startButton && startButton.parentElement !== stage) stage.appendChild(startButton);

    stage.classList.add('arena-svg-composed');
    syncArenaHeroWeapons();
  }

  function enforceArena() {
    installStyles();
    composeArena();

    document.querySelectorAll('#battleView .battle-stage-preview, #battleView .battle-arena').forEach(stage => {
      stage.style.setProperty('background-color', '#07101a', 'important');
      stage.style.setProperty('background-image', ARENA_BACKGROUND, 'important');
      stage.style.setProperty('background-size', 'cover', 'important');
      stage.style.setProperty('background-position', 'center center', 'important');
      stage.style.setProperty('background-repeat', 'no-repeat', 'important');
      stage.style.setProperty('filter', 'none', 'important');
    });

    const haze = document.querySelector('#battleView .battle-stage-haze');
    if (haze) haze.style.setProperty('display', 'none', 'important');

    document.querySelectorAll('#battleView .battle-side, #battleView .battle-portrait, #battleView .battle-portrait-icon').forEach(el => {
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('background-image', 'none', 'important');
      el.style.setProperty('box-shadow', 'none', 'important');
    });
  }

  function init() {
    const preload = new Image();
    preload.src = 'assets/arena-scene.svg?v=20260912-svg-arena';
    enforceArena();

    document.addEventListener('click', event => {
      if (event.target.closest('[data-view="battle"], .battle-btn, #battleStartBtn')) {
        requestAnimationFrame(enforceArena);
        setTimeout(enforceArena, 80);
      }
    });

    const battleView = document.getElementById('battleView');
    if (battleView && 'MutationObserver' in window) {
      const observer = new MutationObserver(() => requestAnimationFrame(enforceArena));
      observer.observe(battleView, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();