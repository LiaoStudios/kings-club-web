/* Shop — catalogo dalle API, teaser in home e griglia completa nella pagina Shop. */
(function () {
  const money = (c) => window.KCeuro(c);

  function card(p) {
    const soldout = p.stock <= 0;
    const sizes = p.sizes?.length ? `<select data-size aria-label="Taglia">${p.sizes.map((s) => `<option>${s}</option>`).join('')}</select>` : '';
    const colors = p.colors?.length ? `<select data-color aria-label="Colore">${p.colors.map((s) => `<option>${s}</option>`).join('')}</select>` : '';
    const img = p.image
      ? `<img src="${p.image}" alt="${p.name}" onerror="this.classList.add('placeholder');this.src='/assets/kings-logo.png'">`
      : `<img class="placeholder" src="/assets/kings-logo.png" alt="">`;
    return `<div class="prod" data-id="${p.id}">
      <div class="ph">${img}${soldout ? '<span class="soldout">Esaurito</span>' : ''}</div>
      <div class="body">
        <div class="cat">${p.category || ''}</div>
        <h4>${p.name}</h4>
        ${p.description ? `<div class="desc">${p.description}</div>` : ''}
        ${(sizes || colors) ? `<div class="variants">${sizes}${colors}</div>` : ''}
        <div class="foot">
          <span class="price">${money(p.price_cents)}</span>
          <button class="add" data-add ${soldout ? 'disabled' : ''}>${soldout ? 'Esaurito' : 'Aggiungi'}</button>
        </div>
      </div></div>`;
  }

  async function load() {
    let products = [];
    try { products = await window.KCApi.products(); } catch { products = []; }
    window.__KC_PRODUCTS = products;

    const home = document.getElementById('shopHome');
    if (home) home.innerHTML = products.slice(0, 4).map(card).join('') || '<p style="color:var(--muted)">Catalogo in aggiornamento.</p>';

    const shop = document.getElementById('view-shop');
    if (shop) shop.innerHTML = `
      <section class="page-hero"><div class="bg"></div><div class="wrap">
        <button class="back" onclick="go('home')">← Torna alla home</button>
        <div class="eyebrow">King's Store</div>
        <h1 class="display">Indossa il club</h1>
        <p class="lead">Merch ufficiale e integrazione selezionata. Ordina online e ritira gratis in sede a Funo.</p>
      </div></section>
      <section class="page-body"><div class="wrap">
        <div class="shop-grid" id="shopGrid">${products.map(card).join('') || '<p style="color:var(--muted)">Catalogo in aggiornamento.</p>'}</div>
        <p class="shop-note" style="padding-top:24px;color:var(--muted-2);font-size:13px">Ritiro gratuito in palestra · Via Galliera 56, Funo. Info: <a href="tel:+390516646731" style="color:var(--red)">051 664 6731</a>.</p>
      </div></section>`;
  }

  // Aggiungi al carrello (delegate)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]'); if (!btn || btn.disabled) return;
    const el = btn.closest('.prod'); const id = +el.dataset.id;
    const p = (window.__KC_PRODUCTS || []).find((x) => x.id === id); if (!p) return;
    window.KCCart.add({
      id: p.id, name: p.name, price_cents: p.price_cents, image: p.image,
      size: el.querySelector('[data-size]')?.value || '',
      color: el.querySelector('[data-color]')?.value || '', qty: 1,
    });
  });

  document.addEventListener('DOMContentLoaded', load);
  window.KCShop = { reload: load };
})();
