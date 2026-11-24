/* =============================================================
   proyecto.js — Ficha de detalle de proyecto (T2.2)

   URL:  proyecto.html?slug=<slug>
   Fuente única: data/proyectos.json  (agregar proyectos = solo JSON)

   Corte actual: plantilla A (caso de negocio) — docs/PROYECTOS.md §3.
   B y C usan la misma estructura hasta el corte de sus plantillas.
   ============================================================= */
(function () {
  'use strict';

  const main = document.getElementById('detalle-main');

  const CATEGORIA_LABELS = {
    'sistema-web':    'Sistema Web',
    'saas':           'SaaS',
    'ecommerce':      'Ecommerce',
    'landing':        'Landing',
    'app-escritorio': 'App de Escritorio',
    'hardware-iot':   'Hardware / IoT',
  };

  /* Escape de todo dato que viene del JSON (XSS por dato, no por código) */
  function esc(v) {
    return String(v).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function setMeta(contenido) {
    const meta = document.getElementById('meta-description');
    if (meta) meta.setAttribute('content', contenido);
  }

  function irAlInicio() {
    const scroller = document.querySelector('.detalle-scroll');
    if (scroller) scroller.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }

  /* ── Bloque numerado (section-label + h2 + cuerpo) ── */
  function bloque(num, label, id, titulo, cuerpoHTML) {
    return `
      <section class="detalle-block" aria-labelledby="${id}">
        <span class="section-label" aria-hidden="true">${num} — ${label}</span>
        <h2 id="${id}">${titulo}</h2>
        ${cuerpoHTML}
      </section>`;
  }

  /* ── Metodología embebida en la ficha (T2.9): sale del home y vive
        en cada detalle, para que el visitante la vea en contexto.
        Mismo copy y mismas clases .process-* que la home. ── */
  const PROCESO_HTML = `
      <ol class="process-list" role="list">
        <li class="process-step">
          <div class="step-marker" aria-hidden="true"><span class="step-num">01</span></div>
          <div class="step-body">
            <h3>Diagnóstico</h3>
            <p>Entiendo el problema real antes de escribir una línea de código. Una reunión de 30 minutos define el 80% del proyecto.</p>
          </div>
        </li>
        <li class="process-step">
          <div class="step-marker" aria-hidden="true"><span class="step-num">02</span></div>
          <div class="step-body">
            <h3>Arquitectura</h3>
            <p>Diseño la solución más simple que resuelva el problema. Sin sobreingeniería y sin dependencias que no pediste.</p>
          </div>
        </li>
        <li class="process-step">
          <div class="step-marker" aria-hidden="true"><span class="step-num">03</span></div>
          <div class="step-body">
            <h3>Desarrollo iterativo</h3>
            <p>Entrego versiones funcionales desde la primera semana. Feedback real, ajustes reales.</p>
          </div>
        </li>
        <li class="process-step">
          <div class="step-marker" aria-hidden="true"><span class="step-num">04</span></div>
          <div class="step-body">
            <h3>Entrega y soporte</h3>
            <p>Deploy, documentación técnica y soporte post-lanzamiento incluidos. No desaparezco al terminar.</p>
          </div>
        </li>
      </ol>`;

  /* ── Ficha completa (plantilla A) ── */
  function renderFicha(p, lista) {
    const idx = lista.findIndex(x => x.slug === p.slug);
    const prev = idx > 0 ? lista[idx - 1] : null;
    const next = idx < lista.length - 1 ? lista[idx + 1] : null;

    const labelCat = CATEGORIA_LABELS[p.categoria] || p.categoria;
    const metaAnio  = p.anio != null ? `<span class="detalle-meta-item">${esc(p.anio)}</span>` : '';
    const metaRol   = p.rol  ? `<span class="detalle-meta-item">${esc(p.rol)}</span>` : '';

    /* Capa 1: demo + acceso rápido. Nunca se muestra un botón de demo si
       el JSON no tiene URL (regla de oro: cero demos falsas). El código
       vive en la Capa 2, dentro de la ficha técnica. */
    const acciones = p.demo
      ? `<a class="btn-primary" href="${esc(p.demo)}" target="_blank" rel="noopener noreferrer">Ver demo →</a>`
      : '';

    const acceso = (typeof p.demoAcceso === 'string' && p.demoAcceso.trim() && p.demo)
      ? `<p class="detalle-demo-acceso">
           <span class="detalle-acceso-label" aria-hidden="true">acceso rápido</span>
           ${esc(p.demoAcceso)}
         </p>`
      : '';

    const funcionalidades = `
      <ul class="detalle-checks" role="list">
        ${p.funcionalidades.map(f => `<li>${esc(f)}</li>`).join('')}
      </ul>`;

    const stack = `
      <ul class="detalle-stack" role="list">
        ${p.stack.map(s => `<li>${esc(s)}</li>`).join('')}
      </ul>`;

    /* Capa 2: ficha técnica desplegable — stack + decisiones + GitHub.
       <details>/<summary> es nativamente accesible (teclado y lector). */
    const decisiones = (Array.isArray(p.decisiones) && p.decisiones.length)
      ? `
        <div class="ficha-tecnica-grupo">
          <h3>Decisiones técnicas</h3>
          <ol class="detalle-decisiones" role="list">
            ${p.decisiones.map(d => `<li>${esc(d)}</li>`).join('')}
          </ol>
        </div>`
      : '';

    const codigo = p.repo
      ? `
        <div class="ficha-tecnica-grupo">
          <h3>Código</h3>
          <a class="btn-secondary" href="${esc(p.repo)}" target="_blank" rel="noopener noreferrer">Ver en GitHub ↗</a>
        </div>`
      : '';

    const fichaTecnica = `
      <details class="ficha-tecnica">
        <summary>
          <span class="ficha-tecnica-titulo">Stack, decisiones y código</span>
          <span class="ficha-tecnica-pista" aria-hidden="true">desplegar ↓</span>
        </summary>
        <div class="ficha-tecnica-body">
          <div class="ficha-tecnica-grupo">
            <h3>Stack</h3>
            ${stack}
          </div>
          ${decisiones}
          ${codigo}
        </div>
      </details>`;

    const capturas = `
      <div class="detalle-gallery">
        ${p.capturas.map((src, i) => `
          <figure>
            <a href="${esc(src)}" target="_blank" rel="noopener"
               aria-label="Ver captura ${i + 1} de ${esc(p.titulo)} en tamaño completo">
              <img src="${esc(src)}"
                   alt="${esc(p.titulo)} — captura ${i + 1} de ${p.capturas.length}"
                   ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} />
            </a>
          </figure>`).join('')}
      </div>`;

    const navegacion = `
      <nav class="detalle-prevnext" aria-label="Navegación entre proyectos">
        ${prev
          ? `<a class="pn-prev" href="proyecto.html?slug=${esc(prev.slug)}">← ${esc(prev.titulo)}</a>`
          : `<span class="pn-empty" aria-hidden="true">←</span>`}
        ${next
          ? `<a class="pn-next" href="proyecto.html?slug=${esc(next.slug)}">${esc(next.titulo)} →</a>`
          : `<span class="pn-empty" aria-hidden="true">→</span>`}
      </nav>`;

    main.innerHTML = `
      <header class="detalle-hero">
        <a class="detalle-back" href="index.html#proyectos">← Todos los proyectos</a>
        <p class="detalle-meta">
          <span class="section-label">${esc(labelCat)}</span>
          ${metaAnio}
          ${metaRol}
        </p>
        <h1 class="detalle-title">${esc(p.titulo)}</h1>
        <p class="detalle-lead">${esc(p.resumen)}</p>
        ${acciones ? `<div class="detalle-actions">${acciones}</div>` : ''}
        ${acceso}
      </header>

      ${bloque('01', 'problema', 'bloque-problema', 'El problema',
        `<p>${esc(p.problema)}</p>`)}
      ${bloque('02', 'solución', 'bloque-solucion', 'La solución',
        `<p>${esc(p.solucion)}</p>`)}
      ${bloque('03', 'resultado', 'bloque-resultado', 'El resultado',
        `<p>${esc(p.resultado)}</p>`)}
      ${bloque('04', 'proceso', 'bloque-proceso', 'Cómo trabajo', PROCESO_HTML)}
      ${bloque('05', 'producto', 'bloque-func', 'Qué hace', funcionalidades)}
      ${bloque('06', 'arquitectura', 'bloque-stack', 'Ficha técnica', fichaTecnica)}
      ${bloque('07', 'evidencia', 'bloque-capturas', 'Capturas', capturas)}

      <section class="detalle-block detalle-cta" aria-labelledby="bloque-cta">
        <h2 id="bloque-cta">¿Tu proyecto tiene un problema parecido?</h2>
        <p>Contame qué necesitás y te devuelvo una arquitectura recomendada con propuesta personalizada.</p>
        <a class="btn-primary" href="index.html#contacto">Quiero algo así →</a>
      </section>

      ${navegacion}`;

    main.setAttribute('aria-busy', 'false');
    document.title = `${p.titulo} — Alan.dev`;
    setMeta(p.resumen);
    irAlInicio();
  }

  /* ── Slug inexistente / JSON caído ── */
  function renderError(titulo, mensaje) {
    main.innerHTML = `
      <div class="detalle-404">
        <h1>${esc(titulo)}</h1>
        <p>${esc(mensaje)}</p>
        <a class="btn-primary" href="index.html#proyectos">← Ver todos los proyectos</a>
      </div>`;
    main.setAttribute('aria-busy', 'false');
    document.title = `${titulo} — Alan.dev`;
    irAlInicio();
  }

  async function init() {
    const slug = new URLSearchParams(location.search).get('slug');

    /* Sin slug: la ficha no existe → vuelta a la grilla */
    if (!slug) {
      location.replace('index.html#proyectos');
      return;
    }

    try {
      const res = await fetch('data/proyectos.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      const lista = Array.isArray(data.proyectos)
        ? [...data.proyectos].sort((a, b) => a.orden - b.orden)
        : [];
      if (!lista.length) throw new Error('el array "proyectos" está vacío');

      const p = lista.find(x => x.slug === slug);
      if (!p) {
        renderError('Proyecto no encontrado',
          `No existe ningún proyecto con el identificador "${slug}". Puede que el enlace esté viejo.`);
        return;
      }

      renderFicha(p, lista);
    } catch (err) {
      console.error('[Detalle] no se pudo cargar data/proyectos.json:', err);
      renderError('No se pudo cargar el proyecto',
        'No hubo forma de leer la base de datos del sitio. Probá recargar la página en unos segundos.');
    }
  }

  init();
})();
