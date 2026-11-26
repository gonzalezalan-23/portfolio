/**
 * secret-mode.js — Protocolo A.L.A.N.
 *
 * Capa OPCIONAL y aditiva. Todo lo que hace acá vive detrás de
 * <html data-theme="doomsday">. Sin el atributo, el sitio es el portfolio
 * cliente original: mismos textos, mismos colores, misma navegación.
 *
 * Módulos:
 *   1. estado (localStorage 'alan:mode' + evento storage entre pestañas)
 *   2. disparador del footer (inyectado, sin duplicar markup)
 *   3. barra flotante + transición de escaneo (400 ms, no bloquea)
 *   4. hero alternativo + lab de gustos (data/laboratorio.json)
 *   5. mural de fotos sueltas (data/laboratorio.json)
 *   6. easter egg en consola
 */
(() => {
  'use strict';

  const KEY = 'alan:mode';
  const ON = 'doomsday';
  const root = document.documentElement;

  const INSTAGRAM = {
    /* Texto visible: el handle sigue sólo en el href. */
    usuario: 'Insta',
    url: 'https://www.instagram.com/gonzalezalan.23/',
  };

  const OCULTAS = ['proyectos', 'proceso', 'skills', 'formacion'];

  const HERO_SECRETO = {
    titulo: 'Detrás de cada programa hay una persona. Yo soy Alan González.',
    desc: 'Este portfolio es mío, pero no va de vender nada. Va de mostrar quién hay detrás: 18 años, de Berazategui, scout, asambleísta de la D3Z6, presidente del centro de estudiantes y voy a la iglesia. Toco bajo, guitarra y teclado; programo porque me gusta aprender y porque nunca me quedo quieto. El mate es la única parte del sistema que nunca se cae.',
    eyebrow: '// detrás del código · Alan González',
    accion: 'Ver mi mundo',
  };

  const SOBRE_SECRETO = {
    eyebrow: '// detrás del código · la persona',
    titulo: 'Alan González. La persona detrás de esto.',
    texto:
      'Me gusta la música: bajo, guitarra y teclado, rock de entrada y cumbia para bailar. Me gusta el voley, aunque la técnica no me deja tiempo. Vi casi todas las películas de Marvel y estoy esperando Doomsday. Soy scout asambleísta de la D3Z6, presidente del centro de estudiantes y voy a la iglesia. Autodidacta por costumbre: si no sé algo, lo busco, lo pruebo y vuelvo.',
    cita: 'Aprendo por costumbre, no por moda. Y el mate no negocia con nadie.',
    metricas: [
      { fuerte: '18', texto: 'años' },
      { fuerte: '3', texto: 'instrumentos' },
      { fuerte: '9', texto: 'gustos en la bóveda' },
    ],
  };

  const ICONOS = {
    musica: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>',
    voley: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M5.2 6.2c3.8 3 5.2 8.4 4.2 14M18.8 6.2c-3.8 3-5.2 8.4-4.2 14M3.4 14.4c4.6-2.2 12.6-2.2 17.2 0"/></svg>',
    escudo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 8.8-8 11-4.6-2.2-8-6-8-11V5z"/><circle cx="12" cy="12" r="3.5"/></svg>',
    scout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 4v4c0 4.6-3.2 8.3-8 10-4.8-1.7-8-5.4-8-10V7z"/><path d="M12 8l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z"/></svg>',
    asamblea: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16"/><path d="M6 20V9l6-4 6 4v11"/><path d="M9 20v-5h6v5"/><path d="M9 11h.01M15 11h.01"/></svg>',
    iglesia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V10h14v11M12 3v7M9 6h6M9 21v-5h6v5"/></svg>',
    rayo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
    mate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 9h2.5a2 2 0 0 1 0 4H16"/><path d="M7 4c1 .8 1 1.7 0 2.5M11 3c1 .8 1 1.7 0 2.5"/></svg>',
    robot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="7" width="14" height="11" rx="3"/><path d="M12 7V3M9 3h6"/><circle cx="9.5" cy="12" r="1"/><circle cx="14.5" cy="12" r="1"/><path d="M9.5 16h5M3 11v3M21 11v3"/></svg>',
  };

  let originalHero = null;
  let originalSobre = null;
  let originalContactoLabel = null;
  let eggShown = false;

  function activo() {
    return root.dataset.theme === ON;
  }

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* El scroll del sitio vive en .scroll-container, no en window. */
  function irAlHero() {
    const scroller = document.querySelector('.scroll-container');
    const salto = { top: 0, behavior: 'instant' };
    if (scroller) scroller.scrollTo(salto);
    else window.scrollTo(salto);
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  function persistir(encendido, desdeStorage) {
    if (desdeStorage) return;
    try {
      window.localStorage.setItem(KEY, encendido ? ON : 'client');
    } catch (_) {
      /* storage bloqueado: el modo funciona igual hasta recargar */
    }
  }

  /* ── 1. Disparador del footer ──────────────────────────────────── */
  function crearTrigger() {
    const footer = document.querySelector('#site-footer .footer-inner');
    if (!footer || footer.querySelector('.footer-secret')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'footer-secret';
    btn.id = 'footer-secret-trigger';
    btn.innerHTML =
      '<span class="footer-secret-mark" aria-hidden="true"></span>' +
      '<span class="footer-secret-label"></span>';
    btn.addEventListener('click', () => setMode(!activo()));

    let contenedor = footer;
    const small = footer.querySelector('small');
    if (small) {
      const legal = document.createElement('span');
      legal.className = 'footer-legal';
      small.parentNode.insertBefore(legal, small);
      legal.appendChild(small);
      legal.appendChild(btn);
      contenedor = legal;
    } else {
      footer.appendChild(btn);
    }

    const ig = document.createElement('a');
    ig.className = 'footer-ig';
    ig.href = INSTAGRAM.url;
    ig.target = '_blank';
    ig.rel = 'noopener noreferrer';
    ig.setAttribute(
      'aria-label',
      'Instagram de Alan: ' + INSTAGRAM.usuario + ' ↗ (se abre en pestaña nueva)'
    );
    ig.textContent = INSTAGRAM.usuario + ' ↗';
    contenedor.appendChild(ig);
  }

  function sincronizarTrigger() {
    const btn = document.getElementById('footer-secret-trigger');
    if (!btn) return;
    const label = btn.querySelector('.footer-secret-label');
    const on = activo();
    const ig = document.querySelector('.footer-ig');
    if (ig) ig.hidden = !on;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    /* El texto visible se define acá y se reusa en el aria-label: si se leyera
       del span antes de escribirlo, el nombre accesible quedaría vacío y axe
       marcaría label-content-name-mismatch. */
    const visible = on
      ? '> sys.status: override [activo]'
      : '> sys.status: stable [override]';
    const accion = on
      ? 'Salir del protocolo A.L.A.N. y volver al modo cliente'
      : 'Activar protocolo A.L.A.N. (modo secreto)';
    if (label) label.textContent = visible;
    btn.setAttribute('aria-label', visible + ' — ' + accion);
  }

  /* ── 2. Barra flotante ─────────────────────────────────────────── */
  function crearBarra() {
    if (document.getElementById('secret-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'secret-bar';
    bar.setAttribute('role', 'status');
    bar.setAttribute('aria-live', 'polite');
    bar.innerHTML =
      '<span class="secret-bar-dot" aria-hidden="true"></span>' +
      '<span class="secret-bar-label">PROTOCOLO A.L.A.N. ACTIVO</span>';

    const link = document.createElement('a');
    link.className = 'secret-bar-link';
    link.href = '#laboratorio';
    link.dataset.target = 'laboratorio';
    link.textContent = 'Lab ↗';
    bar.appendChild(link);

    const ig = document.createElement('a');
    ig.className = 'secret-bar-ig';
    ig.href = INSTAGRAM.url;
    ig.target = '_blank';
    ig.rel = 'noopener noreferrer';
    ig.setAttribute(
      'aria-label',
      'Instagram de Alan: ' + INSTAGRAM.usuario + ' ↗ (se abre en pestaña nueva)'
    );
    ig.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="3" width="18" height="18" rx="5"/>' +
      '<circle cx="12" cy="12" r="4"/>' +
      '<circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>' +
      '</svg>';
    bar.appendChild(ig);

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'secret-bar-back';
    back.textContent = 'Modo Cliente';
    back.addEventListener('click', () => setMode(false));
    bar.appendChild(back);

    document.body.appendChild(bar);
  }

  function sincronizarBarra() {
    const link = document.querySelector('#secret-bar .secret-bar-link');
    if (link) link.hidden = !document.getElementById('laboratorio');
  }

  /* ── 3. Transición de escaneo ──────────────────────────────────── */
  function escanear() {
    if (reducedMotion()) return;
    let overlay = document.querySelector('.secret-scan');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'secret-scan';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
    }
    overlay.classList.remove('is-on');
    void overlay.offsetWidth; /* reinicia la animación si se repite */
    overlay.classList.add('is-on');
    const limpiar = () => overlay.classList.remove('is-on');
    overlay.addEventListener('animationend', limpiar, { once: true });
    window.setTimeout(limpiar, 520);
  }

  /* ── 4. Secciones técnicas: se sacan solo en modo secreto ─────── */
  function sincronizarSecciones(encendido) {
    OCULTAS.forEach((id) => {
      const seccion = document.getElementById(id);
      if (seccion) seccion.hidden = encendido;
    });

    document
      .querySelectorAll('.topnav-link[data-target], #nav-panel a[data-target]')
      .forEach((link) => {
        if (!OCULTAS.includes(link.dataset.target)) return;
        (link.closest('li') || link).hidden = encendido;
      });
  }

  /* ── 5. Hero alternativo ───────────────────────────────────────── */
  function sincronizarHero(encendido, desdeSecreto = false) {
    const hero = document.getElementById('hero');
    const inner = hero?.querySelector('.hero-inner');
    const content = hero?.querySelector('.hero-content');
    const h1 = document.getElementById('hero-heading');
    const desc = hero?.querySelector('.hero-desc');
    const actions = hero?.querySelector('.hero-actions');
    if (!inner || !content || !h1 || !desc) return;

    if (!originalHero) {
      originalHero = {
        tituloHTML: h1.innerHTML,
        tituloTexto: h1.textContent.trim(),
        aria: h1.getAttribute('aria-label'),
        descHTML: desc.innerHTML,
        accionesHTML: actions ? actions.innerHTML : '',
      };
    }

    if (encendido) {
      h1.classList.remove('hero-restaurado');
      h1.textContent = HERO_SECRETO.titulo;
      h1.setAttribute('aria-label', HERO_SECRETO.titulo);
      desc.textContent = HERO_SECRETO.desc;

      if (!content.querySelector('.secret-eyebrow')) {
        const eyebrow = document.createElement('p');
        eyebrow.className = 'secret-eyebrow';
        eyebrow.textContent = HERO_SECRETO.eyebrow;
        content.insertBefore(eyebrow, h1);
      }

      /* La imagen de Avengers la reemplaza la mascota. En su lugar va
         el readout: acá JARVIS informa, sin Instagram y sin ventas. */
      inner.querySelector('.secret-hero-art')?.remove();
      if (!inner.querySelector('.secret-readout')) {
        const panel = document.createElement('div');
        panel.className = 'secret-readout';
        panel.setAttribute('role', 'group');
        panel.setAttribute('aria-label', 'Estado del sistema de JARVIS');
        panel.innerHTML =
          '<p class="readout-head"><span class="readout-led" aria-hidden="true"></span>JARVIS // system readout</p>' +
          '<dl class="readout-datos">' +
            '<div><dt>modo</dt><dd>doomsday · sin ventas</dd></div>' +
            '<div><dt>operador</dt><dd>JARVIS (yo, el que habla)</dd></div>' +
            '<div><dt>humano</dt><dd>Alan G. · 18 · Berazategui</dd></div>' +
            '<div><dt>en bóveda</dt><dd>música · voley · Marvel · mucho mate</dd></div>' +
            '<div><dt>estado</dt><dd>escuchando todo, vendiendo nada</dd></div>' +
          '</dl>' +
          '<p class="readout-nota">// nota del sistema: si apretás cualquier cosa, me quejo.</p>' +
          '<div class="readout-barras" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>';
        inner.appendChild(panel);
      }

      if (actions) {
        /* El IG vive en la barra, el footer y el lab; no en el hero. */
        actions.querySelector('.secret-ig')?.remove();
        const primero = actions.querySelector('a[href="#proyectos"]');
        if (primero) {
          primero.setAttribute('href', '#laboratorio');
          primero.dataset.target = 'laboratorio';
          primero.textContent = HERO_SECRETO.accion;
        }
        const segundo = actions.querySelector('a[href="#contacto"]');
        if (segundo) segundo.textContent = 'Escribirme →';
      }
    } else {
      h1.innerHTML = originalHero.tituloHTML;
      /* Los spans de BlurText vuelven con opacity:0 y sin animación activa;
         esta clase los deja visibles, pero sólo al salir de doomsday.
         En una carga limpia en modo cliente no se toca el hero: la
         animación de app.js debe correr normalmente. */
      h1.classList.toggle('hero-restaurado', desdeSecreto);
      if (originalHero.aria) h1.setAttribute('aria-label', originalHero.aria);
      else h1.removeAttribute('aria-label');
      desc.innerHTML = originalHero.descHTML;
      content.querySelector('.secret-eyebrow')?.remove();
      inner.querySelector('.secret-hero-art')?.remove();
      inner.querySelector('.secret-readout')?.remove();
      if (actions) actions.innerHTML = originalHero.accionesHTML;
    }
  }

  /* ── 5b. "Sobre mí" pasa a ser la persona, no el currículum ────── */
  function sincronizarSobre(encendido) {
    const section = document.getElementById('sobre-mi');
    if (!section) return;

    const eyebrow = section.querySelector('.eyebrow');
    const h2 = document.getElementById('sobre-mi-heading');
    const texto = section.querySelector('#reveal-text-target p');
    const cita = section.querySelector('.about-quote');
    const metricas = [...section.querySelectorAll('.about-pulse-item')];
    const contactoLabel = document.querySelector('#contacto .section-label');
    if (!h2 || !texto || !cita) return;

    if (contactoLabel && !originalContactoLabel) {
      originalContactoLabel = contactoLabel.textContent;
    }

    if (!originalSobre) {
      originalSobre = {
        eyebrow: eyebrow?.textContent || '',
        h2: h2.textContent,
        h2Aria: h2.getAttribute('aria-label'),
        texto: texto.textContent,
        cita: cita.textContent,
        metricas: metricas.map((item) => ({
          fuerte: item.querySelector('strong')?.textContent || '',
          texto: item.querySelector('span')?.textContent || '',
        })),
      };
    }

    if (encendido) {
      if (eyebrow) eyebrow.textContent = SOBRE_SECRETO.eyebrow;
      /* En modo Avengers se ocultan proyectos/proceso/skills/formación:
         numerar "04" sería contradictorio. Etiquetas sin número. */
      if (contactoLabel) contactoLabel.textContent = '// escribirme';
      h2.textContent = SOBRE_SECRETO.titulo;
      h2.setAttribute('aria-label', SOBRE_SECRETO.titulo);
      h2.removeAttribute('aria-hidden');
      texto.textContent = SOBRE_SECRETO.texto;
      cita.textContent = SOBRE_SECRETO.cita;

      metricas.forEach((item, i) => {
        const dato = SOBRE_SECRETO.metricas[i];
        if (!dato) return;
        const strong = item.querySelector('strong');
        const span = item.querySelector('span');
        if (strong) strong.textContent = dato.fuerte;
        if (span) span.textContent = dato.texto;
      });
    } else {
      if (eyebrow) eyebrow.textContent = originalSobre.eyebrow;
      if (contactoLabel && originalContactoLabel) {
        contactoLabel.textContent = originalContactoLabel;
      }
      h2.textContent = originalSobre.h2;
      if (originalSobre.h2Aria) h2.setAttribute('aria-label', originalSobre.h2Aria);
      else h2.removeAttribute('aria-label');
      texto.textContent = originalSobre.texto;
      cita.textContent = originalSobre.cita;

      metricas.forEach((item, i) => {
        const dato = originalSobre.metricas[i];
        if (!dato) return;
        const strong = item.querySelector('strong');
        const span = item.querySelector('span');
        if (strong) strong.textContent = dato.fuerte;
        if (span) span.textContent = dato.texto;
      });
    }
  }

  /* ── 5c. El catálogo tampoco vende en modo secreto ────────────── */
  function sincronizarCatalogo(encendido) {
    const main = document.getElementById('proyectos-main');
    if (!main) return;

    [
      main.querySelector('.proyectos-hero'),
      main.querySelector('.proyectos-catalogo'),
      main.querySelector('.proyectos-cta'),
    ].filter(Boolean).forEach((el) => { el.hidden = encendido; });

    const existente = main.querySelector('.secret-catalogo');
    if (!encendido) {
      if (existente) existente.remove();
      return;
    }
    if (existente) return;

    const bloque = document.createElement('section');
    bloque.className = 'secret-catalogo';
    bloque.setAttribute('aria-labelledby', 'secret-catalogo-heading');
    bloque.innerHTML =
      '<span class="section-label" aria-hidden="true">// modo cliente desactivado</span>' +
      '<h1 id="secret-catalogo-heading">Acá no hay catálogo. Hay una persona.</h1>' +
      '<p>Los proyectos quedaron guardados para el portfolio de cliente. Si querés conocerme de verdad, pasá por mi mundo: música, voley, robótica, cables de más y mucho mate.</p>' +
      '<a class="secret-catalogo-cta" href="index.html#laboratorio">Ver mi mundo <span aria-hidden="true">↗</span></a>';
    main.appendChild(bloque);
  }

  /* ── 6. Bóveda de experimentos ─────────────────────────────────── */
  function crearLab() {
    if (document.getElementById('laboratorio')) return;
    const ancla = document.getElementById('sobre-mi');
    if (!ancla) return;

    const cinta = 'bajo · guitarra · teclado · rock · cumbia · voley · Marvel · Doomsday · robótica · cables de más · D3Z6 · centro de estudiantes · iglesia · mate · mucho mate · autodidacta · ';

    const section = document.createElement('section');
    section.id = 'laboratorio';
    section.className = 'lab-section';
    section.dataset.section = 'laboratorio';
    section.setAttribute('aria-labelledby', 'lab-heading');
    section.innerHTML =
      '<div class="section-inner">' +
        '<header class="section-header lab-header">' +
          '<span class="section-label" aria-hidden="true">// mi mundo · bóveda A.L.A.N.</span>' +
          '<h2 id="lab-heading">Esto es lo que me mueve.</h2>' +
          '<p>No es una lista de habilidades. Es lo que hago cuando nadie me está mirando: música, voley, Marvel, scout, asamblea, iglesia y un cerebro que no para.</p>' +
          '<div class="secret-collage" aria-hidden="true">' +
            '<img src="assets/img/Alan G - Avengers.png" alt="">' +
            '<img src="assets/img/A - Avengers.png" alt="">' +
            '<span class="collage-note">planos de un taller · Berazategui, 2026</span>' +
          '</div>' +
        '</header>' +
        '<p class="lab-marquee" aria-hidden="true"><span>' + cinta + '</span><span>' + cinta + '</span></p>' +
        '<div id="lab-grid" class="lab-grid" aria-busy="true"></div>' +
        '<blockquote class="lab-manifiesto">Detrás de cada programa hay alguien que se levanta, se equivoca y vuelve a intentar. Acá estoy yo.</blockquote>' +
      '</div>';

    ancla.insertAdjacentElement('afterend', section);
    cargarLab(section.querySelector('#lab-grid'));
  }

  async function cargarLab(grid) {
    if (!grid) return;
    try {
      const res = await fetch('data/laboratorio.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const items = Array.isArray(data.experimentos) ? data.experimentos : [];
      const frag = document.createDocumentFragment();

      items.forEach((item, i) => {
        /* Una sola ficha por gusto: imagen a la izquierda, texto a la
           derecha. El chiste queda como epígrafe; la mascota comenta la
           tarjeta con una frase propia, sin leer el epígrafe en voz alta. */
        const card = document.createElement('article');
        card.className = 'lab-card';
        card.dataset.titulo = item.titulo || '';
        if (item.chiste) {
          card.dataset.chiste = item.chiste;
          card.tabIndex = 0;
        }

        const media = document.createElement('div');
        media.className = 'lab-card-media';
        if (item.imagen) {
          const img = document.createElement('img');
          img.src = item.imagen;
          img.alt = item.alt || item.titulo || '';
          img.loading = 'lazy';
          img.decoding = 'async';
          media.appendChild(img);
        } else {
          const icon = document.createElement('span');
          icon.className = 'lab-icon lab-icon--grande';
          icon.innerHTML = ICONOS[item.icono] || ICONOS.rayo;
          icon.setAttribute('aria-hidden', 'true');
          const sinFoto = document.createElement('span');
          sinFoto.className = 'lab-sin-foto';
          sinFoto.textContent = 'sin foto (todavía)';
          media.append(icon, sinFoto);
        }

        const body = document.createElement('div');
        body.className = 'lab-card-body';

        const top = document.createElement('div');
        top.className = 'lab-card-top';
        const status = document.createElement('span');
        status.className = 'lab-status';
        status.textContent = item.estado || 'activo';
        const idx = document.createElement('span');
        idx.className = 'lab-card-index';
        idx.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
        top.append(status, idx);

        const heading = document.createElement('h3');
        heading.textContent = item.clave || 'SIN CLAVE';
        const sub = document.createElement('small');
        sub.textContent = item.titulo || '';
        heading.appendChild(sub);

        const p = document.createElement('p');
        p.textContent = item.descripcion || '';

        const meta = document.createElement('span');
        meta.className = 'lab-meta';
        meta.textContent = item.meta || '';

        body.append(top, heading, p);
        if (item.chiste) {
          const nota = document.createElement('p');
          nota.className = 'lab-chiste';
          nota.textContent = item.chiste;
          body.appendChild(nota);
        }
        body.appendChild(meta);

        card.append(media, body);
        frag.appendChild(card);
      });

      grid.replaceChildren(frag);
      grid.removeAttribute('aria-busy');
    } catch (_) {
      const p = document.createElement('p');
      p.className = 'lab-error';
      p.textContent = 'No pude abrir la bóveda ahora. Volvé a intentar en un momento.';
      grid.replaceChildren(p);
      grid.removeAttribute('aria-busy');
    }
  }

  /* ── 8. Easter egg ─────────────────────────────────────────────── */
  function mostrarEgg() {
    if (eggShown) return;
    eggShown = true;
    const arte = [
      '          /\\',
      '         /  \\',
      '        / /  \\',
      '       / / /\\ \\',
      '      / / /  \\ \\',
      '     / /_/____\\ \\',
      '    /____________\\',
    ].join('\n');

    try {
      console.log(
        '%c' + arte,
        'color:#10B981;font-family:monospace;font-size:12px;line-height:1.1;'
      );
      console.log(
        '%cPROTOCOLO A.L.A.N. ONLINE%c — detrás de cada programa hay alguien. Yo soy Alan González: ' +
        'bajo, guitarra, teclado, voley, robótica y mate (mucho mate). Si querés escribirme (o mandar un mensaje): ' +
        'gonzalez.alan.dev@gmail.com',
        'color:#10B981;font-weight:bold;',
        'color:#A7C4B7;'
      );
    } catch (_) {
      /* consola no disponible: no afecta al sitio */
    }
  }

  /* ── 9. Orquestador ────────────────────────────────────────────── */
  function setMode(encendido, opciones = {}) {
    const cambio = encendido !== activo();

    if (cambio && !opciones.desdeStorage) escanear();

    if (encendido) root.dataset.theme = ON;
    else delete root.dataset.theme;

    persistir(encendido, opciones.desdeStorage);
    crearTrigger();
    sincronizarTrigger();
    if (encendido) crearLab();
    else document.getElementById('laboratorio')?.remove();
    crearBarra();
    sincronizarBarra();
    sincronizarSecciones(encendido);
    /* En el init en modo cliente no reescribimos el hero: se perdería la
       animación BlurText que ya inició app.js. Sólo se sincroniza al
       entrar/salir del modo secreto. */
    if (encendido || cambio) sincronizarHero(encendido, cambio && !encendido);
    sincronizarSobre(encendido);
    sincronizarCatalogo(encendido);

    if (encendido) mostrarEgg();

    if (cambio) {
      /* Siempre volvemos al hero: el trigger está en el footer y sin esto
         el cambio de modo te deja abajo, sin ver lo que apareció. */
      irAlHero();
      root.dispatchEvent(
        new CustomEvent('alan:modechange', { detail: { activo: encendido } })
      );
    }
  }

  function init() {
    setMode(activo(), { desdeStorage: true });

    window.addEventListener('storage', (e) => {
      if (e.key !== KEY) return;
      const encendido = e.value === ON;
      if (encendido !== activo()) setMode(encendido, { desdeStorage: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
