(function () {
  'use strict';

  const root = document.documentElement;
  const DEBUG = {
    version: 2,
    turns: 0,
    impacts: 0,
    enemyItemUses: 0,
    lastItemAction: '',
    lastItemName: ''
  };
  window.A8_PREMIUM_BATTLE_DEBUG = DEBUG;

  const style = document.createElement('style');
  style.id = 'a8BattleMotionStyles';
  style.textContent = `
    /* A8 PREMIUM HD BATTLE MOTION 2026 */
    #battleView .battle-card.a8-battle-active .battle-overview { display:none !important; }
    #battleView .battle-card.a8-battle-active .battle-sim { margin:0 !important; }

    #battleView .battle-portrait { position:relative; isolation:isolate; overflow:visible; }
    #battleView .battle-portrait.hero .battle-portrait-icon img {
      transform-origin:50% 90%; animation:a8HeroPreviewIdle 4.1s cubic-bezier(.45,0,.55,1) infinite !important; will-change:transform;
    }
    #battleView .battle-portrait.enemy .battle-portrait-icon img {
      transform-origin:50% 90%; animation:a8EnemyPreviewIdle 3.25s cubic-bezier(.45,0,.55,1) infinite !important; will-change:transform;
    }
    @keyframes a8HeroPreviewIdle { 0%,100%{transform:translateY(1px) scale(1)} 48%{transform:translateY(-3px) scale(1.008)} 62%{transform:translateY(-2px) scale(1.004)} }
    @keyframes a8EnemyPreviewIdle { 0%,100%{transform:translateY(1px) rotate(-.25deg) scale(1)} 46%{transform:translateY(-4px) rotate(.55deg) scale(1.012)} 64%{transform:translateY(-2px) rotate(.1deg) scale(1.005)} }

    #battleView .battle-side.enemy.a8-preview-swap { animation:a8EnemyPreviewCard .42s cubic-bezier(.22,.78,.2,1) both; }
    #battleView .battle-side.enemy.a8-preview-swap .battle-portrait-icon img { animation:a8EnemyPreviewSwap .42s cubic-bezier(.18,.88,.32,1.12) both !important; }
    @keyframes a8EnemyPreviewCard { 0%,100%{filter:none} 45%{filter:drop-shadow(0 0 20px rgba(248,113,113,.18))} }
    @keyframes a8EnemyPreviewSwap { 0%{opacity:.25;transform:translateY(10px) scale(.92);filter:blur(3px)} 62%{opacity:1;transform:translateY(-3px) scale(1.03);filter:blur(0)} 100%{opacity:1;transform:none;filter:blur(0)} }

    #battleView .a8-preview-enemy-item {
      position:absolute; z-index:8; width:58px; height:58px; right:7%; bottom:20%; pointer-events:none;
      filter:drop-shadow(0 7px 9px rgba(0,0,0,.55)); transform-origin:50% 82%; opacity:.96;
    }
    #battleView .a8-preview-enemy-item svg { width:100%; height:100%; overflow:visible; }
    #battleView .a8-preview-enemy-item[data-kind='weapon'] { transform:rotate(-138deg); }
    #battleView .a8-preview-enemy-item[data-kind='shield'] { right:15%; bottom:28%; width:64px; height:64px; }
    #battleView .a8-preview-enemy-item[data-kind='focus'],
    #battleView .a8-preview-enemy-item[data-kind='heal'] { right:12%; bottom:42%; width:48px; height:48px; }

    #battleView .battle-arena { position:relative; isolation:isolate; overflow:hidden; }
    #battleView .battle-arena .fighter {
      position:absolute !important; margin:0 !important; padding:0 !important; background:transparent !important;
      border:0 !important; overflow:visible !important; display:block !important; z-index:2; will-change:transform,filter;
    }
    #battleView .battle-arena .fighter.knight { left:21%; right:auto; bottom:5.5%; width:190px; height:250px; }
    #battleView .battle-arena .fighter.enemy { left:auto; right:21%; bottom:5.5%; width:190px; height:235px; }
    #battleView .battle-arena .fighter::before { display:none !important; }
    #battleView .battle-arena .fighter::after {
      content:'' !important; display:block !important; position:absolute !important; left:50% !important; bottom:0 !important;
      width:150px !important; height:24px !important; transform:translate(-50%,48%) !important; border-radius:50% !important;
      background:radial-gradient(ellipse,rgba(2,6,23,.68) 0 18%,rgba(2,6,23,.3) 42%,transparent 72%) !important;
      filter:blur(1.5px); opacity:.86; z-index:0; pointer-events:none;
    }
    #battleView .battle-arena .fighter-sprite {
      position:absolute; top:auto !important; bottom:0 !important; left:50% !important; width:auto !important; max-width:none !important; max-height:none !important;
      object-fit:contain; transform:translateX(-50%) !important; transform-origin:50% 92% !important; z-index:2; will-change:transform,filter,opacity;
      filter:drop-shadow(0 18px 27px rgba(2,6,23,.68)) !important;
    }
    #battleView .battle-arena .fighter.knight .fighter-sprite { height:245px !important; }
    #battleView .battle-arena .fighter.enemy .fighter-sprite { height:225px !important; }
    #battleView .battle-arena .fighter.knight:not(.defeated):not(.attacking-left):not(.attacking-right):not(.hit) .fighter-sprite { animation:a8ArenaHeroIdle 3.7s ease-in-out infinite !important; }
    #battleView .battle-arena .fighter.enemy:not(.defeated):not(.attacking-left):not(.attacking-right):not(.hit) .fighter-sprite { animation:a8ArenaEnemyIdle 3.05s ease-in-out infinite !important; }
    @keyframes a8ArenaHeroIdle { 0%,100%{transform:translateX(-50%) translateY(0) scale(1)} 48%{transform:translateX(-50%) translateY(-2.5px) scale(1.006)} 62%{transform:translateX(-50%) translateY(-1.5px) scale(1.003)} }
    @keyframes a8ArenaEnemyIdle { 0%,100%{transform:translateX(-50%) translateY(0) rotate(-.2deg) scale(1)} 45%{transform:translateX(-50%) translateY(-3px) rotate(.42deg) scale(1.008)} 64%{transform:translateX(-50%) translateY(-1.5px) rotate(.08deg) scale(1.004)} }

    /* Premium anticipation -> acceleration -> contact -> recoil. */
    #battleView .battle-arena .fighter.attacking-left { z-index:8 !important; animation:a8HdHeroAttack .70s cubic-bezier(.2,.72,.22,1) both !important; }
    #battleView .battle-arena .fighter.attacking-right { z-index:8 !important; animation:a8HdEnemyAttack .70s cubic-bezier(.2,.72,.22,1) both !important; }
    @keyframes a8HdHeroAttack {
      0%{transform:translate3d(0,0,0) scale(1)} 18%{transform:translate3d(-10px,1px,0) rotate(-1.3deg) scale(.985,1.015)}
      34%{transform:translate3d(-5px,-2px,0) rotate(-.5deg) scale(1.015,.99)} 54%{transform:translate3d(94px,-2px,0) rotate(2deg) scale(1.045,.98)}
      66%{transform:translate3d(82px,0,0) rotate(1deg) scale(1.015)} 100%{transform:translate3d(0,0,0) rotate(0) scale(1)}
    }
    @keyframes a8HdEnemyAttack {
      0%{transform:translate3d(0,0,0) scale(1)} 18%{transform:translate3d(10px,1px,0) rotate(1.4deg) scale(.985,1.015)}
      34%{transform:translate3d(5px,-2px,0) rotate(.5deg) scale(1.015,.99)} 54%{transform:translate3d(-94px,-2px,0) rotate(-2deg) scale(1.045,.98)}
      66%{transform:translate3d(-82px,0,0) rotate(-1deg) scale(1.015)} 100%{transform:translate3d(0,0,0) rotate(0) scale(1)}
    }
    #battleView .battle-arena .fighter.hit { z-index:7 !important; animation:a8HdHit .52s cubic-bezier(.22,.7,.28,1) both !important; }
    @keyframes a8HdHit { 0%{filter:brightness(1);transform:translate3d(0,0,0)} 10%{filter:brightness(2.1) saturate(.6);transform:translate3d(7px,-1px,0) rotate(1.2deg)} 22%{transform:translate3d(-8px,1px,0) rotate(-1deg)} 38%{filter:brightness(1.35);transform:translate3d(5px,0,0)} 64%{transform:translate3d(-2px,0,0)} 100%{filter:brightness(1);transform:none} }

    #battleView .battle-arena.a8-hd-crit { animation:a8ArenaCritKick .34s ease-out both; }
    @keyframes a8ArenaCritKick { 0%,100%{transform:translate3d(0,0,0)} 18%{transform:translate3d(-4px,1px,0)} 34%{transform:translate3d(5px,-1px,0)} 52%{transform:translate3d(-3px,0,0)} 72%{transform:translate3d(2px,0,0)} }

    #battleView .a8-impact-burst { position:absolute; z-index:30; width:130px; height:130px; pointer-events:none; transform:translate(-50%,-50%); }
    #battleView .a8-impact-core { position:absolute; inset:36%; border-radius:50%; background:radial-gradient(circle,#fff 0 18%,#fde68a 20% 40%,rgba(251,191,36,.12) 65%,transparent 72%); animation:a8ImpactCore .46s ease-out forwards; }
    #battleView .a8-impact-ring { position:absolute; inset:27%; border:2px solid rgba(253,224,71,.85); border-radius:50%; box-shadow:0 0 20px rgba(251,191,36,.55); animation:a8ImpactRing .48s cubic-bezier(.1,.7,.2,1) forwards; }
    #battleView .a8-impact-slash { position:absolute; left:10%; top:49%; width:80%; height:3px; border-radius:999px; background:linear-gradient(90deg,transparent,#fff 20%,#fde68a 55%,transparent); transform:rotate(-24deg) scaleX(.25); transform-origin:center; filter:drop-shadow(0 0 7px rgba(255,255,255,.9)); animation:a8ImpactSlash .34s ease-out forwards; }
    #battleView .a8-impact-spark { position:absolute; left:50%; top:50%; width:4px; height:18px; border-radius:999px; background:linear-gradient(#fff,#fbbf24,transparent); transform-origin:50% 100%; animation:a8ImpactSpark .52s ease-out forwards; }
    #battleView .a8-impact-burst.crit .a8-impact-core { background:radial-gradient(circle,#fff 0 16%,#fca5a5 22% 42%,rgba(239,68,68,.16) 66%,transparent 72%); }
    #battleView .a8-impact-burst.fire .a8-impact-ring { border-color:#fb923c; box-shadow:0 0 28px rgba(249,115,22,.75); }
    @keyframes a8ImpactCore { 0%{transform:scale(.1);opacity:0} 22%{opacity:1} 100%{transform:scale(3.2);opacity:0} }
    @keyframes a8ImpactRing { 0%{transform:scale(.25);opacity:1} 100%{transform:scale(2.25);opacity:0} }
    @keyframes a8ImpactSlash { 0%{transform:rotate(-24deg) scaleX(.12);opacity:0} 35%{transform:rotate(-24deg) scaleX(1.1);opacity:1} 100%{transform:rotate(-24deg) scaleX(1.45);opacity:0} }
    @keyframes a8ImpactSpark { 0%{transform:translate(-50%,-100%) rotate(var(--r)) translateY(-8px) scaleY(.4);opacity:0} 20%{opacity:1} 100%{transform:translate(-50%,-100%) rotate(var(--r)) translateY(-62px) scaleY(1);opacity:0} }

    #battleView .a8-ground-dust { position:absolute; z-index:5; width:120px; height:30px; border-radius:50%; pointer-events:none; background:radial-gradient(ellipse,rgba(203,213,225,.22),rgba(100,116,139,.08) 42%,transparent 70%); filter:blur(2px); transform:translate(-50%,-50%) scale(.4); animation:a8GroundDust .58s ease-out forwards; }
    @keyframes a8GroundDust { 0%{opacity:0;transform:translate(-50%,-50%) scale(.4)} 24%{opacity:.9} 100%{opacity:0;transform:translate(-50%,-50%) scale(1.65)} }

    #battleView .a8-enemy-item {
      position:absolute; z-index:5; width:72px; height:72px; left:2px; bottom:62px; pointer-events:none;
      transform-origin:50% 78%; filter:drop-shadow(0 10px 10px rgba(0,0,0,.58)); transition:opacity .2s ease; opacity:.98;
    }
    #battleView .a8-enemy-item svg { width:100%; height:100%; overflow:visible; }
    #battleView .a8-enemy-item[data-kind='weapon'] { transform:rotate(138deg); }
    #battleView .a8-enemy-item[data-kind='shield'] { left:14px; bottom:78px; width:78px; height:78px; transform:rotate(-8deg); }
    #battleView .a8-enemy-item[data-kind='focus'], #battleView .a8-enemy-item[data-kind='heal'] { left:26px; bottom:122px; width:50px; height:50px; }
    #battleView .fighter.enemy.attacking-right .a8-enemy-item[data-kind='weapon'], #battleView .a8-enemy-item.item-use.weapon { animation:a8EnemyWeaponSwing .70s cubic-bezier(.2,.72,.22,1) both; }
    #battleView .a8-enemy-item.item-use.block { animation:a8EnemyShieldBlock .62s cubic-bezier(.2,.8,.2,1) both; }
    #battleView .a8-enemy-item.item-use.focus { animation:a8EnemyFocusUse .68s ease-out both; }
    #battleView .a8-enemy-item.item-use.heal { animation:a8EnemyHealUse .78s ease-out both; }
    @keyframes a8EnemyWeaponSwing { 0%{transform:rotate(138deg) translateY(0) scale(1)} 24%{transform:rotate(160deg) translateY(-4px) scale(1.03)} 52%{transform:rotate(78deg) translate(-18px,-4px) scale(1.08)} 70%{transform:rotate(98deg) translate(-9px,0) scale(1.03)} 100%{transform:rotate(138deg) translate(0,0) scale(1)} }
    @keyframes a8EnemyShieldBlock { 0%,100%{transform:rotate(-8deg) translateX(0) scale(1)} 32%{transform:rotate(2deg) translateX(-18px) scale(1.14)} 58%{transform:rotate(-2deg) translateX(-13px) scale(1.09)} }
    @keyframes a8EnemyFocusUse { 0%,100%{transform:scale(1);filter:drop-shadow(0 8px 9px rgba(0,0,0,.55))} 45%{transform:scale(1.35) rotate(8deg);filter:drop-shadow(0 0 20px rgba(167,139,250,.95)) brightness(1.6)} }
    @keyframes a8EnemyHealUse { 0%,100%{transform:scale(1)} 35%{transform:translateY(-14px) scale(1.25);filter:drop-shadow(0 0 20px rgba(74,222,128,.95)) brightness(1.45)} 62%{transform:translateY(-8px) scale(1.15)} }

    #battleView .a8-item-callout { position:absolute; z-index:31; min-width:max-content; padding:.24rem .48rem; border:1px solid rgba(251,191,36,.35); border-radius:999px; background:rgba(3,9,19,.9); color:#fde68a; font-size:.66rem; font-weight:850; letter-spacing:.02em; pointer-events:none; transform:translate(-50%,-50%); animation:a8ItemCallout .9s ease-out forwards; box-shadow:0 7px 18px rgba(0,0,0,.28); }
    @keyframes a8ItemCallout { 0%{opacity:0;transform:translate(-50%,-35%) scale(.86)} 18%{opacity:1;transform:translate(-50%,-50%) scale(1.03)} 75%{opacity:1} 100%{opacity:0;transform:translate(-50%,-90%) scale(.96)} }

    #battleView .battle-arena .fighter.knight .battle-weapon-slot { width:66px !important; height:78px !important; top:auto !important; bottom:7px !important; z-index:5; transform-origin:50% 12% !important; }
    #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-left { left:24px !important; right:auto !important; }
    #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-right { left:auto !important; right:22px !important; }
    #battleView .battle-arena .fighter.knight .battle-weapon-slot img, #battleView .battle-arena .fighter.knight .battle-weapon-slot svg { width:118% !important; height:118% !important; object-fit:contain !important; object-position:center top !important; }
    #battleView .battle-arena .fighter.knight.attacking-left .battle-weapon-slot.weapon-left { animation:a8HeroBladeLeft .68s ease-out both; }
    #battleView .battle-arena .fighter.knight.attacking-left .battle-weapon-slot.weapon-right { animation:a8HeroBladeRight .68s ease-out both; }
    @keyframes a8HeroBladeLeft { 0%,100%{transform:rotate(9deg)} 26%{transform:rotate(26deg) translateY(-3px)} 54%{transform:rotate(-34deg) translate(8px,-8px)} 70%{transform:rotate(-10deg) translate(3px,-2px)} }
    @keyframes a8HeroBladeRight { 0%,100%{transform:rotate(-9deg)} 26%{transform:rotate(-26deg) translateY(-3px)} 54%{transform:rotate(34deg) translate(-8px,-8px)} 70%{transform:rotate(10deg) translate(-3px,-2px)} }

    #battleView .battle-arena .fighter.enemy.defeated .fighter-sprite { animation:a8BattleDefeatGrounded .72s cubic-bezier(.4,0,.8,.2) forwards !important; }
    #battleView .battle-arena .fighter.knight.defeated .fighter-sprite { animation:a8HeroDefeatGrounded .72s cubic-bezier(.4,0,.8,.2) forwards !important; }
    @keyframes a8BattleDefeatGrounded { 0%{transform:translateX(-50%) translateY(0) scale(1);opacity:1} 45%{transform:translateX(-50%) translateY(-5px) rotate(-5deg) scale(.96);opacity:1} 78%{transform:translateX(-50%) translateY(8px) rotate(-10deg) scale(.7);opacity:.55} 100%{transform:translateX(-50%) translateY(18px) rotate(-12deg) scale(.12);opacity:0} }
    @keyframes a8HeroDefeatGrounded { 0%{transform:translateX(-50%) translateY(0) scale(1);opacity:1} 55%{transform:translateX(-50%) translateY(8px) rotate(4deg) scale(.88);opacity:.8} 100%{transform:translateX(-50%) translateY(22px) rotate(7deg) scale(.32);opacity:.12} }

    @media (max-width:720px) {
      #battleView .battle-arena .fighter.knight { left:17%; bottom:4.5%; width:150px; height:205px; }
      #battleView .battle-arena .fighter.enemy { right:17%; bottom:4.5%; width:150px; height:195px; }
      #battleView .battle-arena .fighter.knight .fighter-sprite { height:200px !important; }
      #battleView .battle-arena .fighter.enemy .fighter-sprite { height:185px !important; }
      #battleView .battle-arena .fighter::after { width:122px !important; height:20px !important; }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot { width:56px !important; height:68px !important; bottom:5px !important; }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-left { left:17px !important; }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-right { right:15px !important; }
      #battleView .a8-enemy-item { width:58px; height:58px; left:0; bottom:48px; }
      #battleView .a8-enemy-item[data-kind='shield'] { width:62px; height:62px; left:9px; bottom:64px; }
      #battleView .a8-enemy-item[data-kind='focus'],#battleView .a8-enemy-item[data-kind='heal'] { width:42px; height:42px; left:18px; bottom:102px; }
    }
    @media (max-width:460px) {
      #battleView .battle-arena .fighter.knight { left:15%; bottom:4%; width:128px; height:182px; }
      #battleView .battle-arena .fighter.enemy { right:15%; bottom:4%; width:128px; height:172px; }
      #battleView .battle-arena .fighter.knight .fighter-sprite { height:176px !important; }
      #battleView .battle-arena .fighter.enemy .fighter-sprite { height:164px !important; }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot { width:48px !important; height:60px !important; bottom:4px !important; }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-left { left:14px !important; }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-right { right:12px !important; }
      #battleView .a8-enemy-item { width:50px; height:50px; bottom:42px; }
    }

    html.a8-motion-off #battleView .battle-portrait-icon img,
    html.a8-motion-off #battleView .battle-side.enemy.a8-preview-swap,
    html.a8-motion-off #battleView .battle-arena .fighter,
    html.a8-motion-off #battleView .battle-arena .fighter-sprite,
    html.a8-motion-off #battleView .battle-arena .battle-weapon-slot,
    html.a8-motion-off #battleView .a8-enemy-item,
    html.a8-motion-off #battleView .a8-impact-burst,
    html.a8-motion-off #battleView .a8-ground-dust,
    html.a8-motion-off #battleView .a8-item-callout { animation:none !important; transition:none !important; }

    @media (prefers-reduced-motion:reduce) {
      #battleView .battle-arena .fighter, #battleView .battle-arena .fighter-sprite, #battleView .a8-enemy-item,
      #battleView .battle-arena .battle-weapon-slot, #battleView .a8-impact-burst, #battleView .a8-ground-dust, #battleView .a8-item-callout { animation:none !important; }
    }
  `;

  function installStyles() {
    if (!document.getElementById(style.id)) document.head.appendChild(style);
  }

  function replayPreviewSwap() {
    if (root.classList.contains('a8-motion-off')) return;
    const side = document.querySelector('#battleView .battle-side.enemy');
    if (!side) return;
    side.classList.remove('a8-preview-swap');
    void side.offsetWidth;
    side.classList.add('a8-preview-swap');
    setTimeout(() => side.classList.remove('a8-preview-swap'), 520);
  }

  function installPreviewMotion() {
    const preview = document.getElementById('battleEnemyPreviewIcon');
    if (!preview) return;
    let previousSrc = preview.getAttribute('src') || '';
    const observer = new MutationObserver(() => {
      const src = preview.getAttribute('src') || '';
      if (!src || src === previousSrc) return;
      previousSrc = src;
      replayPreviewSwap();
    });
    observer.observe(preview, { attributes:true, attributeFilter:['src'] });
  }

  function syncKnightMotionAsset() {
    const sprite = document.getElementById('battleKnightSprite');
    if (!sprite) return;
    const disabled = root.classList.contains('a8-motion-off');
    const wanted = disabled ? 'assets/knight_idle_fin.svg' : 'assets/knight_idle_blink.svg';
    if (!String(sprite.getAttribute('src') || '').endsWith(wanted.split('/').pop())) sprite.setAttribute('src', wanted);
  }

  function installMotionSettingSync() {
    syncKnightMotionAsset();
    const observer = new MutationObserver(syncKnightMotionAsset);
    observer.observe(root, { attributes:true, attributeFilter:['class'] });
  }

  function syncBattleMode() {
    const simulation = document.getElementById('battleSimulation');
    const card = simulation && simulation.closest('.battle-card');
    if (!simulation || !card) return;
    card.classList.toggle('a8-battle-active', !simulation.classList.contains('hidden'));
  }

  function installBattleModeSync() {
    const simulation = document.getElementById('battleSimulation');
    if (!simulation) return;
    syncBattleMode();
    const observer = new MutationObserver(syncBattleMode);
    observer.observe(simulation, { attributes:true, attributeFilter:['class'] });
  }

  function itemSvg(item) {
    const kind = String(item && item.kind || 'weapon');
    if (kind === 'shield') {
      return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="a8sh" x1="0" x2="1"><stop stop-color="#cbd5e1"/><stop offset="1" stop-color="#64748b"/></linearGradient></defs><path d="M32 5 54 13v17c0 17-11 25-22 30C21 55 10 47 10 30V13z" fill="url(#a8sh)" stroke="#e2e8f0" stroke-width="3"/><path d="M32 11v40M18 20h28" stroke="#475569" stroke-width="3" opacity=".72"/></svg>';
    }
    if (kind === 'focus') {
      return '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="21" fill="rgba(124,58,237,.24)" stroke="#c4b5fd" stroke-width="3"/><path d="m32 10 6 15 16 7-16 7-6 15-6-15-16-7 16-7z" fill="#a78bfa" stroke="#ede9fe" stroke-width="2"/><circle cx="32" cy="32" r="5" fill="#fff"/></svg>';
    }
    if (kind === 'heal') {
      return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M23 8h18v10l7 8v25c0 4-3 7-7 7H23c-4 0-7-3-7-7V26l7-8z" fill="rgba(34,197,94,.28)" stroke="#86efac" stroke-width="3"/><path d="M28 26h8v8h8v8h-8v8h-8v-8h-8v-8h8z" fill="#dcfce7"/><path d="M24 13h16" stroke="#f8fafc" stroke-width="4"/></svg>';
    }
    const fire = item && item.element === 'fire';
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="a8blade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${fire ? '#fff7ed' : '#f8fafc'}"/><stop offset=".55" stop-color="${fire ? '#fb923c' : '#cbd5e1'}"/><stop offset="1" stop-color="${fire ? '#ea580c' : '#64748b'}"/></linearGradient></defs><path d="m34 4 9 7-6 35-7 6-5-8z" fill="url(#a8blade)" stroke="${fire ? '#fdba74' : '#e2e8f0'}" stroke-width="2"/><path d="M19 43h29" stroke="#fbbf24" stroke-width="5" stroke-linecap="round"/><path d="m32 48-8 11" stroke="#78350f" stroke-width="7" stroke-linecap="round"/><circle cx="22" cy="60" r="4" fill="#f59e0b"/></svg>`;
  }

  function removeNode(selector, rootNode=document) {
    const node = rootNode.querySelector(selector);
    if (node) node.remove();
  }

  function setPreviewEnemy(enemy) {
    const portrait = document.querySelector('#battleView .battle-side.enemy .battle-portrait');
    if (!portrait) return;
    removeNode('.a8-preview-enemy-item', portrait);
    if (!enemy || !enemy.item) return;
    const el = document.createElement('span');
    el.className = 'a8-preview-enemy-item';
    el.dataset.kind = enemy.item.kind || 'weapon';
    el.title = enemy.item.name || 'Gegenstand';
    el.innerHTML = itemSvg(enemy.item);
    portrait.appendChild(el);
  }

  function setEnemy(enemy) {
    const fighter = document.getElementById('battleEnemy');
    if (!fighter) return;
    removeNode('.a8-enemy-item', fighter);
    DEBUG.lastItemAction = '';
    DEBUG.lastItemName = '';
    if (!enemy || !enemy.item) {
      fighter.removeAttribute('data-enemy-item');
      return;
    }
    const item = enemy.item;
    fighter.dataset.enemyItem = item.key || item.name || 'item';
    const el = document.createElement('span');
    el.className = 'a8-enemy-item';
    el.dataset.kind = item.kind || 'weapon';
    el.dataset.itemKey = item.key || '';
    el.title = item.name || 'Gegenstand';
    el.setAttribute('aria-label', item.name || 'Gegenstand');
    el.innerHTML = itemSvg(item);
    fighter.appendChild(el);
  }

  function arenaPointFor(element) {
    const arena = document.getElementById('battleArena');
    if (!arena || !element) return null;
    const ar = arena.getBoundingClientRect();
    const er = element.getBoundingClientRect();
    return { arena, x: er.left - ar.left + er.width * .5, y: er.top - ar.top + er.height * .48, groundY: er.bottom - ar.top - 8 };
  }

  function spawnImpact(target, turn) {
    if (root.classList.contains('a8-motion-off')) return;
    const pos = arenaPointFor(target);
    if (!pos) return;
    const burst = document.createElement('div');
    burst.className = 'a8-impact-burst' + (turn.crit ? ' crit' : '') + (turn.enemyItem && turn.enemyItem.element === 'fire' && !turn.heroTurn ? ' fire' : '');
    burst.style.left = pos.x + 'px';
    burst.style.top = pos.y + 'px';
    burst.innerHTML = '<span class="a8-impact-core"></span><span class="a8-impact-ring"></span><span class="a8-impact-slash"></span>';
    [0,45,90,135,180,225,270,315].forEach(angle => {
      const spark = document.createElement('i');
      spark.className = 'a8-impact-spark';
      spark.style.setProperty('--r', angle + 'deg');
      burst.appendChild(spark);
    });
    pos.arena.appendChild(burst);
    DEBUG.impacts += 1;
    setTimeout(() => burst.remove(), 720);

    const dust = document.createElement('span');
    dust.className = 'a8-ground-dust';
    dust.style.left = pos.x + 'px';
    dust.style.top = pos.groundY + 'px';
    pos.arena.appendChild(dust);
    setTimeout(() => dust.remove(), 700);

    if (turn.crit) {
      pos.arena.classList.remove('a8-hd-crit');
      void pos.arena.offsetWidth;
      pos.arena.classList.add('a8-hd-crit');
      setTimeout(() => pos.arena.classList.remove('a8-hd-crit'), 420);
    }
  }

  function animateEnemyItem(itemEvent) {
    if (!itemEvent || !itemEvent.item) return;
    const itemEl = document.querySelector('#battleEnemy .a8-enemy-item');
    const fighter = document.getElementById('battleEnemy');
    if (!itemEl || !fighter) return;
    const action = itemEvent.type || itemEvent.item.kind || 'weapon';
    itemEl.classList.remove('item-use','weapon','block','focus','heal');
    void itemEl.offsetWidth;
    itemEl.classList.add('item-use', action === 'weapon' ? 'weapon' : action);
    DEBUG.enemyItemUses += 1;
    DEBUG.lastItemAction = action;
    DEBUG.lastItemName = itemEvent.item.name || '';
    fighter.dataset.lastItemAction = action;

    const pos = arenaPointFor(fighter);
    if (pos) {
      const label = document.createElement('span');
      label.className = 'a8-item-callout';
      label.textContent = action === 'block' ? `${itemEvent.item.name} · BLOCK` : itemEvent.item.name;
      label.style.left = pos.x + 'px';
      label.style.top = Math.max(36, pos.y - 98) + 'px';
      pos.arena.appendChild(label);
      setTimeout(() => label.remove(), 980);
    }
    setTimeout(() => itemEl.classList.remove('item-use','weapon','block','focus','heal'), 860);
  }

  function presentTurn(turn) {
    if (!turn) return;
    DEBUG.turns += 1;
    if (turn.itemEvent) animateEnemyItem(turn.itemEvent);
    window.setTimeout(() => spawnImpact(turn.defenderEl, turn), 300);
  }

  function init() {
    installStyles();
    installPreviewMotion();
    installMotionSettingSync();
    installBattleModeSync();
    const selected = document.querySelector('#battleButtons .battle-btn.selected, #battleButtons .battle-btn[aria-pressed="true"]');
    const level = selected ? Number(selected.dataset.enemy || 1) : 1;
    const enemies = window.SHORTCUT_QUEST_ENEMIES || {};
    if (enemies[level]) setPreviewEnemy(enemies[level]);
  }

  window.A8_PREMIUM_BATTLE = Object.freeze({
    version: 2,
    setEnemy,
    setPreviewEnemy,
    presentTurn
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
