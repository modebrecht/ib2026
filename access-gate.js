(function (root) {
  'use strict';

  // Shared student-side access check for IB2026's Erzwelt and practice solutions.
  // Public static HTML remains inspectable: this is not server-side authentication.
  const APPROVED = 'true';

  function isUnlocked(key) {
    try {
      const value = root.sessionStorage.getItem(key);
      return value === APPROVED || value === '1'; // retain earlier P1L sessions
    } catch (_) {
      return false;
    }
  }

  function remember(key) {
    try { root.sessionStorage.setItem(key, APPROVED); } catch (_) {}
  }

  async function verifyCode(input, expectedSha256) {
    if (!root.crypto || !root.crypto.subtle) throw new Error('secure-context-required');
    const normalized = String(input || '').trim().replace(/\s+/g, ' ').toLowerCase();
    const bytes = new TextEncoder().encode(normalized);
    const digest = await root.crypto.subtle.digest('SHA-256', bytes);
    const computed = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    return computed === expectedSha256;
  }

  root.IB2026AccessGate = Object.freeze({ isUnlocked, remember, verifyCode });
})(window);
