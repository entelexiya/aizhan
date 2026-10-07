(() => {
  'use strict';
  const c = window.REALTOR;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const escape = (value) => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const money = (value) => new Intl.NumberFormat('ru-RU').format(value) + ' ' + c.currency;
  const safeUrl = (value) => { try { const u = new URL(value, location.href); return /^https?:$/.test(u.protocol) ? u.href : '#'; } catch { return '#'; } };

  // ---- Content from config ----
  document.documentElement.style.setProperty('--accent', c.accent);
  $$('[data-first-name]').forEach(el => el.textContent = c.firstName.toLocaleUpperCase('ru'));
  $$('[data-full-name]').forEach(el => el.textContent = c.fullName);
  const fill = (sel, v) => $$(sel).forEach(el => el.textContent = el.closest('.eyebrow') ? v.toLocaleUpperCase('ru') : v);
  fill('[data-city]', c.city);
  fill('[data-agency]', c.agency);
  $$('[data-experience]').forEach(el => el.textContent = c.experience);
  $$('[data-families]').forEach(el => el.textContent = c.families);
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const wa = `https://wa.me/${encodeURIComponent(c.phone)}?text=${encodeURIComponent(c.whatsappText)}`;
  $$('[data-wa]').forEach(el => el.href = wa);
  $$('[data-phone]').forEach(el => { el.href = `tel:+${c.phone}`; el.textContent = c.phoneLabel; });
  $$('[data-ig]').forEach(el => { el.href = `https://instagram.com/${encodeURIComponent(c.instagram)}`; el.textContent = '@' + c.instagram; });

  // ---- Reveal on scroll ----
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;
  const observeReveals = () => $$('.reveal:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  // ---- Listings: one photo, whole photo + link below open the ad ----
  const listEl = $('#listing-list');

  function renderListings(items) {
    if (!listEl) return;
    const limit = Number(listEl.dataset.limit) || items.length;
    const shown = items.slice(0, limit);
    const total = String(shown.length).padStart(2, '0');
    listEl.innerHTML = shown.map((l, i) => {
      const url = escape(safeUrl(l.url));
      const featured = i === 0 && shown.length % 2 === 1 ? ' featured' : '';
      const specs = [l.rooms && `${escape(l.rooms)} комн.`, l.area && `${escape(l.area)} м²`, l.floor && `${escape(l.floor)} эт.`]
        .filter(Boolean).map(s => `<span>${s}</span>`).join('');
      return `<article class="listing reveal${featured}">
        <a class="listing-photo" href="${url}" target="_blank" rel="noopener" aria-label="Открыть объявление: ${escape(l.title)}">
          <img src="${escape(l.image)}" alt="${escape(l.title)}, ${escape(l.district)}" loading="lazy">
          ${l.tag ? `<span class="listing-tag">${escape(l.tag)}</span>` : ''}
          <span class="listing-index">${String(i + 1).padStart(2, '0')} / ${total}</span>
          <span class="listing-open" aria-hidden="true">↗︎</span>
        </a>
        <div class="listing-info">
          <div>
            <h3>${escape(l.title)}</h3>
            <p class="listing-district">${escape(l.district)}</p>
            <div class="specs">${specs}</div>
          </div>
          <div class="listing-price">${escape(money(l.price))}</div>
        </div>
        <a class="listing-link" href="${url}" target="_blank" rel="noopener">Смотреть объявление <span>↗︎</span></a>
      </article>`;
    }).join('');
    $$('.listing-photo img').forEach(img => img.addEventListener('error', () => img.parentElement.classList.add('no-photo')));
    observeReveals();
  }

  renderListings(c.listings || []);

  // Объекты, которые Айжан добавила через /admin, заменяют список из config.js
  fetch('/api/listings', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .then(data => { if (data && Array.isArray(data.listings) && data.listings.length) renderListings(data.listings); })
    .catch(() => {});

  // ---- Reviews ----
  const reviewList = $('#review-list');
  if (reviewList) reviewList.innerHTML = (c.reviews || []).map(r =>
    `<article class="review reveal"><p>«${escape(r.text)}»</p><div class="review-author"><strong>${escape(r.name)}</strong><span>${escape(r.deal)}</span></div></article>`
  ).join('');

  // ---- Photos (striped placeholder if file is missing) ----
  $$('[data-photo]').forEach(img => {
    img.addEventListener('error', () => img.parentElement.classList.add('no-photo'));
    img.src = c.photos[img.dataset.photo];
  });

  // ---- Header & menu ----
  const header = $('.header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menu = $('.menu-toggle');
  const nav = $('#navigation');
  if (menu && nav) {
    const closeMenu = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Открыть меню'); };
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    $$('nav a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  observeReveals();
})();
