(function () {
  'use strict';

  const SETTINGS_KEY = 'shortcutQuest_2026_motion_v1';
  const root = document.documentElement;
  let motionEnabled = true;
  let settingsDialog = null;
  let purchaseObserver = null;

  const styles = `
    :root {
      --a8-motion-fast: 180ms;
      --a8-motion-med: 360ms;
      --a8-motion-slow: 620ms;
      --a8-motion-ease: cubic-bezier(.22,.78,.2,1);
      --a8-motion-pop: cubic-bezier(.18,.88,.32,1.18);
    }

    .a8-settings-btn {
      width: 2.4rem;
      height: 2.4rem;
      display: inline-grid;
      place-items: center;
      border-radius: .8rem;
      border: 1px solid rgba(148,163,184,.28);
      background: rgba(15,23,42,.55);
      color: var(--text);
      cursor: pointer;
      transition: transform var(--a8-motion-fast) var(--a8-motion-ease), border-color var(--a8-motion-fast) ease, background var(--a8-motion-fast) ease;
    }
    .a8-settings-btn:hover { transform: translateY(-1px); border-color: rgba(245,158,11,.55); background: rgba(245,158,11,.10); }
    .a8-settings-btn:active { transform: scale(.96); }
    .a8-settings-btn svg { width: 1.15rem; height: 1.15rem; }

    .a8-settings-backdrop {
      position: fixed;
      inset: 0;
      z-index: 500;
      display: grid;
      place-items: center;
      padding: 1rem;
      background: rgba(2,6,23,.68);
      backdrop-filter: blur(10px);
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--a8-motion-med) ease, visibility var(--a8-motion-med) ease;
    }
    .a8-settings-backdrop.open { opacity: 1; visibility: visible; }
    .a8-settings-panel {
      width: min(430px, 100%);
      border-radius: 1.2rem;
      border: 1px solid rgba(148,163,184,.28);
      background: linear-gradient(180deg, rgba(30,41,59,.98), rgba(15,23,42,.98));
      box-shadow: 0 28px 80px rgba(2,6,23,.55);
      transform: translateY(12px) scale(.97);
      opacity: 0;
      transition: transform var(--a8-motion-med) var(--a8-motion-ease), opacity var(--a8-motion-med) ease;
      overflow: hidden;
    }
    .a8-settings-backdrop.open .a8-settings-panel { transform: translateY(0) scale(1); opacity: 1; }
    .a8-settings-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1rem 1.1rem; border-bottom:1px solid rgba(148,163,184,.16); }
    .a8-settings-head h2 { margin:0; font-size:1.05rem; }
    .a8-settings-close { width:2rem; height:2rem; border-radius:.65rem; border:1px solid rgba(148,163,184,.24); background:rgba(15,23,42,.55); color:var(--text); cursor:pointer; font-size:1.25rem; line-height:1; }
    .a8-settings-body { padding:1rem 1.1rem 1.2rem; display:flex; flex-direction:column; gap:.8rem; }
    .a8-setting-row { display:grid; grid-template-columns:1fr auto; gap:1rem; align-items:center; padding:.9rem; border-radius:.9rem; background:rgba(15,23,42,.45); border:1px solid rgba(148,163,184,.16); }
    .a8-setting-copy strong { display:block; font-size:.95rem; }
    .a8-setting-copy span { display:block; margin-top:.2rem; color:var(--muted); font-size:.8rem; line-height:1.35; }
    .a8-switch { position:relative; width:3.15rem; height:1.8rem; flex:0 0 auto; }
    .a8-switch input { position:absolute; opacity:0; pointer-events:none; }
    .a8-switch-track { position:absolute; inset:0; border-radius:999px; background:rgba(100,116,139,.45); border:1px solid rgba(148,163,184,.28); cursor:pointer; transition:background var(--a8-motion-fast) ease, border-color var(--a8-motion-fast) ease; }
    .a8-switch-track::after { content:''; position:absolute; width:1.25rem; height:1.25rem; left:.22rem; top:.22rem; border-radius:50%; background:#e2e8f0; box-shadow:0 4px 12px rgba(2,6,23,.35); transition:transform var(--a8-motion-fast) var(--a8-motion-ease), background var(--a8-motion-fast) ease; }
    .a8-switch input:checked + .a8-switch-track { background:rgba(34,197,94,.35); border-color:rgba(74,222,128,.58); }
    .a8-switch input:checked + .a8-switch-track::after { transform:translateX(1.34rem); background:#dcfce7; }

    .coin-celebration { animation: a8CoinRise 1.45s var(--a8-motion-ease) forwards !important; will-change: transform, opacity; }
    .coin-main { width:82px !important; height:82px !important; animation:a8CoinPop .72s var(--a8-motion-pop) both !important; box-shadow:0 12px 38px rgba(245,158,11,.32), 0 0 0 1px rgba(255,248,220,.18) inset !important; }
    .coin-symbol { animation:a8CoinSymbol .58s var(--a8-motion-pop) both !important; }
    .coin-amount { animation:a8CoinAmount 1.32s var(--a8-motion-ease) both !important; font-size:1.02rem !important; letter-spacing:.01em; }
    .coin-spark { animation:a8CoinSpark .82s var(--a8-motion-ease) both !important; }
    .coin-badge-boost { animation:a8BadgeGain .68s var(--a8-motion-pop) !important; }
    .coin-badge-loss { animation:a8BadgeLoss .58s var(--a8-motion-ease) !important; }
    @keyframes a8CoinRise { 0%{opacity:0;transform:translate(-50%,-24%) scale(.92)} 15%{opacity:1} 70%{opacity:1;transform:translate(-50%,-80%) scale(1)} 100%{opacity:0;transform:translate(-50%,-118%) scale(.96)} }
    @keyframes a8CoinPop { 0%{transform:scale(.55) rotate(-7deg);filter:blur(2px)} 55%{transform:scale(1.07) rotate(2deg);filter:blur(0)} 100%{transform:scale(1) rotate(0)} }
    @keyframes a8CoinSymbol { 0%{opacity:0;transform:scale(.6) translateY(6px)} 60%{opacity:1;transform:scale(1.08) translateY(-1px)} 100%{opacity:1;transform:scale(1)} }
    @keyframes a8CoinAmount { 0%,12%{opacity:0;transform:translateY(12px)} 32%{opacity:1;transform:translateY(0)} 78%{opacity:1;transform:translateY(-4px)} 100%{opacity:0;transform:translateY(-16px)} }
    @keyframes a8CoinSpark { 0%{opacity:0;transform:translate(-50%,-50%) scale(.2)} 30%{opacity:.95} 100%{opacity:0;transform:translate(calc(-50% + var(--targetX)),calc(-50% + var(--targetY))) scale(.35)} }
    @keyframes a8BadgeGain { 0%{transform:scale(1)} 48%{transform:scale(1.1);box-shadow:0 0 0 7px rgba(245,158,11,.12)} 100%{transform:scale(1);box-shadow:none} }
    @keyframes a8BadgeLoss { 0%{transform:translateX(0)} 28%{transform:translateX(-3px)} 55%{transform:translateX(3px)} 100%{transform:translateX(0)} }

    #shopView.a8-purchase-active .shop-buy-btn { animation:a8PurchaseButton .46s var(--a8-motion-ease) both; }
    #shopLatest .inventory-item.a8-purchase-reveal { position:relative; animation:a8PurchaseReveal .66s var(--a8-motion-pop) both; z-index:2; }
    #shopLatest .inventory-item.a8-purchase-reveal::after { content:''; position:absolute; inset:-1px; border-radius:inherit; pointer-events:none; background:linear-gradient(110deg,transparent 15%,rgba(255,255,255,.30) 42%,transparent 68%); transform:translateX(-120%); animation:a8PurchaseShine .72s .06s ease-out both; }
    @keyframes a8PurchaseButton { 0%{transform:scale(1)} 45%{transform:scale(.97)} 100%{transform:scale(1)} }
    @keyframes a8PurchaseReveal { 0%{opacity:0;transform:translateY(14px) scale(.94);filter:blur(4px)} 62%{opacity:1;transform:translateY(-2px) scale(1.025);filter:blur(0)} 100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)} }
    @keyframes a8PurchaseShine { from{transform:translateX(-120%)} to{transform:translateX(120%)} }

    .a8-purchase-toast { position:fixed; left:50%; bottom:1.25rem; z-index:430; transform:translate(-50%,18px) scale(.96); opacity:0; display:flex; align-items:center; gap:.65rem; max-width:min(92vw,520px); padding:.72rem .9rem; border-radius:.9rem; border:1px solid rgba(251,191,36,.42); background:rgba(15,23,42,.94); box-shadow:0 18px 50px rgba(2,6,23,.42); color:var(--text); pointer-events:none; }
    .a8-purchase-toast.show { animation:a8Toast 1.75s var(--a8-motion-ease) both; }
    .a8-purchase-toast-mark { width:1.85rem; height:1.85rem; display:grid; place-items:center; border-radius:.55rem; background:rgba(245,158,11,.16); color:#fbbf24; font-weight:800; }
    .a8-purchase-toast strong { display:block; font-size:.9rem; }
    .a8-purchase-toast span { display:block; color:var(--muted); font-size:.78rem; margin-top:.08rem; }
    @keyframes a8Toast { 0%{opacity:0;transform:translate(-50%,18px) scale(.96)} 16%{opacity:1;transform:translate(-50%,0) scale(1)} 80%{opacity:1;transform:translate(-50%,0) scale(1)} 100%{opacity:0;transform:translate(-50%,-8px) scale(.98)} }

    .section.a8-section-success > .card, .section.a8-section-success .card-body { animation:a8SectionSuccess .72s var(--a8-motion-ease) both; }
    .section.a8-section-feedback > .card, .section.a8-section-feedback .card-body { animation:a8SectionFeedback .42s var(--a8-motion-ease) both; }
    .result.a8-result-success, [id^='result-'].a8-result-success { animation:a8ResultRise .55s var(--a8-motion-pop) both; }
    @keyframes a8SectionSuccess { 0%{transform:translateY(0);box-shadow:inherit} 45%{transform:translateY(-3px);box-shadow:0 18px 48px rgba(34,197,94,.16)} 100%{transform:translateY(0);box-shadow:inherit} }
    @keyframes a8SectionFeedback { 0%{transform:translateX(0)} 35%{transform:translateX(-2px)} 68%{transform:translateX(2px)} 100%{transform:translateX(0)} }
    @keyframes a8ResultRise { 0%{opacity:.25;transform:translateY(8px) scale(.985)} 70%{opacity:1;transform:translateY(-1px) scale(1.01)} 100%{opacity:1;transform:translateY(0) scale(1)} }

    .a8-section-toast { position:fixed; top:5.2rem; left:50%; z-index:420; transform:translate(-50%,-12px) scale(.96); opacity:0; min-width:min(88vw,360px); padding:.72rem 1rem; border-radius:999px; border:1px solid rgba(74,222,128,.45); background:rgba(6,78,59,.92); color:#dcfce7; text-align:center; font-weight:700; box-shadow:0 16px 42px rgba(2,6,23,.38); pointer-events:none; }
    .a8-section-toast.show { animation:a8SectionToast 1.45s var(--a8-motion-ease) both; }
    @keyframes a8SectionToast { 0%{opacity:0;transform:translate(-50%,-12px) scale(.96)} 18%{opacity:1;transform:translate(-50%,0) scale(1)} 78%{opacity:1;transform:translate(-50%,0) scale(1)} 100%{opacity:0;transform:translate(-50%,-8px) scale(.98)} }

    .view.a8-view-enter { animation:a8ViewEnter .34s var(--a8-motion-ease) both; }
    @keyframes a8ViewEnter { from{opacity:.45;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

    html.a8-motion-off *, html.a8-motion-off *::before, html.a8-motion-off *::after {
      animation: none !important;
      transition-duration: 0.001ms !important;
      transition-delay: 0ms !important;
      scroll-behavior: auto !important;
    }
    html.a8-motion-off .coin-celebration,
    html.a8-motion-off .a8-purchase-toast,
    html.a8-motion-off .a8-section-toast { display:none !important; }
  `;

  function readSetting() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return true;
      const parsed = JSON.parse(raw);
      return parsed.animations !== false;
    } catch (_) {
      return true;
    }
  }

  function saveSetting() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ animations: motionEnabled }));
    } catch (_) {}
  }

  function syncSvgAnimations() {
    document.querySelectorAll('svg').forEach(svg => {
      try {
        if (motionEnabled && typeof svg.unpauseAnimations === 'function') svg.unpauseAnimations();
        if (!motionEnabled && typeof svg.pauseAnimations === 'function') svg.pauseAnimations();
      } catch (_) {}
    });
  }

  function applyMotionSetting(enabled) {
    motionEnabled = enabled !== false;
    root.classList.toggle('a8-motion-off', !motionEnabled);
    const toggle = document.getElementById('a8AnimationToggle');
    if (toggle) toggle.checked = motionEnabled;
    if (!motionEnabled) {
      const layer = document.getElementById('coinAnimationLayer');
      if (layer) layer.replaceChildren();
      document.querySelectorAll('.a8-purchase-toast,.a8-section-toast').forEach(el => el.remove());
    }
    syncSvgAnimations();
    saveSetting();
  }

  function installStyles() {
    if (document.getElementById('a8PremiumMotionStyles')) return;
    const style = document.createElement('style');
    style.id = 'a8PremiumMotionStyles';
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function closeSettings() {
    if (!settingsDialog) return;
    settingsDialog.classList.remove('open');
    settingsDialog.setAttribute('aria-hidden', 'true');
  }

  function openSettings() {
    if (!settingsDialog) return;
    settingsDialog.classList.add('open');
    settingsDialog.setAttribute('aria-hidden', 'false');
    const toggle = document.getElementById('a8AnimationToggle');
    if (toggle) toggle.focus();
  }

  function installSettings() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight || document.getElementById('a8SettingsBtn')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'a8SettingsBtn';
    button.className = 'a8-settings-btn';
    button.setAttribute('aria-label', 'Einstellungen öffnen');
    button.setAttribute('title', 'Einstellungen');
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1a1.7 1.7 0 0 0-1.06-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.14 15a1.7 1.7 0 0 0-.6-1A1.7 1.7 0 0 0 2.44 13.6H2V9.6h.44a1.7 1.7 0 0 0 1.56-1.06 1.7 1.7 0 0 0-.34-1.88l-.06-.06L6.46 3.74l.06.06A1.7 1.7 0 0 0 8.4 4.14a1.7 1.7 0 0 0 1-.6A1.7 1.7 0 0 0 9.8 2.44V2h4v.44a1.7 1.7 0 0 0 1.06 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06a1.7 1.7 0 0 0-.34 1.88c.16.4.43.75.78 1 .32.23.7.37 1.1.4H21v4h-.1A1.7 1.7 0 0 0 19.4 15Z"/></svg>';
    headerRight.insertBefore(button, headerRight.firstChild);

    settingsDialog = document.createElement('div');
    settingsDialog.className = 'a8-settings-backdrop';
    settingsDialog.id = 'a8SettingsDialog';
    settingsDialog.setAttribute('aria-hidden', 'true');
    settingsDialog.innerHTML = `
      <section class="a8-settings-panel" role="dialog" aria-modal="true" aria-labelledby="a8SettingsTitle">
        <div class="a8-settings-head">
          <h2 id="a8SettingsTitle">Einstellungen</h2>
          <button type="button" class="a8-settings-close" aria-label="Einstellungen schliessen">×</button>
        </div>
        <div class="a8-settings-body">
          <div class="a8-setting-row">
            <div class="a8-setting-copy">
              <strong>Animationen</strong>
              <span>Coin-Effekte, Käufe, Abschnitt-Feedback, Battles und dekorative Bewegungen.</span>
            </div>
            <label class="a8-switch" aria-label="Animationen aktivieren">
              <input id="a8AnimationToggle" type="checkbox">
              <span class="a8-switch-track" aria-hidden="true"></span>
            </label>
          </div>
        </div>
      </section>`;
    document.body.appendChild(settingsDialog);

    button.addEventListener('click', openSettings);
    settingsDialog.querySelector('.a8-settings-close').addEventListener('click', closeSettings);
    settingsDialog.addEventListener('click', event => { if (event.target === settingsDialog) closeSettings(); });
    document.getElementById('a8AnimationToggle').addEventListener('change', event => applyMotionSetting(event.target.checked));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSettings(); });
  }

  function showPurchaseToast() {
    if (!motionEnabled) return;
    const latest = document.querySelector('#shopLatest .inventory-item:last-of-type');
    const label = latest ? (latest.querySelector('strong,h4,h3,.item-name,.skill-name') || latest) : null;
    const itemName = label ? String(label.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80) : 'Neue Belohnung';
    document.querySelectorAll('.a8-purchase-toast').forEach(el => el.remove());
    const toast = document.createElement('div');
    toast.className = 'a8-purchase-toast';
    toast.innerHTML = `<div class="a8-purchase-toast-mark">✓</div><div><strong>Kauf abgeschlossen</strong><span>${itemName || 'Neue Belohnung erhalten'}</span></div>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.remove(), 1900);
  }

  function animateLatestPurchase() {
    if (!motionEnabled) return;
    const shopView = document.getElementById('shopView');
    const latest = document.querySelector('#shopLatest .inventory-item:last-of-type');
    if (shopView) {
      shopView.classList.remove('a8-purchase-active');
      void shopView.offsetWidth;
      shopView.classList.add('a8-purchase-active');
      setTimeout(() => shopView.classList.remove('a8-purchase-active'), 600);
    }
    if (latest) {
      latest.classList.remove('a8-purchase-reveal');
      void latest.offsetWidth;
      latest.classList.add('a8-purchase-reveal');
      setTimeout(() => latest.classList.remove('a8-purchase-reveal'), 900);
    }
    showPurchaseToast();
  }

  function installPurchaseMotion() {
    const latest = document.getElementById('shopLatest');
    const buy = document.getElementById('gachaBtn');
    if (!latest || !buy) return;
    let purchasePending = false;
    buy.addEventListener('click', () => { purchasePending = true; setTimeout(() => { purchasePending = false; }, 500); }, true);
    purchaseObserver = new MutationObserver(mutations => {
      if (!purchasePending || !motionEnabled) return;
      const addedReward = mutations.some(m => Array.from(m.addedNodes || []).some(node => node.nodeType === 1 && (node.matches?.('.inventory-item') || node.querySelector?.('.inventory-item'))));
      if (!addedReward) return;
      purchasePending = false;
      requestAnimationFrame(animateLatestPurchase);
    });
    purchaseObserver.observe(latest, { childList: true, subtree: true });
  }

  function showSectionToast(text) {
    if (!motionEnabled) return;
    document.querySelectorAll('.a8-section-toast').forEach(el => el.remove());
    const toast = document.createElement('div');
    toast.className = 'a8-section-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.remove(), 1600);
  }

  function animateSectionResult(button) {
    if (!motionEnabled || !button) return;
    const section = button.closest('.section');
    const sectionId = button.dataset.checkSection;
    const result = sectionId ? document.getElementById('result-' + sectionId) : null;
    if (!section || !result) return;
    const text = String(result.textContent || '');
    const match = text.match(/(\d+)\s*\/\s*(\d+)\s+richtig/i);
    if (!match) return;
    const correct = Number(match[1]);
    const total = Number(match[2]);
    const perfect = total > 0 && correct === total;
    section.classList.remove('a8-section-success', 'a8-section-feedback');
    result.classList.remove('a8-result-success');
    void section.offsetWidth;
    if (perfect) {
      section.classList.add('a8-section-success');
      result.classList.add('a8-result-success');
      const reward = text.match(/\+(\d+)\s*Coins/i);
      showSectionToast(reward ? `Perfekt · +${reward[1]} Coins` : 'Perfekt · Abschnitt geschafft');
    } else {
      section.classList.add('a8-section-feedback');
    }
    setTimeout(() => {
      section.classList.remove('a8-section-success', 'a8-section-feedback');
      result.classList.remove('a8-result-success');
    }, 900);
  }

  function installSectionMotion() {
    document.addEventListener('click', event => {
      const button = event.target.closest('.check-section');
      if (!button || !motionEnabled) return;
      setTimeout(() => animateSectionResult(button), 30);
    }, true);
  }

  function installViewMotion() {
    document.addEventListener('click', event => {
      const nav = event.target.closest('.nav-toggle[data-view]');
      if (!nav || !motionEnabled) return;
      setTimeout(() => {
        const view = document.querySelector('.view.active');
        if (!view) return;
        view.classList.remove('a8-view-enter');
        void view.offsetWidth;
        view.classList.add('a8-view-enter');
        setTimeout(() => view.classList.remove('a8-view-enter'), 500);
      }, 0);
    }, true);
  }

  function init() {
    installStyles();
    motionEnabled = readSetting();
    installSettings();
    installPurchaseMotion();
    installSectionMotion();
    installViewMotion();
    applyMotionSetting(motionEnabled);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
