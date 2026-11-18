document.documentElement.classList.add('js');
const menu = document.querySelector('.menu');
const nav = document.querySelector('#navigation');
menu.addEventListener('click', () => {
  const open = nav.dataset.open !== 'true';
  nav.dataset.open = String(open);
  menu.setAttribute('aria-expanded', String(open));
});

const filters = document.querySelector('.filters');
if (filters) {
  const grid = document.querySelector('#catalogue');
  const cards = [...grid.children];
  const count = document.querySelector('.results');
  const more = document.querySelector('.more');
  const normalize = value => value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  let limit = 24;

  function render() {
    const query = normalize(filters.elements.recherche.value.trim());
    const fuel = filters.elements.carburant.value;
    const sort = filters.elements.tri.value;
    const matching = cards.filter(card =>
      normalize(card.dataset.title).includes(query) && (!fuel || fuel === card.dataset.fuel)
    );
    if (sort === 'prix') matching.sort((a,b) => Number(a.dataset.price) - Number(b.dataset.price));
    if (sort === 'carb') matching.sort((a,b) => a.dataset.fuel.localeCompare(b.dataset.fuel, 'fr'));
    cards.forEach(card => { card.hidden = true; });
    matching.slice(0, limit).forEach(card => {
      card.hidden = false;
      grid.append(card);
    });
    count.textContent = matching.length === 0 ? 'Aucune annonce ne correspond à votre recherche.' :
      matching.length + (matching.length === 1 ? ' annonce' : ' annonces');
    more.hidden = matching.length <= limit;
  }

  filters.hidden = false;
  filters.addEventListener('submit', event => event.preventDefault());
  filters.addEventListener('input', () => { limit = 24; render(); });
  more.addEventListener('click', () => {
    const firstNew = [...grid.children].filter(card => !card.hidden).length;
    limit += 24;
    render();
    [...grid.children].filter(card => !card.hidden)[firstNew]?.querySelector('a')?.focus();
  });
  render();
}

const mainPhoto = document.querySelector('.main-photo');
if (mainPhoto) {
  document.querySelectorAll('.thumbs a').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      mainPhoto.href = link.href;
      mainPhoto.querySelector('img').src = link.href;
      document.querySelectorAll('.thumbs a').forEach(thumb => thumb.removeAttribute('aria-current'));
      link.setAttribute('aria-current', 'true');
    });
  });
}

if (location.pathname.endsWith('/index.php')) {
  const params = new URLSearchParams(location.search);
  const routes = {accueil:'/',vo:'/vehicules/',contact:'/contact/',garanties:'/garanties/',pneumatiques:'/pneumatiques/'};
  const page = params.get('page');
  const id = params.get('id');
  if (page === 'vofiche' && /^\d+$/.test(id || '')) location.replace('/vehicules/' + id + '/');
  else if (routes[page]) location.replace(routes[page]);
  else location.replace('/');
}

document.querySelectorAll('.motion-toggle').forEach(button => {
  const banner = button.closest('.photo-banner');
  button.hidden = false;
  button.addEventListener('click', () => {
    const paused = banner.dataset.paused !== 'true';
    banner.dataset.paused = String(paused);
    button.setAttribute('aria-label', paused ? 'Relancer l’animation' : 'Mettre l’animation en pause');
    button.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
  });
});

if ('IntersectionObserver' in window && 'animate' in Element.prototype) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reveal = new IntersectionObserver(entries => {
    let stagger = 0;
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      reveal.unobserve(target);
      if (reducedMotion.matches || target.matches(':focus-within')) return;

      if (target.matches('h1')) {
        target.animate([{ transform: 'translateY(12px)' }, { transform: 'translateY(0)' }],
          { duration: 460, easing: 'ease-out' });
        return;
      }

      target.animate(
        [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 460, delay: Math.min(stagger++ * 45, 135), easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' }
      );
    });
  }, { threshold: 0 });

  const animatedContent = [
    '.hero-copy > *', '.subhero-inner > :not(.subhero-brand)', '.info .wrap > *',
    'main .heading', 'main .card', '.buy .wrap > *', '.intro-grid > *',
    '.guarantee-intro', '.guarantee-options li', 'main .filters', 'main .results',
    'main .panel', 'main .gallery', 'main .section > h2', 'main .section > p',
    'main .split > div:not(.gallery):not(.panel)', '.garage-grid > img'
  ];
  document.querySelectorAll(animatedContent.join(',')).forEach(element => reveal.observe(element));
}
