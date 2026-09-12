(function () {
  'use strict';

  const STYLE_ID = 'a8GearVisualStyles';
  const VISIBLE_BODY_SLOTS = ['gloves', 'necklace', 'boots'];
  const DEBUG = {
    version: 1,
    renderedPieces: 0,
    helmetSuppressed: true,
    ringsSuppressed: true,
    lastSignature: ''
  };

  const TIER = {
    1: { color: '#94a3b8', glow: 'rgba(148,163,184,.24)', weapon: 'drop-shadow(0 0 4px rgba(148,163,184,.35))' },
    2: { color: '#4ade80', glow: 'rgba(74,222,128,.28)', weapon: 'sepia(.55) saturate(2.2) hue-rotate(74deg) brightness(1.06) drop-shadow(0 0 7px rgba(74,222,128,.55))' },
    3: { color: '#60a5fa', glow: 'rgba(96,165,250,.32)', weapon: 'sepia(.62) saturate(3) hue-rotate(165deg) brightness(1.08) drop-shadow(0 0 8px rgba(96,165,250,.65))' },
    4: { color: '#c084fc', glow: 'rgba(192,132,252,.38)', weapon: 'sepia(.72) saturate(4.2) hue-rotate(228deg) brightness(1.1) drop-shadow(0 0 10px rgba(192,132,252,.72))' },
    5: { color: '#fbbf24', glow: 'rgba(251,191,36,.44)', weapon: 'sepia(.9) saturate(6.2) hue-rotate(318deg) brightness(1.15) contrast(1.06) drop-shadow(0 0 12px rgba(248,113,113,.9))' }
  };

  const css = `
    /* A8 TIERED KNIGHT GEAR VISUALS 2026 */
    #inventoryView .equipment-slot.a8-tier-frame {
      border-color: var(--a8-tier-color) !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.035),
        inset 0 0 0 1px var(--a8-tier-glow),
        0 0 18px var(--a8-tier-glow) !important;
    }
    #inventoryView .equipment-slot.a8-tier-frame .slot-icon {
      border-color: var(--a8-tier-color) !important;
      box-shadow:
        inset 0 0 22px rgba(2,6,23,.55),
        0 0 0 1px var(--a8-tier-glow),
        0 0 14px var(--a8-tier-glow) !important;
    }

    .a8-knight-gear-piece {
      position: absolute;
      z-index: 7;
      display: grid;
      place-items: center;
      pointer-events: none;
      transform-origin: 50% 50%;
      filter: drop-shadow(0 4px 5px rgba(0,0,0,.48)) drop-shadow(0 0 8px var(--a8-tier-glow));
    }
    .a8-knight-gear-piece > img,
    .a8-knight-gear-piece > svg {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      object-fit: contain !important;
      overflow: visible !important;
    }

    #inventoryView #heroAvatar .a8-knight-gear-piece[data-slot='gloves'] { left:50%; top:57%; width:70px; height:50px; transform:translate(-50%,-50%); }
    #inventoryView #heroAvatar .a8-knight-gear-piece[data-slot='necklace'] { left:50%; top:38%; width:32px; height:32px; transform:translate(-50%,-50%); }
    #inventoryView #heroAvatar .a8-knight-gear-piece[data-slot='boots'] { left:50%; bottom:5%; width:76px; height:48px; transform:translateX(-50%); }

    #battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon .a8-knight-gear-piece[data-slot='gloves'] { left:50%; bottom:17%; width:80px; height:54px; transform:translateX(-50%); }
    #battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon .a8-knight-gear-piece[data-slot='necklace'] { left:50%; top:35%; width:36px; height:36px; transform:translateX(-50%); }
    #battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon .a8-knight-gear-piece[data-slot='boots'] { left:50%; bottom:-1%; width:84px; height:54px; transform:translateX(-50%); }
    #battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon .a8-knight-gear-piece > img,
    #battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon .a8-knight-gear-piece > svg {
      animation: none !important;
      transform: none !important;
    }

    #battleView .battle-arena .fighter.knight .a8-knight-gear-piece[data-slot='gloves'] { left:50%; bottom:60px; width:66px; height:46px; transform:translateX(-50%); }
    #battleView .battle-arena .fighter.knight .a8-knight-gear-piece[data-slot='necklace'] { left:50%; top:82px; width:30px; height:30px; transform:translateX(-50%); }
    #battleView .battle-arena .fighter.knight .a8-knight-gear-piece[data-slot='boots'] { left:50%; bottom:-2px; width:72px; height:44px; transform:translateX(-50%); }
    #battleView .battle-arena .fighter.knight:not(.attacking-left):not(.hit):not(.defeated):not(.a8-knight-victory) .a8-knight-gear-piece {
      animation: a8GearBodyIdle 3.05s cubic-bezier(.45,0,.55,1) infinite;
    }
    @keyframes a8GearBodyIdle {
      0%,100% { translate: 0 0; }
      50% { translate: 0 -3px; }
      74% { translate: 0 -1.5px; }
    }

    .a8-tier-weapon > img,
    .a8-tier-weapon > svg {
      filter: var(--a8-weapon-filter) !important;
      transition: filter .18s ease;
    }
    .a8-tier-weapon[data-a8-gear-tier='5']::after {
      content: '';
      position: absolute;
      inset: 14%;
      border-radius: 999px;
      pointer-events: none;
      background: radial-gradient(circle, rgba(248,113,113,.22), transparent 66%);
      filter: blur(5px);
      opacity: .8;
    }

    @media (max-width:720px) {
      #inventoryView #heroAvatar .a8-knight-gear-piece[data-slot='gloves'] { width:56px; height:40px; }
      #inventoryView #heroAvatar .a8-knight-gear-piece[data-slot='boots'] { width:62px; height:40px; }
      #battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon .a8-knight-gear-piece[data-slot='gloves'] { width:64px; height:44px; }
      #battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon .a8-knight-gear-piece[data-slot='boots'] { width:68px; height:44px; }
      #battleView .battle-arena .fighter.knight .a8-knight-gear-piece[data-slot='gloves'] { width:54px; height:38px; bottom:48px; }
      #battleView .battle-arena .fighter.knight .a8-knight-gear-piece[data-slot='boots'] { width:58px; height:38px; }
      #battleView .battle-arena .fighter.knight .a8-knight-gear-piece[data-slot='necklace'] { top:66px; width:25px; height:25px; }
    }

    @media (prefers-reduced-motion: reduce) {
      #battleView .a8-knight-gear-piece { animation:none !important; }
    }
  `;

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getOwnedItems() {
    try {
      return Array.isArray(state && state.items) ? state.items : [];
    } catch (_) {
      return [];
    }
  }

  function getEquipment() {
    try {
      return state && state.equipment && typeof state.equipment === 'object' ? state.equipment : {};
    } catch (_) {
      return {};
    }
  }

  function itemKey(item) {
    return String(item && (item.key || item.name) || '');
  }

  function equippedItem(slotKey) {
    const equipment = getEquipment();
    const key = String(equipment[slotKey] || '');
    if (!key) return null;
    return getOwnedItems().find(item => itemKey(item) === key) || null;
  }

  function tierOf(item) {
    return Math.max(1, Math.min(5, Math.floor(Number(item && item.tier || 1))));
  }

  function applyTierVisual(element, item, weapon) {
    if (!element) return;
    if (!item) {
      element.classList.remove('a8-tier-frame', 'a8-tier-weapon');
      delete element.dataset.a8GearTier;
      element.style.removeProperty('--a8-tier-color');
      element.style.removeProperty('--a8-tier-glow');
      element.style.removeProperty('--a8-weapon-filter');
      return;
    }
    const tier = tierOf(item);
    const palette = TIER[tier];
    element.dataset.a8GearTier = String(tier);
    element.style.setProperty('--a8-tier-color', palette.color);
    element.style.setProperty('--a8-tier-glow', palette.glow);
    element.style.setProperty('--a8-weapon-filter', palette.weapon);
    element.classList.toggle('a8-tier-frame', !weapon);
    element.classList.toggle('a8-tier-weapon', Boolean(weapon));
  }

  function iconMarkup(item, slotKey) {
    try {
      if (typeof getItemIcon === 'function') return getItemIcon(item.icon, item.key);
    } catch (_) {}
    if (slotKey === 'gloves') return '<img src="assets/panzerhandschuhe.svg" alt="" aria-hidden="true">';
    if (slotKey === 'boots') return '<img src="assets/stahl-stiefel.svg" alt="" aria-hidden="true">';
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="9" fill="rgba(254,243,199,.9)" stroke="#fbbf24" stroke-width="1.6"/><path d="m16 8 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#f59e0b"/></svg>';
  }

  function signatureForVisibleGear() {
    return VISIBLE_BODY_SLOTS.map(slot => {
      const item = equippedItem(slot);
      return item ? `${slot}:${itemKey(item)}:${tierOf(item)}` : `${slot}:-`;
    }).join('|');
  }

  function renderBodyGear(host, context) {
    if (!host) return;
    const signature = `${context}|${signatureForVisibleGear()}`;
    if (host.dataset.a8GearSignature === signature) return;
    host.querySelectorAll('.a8-knight-gear-piece').forEach(node => node.remove());
    host.dataset.a8GearSignature = signature;

    VISIBLE_BODY_SLOTS.forEach(slotKey => {
      const item = equippedItem(slotKey);
      if (!item) return;
      const piece = document.createElement('span');
      piece.className = 'a8-knight-gear-piece';
      piece.dataset.slot = slotKey;
      piece.title = `${item.name || itemKey(item)} · Tier ${tierOf(item)}`;
      piece.innerHTML = iconMarkup(item, slotKey);
      piece.querySelectorAll('img').forEach(img => {
        img.loading = 'eager';
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
      });
      applyTierVisual(piece, item, false);
      piece.classList.remove('a8-tier-frame');
      host.appendChild(piece);
    });
  }

  function syncInventoryFrames() {
    document.querySelectorAll('#inventoryView [data-equip-slot]').forEach(slot => {
      const slotKey = slot.dataset.equipSlot || '';
      applyTierVisual(slot, equippedItem(slotKey), false);
    });
  }

  function syncWeaponTiers() {
    const weapon = equippedItem('weapon');
    const offhand = equippedItem('offhand');
    applyTierVisual(document.querySelector('#battleView .battle-stage-preview .a8-arena-weapon.weapon-left'), weapon, true);
    applyTierVisual(document.querySelector('#battleView .battle-stage-preview .a8-arena-weapon.weapon-right'), offhand, true);
    applyTierVisual(document.getElementById('battleWeaponSlot1'), weapon, true);
    applyTierVisual(document.getElementById('battleWeaponSlot2'), offhand, true);
  }

  function syncBodyGear() {
    renderBodyGear(document.getElementById('heroAvatar'), 'inventory');
    renderBodyGear(document.querySelector('#battleView .battle-stage-preview .battle-side.hero .battle-portrait-icon'), 'preview');
    renderBodyGear(document.getElementById('battleKnight'), 'active');
  }

  function sync() {
    installStyles();
    syncInventoryFrames();
    syncWeaponTiers();
    syncBodyGear();
    DEBUG.renderedPieces = document.querySelectorAll('.a8-knight-gear-piece').length;
    DEBUG.lastSignature = signatureForVisibleGear();
  }

  let frame = 0;
  function scheduleSync() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      sync();
    });
  }

  function init() {
    sync();
    document.addEventListener('click', event => {
      if (event.target.closest('#inventoryView, #battleView, #shopView, .nav-toggle, #autoEquipBtn, #unequipAllBtn')) scheduleSync();
    });
    window.addEventListener('storage', scheduleSync);

    ['inventoryView', 'battleView'].forEach(id => {
      const root = document.getElementById(id);
      if (!root || !('MutationObserver' in window)) return;
      const observer = new MutationObserver(scheduleSync);
      observer.observe(root, { childList: true, subtree: true });
    });
  }

  window.A8_GEAR_VISUAL_DEBUG = DEBUG;
  window.A8_GEAR_VISUALS = Object.freeze({ version: 1, sync });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
