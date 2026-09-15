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
  $('#year').textContent = new Date().getFullYear();

  const wa = `https://wa.me/${encodeURIComponent(c.phone)}?text=${encodeURIComponent(c.whatsappText)}`;
  $$('[data-wa]').forEach(el => el.href = wa);
  $$('[data-phone]').forEach(el => { el.href = `tel:+${c.phone}`; el.textContent = c.phoneLabel; });
  $$('[data-ig]').forEach(el => { el.href = `https://instagram.com/${encodeURIComponent(c.instagram)}`; el.textContent = '@' + c.instagram; });

  // ---- Listings: one photo, whole photo + link below open the ad ----
  const total = String(c.listings.length).padStart(2, '0');
  $('#listing-list').innerHTML = c.listings.map((l, i) => {
    const url = escape(safeUrl(l.url));
    const featured = i === 0 && c.listings.length % 2 === 1 ? ' featured' : '';
    return `<article class="listing reveal${featured}">
      <a class="listing-photo" href="${url}" target="_blank" rel="noopener" aria-label="Открыть объявление: ${escape(l.title)}">
        <img src="${escape(l.image)}" alt="${escape(l.title)}, ${escape(l.district)}" loading="lazy">
        ${l.tag ? `<span class="listing-tag">${escape(l.tag)}</span>` : ''}
        <span class="listing-index">${String(i + 1).padStart(2, '0')} / ${total}</span>
        <span class="listing-open" aria-hidden="true">↗</span>
      </a>
      <div class="listing-info">
        <div>
          <h3>${escape(l.title)}</h3>
          <p class="listing-district">${escape(l.district)}</p>
          <div class="specs"><span>${escape(l.rooms)} комн.</span><span>${escape(l.area)} м²</span><span>${escape(l.floor)} эт.</span></div>
        </div>
        <div class="listing-price">${escape(money(l.price))}</div>
      </div>
      <a class="listing-link" href="${url}" target="_blank" rel="noopener">Смотреть объявление <span>↗</span></a>
    </article>`;
  }).join('');

  // ---- Photos (striped placeholder if file is missing) ----
  const markMissing = img => img.parentElement.classList.add('no-photo');
  $$('[data-photo]').forEach(img => {
    img.addEventListener('error', () => markMissing(img));
    img.src = c.photos[img.dataset.photo];
  });
  $$('.listing-photo img').forEach(img => img.addEventListener('error', () => markMissing(img)));

  // ---- Header & menu ----
  const header = $('.header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menu = $('.menu-toggle');
  const nav = $('#navigation');
  const closeMenu = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Открыть меню'); };
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // ---- Reveal on scroll ----
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }
})();
