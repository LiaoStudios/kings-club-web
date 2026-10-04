/* Configurazione front-end modificabile in un unico punto (social, formattazione, sede). */
window.KC = {
  social: {
    instagram: 'https://www.instagram.com/kings.club.fitness/',
    facebook: 'https://www.facebook.com/kingsclubfitness/',
    // tiktok: '...',  // il club non ha ancora TikTok — basta aggiungere l'URL qui e l'icona nel footer
  },
  gym: {
    phone: '+390516646731',
    address: 'Via Galliera 56, 40050 Funo di Argelato (BO)',
  },
};

/* Formattazione prezzo in euro (da centesimi). */
window.KCeuro = (cents) => (cents / 100).toFixed(2).replace('.', ',') + ' €';

/* Applica i link social (footer) leggendo da window.KC.social. */
document.addEventListener('DOMContentLoaded', () => {
  const map = { 'social-instagram': 'instagram', 'social-facebook': 'facebook' };
  for (const [id, key] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el && window.KC.social[key]) el.href = window.KC.social[key];
  }
});
