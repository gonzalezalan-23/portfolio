/**
 * proyectos.js — Catálogo completo de proyectos.html
 * Única fuente: data/proyectos.json. Sin proyectos ni categorías escritos a mano.
 * Cada tarjeta muestra primero problema → resultado (Capa 1) y debajo
 * stack, decisiones/equipo y enlaces (Capa 2).
 */
(() => {
  'use strict';

  const CATEGORIA_LABELS = {
    'sistema-web':    'Sistema Web',
    'saas':           'SaaS',
    'ecommerce':      'Ecommerce',
    'landing':        'Landing',
    'app-escritorio': 'App de Escritorio',
    'hardware-iot':   'Hardware / IoT',
  };

  const grid = document.getElementById('proyectos-grid');
  const filtros = document.getElementById('filtros');
  const contador = document.getElementById('proyectos-contador');
  const totalEl = document.getElementById('total-proyectos');
  const main = document.getElementById('proyectos-main');
  if (!grid || !filtros) return;

  function escapeHTML(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function labelDe(categoria) {
    return CATEGORIA_LABELS[categoria] || categoria;
  }

  function recortar(texto, max = 150) {
    const limpio = String(texto ?? '').trim();
    return limpio.length > max ? `${limpio.slice(0, max - 1).trimEnd()}…` : limpio;
  }

  function equipoHTML(proyecto) {
    if (!Array.isArray(proyecto.equipo) || !proyecto.equipo.length) return '';
    const personas = proyecto.equipo
      .map(p => (p.rol ? `${p.nombre} (${p.rol})` : (p.nombre || p)))
      .map(escapeHTML)
      .join(', ');
    return `<p class="proyecto-equipo"><strong>En equipo con</strong> ${personas}</p>`;
  }

  function tarjetaHTML(p, index) {
    const label = labelDe(p.categoria);
    const stack = (p.stack || []).map(s => `<li>${escapeHTML(s)}</li>`).join('');
    const img = p.capturas?.[0]
      ? `<img src="${escapeHTML(p.capturas[0])}"
                alt="${escapeHTML(p.titulo)} — captura del proyecto"
                loading="${index === 0 ? 'eager' : 'lazy'}" />`
      : '<span class="proyecto-media-ph" aria-hidden="true">alan.dev</span>';
    const demo = p.demo
      ? `<a class="proyecto-demo" href="${escapeHTML(p.demo)}" target="_blank" rel="noopener noreferrer">Ver demo ↗</a>`
      : '';

    return `
      <article class="proyecto-tarjeta"
               data-categoria="${escapeHTML(p.categoria)}"
               aria-labelledby="cat-${escapeHTML(p.slug)}-title">
        <div class="proyecto-media">
          ${img}
          <span class="proyecto-cat">${escapeHTML(label)}</span>
        </div>
        <div class="proyecto-body">
          <h3 id="cat-${escapeHTML(p.slug)}-title">${escapeHTML(p.titulo)}</h3>
          <p class="proyecto-resumen">${escapeHTML(p.resumen)}</p>

          <dl class="proyecto-hechos">
            <div class="proyecto-hecho">
              <dt>Problema</dt>
              <dd>${escapeHTML(recortar(p.problema))}</dd>
            </div>
            <div class="proyecto-hecho">
              <dt>Resultado</dt>
              <dd>${escapeHTML(recortar(p.resultado))}</dd>
            </div>
          </dl>

          <div class="proyecto-capa-dos">
            <ul class="proyecto-stack" aria-label="Herramientas usadas">${stack}</ul>
            ${equipoHTML(p)}
          </div>

          <div class="proyecto-acciones">
            <a class="project-link" href="proyecto.html?slug=${encodeURIComponent(p.slug)}">
              Ver caso completo <span aria-hidden="true">→</span>
            </a>
            ${demo}
          </div>
        </div>
      </article>`;
  }

  function renderizar(lista) {
    grid.innerHTML = lista.length
      ? lista.map(tarjetaHTML).join('')
      : '<p class="proyectos-vacio" role="status">No hay proyectos en esta categoría. Elegí otra opción.</p>';
  }

  function configurarFiltros(lista) {
    const categorias = [...new Set(lista.map(p => p.categoria))];
    filtros.innerHTML = [
      `<button type="button" class="filtro-btn" data-cat="todos" aria-pressed="true">Todos (${lista.length})</button>`,
      ...categorias.map(cat => {
        const n = lista.filter(p => p.categoria === cat).length;
        return `<button type="button" class="filtro-btn" data-cat="${escapeHTML(cat)}" aria-pressed="false">${escapeHTML(labelDe(cat))} (${n})</button>`;
      }),
    ].join('');

    filtros.addEventListener('click', event => {
      const btn = event.target.closest('.filtro-btn');
      if (!btn) return;
      const cat = btn.dataset.cat;

      filtros.querySelectorAll('.filtro-btn').forEach(b => {
        b.setAttribute('aria-pressed', String(b === btn));
      });

      const visibles = cat === 'todos' ? lista : lista.filter(p => p.categoria === cat);
      renderizar(visibles);
      contador.textContent = cat === 'todos'
        ? `${lista.length} proyectos · ${lista.filter(p => p.destacado).length} destacados`
        : `${visibles.length} ${visibles.length === 1 ? 'proyecto' : 'proyectos'} · ${labelDe(cat)}`;
    });
  }

  async function init() {
    try {
      const res = await fetch('data/proyectos.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const lista = Array.isArray(data.proyectos)
        ? [...data.proyectos].sort((a, b) => a.orden - b.orden)
        : [];
      if (!lista.length) throw new Error('el array "proyectos" está vacío');

      renderizar(lista);
      configurarFiltros(lista);
      totalEl.textContent = String(lista.length).padStart(2, '0');
      contador.textContent = `${lista.length} proyectos · ${lista.filter(p => p.destacado).length} destacados`;
      main.setAttribute('aria-busy', 'false');
      grid.removeAttribute('aria-busy');
    } catch (err) {
      console.error('[Proyectos] no se pudo cargar data/proyectos.json:', err);
      grid.innerHTML = `
        <p class="proyectos-error" role="status">
          No se pudieron cargar los proyectos. Revisá que <code>data/proyectos.json</code> sea JSON válido
          y que el sitio se sirva por http (no abriendo el archivo directo).
        </p>`;
      contador.textContent = 'Error de carga';
      main.setAttribute('aria-busy', 'false');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
