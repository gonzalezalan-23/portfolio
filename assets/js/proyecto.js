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

  function hayLightboxAbierto() {
    return !!document.querySelector('.detalle-lightbox[open]');
  }

  /* Flechas para cambiar de proyecto. Se ignora mientras se escribe o
     mientras está abierto el visor de capturas. */
  function instalarTecladoProyectos(lista, idx) {
    document.addEventListener('keydown', (e) => {
      if (hayLightboxAbierto()) return;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

      e.preventDefault();
      const destino = e.key === 'ArrowLeft'
        ? lista[(idx - 1 + lista.length) % lista.length]
        : lista[(idx + 1) % lista.length];
      location.href = `proyecto.html?slug=${encodeURIComponent(destino.slug)}`;
    });
  }

  /* Visor de capturas: mismo dialog para la imagen del hero y la galería.
     Sin dependencias y con fallback a abrir la imagen si no hay showModal. */
  function instalarLightbox(p, root) {
    const capturas = Array.isArray(p.capturas) ? p.capturas : [];
    if (!capturas.length) return;

    const dialog = document.createElement('dialog');
    dialog.className = 'detalle-lightbox';
    dialog.setAttribute('aria-label', `Capturas de ${p.titulo}`);
    dialog.innerHTML = `
      <button type="button" class="lightbox-close" aria-label="Cerrar galería">×</button>
      <button type="button" class="lightbox-nav lightbox-prev" aria-label="Captura anterior">←</button>
      <figure class="lightbox-figure">
        <img class="lightbox-img" alt="" />
        <figcaption class="lightbox-caption"></figcaption>
      </figure>
      <button type="button" class="lightbox-nav lightbox-next" aria-label="Captura siguiente">→</button>`;
    document.body.appendChild(dialog);

    const img = dialog.querySelector('.lightbox-img');
    const caption = dialog.querySelector('.lightbox-caption');
    let actual = 0;
    let ultimoFoco = null;

    function mostrar(i) {
      actual = ((i % capturas.length) + capturas.length) % capturas.length;
      img.src = capturas[actual];
      img.alt = `${p.titulo} — captura ${actual + 1} de ${capturas.length}`;
      caption.textContent = `${actual + 1} / ${capturas.length} · ${p.titulo}`;
    }

    function abrir(i) {
      ultimoFoco = document.activeElement;
      mostrar(i);
      if (typeof dialog.showModal !== 'function') {
        window.open(capturas[actual], '_blank', 'noopener');
        return;
      }
      dialog.showModal();
      document.documentElement.classList.add('lightbox-abierto');
      dialog.querySelector('.lightbox-close').focus();
    }

    function cerrar() {
      if (dialog.open) dialog.close();
      /* Algunos motores no disparan el evento `close` cuando se cierra desde
         el botón. Se libera el scroll y se devuelve el foco acá también. */
      document.documentElement.classList.remove('lightbox-abierto');
      if (ultimoFoco && typeof ultimoFoco.focus === 'function') ultimoFoco.focus();
    }

    root.querySelectorAll('[data-lightbox]').forEach((enlace) => {
      enlace.addEventListener('click', (e) => {
        e.preventDefault();
        abrir(Number(enlace.dataset.lightbox) || 0);
      });
    });

    dialog.querySelector('.lightbox-close').addEventListener('click', cerrar);
    dialog.querySelector('.lightbox-prev').addEventListener('click', () => mostrar(actual - 1));
    dialog.querySelector('.lightbox-next').addEventListener('click', () => mostrar(actual + 1));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) cerrar(); });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('lightbox-abierto');
      if (ultimoFoco && typeof ultimoFoco.focus === 'function') ultimoFoco.focus();
    });

    document.addEventListener('keydown', (e) => {
      if (!dialog.open) return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); mostrar(actual - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(actual + 1); }
      if (e.key === 'Escape')     { e.preventDefault(); cerrar(); }
    });
  }

  /* ── Ficha completa (plantilla A) ── */
  function renderFicha(p, lista) {
    const idx = lista.findIndex(x => x.slug === p.slug);
    /* Navegación circular: el último vuelve al primero y viceversa. */
    const prev = lista[(idx - 1 + lista.length) % lista.length];
    const next = lista[(idx + 1) % lista.length];

    const labelCat = CATEGORIA_LABELS[p.categoria] || p.categoria;
    const metaAnio  = p.anio != null ? `<span class="detalle-meta-item">${esc(p.anio)}</span>` : '';
    const metaRol   = p.rol  ? `<span class="detalle-meta-item">${esc(p.rol)}</span>` : '';

    /* Créditos: los trabajos en equipo se acreditan por nombre (y rol si
       lo hay), con el mismo formato que el catálogo proyectos.html. */
    const equipo = (Array.isArray(p.equipo) && p.equipo.length)
      ? `<p class="detalle-equipo">
           <span class="detalle-equipo-label">En equipo con</span>
           ${p.equipo.map(persona => {
             const nombre = esc(persona.nombre || persona);
             const rol = persona.rol
               ? ` <span class="detalle-equipo-rol">(${esc(persona.rol)})</span>`
               : '';
             return `<span class="detalle-equipo-persona">${nombre}${rol}</span>`;
           }).join(', ')}
         </p>`
      : '';

    /* Capa 1: la "primera hoja" de la presentación. Demo = acción principal;
       documentación = secundaria. No se muestra el texto de acceso local:
       esa información queda fuera del hero. */
    const acciones = [
      p.demo
        ? `<a class="btn-primary" href="${esc(p.demo)}" target="_blank" rel="noopener noreferrer">Probar demo →</a>`
        : '',
      p.documentacion
        ? `<a class="btn-secondary" href="${esc(p.documentacion)}" target="_blank" rel="noopener noreferrer">Ver documentación ↗</a>`
        : '',
    ].filter(Boolean).join('');

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
          <h3>Por qué lo hice así</h3>
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
          <span class="ficha-tecnica-titulo">Herramientas, decisiones y código</span>
          <span class="ficha-tecnica-pista" aria-hidden="true">desplegar ↓</span>
        </summary>
        <div class="ficha-tecnica-body">
          <div class="ficha-tecnica-grupo">
            <h3>Herramientas usadas</h3>
            ${stack}
          </div>
          ${decisiones}
          ${codigo}
        </div>
      </details>`;

    /* La primera captura vive arriba, en el hero: es decorativa, con su
       ratio real y sin visor. El zoom queda sólo para la galería. */
    const heroShot = p.capturas?.length ? `
      <figure class="detalle-hero-shot">
        <img src="${esc(p.capturas[0])}"
             alt="${esc(p.titulo)} — vista principal del proyecto"
             fetchpriority="high" />
        <figcaption>${esc(labelCat)}</figcaption>
      </figure>` : '';

    const capturas = p.capturas.length > 1 ? `
      <div class="detalle-gallery">
        ${p.capturas.slice(1).map((src, i) => `
          <figure>
            <a href="${esc(src)}" data-lightbox="${i + 1}"
               aria-label="Ampliar captura ${i + 2} de ${esc(p.titulo)}">
              <img src="${esc(src)}"
                   alt="${esc(p.titulo)} — captura ${i + 2} de ${p.capturas.length}"
                   loading="lazy" />
            </a>
          </figure>`).join('')}
      </div>` : '';
    const bloqueCapturas = capturas
      ? bloque('06', 'evidencia', 'bloque-capturas', 'Más capturas', capturas)
      : '';

    const navegacion = `
      <nav class="detalle-prevnext" aria-label="Navegación entre proyectos">
        <a class="pn-prev" href="proyecto.html?slug=${esc(prev.slug)}"
           aria-keyshortcuts="ArrowLeft">← ${esc(prev.titulo)}</a>
        <span class="pn-pista" aria-hidden="true">← → para cambiar de proyecto</span>
        <a class="pn-next" href="proyecto.html?slug=${esc(next.slug)}"
           aria-keyshortcuts="ArrowRight">${esc(next.titulo)} →</a>
      </nav>`;

    main.innerHTML = `
      <header class="detalle-hero">
        <div class="detalle-hero-copy">
          <a class="detalle-back" href="index.html#proyectos">← Todos los proyectos</a>
          <p class="detalle-meta">
            <span class="section-label">${esc(labelCat)}</span>
            ${metaAnio}
            ${metaRol}
          </p>
          <h1 class="detalle-title">${esc(p.titulo)}</h1>
          <p class="detalle-lead">${esc(p.resumen)}</p>
          ${acciones ? `<div class="detalle-actions">${acciones}</div>` : ''}
          ${equipo}
        </div>
        ${heroShot}
      </header>

      <div class="detalle-duo">
        ${bloque('01', 'problema', 'bloque-problema', 'El problema',
          `<p>${esc(p.problema)}</p>`)}
        ${bloque('02', 'solución', 'bloque-solucion', 'La solución',
          `<p>${esc(p.solucion)}</p>`)}
      </div>
      ${bloque('03', 'resultado', 'bloque-resultado', 'El resultado',
        `<p>${esc(p.resultado)}</p>`)}
      ${bloque('04', 'producto', 'bloque-func', 'Qué hace', funcionalidades)}
      ${bloque('05', 'detalles', 'bloque-stack', 'Cómo está hecho', fichaTecnica)}
      ${bloqueCapturas}

      <section class="detalle-block detalle-cta" aria-labelledby="bloque-cta">
        <h2 id="bloque-cta">¿Su proyecto tiene un problema parecido?</h2>
        <p>Describa qué necesita resolver y recibirá una propuesta clara, un plazo y un precio.</p>
        <a class="btn-primary" href="index.html#contacto">Solicitar propuesta →</a>
      </section>

      ${navegacion}`;

    main.setAttribute('aria-busy', 'false');
    document.title = `${p.titulo} — Alan.dev`;
    setMeta(p.resumen);
    irAlInicio();
    instalarTecladoProyectos(lista, idx);
    instalarLightbox(p, main);
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
