(function () {
  'use strict';

  const STYLE_ID = 'a8DevPolishStyles';
  let syncFrame = 0;

  const css = `
    #inventoryView .equipment-slot.a8-slot-ready:not(.equipped) {
      border-color: rgba(251,191,36,.72) !important;
      background:
        radial-gradient(circle at 50% 45%, rgba(251,191,36,.10), transparent 62%),
        rgba(15,23,42,.42) !important;
      animation: a8EquipSlotPulse 1.65s ease-in-out infinite !important;
    }

    #inventoryView .equipment-slot.a8-slot-ready:not(.equipped) .slot-icon {
      border-color: rgba(251,191,36,.48) !important;
      box-shadow:
        inset 0 0 22px rgba(2,6,23,.55),
        0 0 0 1px rgba(251,191,36,.10),
        0 0 22px rgba(245,158,11,.10) !important;
    }

    @keyframes a8EquipSlotPulse {
      0%, 100% {
        box-shadow: inset 0 1px 0 rgba(255,255,255,.02), 0 0 0 0 rgba(251,191,36,0);
        transform: translateY(0);
      }
      50% {
        box-shadow: inset 0 1px 0 rgba(255,255,255,.035), 0 0 0 3px rgba(251,191,36,.16), 0 0 26px rgba(245,158,11,.18);
        transform: translateY(-1px);
      }
    }

    /* The weapon layers already inherit the knight's whole-body idle because they live
       inside .battle-portrait-icon. This second, smaller movement mirrors the animated
       hanging arms inside knight_idle_fin.svg (3.4 s) so grips stay visually attached. */
    #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon.weapon-left {
      animation: a8WeaponLeftHandFollow 3.4s ease-in-out infinite !important;
    }

    #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon.weapon-right {
      animation: a8WeaponRightHandFollow 3.4s ease-in-out infinite !important;
    }

    @keyframes a8WeaponLeftHandFollow {
      0%, 100% { translate: 0 0; }
      25% { translate: 1.5px 1.5px; }
      50% { translate: 0 0; }
      75% { translate: -1px -0.5px; }
    }

    @keyframes a8WeaponRightHandFollow {
      0%, 100% { translate: 0 0; }
      25% { translate: -1.5px 1.5px; }
      50% { translate: 0 0; }
      75% { translate: 1px -0.5px; }
    }

    @media (prefers-reduced-motion: reduce) {
      #inventoryView .equipment-slot.a8-slot-ready:not(.equipped),
      #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon {
        animation: none !important;
      }
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

  function getEquipmentState() {
    try {
      return state && state.equipment && typeof state.equipment === 'object' ? state.equipment : {};
    } catch (_) {
      return {};
    }
  }

  function itemFitsSlot(item, slotKey) {
    if (!item || !slotKey) return false;
    try {
      if (typeof getEquipSlotsForItem === 'function') {
        return getEquipSlotsForItem(item).includes(slotKey);
      }
      if (typeof getItemSlot === 'function') {
        return getItemSlot(item) === slotKey;
      }
    } catch (_) {
      return false;
    }
    return false;
  }

  function setAttributeIfChanged(element, name, value) {
    if (!element || element.getAttribute(name) === value) return;
    element.setAttribute(name, value);
  }

  function syncEquipGuidance() {
    const autoButton = document.getElementById('autoEquipBtn');
    if (autoButton) {
      /* Important: do not rewrite textContent on every observer pass. Replacing the
         text node is a childList mutation and used to reschedule this observer forever,
         starving the battle loop's timers after the first hit. */
      if (autoButton.textContent.trim() !== 'Alles anziehen') {
        autoButton.textContent = 'Alles anziehen';
      }
      setAttributeIfChanged(autoButton, 'aria-label', 'Alle passenden Gegenstände anziehen');
      if (autoButton.title !== 'Alle passenden Gegenstände anziehen') {
        autoButton.title = 'Alle passenden Gegenstände anziehen';
      }
    }

    const items = getOwnedItems();
    const equipment = getEquipmentState();
    const usedItemKeys = new Set(
      Object.values(equipment).filter(Boolean).map(key => String(key))
    );

    document.querySelectorAll('#inventoryView [data-equip-slot]').forEach(slot => {
      const slotKey = slot.dataset.equipSlot || '';
      const equipped = Boolean(equipment[slotKey]);
      const compatibleOwned = !equipped && items.some(item => {
        const itemKey = String(item && (item.key || item.name) || '');
        if (!itemKey || usedItemKeys.has(itemKey)) return false;
        return itemFitsSlot(item, slotKey);
      });

      if (slot.classList.contains('a8-slot-ready') !== compatibleOwned) {
        slot.classList.toggle('a8-slot-ready', compatibleOwned);
      }
      if (compatibleOwned) {
        if (slot.dataset.readyToEquip !== 'true') slot.dataset.readyToEquip = 'true';
        setAttributeIfChanged(slot, 'aria-label', `${slotKey}: Gegenstand zum Anziehen verfügbar`);
      } else {
        if ('readyToEquip' in slot.dataset) delete slot.dataset.readyToEquip;
        if (slot.hasAttribute('aria-label')) slot.removeAttribute('aria-label');
      }
    });
  }

  function scheduleSync() {
    /* Coalesce MutationObserver bursts into one frame. A delayed second write is not
       needed: inventory re-renders are themselves observed. */
    if (syncFrame) return;
    syncFrame = requestAnimationFrame(() => {
      syncFrame = 0;
      syncEquipGuidance();
    });
  }

  function init() {
    installStyles();
    syncEquipGuidance();

    document.addEventListener('click', event => {
      if (event.target.closest('#inventoryView, #shopView, #autoEquipBtn, #unequipAllBtn')) {
        scheduleSync();
      }
    });

    const inventoryView = document.getElementById('inventoryView');
    if (inventoryView && 'MutationObserver' in window) {
      const observer = new MutationObserver(scheduleSync);
      observer.observe(inventoryView, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    const shopView = document.getElementById('shopView');
    if (shopView && 'MutationObserver' in window) {
      const observer = new MutationObserver(scheduleSync);
      observer.observe(shopView, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
