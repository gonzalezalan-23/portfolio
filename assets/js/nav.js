/**
 * nav.js — Barra superior compartida (home, ficha y proyectos.html)
 *
 * Hace tres cosas:
 *   1. Crea la hamburguesa dentro de .topbar-inner y un panel con los
 *      mismos links de .topnav (sin duplicar markup en el HTML).
 *   2. Sincroniza el link activo que marca app.js con el panel móvil.
 *   3. Comprime la barra al scrollear y actualiza la línea de progreso.
 *
 * No depende de librerías. Si rAF está congelado (pasa en algunos browsers
 * de QA), el cálculo se ejecuta directamente en el evento de scroll.
 */
(() => {
  'use strict';

  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const inner = topbar.querySelector('.topbar-inner');
  const topnav = topbar.querySelector('.topnav');
  const cta = topbar.querySelector('.topbar-cta');
  const scrollRoot = document.querySelector('.scroll-container');

  /* ── 1. Hamburguesa ───────────────────────────────────────────── */
  let btn = topbar.querySelector('.nav-toggle');
  if (!btn && topnav) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-label', 'Abrir menú de navegación');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'nav-panel');
    btn.innerHTML =
      '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
    inner.appendChild(btn);
  }

  /* ── 2. Panel móvil (clon de los links reales) ────────────────── */
  let panel = document.getElementById('nav-panel');
  if (!panel && topnav && btn) {
    const sourceLinks = [...topnav.querySelectorAll('.topnav-link')];

    panel = document.createElement('div');
    panel.id = 'nav-panel';
    panel.className = 'nav-overlay';
    panel.hidden = true;

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Menú de navegación');
    const ul = document.createElement('ul');
    ul.setAttribute('role', 'list');

    sourceLinks.forEach((link, index) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = link.getAttribute('href') || '#';
      if (link.dataset.target) a.dataset.target = link.dataset.target;
      a.innerHTML =
        `<span class="nav-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>` +
        '<span class="nav-line" aria-hidden="true"></span>' +
        `<span>${link.textContent.trim()}</span>`;
      li.appendChild(a);
      ul.appendChild(li);
    });

    nav.appendChild(ul);

    /* Contacto no está en .topnav: vive en el CTA. Se clona al final
       del panel para que en móvil tampoco quede fuera del menú. */
    if (cta) {
      const contacto = document.createElement('a');
      contacto.className = 'nav-overlay-cta';
      contacto.href = cta.getAttribute('href') || '#contacto';
      contacto.dataset.target = 'contacto';
      contacto.innerHTML = `${cta.textContent.trim()} <span aria-hidden="true">↗</span>`;
      nav.appendChild(contacto);
    }

    panel.appendChild(nav);
    document.body.appendChild(panel);
  }

  /* ── 3. Estado activo del panel ───────────────────────────────── */
  function targetOf(link) {
    return link?.dataset?.target || (link?.getAttribute('href') || '').split('#')[1] || '';
  }

  function syncActive() {
    if (!panel) return;
    const activo = document.querySelector('.topnav-item.is-active > .topnav-link');
    /* Contacto no tiene <li> en .topnav: app.js marca el CTA directamente. */
    const objetivo = cta?.classList.contains('is-active') ? 'contacto' : targetOf(activo);
    panel.querySelectorAll('a[data-target], .nav-overlay ul a').forEach(link => {
      if (targetOf(link) === objetivo && objetivo) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  syncActive();
  if (typeof MutationObserver === 'function' && topnav) {
    new MutationObserver(syncActive).observe(topbar, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true,
    });
  }

  /* ── 4. Apertura / cierre ─────────────────────────────────────── */
  if (btn && panel) {
    const abrir = () => {
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Cerrar menú de navegación');
      syncActive();
      panel.querySelector('a')?.focus();
    };
    const cerrar = ({ devolverFoco = false } = {}) => {
      if (panel.hidden) return;
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menú de navegación');
      if (devolverFoco) btn.focus();
    };

    btn.addEventListener('click', () => (panel.hidden ? abrir() : cerrar()));
    panel.addEventListener('click', event => {
      if (event.target.closest('a') || event.target === panel) cerrar();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) cerrar({ devolverFoco: true });
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980 && !panel.hidden) cerrar();
    });
  }

  /* ── 5. Compresión + progreso ─────────────────────────────────── */
  function actualizarScroll() {
    if (!scrollRoot) return;
    const tope = scrollRoot.scrollHeight - scrollRoot.clientHeight;
    const progreso = tope > 0 ? Math.min(100, Math.max(0, (scrollRoot.scrollTop / tope) * 100)) : 0;
    topbar.style.setProperty('--progress', `${progreso.toFixed(2)}%`);
    topbar.classList.toggle('is-scrolled', scrollRoot.scrollTop > 12);
  }

  if (scrollRoot) {
    scrollRoot.addEventListener('scroll', actualizarScroll, { passive: true });
    window.addEventListener('resize', actualizarScroll);
    actualizarScroll();
  }
})();
