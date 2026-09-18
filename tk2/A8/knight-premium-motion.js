(function () {
  'use strict';

  const root = document.documentElement;
  const DEBUG = {
    version: 1,
    attacks: 0,
    hits: 0,
    victories: 0,
    slashArcs: 0,
    afterimages: 0,
    dustBursts: 0
  };
  window.A8_KNIGHT_PREMIUM_DEBUG = DEBUG;

  const style = document.createElement('style');
  style.id = 'a8KnightPremiumMotionStyles';
  style.textContent = `
    /* A8 PREMIUM KNIGHT MOTION 2026 */

    /* PRE-BATTLE: less floating, more confident weight and weapon life. */
    #battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon img {
      transform-origin: 50% 94% !important;
      animation: a8KnightPreviewPremium 3.35s cubic-bezier(.45,0,.55,1) infinite !important;
      will-change: transform, filter;
    }
    @keyframes a8KnightPreviewPremium {
      0%,100% { transform: translateY(0) rotate(-.25deg) scale(1); filter: brightness(1); }
      24% { transform: translateY(-1px) rotate(.1deg) scale(1.002,1.008); }
      48% { transform: translateY(-3px) rotate(.35deg) scale(1.006,1.012); filter: brightness(1.025); }
      70% { transform: translateY(-1.5px) rotate(0deg) scale(1.003,1.006); }
    }

    #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon {
      will-change: transform, filter;
    }
    #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon.weapon-left {
      animation: a8KnightPreviewBladeLeft 3.35s cubic-bezier(.45,0,.55,1) infinite !important;
    }
    #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon.weapon-right {
      animation: a8KnightPreviewBladeRight 3.35s cubic-bezier(.45,0,.55,1) infinite !important;
    }
    @keyframes a8KnightPreviewBladeLeft {
      0%,100% { transform: rotate(9deg) scale(1.02); filter: brightness(1); }
      48% { transform: rotate(12deg) translateY(-2px) scale(1.025); filter: brightness(1.08); }
      70% { transform: rotate(8deg) translateY(-1px) scale(1.02); }
    }
    @keyframes a8KnightPreviewBladeRight {
      0%,100% { transform: rotate(-9deg) scale(1.02); filter: brightness(1); }
      48% { transform: rotate(-12deg) translateY(-2px) scale(1.025); filter: brightness(1.08); }
      70% { transform: rotate(-8deg) translateY(-1px) scale(1.02); }
    }

    /* ACTIVE IDLE: breathing + tiny weight transfer. */
    #battleView .battle-arena .fighter.knight:not(.defeated):not(.attacking-left):not(.attacking-right):not(.hit):not(.a8-knight-victory) .fighter-sprite {
      animation: a8KnightIdlePremium 3.05s cubic-bezier(.45,0,.55,1) infinite !important;
      transform-origin: 50% 94% !important;
    }
    @keyframes a8KnightIdlePremium {
      0%,100% { transform: translateX(-50%) translateY(0) rotate(-.2deg) scale(1); filter: drop-shadow(0 18px 27px rgba(2,6,23,.68)); }
      24% { transform: translateX(-50%) translateY(-1px) rotate(.05deg) scale(1.001,1.006); }
      50% { transform: translateX(-50%) translateY(-3px) rotate(.28deg) scale(1.005,1.012); filter: drop-shadow(0 20px 29px rgba(2,6,23,.62)) brightness(1.025); }
      74% { transform: translateX(-50%) translateY(-1.5px) rotate(0deg) scale(1.002,1.006); }
    }

    #battleView .battle-arena .fighter.knight:not(.attacking-left):not(.hit):not(.defeated):not(.a8-knight-victory) .battle-weapon-slot.weapon-left {
      animation: a8KnightBladeIdleLeft 3.05s cubic-bezier(.45,0,.55,1) infinite !important;
    }
    #battleView .battle-arena .fighter.knight:not(.attacking-left):not(.hit):not(.defeated):not(.a8-knight-victory) .battle-weapon-slot.weapon-right {
      animation: a8KnightBladeIdleRight 3.05s cubic-bezier(.45,0,.55,1) infinite !important;
    }
    @keyframes a8KnightBladeIdleLeft {
      0%,100% { transform: rotate(180deg); }
      50% { transform: rotate(184deg) translate(-1px,-2px); }
      74% { transform: rotate(181deg) translate(0,-1px); }
    }
    @keyframes a8KnightBladeIdleRight {
      0%,100% { transform: rotate(180deg); }
      50% { transform: rotate(176deg) translate(1px,-2px); }
      74% { transform: rotate(179deg) translate(0,-1px); }
    }

    /* ATTACK: anticipation -> planted launch -> two-stage cut -> overshoot -> recover. */
    #battleView .battle-arena .fighter.knight.attacking-left {
      z-index: 12 !important;
      animation: a8KnightAttackPremium .82s cubic-bezier(.18,.78,.18,1) both !important;
    }
    #battleView .battle-arena .fighter.knight.attacking-left .fighter-sprite {
      animation: a8KnightBodyAttackPremium .82s cubic-bezier(.18,.78,.18,1) both !important;
    }
    @keyframes a8KnightAttackPremium {
      0% { transform: translate3d(0,0,0) scale(1); }
      12% { transform: translate3d(-8px,2px,0) rotate(-1.4deg) scale(.985,1.015); }
      25% { transform: translate3d(-13px,3px,0) rotate(-2.1deg) scale(.975,1.025); }
      39% { transform: translate3d(18px,-3px,0) rotate(.6deg) scale(1.02,.99); }
      52% { transform: translate3d(103px,-4px,0) rotate(2.8deg) scale(1.055,.97); }
      64% { transform: translate3d(92px,-1px,0) rotate(1.3deg) scale(1.025,.99); }
      77% { transform: translate3d(28px,1px,0) rotate(-.4deg) scale(.995,1.006); }
      90% { transform: translate3d(-4px,0,0) rotate(-.25deg) scale(1.002); }
      100% { transform: translate3d(0,0,0) rotate(0) scale(1); }
    }
    @keyframes a8KnightBodyAttackPremium {
      0% { transform: translateX(-50%) translateY(0) rotate(0) scale(1); }
      15% { transform: translateX(-50%) translateY(2px) rotate(-2.2deg) scale(.99,1.02); }
      29% { transform: translateX(-50%) translateY(3px) rotate(-3.2deg) scale(.985,1.025); }
      48% { transform: translateX(-50%) translateY(-4px) rotate(2.4deg) scale(1.025,.985); }
      62% { transform: translateX(-50%) translateY(-2px) rotate(3deg) scale(1.015,.992); }
      79% { transform: translateX(-50%) translateY(1px) rotate(-1deg) scale(.998,1.006); }
      100% { transform: translateX(-50%) translateY(0) rotate(0) scale(1); }
    }

    /* Dual blades no longer swing symmetrically: left leads, right follows through. */
    #battleView .battle-arena .fighter.knight.attacking-left .battle-weapon-slot.weapon-left {
      animation: a8KnightDualBladeLead .82s cubic-bezier(.18,.78,.18,1) both !important;
    }
    #battleView .battle-arena .fighter.knight.attacking-left .battle-weapon-slot.weapon-right {
      animation: a8KnightDualBladeFollow .82s cubic-bezier(.18,.78,.18,1) both !important;
    }
    @keyframes a8KnightDualBladeLead {
      0% { transform: rotate(180deg); filter: brightness(1); }
      18% { transform: rotate(202deg) translate(-2px,-4px); }
      34% { transform: rotate(220deg) translate(-4px,-8px); filter: brightness(1.1); }
      50% { transform: rotate(118deg) translate(12px,-13px) scale(1.08); filter: brightness(1.65) drop-shadow(0 0 9px rgba(253,224,71,.85)); }
      64% { transform: rotate(142deg) translate(7px,-7px) scale(1.035); filter: brightness(1.18); }
      82% { transform: rotate(188deg) translate(1px,-2px); }
      100% { transform: rotate(180deg); filter: brightness(1); }
    }
    @keyframes a8KnightDualBladeFollow {
      0%,20% { transform: rotate(180deg); filter: brightness(1); }
      34% { transform: rotate(158deg) translate(2px,-4px); }
      49% { transform: rotate(144deg) translate(4px,-8px); filter: brightness(1.08); }
      62% { transform: rotate(242deg) translate(-12px,-13px) scale(1.08); filter: brightness(1.65) drop-shadow(0 0 9px rgba(253,224,71,.85)); }
      74% { transform: rotate(218deg) translate(-7px,-6px) scale(1.035); filter: brightness(1.16); }
      90% { transform: rotate(174deg) translate(-1px,-1px); }
      100% { transform: rotate(180deg); filter: brightness(1); }
    }

    /* HERO HIT: readable recoil instead of the generic side shake. */
    #battleView .battle-arena .fighter.knight.hit:not(.defeated) {
      z-index: 10 !important;
      animation: a8KnightHitPremium .56s cubic-bezier(.22,.72,.25,1) both !important;
    }
    #battleView .battle-arena .fighter.knight.hit:not(.defeated) .fighter-sprite {
      animation: a8KnightBodyHitPremium .56s cubic-bezier(.22,.72,.25,1) both !important;
    }
    #battleView .battle-arena .fighter.knight.hit:not(.defeated) .battle-weapon-slot.weapon-left {
      animation: a8KnightHitBladeLeft .56s ease-out both !important;
    }
    #battleView .battle-arena .fighter.knight.hit:not(.defeated) .battle-weapon-slot.weapon-right {
      animation: a8KnightHitBladeRight .56s ease-out both !important;
    }
    @keyframes a8KnightHitPremium {
      0% { transform: translate3d(0,0,0); filter: brightness(1); }
      9% { transform: translate3d(-13px,-1px,0) rotate(-2.6deg); filter: brightness(1.9) saturate(.7); }
      23% { transform: translate3d(-22px,2px,0) rotate(-4deg); }
      42% { transform: translate3d(-10px,1px,0) rotate(-1.7deg); filter: brightness(1.2); }
      68% { transform: translate3d(3px,0,0) rotate(.5deg); }
      100% { transform: translate3d(0,0,0) rotate(0); filter: brightness(1); }
    }
    @keyframes a8KnightBodyHitPremium {
      0% { transform: translateX(-50%) translateY(0) rotate(0); }
      13% { transform: translateX(-50%) translateY(-2px) rotate(-4deg) scale(.99,1.01); }
      34% { transform: translateX(-50%) translateY(2px) rotate(-2.5deg) scale(.995); }
      70% { transform: translateX(-50%) translateY(0) rotate(.7deg); }
      100% { transform: translateX(-50%) translateY(0) rotate(0); }
    }
    @keyframes a8KnightHitBladeLeft { 0%,100%{transform:rotate(180deg)} 18%{transform:rotate(194deg) translate(-3px,3px)} 44%{transform:rotate(170deg) translate(2px,1px)} }
    @keyframes a8KnightHitBladeRight { 0%,100%{transform:rotate(180deg)} 18%{transform:rotate(166deg) translate(3px,3px)} 44%{transform:rotate(190deg) translate(-2px,1px)} }

    /* VICTORY FLOURISH: short, readable, no loop. */
    #battleView .battle-arena .fighter.knight.a8-knight-victory:not(.defeated) {
      z-index: 14 !important;
      animation: a8KnightVictoryBody 1.35s cubic-bezier(.18,.75,.2,1) both !important;
    }
    #battleView .battle-arena .fighter.knight.a8-knight-victory:not(.defeated) .fighter-sprite {
      animation: a8KnightVictorySprite 1.35s cubic-bezier(.18,.75,.2,1) both !important;
    }
    #battleView .battle-arena .fighter.knight.a8-knight-victory .battle-weapon-slot.weapon-left {
      animation: a8KnightVictoryBladeLeft 1.35s cubic-bezier(.18,.75,.2,1) both !important;
    }
    #battleView .battle-arena .fighter.knight.a8-knight-victory .battle-weapon-slot.weapon-right {
      animation: a8KnightVictoryBladeRight 1.35s cubic-bezier(.18,.75,.2,1) both !important;
    }
    @keyframes a8KnightVictoryBody {
      0% { transform: translateY(0) scale(1); }
      20% { transform: translateY(2px) scale(.99,1.01); }
      38% { transform: translateY(-13px) scale(1.02,.99); }
      55% { transform: translateY(-8px) scale(1.012); }
      72% { transform: translateY(1px) scale(.995,1.005); }
      86% { transform: translateY(-2px) scale(1.003); }
      100% { transform: translateY(0) scale(1); }
    }
    @keyframes a8KnightVictorySprite {
      0% { transform: translateX(-50%) rotate(0); filter: brightness(1); }
      35% { transform: translateX(-50%) rotate(-2deg); filter: brightness(1.14) drop-shadow(0 0 16px rgba(251,191,36,.25)); }
      60% { transform: translateX(-50%) rotate(2deg); filter: brightness(1.08); }
      100% { transform: translateX(-50%) rotate(0); filter: brightness(1); }
    }
    @keyframes a8KnightVictoryBladeLeft { 0%{transform:rotate(180deg)} 35%{transform:rotate(238deg) translate(-7px,-18px) scale(1.08)} 58%{transform:rotate(218deg) translate(-4px,-12px)} 100%{transform:rotate(180deg)} }
    @keyframes a8KnightVictoryBladeRight { 0%{transform:rotate(180deg)} 35%{transform:rotate(122deg) translate(7px,-18px) scale(1.08)} 58%{transform:rotate(142deg) translate(4px,-12px)} 100%{transform:rotate(180deg)} }

    /* Spawned cinematic accents. */
    #battleView .a8-knight-charge {
      position:absolute; z-index:6; width:180px; height:180px; border-radius:50%; pointer-events:none;
      transform:translate(-50%,-50%) scale(.45);
      background:radial-gradient(circle,rgba(254,240,138,.25) 0 12%,rgba(251,191,36,.12) 34%,transparent 68%);
      filter:blur(.5px) drop-shadow(0 0 18px rgba(250,204,21,.25));
      animation:a8KnightCharge .58s ease-out forwards;
    }
    @keyframes a8KnightCharge { 0%{opacity:0;transform:translate(-50%,-50%) scale(.35)} 30%{opacity:1} 100%{opacity:0;transform:translate(-50%,-50%) scale(1.18)} }

    #battleView .a8-knight-afterimage {
      position:absolute; z-index:5; pointer-events:none; object-fit:contain;
      opacity:.24; filter:brightness(1.35) saturate(.75) sepia(.2) drop-shadow(0 0 10px rgba(253,224,71,.4));
      transform-origin:50% 92%; animation:a8KnightAfterimage .42s ease-out forwards;
    }
    @keyframes a8KnightAfterimage { 0%{opacity:.28;transform:translateX(0) scale(1)} 100%{opacity:0;transform:translateX(-26px) scale(.985)} }

    #battleView .a8-knight-slash-arc {
      position:absolute; z-index:28; width:178px; height:92px; pointer-events:none;
      border-top:4px solid rgba(255,255,255,.95); border-radius:50%;
      filter:drop-shadow(0 0 5px rgba(255,255,255,.95)) drop-shadow(0 0 11px rgba(250,204,21,.72));
      transform:translate(-50%,-50%) rotate(var(--slash-rot)) scale(.25,.72);
      transform-origin:center; animation:a8KnightSlashArc .38s cubic-bezier(.12,.72,.2,1) forwards;
    }
    #battleView .a8-knight-slash-arc.follow {
      width:164px; height:84px; border-top-color:rgba(254,240,138,.95);
    }
    @keyframes a8KnightSlashArc {
      0%{opacity:0;transform:translate(-50%,-50%) rotate(var(--slash-rot)) scale(.18,.66)}
      28%{opacity:1;transform:translate(-50%,-50%) rotate(var(--slash-rot)) scale(1.06,1)}
      100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--slash-rot)) scale(1.36,1.08)}
    }

    #battleView .a8-knight-foot-dust {
      position:absolute; z-index:4; width:112px; height:28px; border-radius:50%; pointer-events:none;
      background:radial-gradient(ellipse,rgba(226,232,240,.24),rgba(100,116,139,.08) 46%,transparent 72%);
      filter:blur(2px); transform:translate(-50%,-50%) scale(.35); animation:a8KnightFootDust .52s ease-out forwards;
    }
    @keyframes a8KnightFootDust { 0%{opacity:0;transform:translate(-50%,-50%) scale(.35)} 22%{opacity:.85} 100%{opacity:0;transform:translate(-50%,-50%) scale(1.55)} }

    #battleView .a8-knight-victory-flare {
      position:absolute; z-index:5; width:220px; height:220px; border-radius:50%; pointer-events:none;
      background:radial-gradient(circle,rgba(254,240,138,.22),rgba(251,191,36,.08) 36%,transparent 67%);
      transform:translate(-50%,-50%) scale(.55); animation:a8KnightVictoryFlare 1.25s ease-out forwards;
    }
    @keyframes a8KnightVictoryFlare { 0%{opacity:0;transform:translate(-50%,-50%) scale(.45)} 25%{opacity:1} 100%{opacity:0;transform:translate(-50%,-50%) scale(1.3)} }

    /* Shadow compresses on anticipation / landing so the knight stays planted. */
    #battleView .battle-arena .fighter.knight.attacking-left::after { animation:a8KnightShadowAttack .82s ease-out both !important; }
    #battleView .battle-arena .fighter.knight.a8-knight-victory::after { animation:a8KnightShadowVictory 1.35s ease-out both !important; }
    @keyframes a8KnightShadowAttack { 0%,100%{transform:translate(-50%,48%) scaleX(1);opacity:.86} 25%{transform:translate(-50%,48%) scaleX(.84);opacity:.75} 52%{transform:translate(-50%,48%) scaleX(1.18);opacity:.58} 78%{transform:translate(-50%,48%) scaleX(.92);opacity:.78} }
    @keyframes a8KnightShadowVictory { 0%,100%{transform:translate(-50%,48%) scaleX(1);opacity:.86} 38%{transform:translate(-50%,48%) scaleX(.72);opacity:.48} 72%{transform:translate(-50%,48%) scaleX(1.08);opacity:.78} }

    html.a8-motion-off #battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon img,
    html.a8-motion-off #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon,
    html.a8-motion-off #battleView .battle-arena .fighter.knight,
    html.a8-motion-off #battleView .battle-arena .fighter.knight .fighter-sprite,
    html.a8-motion-off #battleView .battle-arena .fighter.knight .battle-weapon-slot,
    html.a8-motion-off #battleView .a8-knight-charge,
    html.a8-motion-off #battleView .a8-knight-afterimage,
    html.a8-motion-off #battleView .a8-knight-slash-arc,
    html.a8-motion-off #battleView .a8-knight-foot-dust,
    html.a8-motion-off #battleView .a8-knight-victory-flare {
      animation:none !important; transition:none !important;
    }

    @media (prefers-reduced-motion: reduce) {
      #battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon img,
      #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon,
      #battleView .battle-arena .fighter.knight,
      #battleView .battle-arena .fighter.knight .fighter-sprite,
      #battleView .battle-arena .fighter.knight .battle-weapon-slot,
      #battleView .a8-knight-charge,
      #battleView .a8-knight-afterimage,
      #battleView .a8-knight-slash-arc,
      #battleView .a8-knight-foot-dust,
      #battleView .a8-knight-victory-flare { animation:none !important; transition:none !important; }
    }
  `;

  function motionDisabled() {
    return root.classList.contains('a8-motion-off') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  function installStyles() {
    if (!document.getElementById(style.id)) document.head.appendChild(style);
  }

  function arenaRect() {
    const arena = document.getElementById('battleArena');
    if (!arena) return null;
    return { arena, rect: arena.getBoundingClientRect() };
  }

  function pointFor(el, xRatio = .5, yRatio = .5) {
    const info = arenaRect();
    if (!info || !el) return null;
    const rect = el.getBoundingClientRect();
    return {
      arena: info.arena,
      x: rect.left - info.rect.left + rect.width * xRatio,
      y: rect.top - info.rect.top + rect.height * yRatio,
      groundY: rect.bottom - info.rect.top - 5
    };
  }

  function spawnCharge() {
    if (motionDisabled()) return;
    const knight = document.getElementById('battleKnight');
    const pos = pointFor(knight, .5, .5);
    if (!pos) return;
    const glow = document.createElement('span');
    glow.className = 'a8-knight-charge';
    glow.style.left = `${pos.x}px`;
    glow.style.top = `${pos.y}px`;
    pos.arena.appendChild(glow);
    setTimeout(() => glow.remove(), 680);
  }

  function spawnAfterimage(delay = 0) {
    if (motionDisabled()) return;
    setTimeout(() => {
      const sprite = document.getElementById('battleKnightSprite');
      const info = arenaRect();
      if (!sprite || !info || !sprite.src) return;
      const rect = sprite.getBoundingClientRect();
      const clone = document.createElement('img');
      clone.className = 'a8-knight-afterimage';
      clone.src = sprite.src;
      clone.alt = '';
      clone.setAttribute('aria-hidden', 'true');
      clone.style.left = `${rect.left - info.rect.left}px`;
      clone.style.top = `${rect.top - info.rect.top}px`;
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      info.arena.appendChild(clone);
      DEBUG.afterimages += 1;
      setTimeout(() => clone.remove(), 480);
    }, delay);
  }

  function spawnSlash(delay, follow = false) {
    if (motionDisabled()) return;
    setTimeout(() => {
      const knight = document.getElementById('battleKnight');
      const enemy = document.getElementById('battleEnemy');
      const info = arenaRect();
      if (!knight || !enemy || !info) return;
      const kr = knight.getBoundingClientRect();
      const er = enemy.getBoundingClientRect();
      const x = ((kr.right + er.left) * .5) - info.rect.left + (follow ? 12 : -8);
      const y = (kr.top + kr.height * (follow ? .46 : .39)) - info.rect.top;
      const arc = document.createElement('span');
      arc.className = `a8-knight-slash-arc${follow ? ' follow' : ''}`;
      arc.style.left = `${x}px`;
      arc.style.top = `${y}px`;
      arc.style.setProperty('--slash-rot', follow ? '22deg' : '-24deg');
      info.arena.appendChild(arc);
      DEBUG.slashArcs += 1;
      setTimeout(() => arc.remove(), 460);
    }, delay);
  }

  function spawnFootDust(delay = 0, landing = false) {
    if (motionDisabled()) return;
    setTimeout(() => {
      const knight = document.getElementById('battleKnight');
      const pos = pointFor(knight, landing ? .46 : .5, .95);
      if (!pos) return;
      const dust = document.createElement('span');
      dust.className = 'a8-knight-foot-dust';
      dust.style.left = `${pos.x + (landing ? 16 : -7)}px`;
      dust.style.top = `${pos.groundY}px`;
      pos.arena.appendChild(dust);
      DEBUG.dustBursts += 1;
      setTimeout(() => dust.remove(), 620);
    }, delay);
  }

  function spawnVictoryFlare() {
    if (motionDisabled()) return;
    const knight = document.getElementById('battleKnight');
    const pos = pointFor(knight, .5, .5);
    if (!pos) return;
    const flare = document.createElement('span');
    flare.className = 'a8-knight-victory-flare';
    flare.style.left = `${pos.x}px`;
    flare.style.top = `${pos.y}px`;
    pos.arena.appendChild(flare);
    setTimeout(() => flare.remove(), 1400);
  }

  function playKnightAttackFx() {
    DEBUG.attacks += 1;
    spawnCharge();
    spawnFootDust(55, false);
    spawnAfterimage(255);
    spawnAfterimage(340);
    spawnSlash(365, false);
    spawnSlash(455, true);
    spawnFootDust(650, true);
  }

  function installKnightStateObserver() {
    const knight = document.getElementById('battleKnight');
    if (!knight) return;
    let attacking = knight.classList.contains('attacking-left');
    let hit = knight.classList.contains('hit');
    const observer = new MutationObserver(() => {
      const nextAttack = knight.classList.contains('attacking-left');
      const nextHit = knight.classList.contains('hit');
      if (nextAttack && !attacking && !knight.classList.contains('defeated')) playKnightAttackFx();
      if (nextHit && !hit && !knight.classList.contains('defeated')) DEBUG.hits += 1;
      attacking = nextAttack;
      hit = nextHit;
    });
    observer.observe(knight, { attributes:true, attributeFilter:['class'] });
  }

  function installVictoryObserver() {
    const enemy = document.getElementById('battleEnemy');
    const knight = document.getElementById('battleKnight');
    if (!enemy || !knight) return;
    let defeated = enemy.classList.contains('defeated');
    const observer = new MutationObserver(() => {
      const next = enemy.classList.contains('defeated');
      if (next && !defeated && !knight.classList.contains('defeated')) {
        DEBUG.victories += 1;
        knight.classList.remove('a8-knight-victory');
        void knight.offsetWidth;
        knight.classList.add('a8-knight-victory');
        spawnVictoryFlare();
        setTimeout(() => knight.classList.remove('a8-knight-victory'), 1450);
      }
      defeated = next;
    });
    observer.observe(enemy, { attributes:true, attributeFilter:['class'] });
  }

  function init() {
    installStyles();
    installKnightStateObserver();
    installVictoryObserver();
  }

  window.A8_KNIGHT_PREMIUM = Object.freeze({ version:1, debug:DEBUG });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
