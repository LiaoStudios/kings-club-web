/* Carrello — stato in localStorage, badge in navbar, drawer laterale. */
(function () {
  const KEY = 'kc_cart';
  const $ = (id) => document.getElementById(id);
  let items = load();

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
  function persist() { localStorage.setItem(KEY, JSON.stringify(items)); render(); }
  const keyOf = (i) => `${i.id}|${i.size || ''}|${i.color || ''}`;
  const count = () => items.reduce((s, i) => s + i.qty, 0);
  const total = () => items.reduce((s, i) => s + i.price_cents * i.qty, 0);

  function add(item) {
    const k = keyOf(item);
    const ex = items.find((x) => keyOf(x) === k);
    if (ex) ex.qty = Math.min(99, ex.qty + (item.qty || 1));
    else items.push({ id: item.id, name: item.name, price_cents: item.price_cents, image: item.image, size: item.size || '', color: item.color || '', qty: item.qty || 1 });
    persist();
    if (window.toast) window.toast('Aggiunto al carrello ✓');
    open();
  }
  function setQty(k, q) { const it = items.find((x) => keyOf(x) === k); if (it) { it.qty = Math.max(1, Math.min(99, q)); persist(); } }
  function remove(k) { items = items.filter((x) => keyOf(x) !== k); persist(); }
  function clear() { items = []; persist(); }

  function open() { $('cartDrawer')?.classList.add('open'); $('cartBackdrop')?.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { $('cartDrawer')?.classList.remove('open'); $('cartBackdrop')?.classList.remove('open'); document.body.style.overflow = ''; }

  function render() {
    const badge = $('cartCount'); const c = count();
    if (badge) { badge.textContent = c; badge.classList.toggle('show', c > 0); }
    const list = $('cartList');
    if (list) {
      list.innerHTML = items.length
        ? items.map((i) => {
            const k = keyOf(i); const v = [i.size, i.color].filter(Boolean).join(' · ');
            return `<div class="cart-row">
              <img class="thumb" src="${i.image || '/assets/kings-logo.png'}" alt="" onerror="this.src='/assets/kings-logo.png'">
              <div class="info"><h4>${i.name}</h4>${v ? `<div class="var">${v}</div>` : ''}<div class="price">${window.KCeuro(i.price_cents)}</div></div>
              <div class="right"><div class="qty"><button data-dec="${k}" aria-label="Diminuisci">−</button><span>${i.qty}</span><button data-inc="${k}" aria-label="Aumenta">+</button></div>
              <button class="rm" data-rm="${k}">Rimuovi</button></div></div>`;
          }).join('')
        : '<div class="cart-empty">Il carrello è vuoto.<br>Aggiungi qualcosa dallo shop.</div>';
    }
    const t = $('cartTotal'); if (t) t.textContent = window.KCeuro(total());
    const co = $('cartCheckout'); if (co) co.disabled = !items.length;
  }

  // Interazioni (delegate)
  document.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]'); const dec = e.target.closest('[data-dec]'); const rm = e.target.closest('[data-rm]');
    if (inc) { const it = items.find((x) => keyOf(x) === inc.dataset.inc); if (it) setQty(inc.dataset.inc, it.qty + 1); }
    if (dec) { const it = items.find((x) => keyOf(x) === dec.dataset.dec); if (it) setQty(dec.dataset.dec, it.qty - 1); }
    if (rm) remove(rm.dataset.rm);
  });

  document.addEventListener('DOMContentLoaded', () => {
    $('cartBtn')?.addEventListener('click', open);
    $('cartClose')?.addEventListener('click', close);
    $('cartBackdrop')?.addEventListener('click', close);
    $('cartClear')?.addEventListener('click', () => { if (items.length && confirm('Svuotare il carrello?')) clear(); });
    $('cartCheckout')?.addEventListener('click', () => { if (items.length) { close(); window.KCCheckout?.open(); } });
    render();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  window.KCCart = { add, remove, setQty, clear, count, total, items: () => items.slice(), open, close };
})();
