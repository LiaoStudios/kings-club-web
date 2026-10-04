/* Client API — unico punto di contatto con il backend. */
window.KCApi = {
  async config() {
    return fetch('api/config').then((r) => r.json());
  },
  async products() {
    return fetch('api/products').then((r) => r.json());
  },
  async checkout(payload) {
    const r = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Errore durante il checkout');
    return data;
  },
  async orderStatus(number) {
    return fetch('/api/orders/' + encodeURIComponent(number)).then((r) => r.json());
  },
};
