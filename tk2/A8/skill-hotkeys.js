(function attachSkillHotkeys(global) {
  const LEGACY_STORAGE_KEY = "shortcutRitter_v1";
  const STORAGE_2026_KEY = "shortcutRitter_2026_v1";
  const BATTLE_COUNT_2026 = 11;
  const SECTION_COUNT_2026 = 30;
  const REWARD_SCALE_2026 = 1.16;
  const RUNEN_AMULET_KEY_2026 = "runen_amulet";
  const XP_STORAGE_KEY_2026 = "tk_global_xp_v1";
  const HINT_COST_XP_2026 = 30;
  const XP_PER_CORRECT_2026 = 5;

  function narrativeEntry(scene, prompt, options, answers) {
    return {
      scene,
      prompt,
      missingSlots: answers.length,
      options: options.map(value => ({ label: value, value })),
      answers
    };
  }

  function stripWorksheetRefs(value) {
    if (typeof value !== "string") return value;
    return value
      .replace(/\bA[1-8]\s*\+\s*A[1-8]\b/gi, "gemischt")
      .replace(/\s+(?:aus|von)\s+A[1-8]\b/gi, "")
      .replace(/\bA[1-8]\b/gi, "")
      .replace(/\s+([,.;:])/g, "$1")
      .replace(/\s{2,}/g, " ")
      .replace(/\s*[–-]\s*$/g, "")
      .trim();
  }

  function applyDidacticOverrides() {
    const sections = Array.isArray(global.LEARN_SECTION_BLUEPRINTS) ? global.LEARN_SECTION_BLUEPRINTS : [];
    const byId = id => sections.find(section => String(section && section.id) === String(id));

    const s12 = byId(12);
    if (s12) {
      s12.title = "12. Workflow Chain – Dokument";
      s12.description = "Ein realistischer Dokument-Workflow: Inhalt übernehmen, bereinigen, prüfen und sichern.";
      s12.comboBuilder = {
        title: "Workflow Chain",
        instructions: "Setze die Arbeitsschritte als vollständige Shortcut-Kette zusammen.",
        defaultOptions: ["Ctrl+O", "Ctrl+A", "Ctrl+C", "Ctrl+N", "Ctrl+Shift+V", "Ctrl+S", "Ctrl+F", "Ctrl+H", "Ctrl+P"],
        combos: [
          {
            title: "Saubere Kopie erstellen",
            prompt: "Datei öffnen → alles markieren → kopieren → neues Dokument → ohne Formatierung einfügen → speichern.",
            answers: ["Ctrl+O", "Ctrl+A", "Ctrl+C", "Ctrl+N", "Ctrl+Shift+V", "Ctrl+S"]
          },
          {
            title: "Prüfen & ausgeben",
            prompt: "Begriff suchen → suchen & ersetzen → speichern → Druckdialog öffnen.",
            answers: ["Ctrl+F", "Ctrl+H", "Ctrl+S", "Ctrl+P"]
          }
        ]
      };
      s12.tasks = [];
    }

    const s16 = byId(16);
    if (s16) {
      s16.title = "16. Szenario – System unter Druck";
      s16.description = "Ein Programm hängt, du musst reagieren und deinen Arbeitsplatz sauber verlassen.";
      s16.narrative = {
        autoCheck: false,
        entries: [
          narrativeEntry("Ein Programm reagiert nicht mehr.", "Du öffnest den Task-Manager direkt mit ____ + ____ + ____.", ["Ctrl", "Shift", "Esc", "Alt", "Tab"], ["Ctrl", "Shift", "Esc"]),
          narrativeEntry("Du willst kurz zu einem anderen geöffneten Programm wechseln.", "Du nutzt ____ + ____.", ["Alt", "Tab", "Ctrl", "Shift"], ["Alt", "Tab"]),
          narrativeEntry("Das aktive Problemfenster soll geschlossen werden.", "Du nutzt ____ + ____.", ["Alt", "F4", "Ctrl", "W"], ["Alt", "F4"]),
          narrativeEntry("Danach brauchst du eine Datei aus dem Explorer.", "Du nutzt ____ + ____.", ["Win", "E", "D", "L"], ["Win", "E"]),
          narrativeEntry("Du verlässt den Arbeitsplatz.", "Du sperrst den PC mit ____ + ____.", ["Win", "L", "Ctrl", "D"], ["Win", "L"])
        ]
      };
      s16.tasks = [];
    }

    const s30 = byId(30);
    if (s30 && Array.isArray(s30.tasks)) {
      const leftArrow = s30.tasks.find(task => task && task.answer === "Win+←");
      if (leftArrow) {
        leftArrow.prompt = "Screenshot-Ausschnitt";
        leftArrow.answer = "Win+Shift+S";
      }
      const upArrow = s30.tasks.find(task => task && task.answer === "Win+↑");
      if (upArrow) {
        upArrow.prompt = "Aktives Fenster schliessen";
        upArrow.answer = "Alt+F4";
      }
    }

    sections.forEach(section => {
      if (!section) return;
      section.title = stripWorksheetRefs(section.title);
      section.description = stripWorksheetRefs(section.description);
      section.tabLabel = stripWorksheetRefs(section.tabLabel);
      if (section.fastPaced) {
        section.fastPaced.title = stripWorksheetRefs(section.fastPaced.title);
        section.fastPaced.instructions = stripWorksheetRefs(section.fastPaced.instructions);
      }
      if (section.comboBuilder) {
        section.comboBuilder.title = stripWorksheetRefs(section.comboBuilder.title);
        section.comboBuilder.instructions = stripWorksheetRefs(section.comboBuilder.instructions);
      }
    });
  }

  applyDidacticOverrides();

  function completedSectionCount(state) {
    if (!state || !state.sectionClears || typeof state.sectionClears !== "object") return 0;
    return Object.values(state.sectionClears).filter(value => Number(value) > 0).length;
  }

  function sequentialBattleProgress(state) {
    const clears = state && state.battleClears && typeof state.battleClears === "object" ? state.battleClears : {};
    let next = 1;
    while (next < BATTLE_COUNT_2026 && clears[String(next)]) next += 1;
    return next;
  }

  function migrateRunenAmuletItems(state) {
    if (!state || !Array.isArray(state.items)) return;
    state.items.forEach(item => {
      if (!item || item.key !== RUNEN_AMULET_KEY_2026) return;
      item.baseDef = 1;
      item.description = "Runenschutz: erhöht DEF um 1 pro Tier.";
    });
  }

  function normalize2026State(serialized) {
    try {
      const state = JSON.parse(serialized);
      if (!state || typeof state !== "object") return { serialized, state: null };
      const learningCap = Math.min(BATTLE_COUNT_2026, 1 + Math.floor(completedSectionCount(state) / 3));
      const battleCap = sequentialBattleProgress(state);
      state.battleUnlocked = Math.max(1, Math.min(learningCap, battleCap));
      state.edition = "tk2-2026";
      migrateRunenAmuletItems(state);
      return { serialized: JSON.stringify(state), state };
    } catch (_) {
      return { serialized, state: null };
    }
  }

  function render2026Progress(state) {
    if (typeof document === "undefined") return;
    const completed = Math.min(SECTION_COUNT_2026, completedSectionCount(state));
    let badge = document.getElementById("a8ProgressBadge");
    const editionBadge = document.getElementById("tk2EditionBadge");
    const title = document.querySelector("header .title");
    if (!badge && (editionBadge || title)) {
      badge = document.createElement("span");
      badge.id = "a8ProgressBadge";
      badge.style.cssText = "font-size:.72rem;font-weight:800;padding:.25rem .55rem;border-radius:999px;background:rgba(34,197,94,.10);border:1px solid rgba(34,197,94,.28);color:#bbf7d0;white-space:nowrap";
      (editionBadge || title).insertAdjacentElement("afterend", badge);
    }
    if (!badge) return;
    badge.textContent = completed >= SECTION_COUNT_2026 ? "Abgeschlossen ✓" : `${completed} / ${SECTION_COUNT_2026}`;
    badge.title = completed >= SECTION_COUNT_2026
      ? "Alle Übungen abgeschlossen"
      : `${completed} von ${SECTION_COUNT_2026} Übungen abgeschlossen`;
  }

  if (typeof Storage !== "undefined" && !global.__shortcutQuest2026StoragePatched) {
    const rawGet = Storage.prototype.getItem;
    const rawSet = Storage.prototype.setItem;
    const rawRemove = Storage.prototype.removeItem;
    const mapKey = (store, key) => (store === global.localStorage && key === LEGACY_STORAGE_KEY ? STORAGE_2026_KEY : key);

    Storage.prototype.getItem = function(key) {
      return rawGet.call(this, mapKey(this, key));
    };
    Storage.prototype.setItem = function(key, value) {
      const mapped = mapKey(this, key);
      if (this === global.localStorage && mapped === STORAGE_2026_KEY) {
        const normalized = normalize2026State(String(value));
        const result = rawSet.call(this, mapped, normalized.serialized);
        if (normalized.state) queueMicrotask(() => render2026Progress(normalized.state));
        return result;
      }
      return rawSet.call(this, mapped, value);
    };
    Storage.prototype.removeItem = function(key) {
      return rawRemove.call(this, mapKey(this, key));
    };

    if (rawGet.call(global.localStorage, STORAGE_2026_KEY) === null) {
      rawSet.call(global.localStorage, STORAGE_2026_KEY, JSON.stringify({
        edition: "tk2-2026",
        sectionsUnlocked: 10,
        battleUnlocked: 1
      }));
    }
    global.__shortcutQuest2026StoragePatched = true;

    const stored = rawGet.call(global.localStorage, STORAGE_2026_KEY);
    if (stored) {
      const normalized = normalize2026State(stored);
      if (normalized.serialized !== stored) rawSet.call(global.localStorage, STORAGE_2026_KEY, normalized.serialized);
      global.__shortcutQuest2026InitialState = normalized.state;
    }
  }

  function install2026EconomyOverrides() {
    if (typeof global.getRunenAmuletCoinBonusPercent === "function") {
      global.getRunenAmuletCoinBonusPercent = () => 0;
    }
    if (typeof global.applyCoinBonus === "function") {
      global.applyCoinBonus = baseAmount => {
        const amount = Number(baseAmount) || 0;
        if (amount <= 0) return amount;
        return Math.max(0, Math.round(amount * REWARD_SCALE_2026));
      };
    }
    if (typeof global.updateItemDerivedStats === "function") {
      const legacyUpdateItemDerivedStats = global.updateItemDerivedStats;
      global.updateItemDerivedStats = item => {
        if (item && item.key === RUNEN_AMULET_KEY_2026) {
          item.baseDef = 1;
          item.description = "Runenschutz: erhöht DEF um 1 pro Tier.";
        }
        return legacyUpdateItemDerivedStats(item);
      };
    }
    if (typeof global.collectItemStats === "function") {
      const legacyCollectItemStats = global.collectItemStats;
      global.collectItemStats = item => {
        const stats = legacyCollectItemStats(item);
        if (!item || item.key !== RUNEN_AMULET_KEY_2026) return stats;
        const cleaned = stats.filter(stat => stat && stat.label !== "Münzen");
        if (Number(item.def || 0) > 0 && !cleaned.some(stat => stat && stat.label === "DEF")) {
          cleaned.push({ label: "DEF", value: String(item.def), className: "def" });
        }
        return cleaned;
      };
    }
    if (typeof global.updateUI === "function") global.updateUI();
    global.SHORTCUT_QUEST_2026_ECONOMY = Object.freeze({
      rewardScale: REWARD_SCALE_2026,
      runenAmuletEffect: "+1 DEF per tier",
      equipmentCoinBonus: false
    });
  }

  function getSharedXP() {
    if (typeof global.localStorage === "undefined") return 0;
    const value = parseInt(global.localStorage.getItem(XP_STORAGE_KEY_2026) || "0", 10);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  function setSharedXP(value) {
    if (typeof global.localStorage === "undefined") return;
    global.localStorage.setItem(XP_STORAGE_KEY_2026, String(Math.max(0, Math.floor(Number(value) || 0))));
    renderSharedXP();
    refreshHintButtons();
  }

  function addSharedXP(amount) {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    if (!value) return 0;
    setSharedXP(getSharedXP() + value);
    return value;
  }

  function renderSharedXP() {
    if (typeof document === "undefined") return;
    const headerRight = document.querySelector("header .header-right");
    if (!headerRight) return;
    let badge = document.getElementById("a8XpTop");
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "a8XpTop";
      badge.className = "badge";
      const coinBadge = document.getElementById("coinTop");
      if (coinBadge) headerRight.insertBefore(badge, coinBadge);
      else headerRight.appendChild(badge);
    }
    badge.textContent = `XP: ${getSharedXP()}`;
    badge.title = `Jede richtige Antwort bringt ${XP_PER_CORRECT_2026} XP · Tipps kosten ${HINT_COST_XP_2026} XP`;
  }

  function injectChoiceStyles() {
    if (typeof document === "undefined" || document.getElementById("a8ChoiceStyles")) return;
    const style = document.createElement("style");
    style.id = "a8ChoiceStyles";
    style.textContent = `
      #overviewCard { display:none!important; }
      #sectionTabs { flex-wrap: nowrap !important; overflow-x: auto; overscroll-behavior-inline: contain; scrollbar-width: thin; padding-bottom: .25rem; }
      #sectionTabs .section-tab { flex: 0 0 auto; }
      #learnView .nav-card > .small { margin: .45rem 0 0; }
      #learnSections select.a8-native-select { position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;clip:rect(0 0 0 0)!important; }
      .a8-choice-ui { display:flex;flex-direction:column;gap:.65rem;width:100%;margin-top:.55rem; }
      .a8-choice-options { display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:.55rem;width:100%; }
      .a8-choice-option,.a8-combo-bank-option,.a8-combo-slot-button { appearance:none;border:1px solid rgba(148,163,184,.38);border-radius:.85rem;background:rgba(15,23,42,.58);color:var(--text);min-height:44px;padding:.62rem .8rem;font:inherit;font-weight:750;cursor:pointer;transition:transform .12s ease,border-color .12s ease,background .12s ease,opacity .12s ease; }
      .a8-choice-option:hover:not(:disabled),.a8-combo-bank-option:hover:not(:disabled),.a8-combo-slot-button:hover:not(:disabled) { border-color:var(--accent);background:rgba(245,158,11,.14);transform:translateY(-1px); }
      .a8-choice-option.selected,.a8-combo-bank-option.selected,.a8-combo-slot-button.active { border-color:rgba(245,158,11,.82);background:rgba(245,158,11,.2);box-shadow:0 0 0 2px rgba(245,158,11,.12); }
      .a8-choice-option.removed { opacity:.22;text-decoration:line-through;pointer-events:none; }
      .a8-choice-option.correct,.a8-combo-slot-button.correct { border-color:var(--good);background:var(--good-soft);color:var(--good); }
      .a8-choice-option.wrong,.a8-combo-slot-button.incorrect { border-color:var(--bad);background:var(--bad-soft);color:var(--bad); }
      .a8-choice-option.correct-answer,.a8-combo-bank-option.correct-answer { border-color:var(--good);box-shadow:0 0 0 2px rgba(34,197,94,.12); }
      .a8-hint-row { display:flex;align-items:center;flex-wrap:wrap;gap:.55rem; }
      .a8-hint-button { border:1px solid rgba(250,204,21,.4);border-radius:.75rem;background:rgba(250,204,21,.10);color:#fde68a;padding:.48rem .72rem;font:inherit;font-size:.84rem;font-weight:750;cursor:pointer; }
      .a8-hint-button:disabled { opacity:.48;cursor:not-allowed; }
      .a8-hint-note { color:var(--muted);font-size:.82rem; }
      .a8-combo-controls { display:flex;flex-direction:column;gap:.7rem;width:100%;margin-top:.7rem; }
      .a8-combo-bank { display:flex;flex-wrap:wrap;gap:.48rem;align-items:center; }
      .a8-combo-bank-option { min-height:40px;padding:.5rem .7rem;font-size:.88rem; }
      .combo-slot .a8-combo-slot-button { min-width:88px; }
      .a8-combo-bank-option.hint-removed { opacity:.2;text-decoration:line-through;pointer-events:none; }

      .a8-filtered-combo { align-items:flex-end;gap:.55rem!important; }
      .a8-filtered-combo .combo-slot select { display:block!important;position:static!important;width:auto!important;height:44px!important;min-width:128px;max-width:180px;opacity:1!important;pointer-events:auto!important;clip:auto!important;overflow:visible!important;border:1px solid rgba(148,163,184,.38);border-radius:.8rem;background:#111c31;color:var(--text);padding:.45rem .65rem;font:inherit;font-weight:750; }
      .a8-filtered-combo .combo-slot select:focus { outline:2px solid rgba(245,158,11,.55);outline-offset:2px;border-color:var(--accent); }
      .a8-filtered-combo .a8-combo-select-hint { flex-basis:100%;margin-top:.2rem; }
      .a8-dnd-shell { display:flex;flex-direction:column;gap:.85rem;margin-top:.5rem; }
      .a8-dnd-head { display:flex;align-items:center;justify-content:space-between;gap:.7rem;flex-wrap:wrap; }
      .a8-dnd-progress { font-size:.82rem;font-weight:800;color:#fde68a;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.28);border-radius:999px;padding:.3rem .65rem; }
      .a8-dnd-help { margin:0;color:var(--muted);font-size:.86rem; }
      .a8-dnd-shell .dnd-pool { display:flex!important;gap:.5rem!important;flex-wrap:wrap!important;justify-content:flex-start!important;padding:.8rem!important;border:1px solid rgba(148,163,184,.2)!important;border-radius:1rem!important;background:rgba(15,23,42,.35)!important;min-height:62px; }
      .a8-dnd-shell .dnd-token { border-radius:999px!important;padding:.55rem .78rem!important;background:rgba(30,41,59,.9)!important;border:1px solid rgba(96,165,250,.42)!important;color:#dbeafe!important;font-weight:800!important;cursor:grab!important;box-shadow:none!important; }
      .a8-dnd-shell .dnd-token:hover { transform:translateY(-1px);border-color:#60a5fa!important;background:rgba(37,99,235,.18)!important; }
      .a8-dnd-shell .dnd-token.a8-used,.a8-dnd-shell .dnd-token.a8-hint-hidden { display:none!important; }
      .a8-dnd-shell .dnd-targets { display:block!important; }
      .a8-dnd-shell .dnd-target { display:none!important; }
      .a8-dnd-shell .dnd-target.a8-active { display:flex!important;align-items:center;justify-content:space-between;gap:1rem;min-height:86px;padding:1rem 1.1rem!important;border:1px solid rgba(245,158,11,.46)!important;border-radius:1rem!important;background:linear-gradient(135deg,rgba(245,158,11,.10),rgba(15,23,42,.56))!important;box-shadow:0 12px 30px rgba(2,6,23,.2); }
      .a8-dnd-shell .dnd-target.a8-active .question-text { font-size:1.05rem;font-weight:800; }
      .a8-dnd-shell .dnd-target.a8-active .drop-slot { min-width:150px;min-height:48px;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(245,158,11,.65)!important;border-radius:.8rem!important;background:rgba(15,23,42,.45)!important;color:#fde68a;font-weight:800; }
      .a8-dnd-done { display:none;padding:.85rem 1rem;border-radius:.9rem;border:1px solid rgba(34,197,94,.3);background:rgba(34,197,94,.08);color:#bbf7d0;font-weight:800; }
      .a8-dnd-done.visible { display:block; }
      .a8-dnd-assignments { display:flex;flex-wrap:wrap;gap:.45rem; }
      .a8-dnd-assignment { border:1px solid rgba(148,163,184,.26);border-radius:999px;background:rgba(15,23,42,.48);color:var(--muted);padding:.42rem .65rem;font:inherit;font-size:.8rem;cursor:pointer; }
      .a8-dnd-assignment strong { color:var(--text); }
      .a8-dnd-assignment.correct { border-color:rgba(34,197,94,.5);color:#bbf7d0; }
      .a8-dnd-assignment.incorrect { border-color:rgba(248,113,113,.5);color:#fecaca; }
      .a8-xp-earned { display:inline-flex;align-items:center;margin-left:.5rem;padding:.25rem .5rem;border-radius:999px;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#bbf7d0;font-size:.8rem;font-weight:850;animation:a8XpPop .5s ease; }
      .a8-xp-float { position:fixed;z-index:9999;pointer-events:none;font-weight:900;color:#bbf7d0;text-shadow:0 2px 8px #020617;animation:a8XpFloat .8s ease forwards; }
      @keyframes a8XpPop { from{transform:scale(.75);opacity:0} to{transform:scale(1);opacity:1} }
      @keyframes a8XpFloat { 0%{transform:translateY(0) scale(.8);opacity:0} 20%{opacity:1} 100%{transform:translateY(-38px) scale(1.08);opacity:0} }
      @media (max-width:620px) {
        .a8-choice-options { grid-template-columns:repeat(2,minmax(0,1fr)); }
        .a8-choice-option { min-width:0;padding:.6rem .45rem; }
        .a8-combo-bank { display:grid;grid-template-columns:repeat(2,minmax(0,1fr)); }
        .a8-combo-bank-option { min-width:0; }
        .a8-dnd-shell .dnd-target.a8-active { flex-direction:column;align-items:stretch; }
        .a8-dnd-shell .dnd-target.a8-active .drop-slot { width:100%;min-width:0; }
      }
    `;
    document.head.appendChild(style);
  }

  function updateHintButton(hint, owner) {
    if (!hint) return;
    const used = hint.dataset.used === "true";
    const locked = Boolean(owner && owner.closest && owner.closest(".section.section-locked"));
    const xp = getSharedXP();
    hint.disabled = used || locked || xp < HINT_COST_XP_2026;
    hint.textContent = used
      ? `Tipp genutzt · ${HINT_COST_XP_2026} XP`
      : xp < HINT_COST_XP_2026
        ? `Tipp · ${HINT_COST_XP_2026} XP · Zu wenig XP`
        : `Tipp kaufen · ${HINT_COST_XP_2026} XP`;
  }

  function refreshHintButtons() {
    if (typeof document === "undefined") return;
    document.querySelectorAll("#learnSections .a8-hint-button:not(.a8-dnd-hint)").forEach(hint => {
      updateHintButton(hint, hint.closest(".a8-choice-ui,.combo-row"));
    });
    document.querySelectorAll(".a8-dnd-shell").forEach(shell => {
      if (typeof shell.__a8SyncDnd === "function") shell.__a8SyncDnd();
    });
  }

  function spendHintXP() {
    const current = getSharedXP();
    if (current < HINT_COST_XP_2026) return false;
    setSharedXP(current - HINT_COST_XP_2026);
    if (typeof global.playSound === "function") global.playSound("hint");
    return true;
  }

  function syncSimpleChoice(select, ui) {
    if (!select || !ui) return;
    const value = select.value || "";
    const answer = select.dataset.answer || "";
    const isCorrect = select.classList.contains("correct");
    const isIncorrect = select.classList.contains("incorrect");
    ui.querySelectorAll(".a8-choice-option").forEach(button => {
      const selected = button.dataset.value === value;
      button.classList.toggle("selected", selected);
      button.classList.toggle("correct", selected && isCorrect);
      button.classList.toggle("wrong", selected && isIncorrect);
      button.classList.toggle("correct-answer", isIncorrect && button.dataset.value === answer);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function resetSimpleChoice(select, ui) {
    if (!select || !ui) return;
    ui.querySelectorAll(".a8-choice-option").forEach(button => {
      button.classList.remove("removed", "correct", "wrong", "correct-answer");
      button.disabled = false;
    });
    const hint = ui.querySelector(".a8-hint-button");
    if (hint) hint.dataset.used = "false";
    const note = ui.querySelector(".a8-hint-note");
    if (note) note.textContent = "";
    syncSimpleChoice(select, ui);
    updateHintButton(hint, ui);
  }

  function upgradeSimpleSelect(select) {
    if (!select || select.dataset.a8Buttonized === "true") return;
    select.dataset.a8Buttonized = "true";
    select.classList.add("a8-native-select");
    const options = Array.from(select.options).filter(option => option.value);
    if (!options.length) return;

    const ui = document.createElement("div");
    ui.className = "a8-choice-ui";
    const optionWrap = document.createElement("div");
    optionWrap.className = "a8-choice-options";
    options.forEach(option => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "a8-choice-option";
      button.dataset.value = option.value;
      button.textContent = option.textContent || option.value;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", event => {
        event.preventDefault();
        if (button.classList.contains("removed")) return;
        select.value = button.dataset.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        syncSimpleChoice(select, ui);
      });
      optionWrap.appendChild(button);
    });

    const hintRow = document.createElement("div");
    hintRow.className = "a8-hint-row";
    const hint = document.createElement("button");
    hint.type = "button";
    hint.className = "a8-hint-button";
    hint.dataset.used = "false";
    const note = document.createElement("span");
    note.className = "a8-hint-note";
    hint.addEventListener("click", event => {
      event.preventDefault();
      if (hint.dataset.used === "true" || hint.disabled) return;
      const answer = select.dataset.answer || "";
      const candidates = Array.from(optionWrap.querySelectorAll(".a8-choice-option")).filter(button =>
        button.dataset.value !== answer && button.dataset.value !== select.value && !button.classList.contains("removed")
      );
      if (!candidates.length || !spendHintXP()) return;
      const removed = candidates[Math.floor(Math.random() * candidates.length)];
      removed.classList.add("removed");
      removed.disabled = true;
      hint.dataset.used = "true";
      note.textContent = "Eine falsche Antwort wurde entfernt.";
      updateHintButton(hint, ui);
    });
    hintRow.appendChild(hint);
    hintRow.appendChild(note);
    ui.appendChild(optionWrap);
    ui.appendChild(hintRow);
    select.parentNode.insertBefore(ui, select);

    new MutationObserver(() => syncSimpleChoice(select, ui)).observe(select, { attributes: true, attributeFilter: ["class"] });
    syncSimpleChoice(select, ui);
    updateHintButton(hint, ui);
  }

  const COMBO_MODIFIER_OPTIONS = ["Ctrl", "Shift", "Alt", "AltGr", "Win"];

  function uniqueComboValues(values) {
    const seen = new Set();
    return values.filter(value => {
      const clean = String(value || "").trim();
      if (!clean || seen.has(clean)) return false;
      seen.add(clean);
      return true;
    });
  }

  function compactComboCandidates(answer, preferred, fallback, limit = 6) {
    const result = [];
    const add = value => {
      const clean = String(value || "").trim();
      if (!clean || result.includes(clean)) return;
      result.push(clean);
    };
    add(answer);
    preferred.forEach(add);
    fallback.forEach(add);
    return result.slice(0, Math.max(2, limit));
  }

  function writeComboSelectOptions(select, values) {
    if (!select) return;
    const current = select.value || "";
    const answer = select.dataset.answer || "";
    const labels = new Map(Array.from(select.options).map(option => [option.value, option.textContent || option.value]));
    const finalValues = uniqueComboValues([...values, answer]);
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "auswählen";
    select.appendChild(placeholder);
    finalValues.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = labels.get(value) || value;
      select.appendChild(option);
    });
    select.value = finalValues.includes(current) ? current : "";
  }

  function upgradeComboRow(row) {
    if (!row || row.dataset.a8ComboFiltered === "true") return;
    const selects = Array.from(row.querySelectorAll(".combo-slot select"));
    if (!selects.length) return;
    row.dataset.a8ComboFiltered = "true";
    row.classList.add("a8-filtered-combo");
    row.querySelectorAll(".a8-combo-slot-button,.a8-combo-controls").forEach(node => node.remove());

    const section = row.closest(".section");
    const sectionSelects = Array.from(section?.querySelectorAll(".combo-row .combo-slot select") || selects);
    const sectionAnswers = sectionSelects.map(select => select.dataset.answer || "").filter(Boolean);
    const terminalPool = uniqueComboValues(sectionAnswers.filter(value => !COMBO_MODIFIER_OPTIONS.includes(value) && !value.includes("+")));
    const wholeShortcutPool = uniqueComboValues(sectionAnswers.filter(value => value.includes("+")));
    const atomicRow = selects.every(select => !(select.dataset.answer || "").includes("+"));
    const originalBySelect = new Map(selects.map(select => [select, Array.from(select.options).map(option => option.value).filter(Boolean)]));

    function baseCandidates(select, index) {
      const answer = select.dataset.answer || "";
      const original = originalBySelect.get(select) || [];
      if (!atomicRow) return compactComboCandidates(answer, wholeShortcutPool, original, 5);
      if (index === 0) return compactComboCandidates(answer, COMBO_MODIFIER_OPTIONS, original, 5);
      if (index < selects.length - 1) return compactComboCandidates(answer, COMBO_MODIFIER_OPTIONS, original, 5);
      return compactComboCandidates(answer, terminalPool, original.filter(value => !COMBO_MODIFIER_OPTIONS.includes(value)), 6);
    }

    selects.forEach((select, index) => {
      select.classList.remove("a8-native-select");
      select.dataset.a8ComboSelect = "true";
      const values = baseCandidates(select, index);
      writeComboSelectOptions(select, values);
      select.__a8BaseComboValues = values.slice();
    });

    const hintRow = document.createElement("div");
    hintRow.className = "a8-hint-row a8-combo-select-hint";
    const hint = document.createElement("button");
    hint.type = "button";
    hint.className = "a8-hint-button";
    hint.dataset.used = "false";
    const note = document.createElement("span");
    note.className = "a8-hint-note";
    hintRow.appendChild(hint);
    hintRow.appendChild(note);
    row.appendChild(hintRow);

    function hintTarget() {
      return selects.find(select => !select.value)
        || selects.find(select => select.classList.contains("incorrect"))
        || selects[selects.length - 1];
    }

    function syncCombo() {
      const xp = getSharedXP();
      const used = hint.dataset.used === "true";
      hint.disabled = used || xp < HINT_COST_XP_2026;
      hint.textContent = used
        ? `Tipp genutzt · ${HINT_COST_XP_2026} XP`
        : xp < HINT_COST_XP_2026
          ? `Tipp · ${HINT_COST_XP_2026} XP · Zu wenig XP`
          : `Tipp kaufen · ${HINT_COST_XP_2026} XP`;
    }

    hint.addEventListener("click", event => {
      event.preventDefault();
      if (hint.disabled || hint.dataset.used === "true") return;
      const select = hintTarget();
      if (!select) return;
      const answer = select.dataset.answer || "";
      const wrongOptions = Array.from(select.options).filter(option => option.value && option.value !== answer && option.value !== select.value);
      if (!wrongOptions.length || !spendHintXP()) return;
      wrongOptions[Math.floor(Math.random() * wrongOptions.length)].remove();
      hint.dataset.used = "true";
      note.textContent = "Eine falsche Auswahl wurde entfernt.";
      syncCombo();
    });

    row.__a8SyncCombo = syncCombo;
    row.__a8ResetCombo = () => {
      selects.forEach(select => {
        writeComboSelectOptions(select, select.__a8BaseComboValues || []);
        select.classList.remove("correct", "incorrect");
      });
      hint.dataset.used = "false";
      note.textContent = "";
      syncCombo();
    };
    syncCombo();
  }

  function upgradeDndPool(pool) {
    if (!pool || pool.dataset.a8DndUpgraded === "true") return;
    const targetsWrap = pool.nextElementSibling;
    if (!targetsWrap || !targetsWrap.classList.contains("dnd-targets")) return;
    const targets = Array.from(targetsWrap.querySelectorAll(".dnd-target"));
    const tokens = Array.from(pool.querySelectorAll(".dnd-token"));
    if (!targets.length || !tokens.length) return;
    pool.dataset.a8DndUpgraded = "true";

    const shell = document.createElement("div");
    shell.className = "a8-dnd-shell";
    pool.parentNode.insertBefore(shell, pool);
    shell.appendChild(pool);
    shell.appendChild(targetsWrap);

    const head = document.createElement("div");
    head.className = "a8-dnd-head";
    const help = document.createElement("p");
    help.className = "a8-dnd-help";
    help.textContent = "Tippe oder ziehe das passende Kürzel. Verwendete Kürzel verschwinden.";
    const progress = document.createElement("span");
    progress.className = "a8-dnd-progress";
    head.appendChild(help);
    head.appendChild(progress);
    shell.insertBefore(head, pool);

    const hintRow = document.createElement("div");
    hintRow.className = "a8-hint-row";
    const hint = document.createElement("button");
    hint.type = "button";
    hint.className = "a8-hint-button a8-dnd-hint";
    const hintNote = document.createElement("span");
    hintNote.className = "a8-hint-note";
    hintRow.appendChild(hint);
    hintRow.appendChild(hintNote);
    shell.insertBefore(hintRow, targetsWrap);

    const done = document.createElement("div");
    done.className = "a8-dnd-done";
    done.textContent = "✓ Alles zugeordnet. Prüfe kurz deine Auswahl und klicke dann auf „Abschnitt prüfen“.";
    shell.appendChild(done);
    const assignments = document.createElement("div");
    assignments.className = "a8-dnd-assignments";
    shell.appendChild(assignments);

    const hintUsed = new Set();
    const hintRemoved = new Map();
    let activeIndex = Math.max(0, targets.findIndex(target => !(target.querySelector(".drop-slot")?.dataset.value)));
    if (activeIndex < 0) activeIndex = 0;
    let syncing = false;

    function slotFor(target) {
      return target ? target.querySelector(".drop-slot") : null;
    }

    function valueFor(target) {
      const slot = slotFor(target);
      return slot ? (slot.dataset.value || "") : "";
    }

    function nextOpenIndex(fromIndex) {
      for (let offset = 1; offset <= targets.length; offset += 1) {
        const index = (fromIndex + offset) % targets.length;
        if (!valueFor(targets[index])) return index;
      }
      return -1;
    }

    function clearTarget(target) {
      const slot = slotFor(target);
      if (!slot) return;
      slot.textContent = "";
      delete slot.dataset.value;
      slot.classList.remove("correct", "incorrect");
      target.classList.remove("correct", "incorrect");
      const wrap = target.closest(".task-field");
      if (wrap) wrap.classList.remove("correct", "incorrect");
    }

    function assignValue(target, value) {
      if (!target || !value) return;
      const slot = slotFor(target);
      if (!slot) return;
      slot.textContent = value;
      slot.dataset.value = value;
      slot.classList.remove("correct", "incorrect");
      target.classList.remove("correct", "incorrect");
      const wrap = target.closest(".task-field");
      if (wrap) wrap.classList.remove("correct", "incorrect");
      const current = targets.indexOf(target);
      const next = nextOpenIndex(current);
      if (next >= 0) activeIndex = next;
      sync();
    }

    function sync() {
      if (syncing) return;
      syncing = true;
      const values = targets.map(valueFor);
      const used = new Set(values.filter(Boolean));
      const filled = values.filter(Boolean).length;
      if (!values[activeIndex]) {
      } else {
        const next = nextOpenIndex(activeIndex);
        if (next >= 0) activeIndex = next;
      }
      const allFilled = filled === targets.length;
      targets.forEach((target, index) => target.classList.toggle("a8-active", !allFilled && index === activeIndex));
      progress.textContent = `${filled} / ${targets.length}`;
      done.classList.toggle("visible", allFilled);

      const currentRemoved = hintRemoved.get(activeIndex) || "";
      tokens.forEach(token => {
        const value = token.dataset.value || "";
        token.classList.toggle("a8-used", used.has(value));
        token.classList.toggle("a8-hint-hidden", Boolean(currentRemoved && currentRemoved === value && !used.has(value)));
      });

      assignments.innerHTML = "";
      targets.forEach((target, index) => {
        const value = valueFor(target);
        if (!value) return;
        const label = target.querySelector(".question-text")?.textContent?.trim() || `Zuordnung ${index + 1}`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "a8-dnd-assignment";
        button.innerHTML = `<span>${label}</span> · <strong>${value}</strong>`;
        button.classList.toggle("correct", target.classList.contains("correct"));
        button.classList.toggle("incorrect", target.classList.contains("incorrect"));
        button.title = "Zum Ändern anklicken";
        button.addEventListener("click", () => {
          clearTarget(target);
          activeIndex = index;
          sync();
        });
        assignments.appendChild(button);
      });

      const usedHint = hintUsed.has(activeIndex);
      const xp = getSharedXP();
      hint.dataset.used = usedHint ? "true" : "false";
      hint.disabled = allFilled || usedHint || xp < HINT_COST_XP_2026;
      hint.textContent = usedHint
        ? `Tipp genutzt · ${HINT_COST_XP_2026} XP`
        : xp < HINT_COST_XP_2026
          ? `Tipp · ${HINT_COST_XP_2026} XP · Zu wenig XP`
          : `Tipp kaufen · ${HINT_COST_XP_2026} XP`;
      hintNote.textContent = usedHint ? "Eine falsche Möglichkeit wurde entfernt." : "";
      syncing = false;
    }

    tokens.forEach(token => {
      token.setAttribute("role", "button");
      token.setAttribute("tabindex", "0");
      const choose = () => {
        if (token.classList.contains("a8-used") || token.classList.contains("a8-hint-hidden")) return;
        assignValue(targets[activeIndex], token.dataset.value || "");
      };
      token.addEventListener("click", choose);
      token.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        choose();
      });
    });

    hint.addEventListener("click", event => {
      event.preventDefault();
      if (hint.disabled || hintUsed.has(activeIndex)) return;
      const target = targets[activeIndex];
      const answer = target?.dataset.answer || "";
      const used = new Set(targets.map(valueFor).filter(Boolean));
      const candidates = tokens.filter(token => {
        const value = token.dataset.value || "";
        return value && value !== answer && !used.has(value);
      });
      if (!candidates.length || !spendHintXP()) return;
      const removed = candidates[Math.floor(Math.random() * candidates.length)];
      hintUsed.add(activeIndex);
      hintRemoved.set(activeIndex, removed.dataset.value || "");
      sync();
    });

    new MutationObserver(() => sync()).observe(targetsWrap, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-value"]
    });

    shell.__a8SyncDnd = sync;
    shell.__a8ResetDnd = () => {
      activeIndex = 0;
      hintUsed.clear();
      hintRemoved.clear();
      sync();
    };
    sync();
  }

  function upgradeAllInteractiveUI() {
    if (typeof document === "undefined") return;
    const host = document.getElementById("learnSections");
    if (!host) return;
    host.querySelectorAll(".combo-row").forEach(upgradeComboRow);
    host.querySelectorAll("select:not([data-a8-buttonized='true'])").forEach(select => {
      if (!select.closest(".combo-row")) upgradeSimpleSelect(select);
    });
    host.querySelectorAll(".dnd-pool:not([data-a8-dnd-upgraded='true'])").forEach(upgradeDndPool);
  }

  function showXpEarned(section, amount) {
    if (!section || amount <= 0) return;
    const result = section.querySelector(".result-text") || section.querySelector(".card-header") || section;
    const old = result.querySelector?.(".a8-xp-earned");
    if (old) old.remove();
    const badge = document.createElement("span");
    badge.className = "a8-xp-earned";
    badge.textContent = `+${amount} XP`;
    result.appendChild(badge);
  }

  function showFloatingXp(element, amount) {
    if (!element || amount <= 0) return;
    const rect = element.getBoundingClientRect();
    const pop = document.createElement("span");
    pop.className = "a8-xp-float";
    pop.textContent = `+${amount} XP`;
    pop.style.left = `${Math.max(8, rect.left + rect.width / 2 - 25)}px`;
    pop.style.top = `${Math.max(8, rect.top)}px`;
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 900);
  }

  function awardCheckedAnswers(section) {
    if (!section) return 0;
    const fields = Array.from(section.querySelectorAll("[data-answer], .dnd-target"));
    let newlyCorrect = 0;
    fields.forEach(field => {
      if (!field.classList.contains("correct") || field.dataset.a8XpAwarded === "true") return;
      field.dataset.a8XpAwarded = "true";
      newlyCorrect += 1;
    });
    const xp = newlyCorrect * XP_PER_CORRECT_2026;
    if (xp > 0) {
      addSharedXP(xp);
      showXpEarned(section, xp);
    }
    return xp;
  }

  function resetAttemptXp(section) {
    if (!section) return;
    section.querySelectorAll("[data-a8-xp-awarded='true']").forEach(field => delete field.dataset.a8XpAwarded);
    const badge = section.querySelector(".a8-xp-earned");
    if (badge) badge.remove();
  }

  function install2026Interactions() {
    if (typeof document === "undefined" || global.__shortcutQuest2026InteractionsInstalled) return;
    global.__shortcutQuest2026InteractionsInstalled = true;
    injectChoiceStyles();
    renderSharedXP();
    upgradeAllInteractiveUI();
    refreshHintButtons();

    const navHelp = document.querySelector("#learnView .nav-card > .small");
    if (navHelp) navHelp.textContent = `Richtig = +${XP_PER_CORRECT_2026} XP. Perfekte Abschnitte bringen zusätzlich Coins.`;

    const host = document.getElementById("learnSections");
    if (host) {
      let upgradeQueued = false;
      const nodeNeedsUpgrade = node => {
        if (!(node instanceof Element)) return false;
        if (node.matches(".combo-row:not([data-a8-combo-filtered='true']), .dnd-pool:not([data-a8-dnd-upgraded='true'])")) return true;
        if (node.matches("select:not([data-a8-buttonized='true'])") && !node.closest(".combo-row[data-a8-combo-filtered='true']")) return true;
        if (node.querySelector(".combo-row:not([data-a8-combo-filtered='true']), .dnd-pool:not([data-a8-dnd-upgraded='true'])")) return true;
        return Array.from(node.querySelectorAll("select:not([data-a8-buttonized='true'])"))
          .some(select => !select.closest(".combo-row[data-a8-combo-filtered='true']"));
      };
      new MutationObserver(records => {
        if (upgradeQueued) return;
        const needsUpgrade = records.some(record => Array.from(record.addedNodes).some(nodeNeedsUpgrade));
        if (!needsUpgrade) return;
        upgradeQueued = true;
        queueMicrotask(() => {
          upgradeQueued = false;
          upgradeAllInteractiveUI();
          refreshHintButtons();
        });
      }).observe(host, { childList: true, subtree: true });
    }

    document.addEventListener("click", event => {
      const reset = event.target && event.target.closest ? event.target.closest(".reset-section") : null;
      if (reset) {
        const section = reset.closest(".section");
        setTimeout(() => {
          resetAttemptXp(section);
          section?.querySelectorAll("select.a8-native-select").forEach(select => {
            if (select.closest(".combo-row")) return;
            const ui = select.previousElementSibling?.classList.contains("a8-choice-ui") ? select.previousElementSibling : null;
            if (ui) resetSimpleChoice(select, ui);
          });
          section?.querySelectorAll(".combo-row").forEach(row => row.__a8ResetCombo?.());
          section?.querySelectorAll(".a8-dnd-shell").forEach(shell => shell.__a8ResetDnd?.());
        }, 0);
      }

      const check = event.target && event.target.closest ? event.target.closest(".check-section") : null;
      if (check) {
        const section = check.closest(".section");
        setTimeout(() => {
          awardCheckedAnswers(section);
          upgradeAllInteractiveUI();
          refreshHintButtons();
          section?.querySelectorAll(".combo-row").forEach(row => row.__a8SyncCombo?.());
          section?.querySelectorAll(".a8-dnd-shell").forEach(shell => shell.__a8SyncDnd?.());
        }, 0);
      }

      const fastOption = event.target && event.target.closest ? event.target.closest(".fast-paced-option") : null;
      if (fastOption) {
        setTimeout(() => {
          if (!fastOption.classList.contains("correct") || fastOption.dataset.a8XpAwarded === "true") return;
          fastOption.dataset.a8XpAwarded = "true";
          addSharedXP(XP_PER_CORRECT_2026);
          showFloatingXp(fastOption, XP_PER_CORRECT_2026);
        }, 0);
      }
    });

    global.addEventListener("storage", event => {
      if (event.key === XP_STORAGE_KEY_2026) {
        renderSharedXP();
        refreshHintButtons();
      }
    });

    global.SHORTCUT_QUEST_2026_HINTS = Object.freeze({
      costXP: HINT_COST_XP_2026,
      storageKey: XP_STORAGE_KEY_2026,
      behavior: "remove-one-wrong-answer"
    });
    global.SHORTCUT_QUEST_2026_XP = Object.freeze({
      perCorrect: XP_PER_CORRECT_2026,
      storageKey: XP_STORAGE_KEY_2026
    });
  }

  function install2026SectionStageNav() {
    if (typeof document === "undefined") return;
    const tabsHost = document.getElementById("sectionTabs");
    if (!tabsHost || tabsHost.dataset.stageNavInstalled === "true") return;
    const navCard = tabsHost.closest(".nav-card");
    if (!navCard) return;

    const stageNav = document.createElement("div");
    stageNav.id = "a8SectionStageNav";
    stageNav.className = "section-stage-nav";

    const controls = document.createElement("div");
    controls.className = "section-stage-controls";
    controls.setAttribute("aria-label", "Abschnittsgruppen");
    stageNav.appendChild(controls);

    const divider = document.createElement("span");
    divider.className = "section-stage-divider";
    divider.setAttribute("aria-hidden", "true");
    stageNav.appendChild(divider);

    navCard.insertBefore(stageNav, tabsHost);
    stageNav.appendChild(tabsHost);

    const rewardHint = navCard.querySelector(":scope > .small");
    if (rewardHint) {
      rewardHint.classList.add("section-reward-hint");
      rewardHint.textContent = "+5 XP pro richtige Antwort · Perfekt = Bonus-Coins";
      navCard.insertAdjacentElement("afterend", rewardHint);
    }

    const sectionNumber = tab => Number(tab?.dataset?.sectionId || tab?.dataset?.goto || 0);
    let activeStage = 0;

    const stageButtons = Array.from({ length: 3 }, (_, stageIndex) => {
      const start = stageIndex * 10 + 1;
      const end = start + 9;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "section-stage-button";
      button.dataset.stage = String(stageIndex);
      button.textContent = String(end);
      button.title = `Abschnitte ${start}–${end}`;
      button.addEventListener("click", () => {
        if (button.disabled) return;
        showStage(stageIndex, true);
      });
      controls.appendChild(button);
      return button;
    });

    const normalizeTabLabels = tabs => {
      tabs.forEach(tab => {
        const label = tab.querySelector(".section-tab-label");
        const number = sectionNumber(tab);
        if (!label || !number) return;
        const targetLabel = String(number);
        if (label.textContent !== targetLabel) label.textContent = targetLabel;
        tab.setAttribute("aria-label", `Abschnitt ${number}`);
        tab.title = `Abschnitt ${number}`;
      });
    };

    const updateStageButtons = tabs => {
      stageButtons.forEach((button, stageIndex) => {
        const start = stageIndex * 10 + 1;
        const end = start + 9;
        const stageTabs = tabs.filter(tab => {
          const number = sectionNumber(tab);
          return number >= start && number <= end;
        });
        const completed = stageTabs.filter(tab => tab.classList.contains("completed")).length;
        const available = stageTabs.length > 0;
        button.disabled = !available;
        button.classList.toggle("active", stageIndex === activeStage);
        button.classList.toggle("completed", completed >= 10);
        button.setAttribute("aria-label", available
          ? `Abschnitte ${start} bis ${end}, ${completed} von 10 abgeschlossen`
          : `Abschnitte ${start} bis ${end}, noch gesperrt`);
      });
    };

    function showStage(stageIndex, selectFirst = false) {
      const tabs = Array.from(tabsHost.querySelectorAll(".section-tab"));
      const start = stageIndex * 10 + 1;
      const end = start + 9;
      const visibleTabs = tabs.filter(tab => {
        const number = sectionNumber(tab);
        return number >= start && number <= end;
      });
      if (!visibleTabs.length) return false;

      activeStage = stageIndex;
      tabsHost.dataset.stage = String(stageIndex + 1);
      tabs.forEach(tab => {
        const number = sectionNumber(tab);
        tab.hidden = number < start || number > end;
      });
      normalizeTabLabels(tabs);
      updateStageButtons(tabs);

      if (selectFirst && !visibleTabs.some(tab => tab.classList.contains("active"))) {
        visibleTabs[0].click();
      }
      return true;
    }

    const initialTabs = Array.from(tabsHost.querySelectorAll(".section-tab"));
    normalizeTabLabels(initialTabs);
    const initialActive = initialTabs.find(tab => tab.classList.contains("active"));
    const initialNumber = sectionNumber(initialActive) || sectionNumber(initialTabs[0]) || 1;
    activeStage = Math.max(0, Math.min(2, Math.floor((initialNumber - 1) / 10)));
    let previousMaxStage = initialTabs.length
      ? Math.max(...initialTabs.map(sectionNumber).filter(Boolean).map(number => Math.floor((number - 1) / 10)))
      : 0;
    showStage(activeStage, false);

    tabsHost.addEventListener("click", event => {
      const tab = event.target.closest(".section-tab");
      if (!tab) return;
      const number = sectionNumber(tab);
      if (!number) return;
      activeStage = Math.floor((number - 1) / 10);
      setTimeout(() => {
        const tabs = Array.from(tabsHost.querySelectorAll(".section-tab"));
        normalizeTabLabels(tabs);
        updateStageButtons(tabs);
      }, 0);
    });

    const observer = new MutationObserver(() => {
      const tabs = Array.from(tabsHost.querySelectorAll(".section-tab"));
      if (!tabs.length) return;
      normalizeTabLabels(tabs);
      const maxStage = Math.max(...tabs.map(sectionNumber).filter(Boolean).map(number => Math.floor((number - 1) / 10)));
      if (maxStage > previousMaxStage) {
        previousMaxStage = maxStage;
      }
      showStage(activeStage, false);
    });
    observer.observe(tabsHost, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    tabsHost.dataset.stageNavInstalled = "true";
  }

  if (typeof document !== "undefined") {
    if (!document.getElementById("shortcutQuestModernUi")) {
      const modernUi = document.createElement("link");
      modernUi.id = "shortcutQuestModernUi";
      modernUi.rel = "stylesheet";
      modernUi.href = "modern-ui.css";
      document.head.appendChild(modernUi);
    }
    if (!document.getElementById("shortcutQuestModernExercises")) {
      const modernExercises = document.createElement("link");
      modernExercises.id = "shortcutQuestModernExercises";
      modernExercises.rel = "stylesheet";
      modernExercises.href = "modern-exercises.css";
      document.head.appendChild(modernExercises);
    }
    if (!document.getElementById("shortcutQuestModernGame")) {
      const modernGame = document.createElement("link");
      modernGame.id = "shortcutQuestModernGame";
      modernGame.rel = "stylesheet";
      modernGame.href = "modern-game.css";
      document.head.appendChild(modernGame);
    }
    if (!document.getElementById("shortcutQuestModernBattle")) {
      const modernBattle = document.createElement("link");
      modernBattle.id = "shortcutQuestModernBattle";
      modernBattle.rel = "stylesheet";
      modernBattle.href = "modern-battle.css";
      document.head.appendChild(modernBattle);
    }
    document.title = "Shortcut Quest 2026";
    document.documentElement.dataset.edition = "tk2-2026";
    const title = document.querySelector("header .title");
    if (title) {
      title.textContent = "Shortcut Quest 2026";
    }
    const trainingNav = document.querySelector('[data-view="learn"]');
    if (trainingNav) {
      const labelNode = Array.from(trainingNav.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (labelNode) labelNode.textContent = " Training";
    }

    document.addEventListener("click", event => {
      const check = event.target && event.target.closest ? event.target.closest(".check-section") : null;
      if (!check) return;
      const section = check.closest(".section");
      if (!section) return;
      section.querySelectorAll('input[data-answer]').forEach(input => {
        input.value = String(input.value || "").trim().replace(/\s*\+\s*/g, "+");
      });
    }, true);

    render2026Progress(global.__shortcutQuest2026InitialState || {});

  function installCompactHeaderStats() {
    if (typeof document === "undefined" || global.__shortcutQuestCompactHeaderStatsInstalled) return;
    const header = document.querySelector("header");
    const topNav = document.getElementById("topNav");
    const headerRight = header && header.querySelector(".header-right");
    if (!header || !topNav || !headerRight) return;

    const compactQuery = typeof global.matchMedia === "function"
      ? global.matchMedia("(max-width: 1180px)")
      : null;

    const sync = () => {
      const compact = compactQuery ? compactQuery.matches : Number(global.innerWidth || 0) <= 1180;
      if (compact) {
        if (headerRight.parentElement !== topNav) topNav.appendChild(headerRight);
      } else if (headerRight.parentElement !== header) {
        header.appendChild(headerRight);
      }
    };

    sync();
    if (compactQuery) {
      if (typeof compactQuery.addEventListener === "function") compactQuery.addEventListener("change", sync);
      else if (typeof compactQuery.addListener === "function") compactQuery.addListener(sync);
    } else {
      global.addEventListener("resize", sync);
    }
    global.__shortcutQuestCompactHeaderStatsInstalled = true;
  }

  function installTargetedHintCoverage() {
    if (typeof document === "undefined") return;
    const narrativeIds = new Set(["1", "15", "16", "28"]);
    const recallIds = new Set(["20"]);
    const enabledIds = Object.freeze(["1","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","25","26","27","28"]);
    const excludedIds = Object.freeze(["2","21","22","23","24","29","30"]);

    if (!document.getElementById("a8TargetedHintStyles")) {
      const style = document.createElement("style");
      style.id = "a8TargetedHintStyles";
      style.textContent = `
        .narrative-option.a8-targeted-hint-removed {
          opacity: .22;
          text-decoration: line-through;
          pointer-events: none;
        }
        .a8-targeted-hint-row { margin-top: .7rem; }
      `;
      document.head.appendChild(style);
    }

    const byId = id => Array.isArray(global.LEARN_SECTION_BLUEPRINTS)
      ? global.LEARN_SECTION_BLUEPRINTS.find(section => String(section && section.id) === String(id))
      : null;

    function spendHintXP() {
      if (getSharedXP() < HINT_COST_XP_2026) return false;
      setSharedXP(getSharedXP() - HINT_COST_XP_2026);
      return true;
    }

    function resetHintRow(row, section) {
      if (!row) return;
      const hint = row.querySelector(".a8-targeted-hint");
      const note = row.querySelector(".a8-hint-note");
      if (hint) {
        hint.dataset.used = "false";
        updateHintButton(hint, section);
      }
      if (note) note.textContent = "";
    }

    narrativeIds.forEach(sectionId => {
      const section = document.querySelector(`.section[data-section="${sectionId}"]`);
      const blueprint = byId(sectionId);
      if (!section || !blueprint || !blueprint.narrative || !Array.isArray(blueprint.narrative.entries)) return;
      const cards = Array.from(section.querySelectorAll(".narrative-card"));
      cards.forEach((card, index) => {
        if (card.querySelector(".a8-targeted-hint-row")) return;
        const entry = blueprint.narrative.entries[index];
        const optionsRow = card.querySelector(".narrative-options");
        if (!entry || !optionsRow) return;

        const hintRow = document.createElement("div");
        hintRow.className = "a8-hint-row a8-targeted-hint-row";
        const hint = document.createElement("button");
        hint.type = "button";
        hint.className = "a8-hint-button a8-targeted-hint";
        hint.dataset.used = "false";
        const note = document.createElement("span");
        note.className = "a8-hint-note";
        hintRow.appendChild(hint);
        hintRow.appendChild(note);
        card.appendChild(hintRow);
        updateHintButton(hint, section);

        hint.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          if (hint.dataset.used === "true") return;
          const answers = new Set((entry.answers || []).map(String));
          const wrong = Array.from(optionsRow.querySelectorAll(".narrative-option"))
            .find(button => !button.disabled && !button.classList.contains("a8-targeted-hint-removed") && !answers.has(String(button.dataset.value || button.textContent || "")));
          if (!wrong) {
            note.textContent = "Keine falsche Möglichkeit mehr übrig.";
            return;
          }
          if (!spendHintXP()) {
            updateHintButton(hint, section);
            return;
          }
          wrong.disabled = true;
          wrong.classList.add("a8-targeted-hint-removed");
          hint.dataset.used = "true";
          note.textContent = "Eine falsche Möglichkeit wurde entfernt.";
          updateHintButton(hint, section);
        });
      });
    });

    recallIds.forEach(sectionId => {
      const section = document.querySelector(`.section[data-section="${sectionId}"]`);
      if (!section) return;
      section.querySelectorAll(".task-field input[data-answer]").forEach(input => {
        const field = input.closest(".task-field");
        if (!field || field.querySelector(".a8-targeted-hint-row")) return;
        const hintRow = document.createElement("div");
        hintRow.className = "a8-hint-row a8-targeted-hint-row";
        const hint = document.createElement("button");
        hint.type = "button";
        hint.className = "a8-hint-button a8-targeted-hint";
        hint.dataset.used = "false";
        const note = document.createElement("span");
        note.className = "a8-hint-note";
        hintRow.appendChild(hint);
        hintRow.appendChild(note);
        field.appendChild(hintRow);
        updateHintButton(hint, section);

        hint.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          if (hint.dataset.used === "true") return;
          const answer = String(input.dataset.answer || "").trim();
          const firstKey = answer.split("+")[0].trim();
          if (!firstKey) {
            note.textContent = "Kein Tipp verfügbar.";
            return;
          }
          if (!spendHintXP()) {
            updateHintButton(hint, section);
            return;
          }
          hint.dataset.used = "true";
          note.textContent = `Start: ${firstKey} + …`;
          updateHintButton(hint, section);
        });
      });
    });

    const host = document.getElementById("learnSections");
    if (host && host.dataset.targetedHintResetBound !== "true") {
      host.dataset.targetedHintResetBound = "true";
      host.addEventListener("click", event => {
        const reset = event.target.closest(".reset-section");
        if (!reset) return;
        const section = reset.closest(".section");
        const sectionId = String(section && section.dataset.section || "");
        if (!narrativeIds.has(sectionId) && !recallIds.has(sectionId)) return;
        setTimeout(() => {
          section.querySelectorAll(".narrative-option.a8-targeted-hint-removed").forEach(option => {
            option.disabled = false;
            option.classList.remove("a8-targeted-hint-removed");
          });
          section.querySelectorAll(".a8-targeted-hint-row").forEach(row => resetHintRow(row, section));
        }, 0);
      });
    }

    global.SHORTCUT_QUEST_2026_HINT_COVERAGE = Object.freeze({ enabledSectionIds: enabledIds, excludedSectionIds: excludedIds });
  }

    const installAfterRuntime = () => queueMicrotask(() => {
      install2026EconomyOverrides();
      install2026Interactions();
      installTargetedHintCoverage();
      install2026SectionStageNav();
      installCompactHeaderStats();
    });
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", installAfterRuntime, { once: true });
    } else {
      installAfterRuntime();
    }
  }

  const data = [
    { label: "Kopieren (CTRL+C)", keys: ["Control", "C"] },
    { label: "Ausschneiden (CTRL+X)", keys: ["Control", "X"] },
    { label: "Einfügen (CTRL+V)", keys: ["Control", "V"] },
    { label: "Speichern (CTRL+S)", keys: ["Control", "S"] },
    { label: "Rückgängig (CTRL+Z)", keys: ["Control", "Z"] },
    { label: "Wiederholen (CTRL+Y)", keys: ["Control", "Y"] },
    { label: "Alles markieren (CTRL+A)", keys: ["Control", "A"] },
    { label: "Drucken (CTRL+P)", keys: ["Control", "P"] },
    { label: "Suchen (CTRL+F)", keys: ["Control", "F"] },
    { label: "Datei öffnen (CTRL+O)", keys: ["Control", "O"] },
    { label: "Zum Dokumentanfang (CTRL+Home)", keys: ["Control", "Home"] },
    { label: "Zum Dokumentende (CTRL+Ende)", keys: ["Control", "End"] }
  ];

  global.SKILL_HOTKEY_BLUEPRINTS = data;
})(typeof window !== "undefined" ? window : globalThis);