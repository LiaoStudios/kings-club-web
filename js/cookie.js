/* Banner cookie GDPR — Accetta tutti / Rifiuta / Personalizza, con preferenze memorizzate. */
(function () {
  const KEY = 'kc_consent';
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
  const set = (v) => localStorage.setItem(KEY, JSON.stringify({ ...v, ts: Date.now() }));

  document.addEventListener('DOMContentLoaded', () => {
    const b = document.getElementById('cookieBanner');
    if (!b) return;
    const hide = () => b.classList.remove('show');
    const show = () => b.classList.add('show');
    const saveBtn = b.querySelector('[data-ck-save]');

    if (!get()) setTimeout(show, 700);

    b.querySelector('[data-ck-all]')?.addEventListener('click', () => { set({ necessary: true, analytics: true, marketing: true }); hide(); });
    b.querySelector('[data-ck-reject]')?.addEventListener('click', () => { set({ necessary: true, analytics: false, marketing: false }); hide(); });
    b.querySelector('[data-ck-custom]')?.addEventListener('click', () => {
      const prefs = document.getElementById('cookiePrefs');
      const opening = !prefs.classList.contains('open');
      prefs.classList.toggle('open', opening);
      if (saveBtn) saveBtn.style.display = opening ? '' : 'none';
    });
    saveBtn?.addEventListener('click', () => {
      set({ necessary: true, analytics: document.getElementById('ck-analytics').checked, marketing: document.getElementById('ck-marketing').checked });
      hide();
    });
  });

  window.KCConsent = { get };
})();
