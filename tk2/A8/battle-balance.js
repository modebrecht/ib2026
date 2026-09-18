(function () {
  'use strict';

  const VERSION = 1;
  const HERO_AUTO_ATTACK_MULTIPLIER = 0.45;
  const SKILL_COOLDOWN_TURNS = 4;
  const SHORTCUT_COIN_CAP = 4;
  const STYLE_ID = 'a8BattleBalanceStyles';

  const SKILL_BASELINES = Object.freeze({
    sturm_hieb: Object.freeze({ basePower: 12, powerPerTier: 4, description: 'Beschwört Sturmwolken: Blitzschaden und 4-Runden-Abklingzeit.' }),
    schutzwall: Object.freeze({ basePower: 7, powerPerTier: 2, description: 'Beschwört eine magische Wand, die DEF für 5 Angriffe erhöht.' }),
    kampfrausch: Object.freeze({ basePower: 4, powerPerTier: 0, description: 'Entfesselt Kampfrausch: +ATK für 5 Runden, danach 4 Runden Abklingzeit.' }),
    lichtbrunnen: Object.freeze({ basePower: 18, powerPerTier: 6, description: 'Heilt den Ritter sofort und legt eine 4-Runden-Abklingzeit fest.' })
  });

  const LEGACY_SKILL_KEYS = Object.freeze({
    strike: 'sturm_hieb',
    shield_wall: 'schutzwall',
    frenzy: 'kampfrausch',
    heal: 'lichtbrunnen'
  });

  let shortcutCoinsThisBattle = 0;
  let shortcutActivationsThisBattle = 0;
  let autoImpactTimer = 0;
  let skillImpactTimer = 0;

  function canonicalSkillKey(skillOrKey) {
    const raw = typeof skillOrKey === 'string' ? skillOrKey : skillOrKey && skillOrKey.key;
    return LEGACY_SKILL_KEYS[raw] || raw || '';
  }

  function safeTier(skill) {
    return Math.max(1, Math.min(6, Math.floor(Number(skill && skill.tier) || 1)));
  }

  function balancedBaseEffect(skill) {
    const key = canonicalSkillKey(skill);
    const tier = safeTier(skill);
    if (key === 'sturm_hieb') return 12 + 4 * (tier - 1);
    if (key === 'schutzwall') return 7 + 2 * (tier - 1);
    if (key === 'lichtbrunnen') return 18 + 6 * (tier - 1);
    if (key === 'kampfrausch') {
      const frenzyTable = { 1: 4, 2: 7, 3: 12, 4: 17, 5: 27, 6: 27 };
      return frenzyTable[tier] || frenzyTable[5];
    }
    return null;
  }

  function applyTemplateBaselines() {
    try {
      if (typeof SKILL_POOL !== 'undefined' && Array.isArray(SKILL_POOL)) {
        SKILL_POOL.forEach(skill => {
          const key = canonicalSkillKey(skill);
          const baseline = SKILL_BASELINES[key];
          if (!baseline) return;
          skill.basePower = baseline.basePower;
          skill.powerPerTier = baseline.powerPerTier;
          skill.description = baseline.description;
        });
      }
    } catch (_) {}

    try {
      if (typeof state !== 'undefined' && Array.isArray(state.skills)) {
        state.skills.forEach(skill => {
          const key = canonicalSkillKey(skill);
          const baseline = SKILL_BASELINES[key];
          if (!baseline) return;
          skill.basePower = baseline.basePower;
          skill.powerPerTier = baseline.powerPerTier;
          skill.description = baseline.description;
        });
      }
    } catch (_) {}
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Passive autohit stays readable but deliberately lighter than shortcut skills. */
      #battleView .battle-arena.a8-auto-hit-light .fighter.knight.attacking-left {
        animation:a8BalanceHeroAuto .48s cubic-bezier(.2,.72,.22,1) both !important;
      }
      #battleView .battle-arena.a8-auto-hit-light .fighter.enemy.hit {
        animation:a8BalanceAutoHitRecoil .34s cubic-bezier(.22,.7,.28,1) both !important;
      }
      #battleView .battle-arena.a8-auto-hit-light .a8-impact-burst {
        width:94px !important;
        height:94px !important;
        opacity:.68 !important;
        filter:saturate(.72) brightness(.96);
      }
      #battleView .battle-arena.a8-auto-hit-light .a8-impact-spark:nth-of-type(n+6) { display:none !important; }
      @keyframes a8BalanceHeroAuto {
        0%{transform:translate3d(0,0,0) scale(1)}
        22%{transform:translate3d(-5px,1px,0) rotate(-.7deg) scale(.992,1.008)}
        55%{transform:translate3d(50px,-1px,0) rotate(.9deg) scale(1.018,.992)}
        72%{transform:translate3d(42px,0,0) rotate(.4deg) scale(1.008)}
        100%{transform:translate3d(0,0,0) rotate(0) scale(1)}
      }
      @keyframes a8BalanceAutoHitRecoil {
        0%{filter:brightness(1);transform:translate3d(0,0,0)}
        18%{filter:brightness(1.48);transform:translate3d(4px,0,0)}
        40%{transform:translate3d(-4px,0,0)}
        100%{filter:brightness(1);transform:none}
      }

      /* Existing bespoke skill effects get one extra premium accent. */
      #battleView .battle-arena.a8-skill-impact-strong {
        animation:a8BalanceSkillArenaPulse .48s ease-out both;
      }
      #battleView .battle-arena.a8-skill-impact-strong .fighter.a8-skill-focus {
        filter:drop-shadow(0 0 22px rgba(250,204,21,.72)) drop-shadow(0 16px 24px rgba(2,6,23,.62)) !important;
      }
      @keyframes a8BalanceSkillArenaPulse {
        0%,100%{box-shadow:inset 0 0 0 rgba(250,204,21,0)}
        26%{box-shadow:inset 0 0 70px rgba(250,204,21,.13)}
        58%{box-shadow:inset 0 0 36px rgba(96,165,250,.08)}
      }
      @media (prefers-reduced-motion: reduce) {
        #battleView .battle-arena.a8-auto-hit-light .fighter.knight.attacking-left,
        #battleView .battle-arena.a8-auto-hit-light .fighter.enemy.hit,
        #battleView .battle-arena.a8-skill-impact-strong { animation:none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function battleArenaElement() {
    return document.getElementById('battleArena') || document.querySelector('#battleView .battle-arena');
  }

  function markAutoHitVisual(turn) {
    if (!turn || !turn.heroTurn) return;
    const arena = battleArenaElement();
    if (!arena) return;
    window.clearTimeout(autoImpactTimer);
    arena.classList.add('a8-auto-hit-light');
    autoImpactTimer = window.setTimeout(() => arena.classList.remove('a8-auto-hit-light'), 840);
  }

  function markSkillImpact(entry) {
    const arena = battleArenaElement();
    if (!arena) return;
    const effect = entry && entry.skill ? entry.skill.effect : '';
    const focus = effect === 'damage'
      ? document.getElementById('battleEnemy')
      : document.getElementById('battleKnight');
    window.clearTimeout(skillImpactTimer);
    arena.classList.add('a8-skill-impact-strong');
    if (focus) focus.classList.add('a8-skill-focus');
    skillImpactTimer = window.setTimeout(() => {
      arena.classList.remove('a8-skill-impact-strong');
      if (focus) focus.classList.remove('a8-skill-focus');
    }, 560);
  }

  function syncCooldownCopy() {
    document.querySelectorAll('#battleView .battle-skill-desc').forEach(el => {
      const next = el.textContent
        .replace(/Cooldown\s+5\s+Runden/gi, 'Cooldown 4 Runden')
        .replace(/5-Runden-Abklingzeit/gi, '4-Runden-Abklingzeit');
      if (next !== el.textContent) el.textContent = next;
    });
  }

  function resetBattleShortcutBonus() {
    shortcutCoinsThisBattle = 0;
    shortcutActivationsThisBattle = 0;
  }

  function awardShortcutCoin(entry) {
    if (shortcutCoinsThisBattle >= SHORTCUT_COIN_CAP) return false;
    shortcutCoinsThisBattle += 1;
    try {
      state.coins = Math.max(0, Number(state.coins) || 0) + 1;
      if (typeof pendingCoinAnimation !== 'undefined') {
        pendingCoinAnimation = {
          amount: 1,
          anchor: (typeof battleKnight !== 'undefined' && battleKnight) ? battleKnight : document.getElementById('battleArena'),
          variant: 'gain'
        };
      }
      if (typeof updateUI === 'function') updateUI();
      if (typeof saveState === 'function') saveState();
      if (typeof spawnStatusText === 'function' && typeof battleKnight !== 'undefined' && battleKnight) {
        spawnStatusText(battleKnight, '+1 Coin', 'buff');
      }
      if (typeof pushBattleLog === 'function') {
        const shortcut = entry && entry.hotkeyDisplay ? ` (${entry.hotkeyDisplay})` : '';
        pushBattleLog(`Shortcut-Bonus${shortcut}: +1 Coin (${shortcutCoinsThisBattle}/${SHORTCUT_COIN_CAP}).`, 'system');
      }
    } catch (error) {
      console.warn('[battle-balance] coin feedback failed', error);
    }
    return true;
  }

  function installRuntimePatches() {
    if (window.__A8_BATTLE_BALANCE_PATCHED__) return true;

    if (typeof calculateDamage !== 'function' ||
        typeof resolveBattleTurn !== 'function' ||
        typeof getSkillBaseEffect !== 'function' ||
        typeof setHeroSkillCooldown !== 'function' ||
        typeof activateBattleSkill !== 'function' ||
        typeof prepareBattleSimulation !== 'function') {
      return false;
    }

    window.__A8_BATTLE_BALANCE_PATCHED__ = true;

    const originalGetSkillBaseEffect = getSkillBaseEffect;
    getSkillBaseEffect = function balancedSkillBaseEffect(skill) {
      const balanced = balancedBaseEffect(skill);
      return balanced === null ? originalGetSkillBaseEffect.apply(this, arguments) : balanced;
    };

    const originalSetHeroSkillCooldown = setHeroSkillCooldown;
    setHeroSkillCooldown = function balancedSetHeroSkillCooldown(hero, skillKey, rounds) {
      const requested = arguments.length < 3 ? SKILL_COOLDOWN_TURNS : Number(rounds);
      const balancedRounds = !Number.isFinite(requested) || requested === 5
        ? SKILL_COOLDOWN_TURNS
        : requested;
      return originalSetHeroSkillCooldown.call(this, hero, skillKey, balancedRounds);
    };

    const originalCalculateDamage = calculateDamage;
    calculateDamage = function balancedBattleDamage(attacker, defender) {
      const result = originalCalculateDamage.apply(this, arguments);
      try {
        if (currentBattleContext && attacker === currentBattleContext.hero) {
          return Object.assign({}, result, {
            amount: Math.max(1, Math.round(Number(result.amount || 0) * HERO_AUTO_ATTACK_MULTIPLIER))
          });
        }
      } catch (_) {}
      return result;
    };

    const originalResolveBattleTurn = resolveBattleTurn;
    resolveBattleTurn = function balancedResolveBattleTurn(hero, enemy, heroTurn) {
      const enemyItem = !heroTurn && enemy && enemy.item ? enemy.item : null;
      if (!enemyItem || enemyItem.kind !== 'heal' || !enemyItem.used) {
        return originalResolveBattleTurn.apply(this, arguments);
      }

      // Consumed heal items are inert. Hide the item only while the core resolver
      // computes this enemy turn so the generic non-shield fallback cannot see it.
      enemy.item = null;
      try {
        return originalResolveBattleTurn.apply(this, arguments);
      } finally {
        enemy.item = enemyItem;
        enemyItem.useCount = 1;
      }
    };

    if (typeof presentBattleTurn === 'function') {
      const originalPresentBattleTurn = presentBattleTurn;
      presentBattleTurn = function balancedPresentBattleTurn(turn) {
        markAutoHitVisual(turn);
        return originalPresentBattleTurn.call(this, turn);
      };
    }

    if (typeof renderBattleSkillBar === 'function') {
      const originalRenderBattleSkillBar = renderBattleSkillBar;
      renderBattleSkillBar = function balancedRenderBattleSkillBar() {
        const result = originalRenderBattleSkillBar.apply(this, arguments);
        syncCooldownCopy();
        return result;
      };
    }

    const originalPrepareBattleSimulation = prepareBattleSimulation;
    prepareBattleSimulation = function balancedPrepareBattleSimulation() {
      resetBattleShortcutBonus();
      return originalPrepareBattleSimulation.apply(this, arguments);
    };

    const originalActivateBattleSkill = activateBattleSkill;
    activateBattleSkill = function balancedActivateBattleSkill(entry) {
      const beforeUseCount = Number(battleSkillUseCount || 0);
      const isShortcutCombo = Boolean(entry && entry.mode === 'combo');
      const result = originalActivateBattleSkill.apply(this, arguments);
      const afterUseCount = Number(battleSkillUseCount || 0);
      const activated = afterUseCount > beforeUseCount;

      if (activated) {
        markSkillImpact(entry);
        if (isShortcutCombo) {
          shortcutActivationsThisBattle += 1;
          // Combo cards cannot activate by click in the current Battle UI: a successful
          // combo entry reaches this function only through the real shortcut handler.
          // Core victory rewards already add one coin per counted skill use, so remove
          // this one deferred count and pay the shortcut coin immediately instead.
          // This also prevents valid uses after the cap from becoming delayed coin farms.
          battleSkillUseCount = Math.max(beforeUseCount, afterUseCount - 1);
          awardShortcutCoin(entry);
        }
      }
      return result;
    };

    applyTemplateBaselines();
    syncCooldownCopy();
    try {
      if (typeof renderBattleSkillBar === 'function') renderBattleSkillBar();
    } catch (_) {}
    return true;
  }

  installStyles();
  const installed = installRuntimePatches();

  window.SHORTCUT_QUEST_BATTLE_BALANCE = Object.freeze({
    version: VERSION,
    installed,
    heroAutoAttackMultiplier: HERO_AUTO_ATTACK_MULTIPLIER,
    cooldownTurns: SKILL_COOLDOWN_TURNS,
    shortcutCoinCap: SHORTCUT_COIN_CAP,
    consumedHealResolutionGuard: true,
    skillBaselines: Object.freeze({
      damage: 12,
      defense: 7,
      heal: 18,
      attack: 4
    }),
    get shortcutCoinsThisBattle() { return shortcutCoinsThisBattle; },
    get shortcutActivationsThisBattle() { return shortcutActivationsThisBattle; },
    getSkillBasePower(key, tier = 1) {
      return balancedBaseEffect({ key, tier });
    }
  });
})();
