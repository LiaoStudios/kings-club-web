/* Checkout — riepilogo, dati cliente, pagamento (carta Stripe / al ritiro).
   Gestisce sia il carrello prodotti sia l'acquisto diretto (abbonamenti e servizi). */
(function () {
  let stripeEnabled = false;
  window.KCApi?.config().then((c) => { stripeEnabled = !!c.stripeEnabled; }).catch(() => {});

  let directItems = null; // se valorizzato, checkout di un singolo abbonamento/servizio

  const currentItems = () => directItems || window.KCCart.items();
  const currentTotal = () => currentItems().reduce((s, i) => s + i.price_cents * i.qty, 0);

  function open() {
    directItems = null;
    if (!window.KCCart.items().length) { window.toast?.('Il carrello è vuoto'); return; }
    render(); window.openModal('modalCheckout');
  }
  function openDirect(items) {
    directItems = items;
    render(); window.openModal('modalCheckout');
  }

  function render() {
    const rows = currentItems().map((i) => {
      const v = [i.size, i.color].filter(Boolean).join(' · ');
      return `<div class="li"><span>${i.qty}× ${i.name}${v ? ` <span class="m">(${v})</span>` : ''}</span><span>${window.KCeuro(i.price_cents * i.qty)}</span></div>`;
    }).join('');
    const stripeOpt = stripeEnabled
      ? `<label class="pay-opt sel"><input type="radio" name="pay" value="stripe" checked><div><div class="t">Carta di credito</div><div class="d">Pagamento online sicuro con Stripe.</div></div></label>`
      : '';
    document.getElementById('checkoutBox').innerHTML = `
      <button class="close" data-co-close aria-label="Chiudi">✕</button>
      <div class="eyebrow" style="color:var(--red);margin-bottom:12px">Checkout</div>
      <h3>Completa l'ordine</h3>
      <div class="co-summary">${rows}<div class="tot"><span>Totale</span><span>${window.KCeuro(currentTotal())}</span></div></div>
      <form id="coForm">
        <div class="field"><label>Nome e cognome</label><input required name="name" placeholder="Mario Rossi"></div>
        <div class="field two"><div><label>Email</label><input required type="email" name="email" placeholder="mario@email.it"></div><div><label>Telefono</label><input required name="phone" placeholder="333 1234567"></div></div>
        <div class="field"><label>Note (opzionale)</label><textarea name="notes" placeholder="Richieste particolari..."></textarea></div>
        <div class="field"><label>Ritiro / attivazione</label>
          <div class="ful-opts"><label class="pay-opt sel"><input type="radio" name="ful" value="pickup" checked><div><div class="t">In palestra</div><div class="d">Via Galliera 56, Funo di Argelato (BO).</div></div></label></div>
        </div>
        <div class="field"><label>Pagamento</label>
          <div class="pay-opts">${stripeOpt}
            <label class="pay-opt${stripeEnabled ? '' : ' sel'}"><input type="radio" name="pay" value="pickup" ${stripeEnabled ? '' : 'checked'}><div><div class="t">Paga in sede</div><div class="d">Salda in contanti o carta in palestra.</div></div></label>
          </div>
        </div>
        <button type="submit" class="btn btn-red" style="width:100%;justify-content:center">Conferma ordine →</button>
        <div class="co-note">Ordine registrato in modo sicuro. Riceverai conferma via email.</div>
      </form>`;
    document.querySelectorAll('#coForm [name=pay]').forEach((r) => r.addEventListener('change', () => {
      document.querySelectorAll('#coForm .pay-opts .pay-opt').forEach((l) => l.classList.toggle('sel', l.contains(r) && r.checked));
    }));
  }

  async function submit(e) {
    e.preventDefault();
    const f = e.target;
    const btn = f.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Invio in corso...';
    const items = currentItems().map((i) => i.payload
      ? { ...i.payload }
      : { id: i.id, qty: i.qty, size: i.size, color: i.color });
    const payload = { items, customer: { name: f.name.value, email: f.email.value, phone: f.phone.value, notes: f.notes.value }, payment_method: f.pay ? f.pay.value : 'pickup' };
    try {
      const res = await window.KCApi.checkout(payload);
      if (res.checkout_url) { window.location.href = res.checkout_url; return; } // redirect a Stripe
      success(res);
      if (!directItems) window.KCCart.clear();
      directItems = null;
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Conferma ordine →';
      window.toast?.(err.message || 'Errore');
    }
  }

  function success(res) {
    document.getElementById('checkoutBox').innerHTML = `<div class="success">
      <div class="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M4 12l5 5L20 6"/></svg></div>
      <h3>Ordine confermato!</h3>
      <p>Numero ordine <strong style="color:var(--bone)">${res.order_number}</strong>.</p>
      <p>${res.message || 'Ti abbiamo inviato la conferma via email.'}</p>
      <p style="color:var(--muted-2);font-size:13px;margin-top:10px">Stato: In preparazione · in palestra a Funo.</p>
      <button class="btn btn-red" style="width:100%;justify-content:center;margin-top:18px" data-co-close>Chiudi</button></div>`;
  }

  document.addEventListener('click', (e) => { if (e.target.closest('[data-co-close]')) window.closeModal('modalCheckout'); });
  document.addEventListener('submit', (e) => { if (e.target.id === 'coForm') submit(e); });

  document.addEventListener('DOMContentLoaded', () => {
    const q = new URLSearchParams(location.search);
    if (q.get('order') && q.get('paid')) { window.toast?.('Pagamento riuscito · ordine ' + q.get('order')); window.KCCart?.clear(); }
    else if (q.get('canceled')) { window.toast?.('Pagamento annullato'); }
  });

  window.KCCheckout = { open, openDirect };
})();
