/**
 * app.js — Alan.dev Portfolio
 * Módulos:
 *   0. initBlurText       — BlurText replica: anima el h1 del Hero palabra a palabra (Web Animations API)
 *   1. initHologramCanvas — Canvas de partículas/threads orbitales bajo el avatar
 *   2. initScrollytelling — IntersectionObserver → intercambia .in-* en el avatar
 *   3. initReveal         — Anima .reveal al entrar en viewport
 *   4. initNavMobile      — Hamburger toggle
 *   5. initWizard         — Pasos del wizard de contacto + pulso del avatar
 *   6. initContactForm    — Validación y envío a Google Sheets (Apps Script)
 */
(() => {
  'use strict';

  /* Endpoint del web app de Google Apps Script (docs/GOOGLE_SHEETS.md).
     Vacío = backend todavía no configurado: el form muestra el estado
     de error en vez de fingir que envió. */
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwsiGGr7tBjZSiuSBQ04OsmzfpXKQNoirnDn_LhcdYyeOM5iZUiMrpG4Fvhuce-1P7A/exec';

  const avatarVP   = () => document.getElementById('avatar-viewport');


  /* ═══════════════════════════════════════════════════════════════
     0. BLUR TEXT — Replica fiel de <BlurText /> de React Bits
     Separa el texto por palabras, envuelve cada una en <span class="blur-word">
     y anima con element.animate() (Web Animations API nativa).
     IntersectionObserver dispara la secuencia cuando el elemento
     alcanza el threshold definido. Sin dependencias externas.
     ═══════════════════════════════════════════════════════════════ */
  function initBlurText(elementSelector, options = {}) {
    const el = document.querySelector(elementSelector);
    if (!el) return;

    /* ── Parámetros con valores por defecto de React Bits ── */
    const {
      animateBy    = 'words',
      direction    = 'top',
      delay        = 150,          /* ms entre cada palabra */
      stepDuration = 0.35,         /* segundos por palabra */
      threshold    = 0.1,
    } = options;

    /* ── 1. Extraer texto, preservar accesibilidad y dividir ── */
    const rawText = el.textContent.trim();
    el.textContent = '';
    el.setAttribute('aria-label', rawText);

    const units = animateBy === 'words'
      ? rawText.split(' ')
      : [...rawText];              /* fallback: caracteres */

    /* ── 2. Crear spans con las propiedades de contención requeridas ── */
    const spans = units.map((unit, i) => {
      const span = document.createElement('span');
      span.className          = 'blur-word';
      /* Propiedades de contención: evitan colapso de espacios y
         habilitan compositing en GPU para filter + transform */
      span.style.display      = 'inline-block';
      span.style.whiteSpace   = 'pre';
      span.style.willChange   = 'transform, filter, opacity';
      /* Espacio entre palabras: añade un espacio después de cada
         palabra excepto la última */
      span.textContent        = i < units.length - 1 ? unit + ' ' : unit;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
      return span;
    });

    /* ── 3. Keyframes según dirección (direction: 'top') ── */
    const yStart = direction === 'top' ? '-50px' : '50px';

    const keyframes = [
      { filter: 'blur(10px)', opacity: 0,   transform: `translateY(${yStart})` },  /* 0%  */
      { filter: 'blur(5px)',  opacity: 0.5, transform: 'translateY(5px)'        },  /* 50% */
      { filter: 'blur(0px)',  opacity: 1,   transform: 'translateY(0px)'        },  /* 100% */
    ];

    /* ── 4. Función que lanza la secuencia de animaciones ── */
    function runAnimation() {
      let lastAnim = null;

      spans.forEach((span, index) => {
        lastAnim = span.animate(keyframes, {
          duration:   stepDuration * 1000,   /* Web Animations API usa ms */
          delay:      index * delay,          /* retraso escalonado */
          easing:     'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          fill:       'forwards',             /* mantiene el estado final */
        });
      });

      /* ── 5. Callback onAnimationComplete en la última palabra ── */
      if (lastAnim) {
        lastAnim.onfinish = () => console.log('Animation completed!');
      }
    }

    /* ── 6. IntersectionObserver — disparo único al threshold ── */
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          runAnimation();
          obs.unobserve(entry.target);   /* once: true */
        });
      },
      { threshold }
    );

    observer.observe(el);
  }


  /* ═══════════════════════════════════════════════════════════════
     1. HOLOGRAM CANVAS
     Sistema de partículas orbitales que simulan transferencia de datos.
     Cada partícula orbita en un radio aleatorio con velocidad variable.
     La velocidad global se controla desde initScrollytelling via
     hologram.setSpeed(multiplier).
     ═══════════════════════════════════════════════════════════════ */
  const hologram = (() => {
    const PARTICLE_COUNT = 38;
    const ACCENT         = '255, 45, 45';   /* rojo fuerte — señal */
    const GREEN          = '255, 90, 90';   /* rojo claro (ex "teal") */

    let canvas, ctx, W, H, cx, cy;
    let particles = [];
    let speedMult = 1;   // controlado por sección activa
    let rafId     = null;

    function Particle() {
      this.reset();
    }

    Particle.prototype.reset = function () {
      // Dos tipos: orbitales (círculo) y threads (línea radial)
      this.type    = Math.random() < 0.65 ? 'orbit' : 'thread';
      this.radius  = 60 + Math.random() * 110;
      this.angle   = Math.random() * Math.PI * 2;
      this.speed   = (0.004 + Math.random() * 0.008) * (Math.random() < 0.5 ? 1 : -1);
      this.size    = 1.2 + Math.random() * 2;
      this.color   = Math.random() < 0.85 ? ACCENT : GREEN;
      this.alpha   = 0.3 + Math.random() * 0.55;
      // Para threads: longitud y ángulo fijo de emisión
      this.len     = 18 + Math.random() * 32;
      this.decay   = 0.008 + Math.random() * 0.006;
      this.life    = 1;
    };

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      cx = W / 2;
      cy = H * 0.52; // ligeramente por encima del centro para alinearse con el torso
    }

    function drawOrbit(p) {
      p.angle += p.speed * speedMult;
      const x = cx + Math.cos(p.angle) * p.radius;
      const y = cy + Math.sin(p.angle) * p.radius * 0.38; // elipse aplanada
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.fill();

      // Estela corta
      ctx.beginPath();
      ctx.moveTo(x, y);
      const tx = cx + Math.cos(p.angle - p.speed * speedMult * 8) * p.radius;
      const ty = cy + Math.sin(p.angle - p.speed * speedMult * 8) * p.radius * 0.38;
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = `rgba(${p.color}, ${p.alpha * 0.3})`;
      ctx.lineWidth   = p.size * 0.6;
      ctx.stroke();
    }

    function drawThread(p) {
      p.life -= p.decay * speedMult;
      if (p.life <= 0) { p.reset(); return; }

      const x  = cx + Math.cos(p.angle) * p.radius;
      const y  = cy + Math.sin(p.angle) * p.radius * 0.38;
      const ex = x  + Math.cos(p.angle) * p.len;
      const ey = y  + Math.sin(p.angle) * p.len * 0.38;

      const grad = ctx.createLinearGradient(x, y, ex, ey);
      grad.addColorStop(0, `rgba(${p.color}, ${p.alpha * p.life})`);
      grad.addColorStop(1, `rgba(${p.color}, 0)`);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1;
      ctx.stroke();
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);

      // Anillos orbitales de referencia (muy tenues)
      [70, 110, 155].forEach((r, i) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.38, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ACCENT}, ${0.07 + i * 0.03})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      });

      particles.forEach(p => {
        if (p.type === 'orbit') drawOrbit(p);
        else                    drawThread(p);
      });

      rafId = requestAnimationFrame(tick);
    }

    return {
      init(canvasEl) {
        canvas = canvasEl;
        ctx    = canvas.getContext('2d');
        particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
        resize();
        window.addEventListener('resize', resize);
        tick();
      },
      setSpeed(mult) {
        // Transición suave de velocidad
        const target = mult;
        const step   = () => {
          speedMult += (target - speedMult) * 0.06;
          if (Math.abs(target - speedMult) > 0.01) requestAnimationFrame(step);
          else speedMult = target;
        };
        step();
      },
      burst() {
        // Pulso de velocidad al interactuar con el wizard
        this.setSpeed(4.5);
        setTimeout(() => this.setSpeed(1), 600);
      },
    };
  })();


  /* ═══════════════════════════════════════════════════════════════
     2. SCROLLYTELLING — IntersectionObserver
     Intercambia .in-{section} en avatar-viewport.
     Ajusta la velocidad del canvas según la sección.
     ═══════════════════════════════════════════════════════════════ */
  const SPEED_MAP = {
    hero:        1,
    'sobre-mi':  0.8,
    skills:      0.6,
    proyectos:   0.4,
    proceso:     0.9,
    formacion:   0.7,
    contacto:    1.5,
  };

  function initScrollytelling() {
    const avatarEl     = avatarVP();
    const AVATAR_CLS   = ['in-hero', 'in-sobre-mi', 'in-skills', 'in-proyectos', 'in-proceso', 'in-formacion', 'in-contacto'];
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const scrollRoot   = document.querySelector('.scroll-container');
    const secciones    = [...document.querySelectorAll('[data-section]')];
    let actual         = null;

    function syncSidebar(sectionId) {
      sidebarItems.forEach(item => {
        const link   = item.querySelector('.sidebar-link');
        const target = link?.dataset.target;
        item.classList.toggle('is-active', target === sectionId);
      });
    }

    /* Sección dominante = la que ocupa MÁS PÍXELES del viewport.
       Con threshold:0.6, cualquier sección más alta que viewport/0.6
       (≈1.67× el alto del viewport) nunca llegaba al 60% de visibilidad
       y NO DISPARABA: en pantallas bajas el personaje quedaba congelado
       en el estado anterior (proyectos y contacto nunca se activaban).
       Medir en píxeles no depende de la altura de la sección. */
    function seccionDominante() {
      const rootR = scrollRoot.getBoundingClientRect();
      const areas = new Map();
      let mejor = null, mejorArea = 0;
      for (const sec of secciones) {
        const r = sec.getBoundingClientRect();
        const alto = Math.min(r.bottom, rootR.bottom) - Math.max(r.top, rootR.top);
        areas.set(sec, alto);
        if (alto > mejorArea) { mejorArea = alto; mejor = sec; }
      }
      if (!mejor) return actual;

      /* HISTERESIS — sin ella el punto de cambio es el empate exacto
         entre dos secciones (50/50) y cualquier micro-movimiento invierte
         la dominancia: en un amago de 140px el personaje cambiaba de
         estado 4 veces ("entra en duda"). Se mantiene el estado actual
         salvo que la candidata lo supere por 12% del alto del viewport. */
      if (actual) {
        const actualEl = secciones.find(s => s.dataset.section === actual);
        const areaActual = actualEl ? areas.get(actualEl) : 0;
        if (areaActual + rootR.height * 0.12 > mejorArea) return actual;
      }
      return mejor.dataset.section;
    }

    function aplicar(section) {
      if (!section || section === actual) return;
      actual = section;

      /* a) Avatar viewport */
      const cls = `in-${section}`;
      if (avatarEl) {
        AVATAR_CLS.forEach(c => avatarEl.classList.remove(c));
        if (AVATAR_CLS.includes(cls)) avatarEl.classList.add(cls);
      }

      /* b) Line sidebar */
      syncSidebar(section);

      /* c) Velocidad del holograma */
      hologram.setSpeed(SPEED_MAP[section] ?? 1);
    }

    const observer = new IntersectionObserver(
      () => aplicar(seccionDominante()),
      { root: scrollRoot, threshold: [0, 0.5] }
    );

    secciones.forEach(s => observer.observe(s));

    /* Fallback por scroll (rAF-throttled): con secciones mucho más altas
       que el viewport (skills mide ~5×, proyectos ~6×) la sección entrante
       NUNCA cruza el threshold 0.5 y el cruce final de la saliente a veces
       no notifica — el sidebar/avatar quedaban congelados en la anterior.
       Recalcular en cada scroll (incluido el final del scroll programático
       por hash) garantiza el estado correcto. La histeresis de
       seccionDominante() evita el flicker. */
    let spyTicking = false;
    function updateSpy() {
      if (!spyTicking) return;   /* ya lo actualizó el rAF (o un timeout anterior) */
      spyTicking = false;
      aplicar(seccionDominante());
    }
    scrollRoot.addEventListener('scroll', () => {
      if (spyTicking) return;
      spyTicking = true;
      /* rAF alinea el cálculo con el pintado. El timeout es un respaldo para
         pestañas en segundo plano / entornos donde rAF se congela: sin él el
         sidebar y el avatar quedan trabados en la sección inicial (F7 QA). */
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(updateSpy);
      setTimeout(updateSpy, 32);
    }, { passive: true });

    aplicar(seccionDominante());   /* estado correcto desde la carga */
  }


  /* ═══════════════════════════════════════════════════════════════
     3. REVEAL — Anima elementos .reveal al entrar en viewport
     ═══════════════════════════════════════════════════════════════ */
  /* Revela los .reveal existentes y deja un observer reutilizable para
     los nodos que se inyectan después (tarjetas de proyectos desde JSON). */
  let revealObserver = null;

  function initReveal() {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  function observarReveals(nodos) {
    if (!revealObserver) { nodos.forEach(n => n.classList.add('is-visible')); return; }
    nodos.forEach(n => revealObserver.observe(n));
  }


  /* ═══════════════════════════════════════════════════════════════
     3b. PROYECTOS — se renderiza desde data/proyectos.json
     ÚNICA fuente de verdad: para agregar un proyecto se edita SOLO
     el JSON (ver docs/AGREGAR_PROYECTO.md). Nunca este archivo.
     ═══════════════════════════════════════════════════════════════ */
  const CATEGORIA_LABELS = {
    'sistema-web':     'Sistema Web',
    'saas':            'SaaS',
    'ecommerce':       'Ecommerce',
    'landing':         'Landing',
    'app-escritorio':  'App de Escritorio',
    'hardware-iot':    'Hardware / IoT',
  };

  function escapeHTML(v) {
    return String(v).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function tarjetaProyecto(p) {
    const label = CATEGORIA_LABELS[p.categoria] || p.categoria;
    const stack = p.stack.map(s => `<li>${escapeHTML(s)}</li>`).join('');
    return `
      <article class="project-card reveal" aria-labelledby="proj-${escapeHTML(p.slug)}-title">
        <div class="project-card-inner">
          <header>
            <span class="project-type">${escapeHTML(label)}</span>
            <h3 id="proj-${escapeHTML(p.slug)}-title">${escapeHTML(p.titulo)}</h3>
          </header>
          <p>${escapeHTML(p.resumen)}</p>
          <footer>
            <ul class="project-stack" aria-label="Tecnologías">${stack}</ul>
            <a href="proyecto.html?slug=${p.slug}" class="project-link">Ver caso completo →</a>
          </footer>
        </div>
      </article>`;
  }

  async function initProyectosGrid() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    try {
      /* no-cache: si editás el JSON, la próxima recarga muestra el cambio */
      const res = await fetch('data/proyectos.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const lista = Array.isArray(data.proyectos)
        ? [...data.proyectos].sort((a, b) => a.orden - b.orden)
        : [];
      if (!lista.length) throw new Error('el array "proyectos" está vacío');

      grid.innerHTML = lista.map(tarjetaProyecto).join('');
      grid.removeAttribute('aria-busy');
      observarReveals([...grid.querySelectorAll('.reveal')]);
    } catch (err) {
      /* No se rompe el resto del sitio: solo falla esta sección. */
      console.error('[Proyectos] no se pudo cargar data/proyectos.json:', err);
      grid.innerHTML = `
        <p class="projects-error" role="status">
          No se pudieron cargar los proyectos. Si estás en local, revisá que el sitio
          se sirva por http (no por archivo directo) y que <code>data/proyectos.json</code> sea JSON válido.
        </p>`;
    }
  }


  /* ═══════════════════════════════════════════════════════════════
     3c. SKILLS — chips con evidencia, desde los `stack` de data/proyectos.json
     Cada tecnología cuenta en cuántos proyectos aparece y cuáles son:
     la evidencia reemplaza a la lista de deseos típica de un portfolio.
     ═══════════════════════════════════════════════════════════════ */
  async function initSkills() {
    const grid = document.getElementById('skills-grid');
    if (!grid) return;

    try {
      const res = await fetch('data/proyectos.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const lista = Array.isArray(data.proyectos) ? data.proyectos : [];
      if (!lista.length) throw new Error('el array "proyectos" está vacío');

      /* Agrupa por tecnología normalizada (minúsculas), conservando el
         label original. La key permite cruzarlo con el mapa `tecnologias`
         de la raíz del JSON (categorías del stack). */
      const mapa = new Map();
      for (const p of lista) {
        for (const tech of (Array.isArray(p.stack) ? p.stack : [])) {
          const key = String(tech).trim().toLowerCase();
          if (!key) continue;
          if (!mapa.has(key)) mapa.set(key, { key, label: String(tech).trim(), proyectos: [] });
          const entrada = mapa.get(key);
          if (!entrada.proyectos.some(x => x.slug === p.slug)) {
            entrada.proyectos.push({ slug: p.slug, titulo: p.titulo });
          }
        }
      }

      /* Más usadas primero; empate → alfabético */
      const ordenadas = [...mapa.values()].sort((a, b) =>
        b.proyectos.length - a.proyectos.length || a.label.localeCompare(b.label)
      );

      /* Categorías declaradas en el JSON. Si el mapa no está (e.g. mientras
         el dueño edita el archivo), cae a una sola categoría: ninguna
         tecnología desaparece. */
      const declaradas = (data.tecnologias && typeof data.tecnologias === 'object')
        ? data.tecnologias
        : { 'Tecnologías': ordenadas.map(s => s.label) };

      const asignadas = new Set();
      const bloques = Object.entries(declaradas)
        .map(([nombre, techs]) => {
          const keys = new Set((Array.isArray(techs) ? techs : []).map(t => String(t).trim().toLowerCase()));
          const chips = ordenadas.filter(s => {
            if (!keys.has(s.key)) return false;
            asignadas.add(s.key);
            return true;
          });
          return { nombre, chips };
        })
        .filter(b => b.chips.length);

      /* Toda tecnología usada en un proyecto pero aún no categorizada
         aparece en "Otros": editar el JSON nunca rompe la evidencia. */
      const sinCategoria = ordenadas.filter(s => !asignadas.has(s.key));
      if (sinCategoria.length) bloques.push({ nombre: 'Otros', chips: sinCategoria });

      const chipHTML = (s) => {
        const n = s.proyectos.length;
        const ver = s.proyectos.slice(0, 3).map(p => p.titulo).join(' · ');
        const resto = n > 3 ? ` +${n - 3} más` : '';
        return `
          <li class="skill-chip">
            <div class="skill-top">
              <span class="skill-name">${escapeHTML(s.label)}</span>
              <span class="skill-count" aria-label="usado en ${n} proyecto${n === 1 ? '' : 's'}">×${n}</span>
            </div>
            <p class="skill-evidencia">${escapeHTML(ver + resto)}</p>
          </li>`;
      };

      grid.innerHTML = bloques.map(b => `
        <section class="skill-category reveal">
          <h3 class="skill-category-title">
            <span aria-hidden="true">// </span>${escapeHTML(b.nombre)}
            <span class="skill-category-count" aria-hidden="true">${b.chips.length}</span>
          </h3>
          <ul class="skills-grid" role="list">${b.chips.map(chipHTML).join('')}</ul>
        </section>`).join('');

      grid.removeAttribute('aria-busy');
      observarReveals([...grid.querySelectorAll('.reveal')]);
    } catch (err) {
      console.error('[Skills] no se pudo cargar data/proyectos.json:', err);
      grid.innerHTML = `
        <p class="skills-error" role="status">
          No se pudieron cargar las tecnologías. Revisá que el sitio se sirva por http
          y que <code>data/proyectos.json</code> sea JSON válido.
        </p>`;
    }
  }


  /* ═══════════════════════════════════════════════════════════════
     3d. ÓRBITA — carrusel de proyectos destacados
     Filtra `destacado === true` del JSON y los ordena por `orden`.
     Máximo 6 (límite del validador). Sin autoplay: flechas, dots,
     teclado (←/→) y swipe táctil. Si no hay destacados, no se muestra.
     ═══════════════════════════════════════════════════════════════ */
  async function initOrbita() {
    const orbita = document.getElementById('orbita');
    const stage  = document.getElementById('orbita-stage');
    const dotsBox = document.getElementById('orbita-dots');
    if (!orbita || !stage) return;

    try {
      const res = await fetch('data/proyectos.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const dest = (Array.isArray(data.proyectos) ? data.proyectos : [])
        .filter(p => p.destacado)
        .sort((a, b) => a.orden - b.orden);

      /* Sin destacados: la sección de tarjetas sigue sola */
      if (!dest.length) { orbita.remove(); return; }

      const n = dest.length;
      let activo = 0;

      stage.innerHTML = dest.map((p, i) => `
        <article class="orbita-card" data-i="${i}" data-d="fuera"
                 aria-roledescription="diapositiva"
                 aria-label="Destacado ${i + 1} de ${n}: ${escapeHTML(p.titulo)}">
          <div class="orbita-media">
            ${p.capturas && p.capturas[0]
              ? `<img src="${escapeHTML(p.capturas[0])}"
                     alt="${escapeHTML(p.titulo)} — captura del proyecto"
                     loading="${i === 0 ? 'eager' : 'lazy'}" />`
              : `<span class="orbita-media-ph" aria-hidden="true">alan.dev</span>`}
            <span class="orbita-cat">${escapeHTML(CATEGORIA_LABELS[p.categoria] || p.categoria)}</span>
          </div>
          <div class="orbita-body">
            <h3>${escapeHTML(p.titulo)}</h3>
            <p>${escapeHTML(p.resumen)}</p>
            <a class="project-link" href="proyecto.html?slug=${escapeHTML(p.slug)}">Ver caso completo →</a>
          </div>
        </article>`).join('');

      dotsBox.innerHTML = dest.map((p, i) => `
        <button type="button" class="orbita-dot" data-i="${i}"
                aria-label="Ir al destacado ${i + 1}: ${escapeHTML(p.titulo)}"></button>`).join('');

      const cards = [...stage.querySelectorAll('.orbita-card')];
      const dots  = [...dotsBox.querySelectorAll('.orbita-dot')];

      function mostrar(idx) {
        activo = ((idx % n) + n) % n;
        cards.forEach((c, i) => {
          let d = i - activo;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;
          if (d === -n / 2) d = n / 2;        /* empate par: siempre el mismo lado */
          const activa = d === 0;
          const fuera = Math.abs(d) > 2;
          c.dataset.d = activa ? '0' : (fuera ? 'fuera' : String(d));
          c.toggleAttribute('inert', !activa);
          c.setAttribute('aria-hidden', activa ? 'false' : 'true');
          const link = c.querySelector('a');
          if (link) link.tabIndex = activa ? 0 : -1;
        });
        dots.forEach((b, i) => {
          const on = i === activo;
          b.classList.toggle('is-active', on);
          if (on) b.setAttribute('aria-current', 'true');
          else b.removeAttribute('aria-current');
        });
        orbita.removeAttribute('aria-busy');
      }

      mostrar(0);

      /* Controles: solo aportan si hay más de uno */
      const prev = orbita.querySelector('.orbita-prev');
      const next = orbita.querySelector('.orbita-next');
      if (n < 2) {
        prev.hidden = next.hidden = dotsBox.hidden = true;
      } else {
        prev.addEventListener('click', () => mostrar(activo - 1));
        next.addEventListener('click', () => mostrar(activo + 1));
        dotsBox.addEventListener('click', e => {
          const b = e.target.closest('.orbita-dot');
          if (b) mostrar(Number(b.dataset.i));
        });
        orbita.addEventListener('keydown', e => {
          if (e.key === 'ArrowLeft')  { e.preventDefault(); mostrar(activo - 1); }
          if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(activo + 1); }
        });
        /* Swipe táctil */
        let x0 = null;
        stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
        stage.addEventListener('touchend', e => {
          if (x0 == null) return;
          const dx = e.changedTouches[0].clientX - x0;
          if (Math.abs(dx) > 40) mostrar(activo + (dx < 0 ? 1 : -1));
          x0 = null;
        }, { passive: true });
      }
    } catch (err) {
      console.error('[Órbita] no se pudo cargar data/proyectos.json:', err);
      orbita.remove();   /* no rompe la grilla de tarjetas */
    }
  }


  /* ═══════════════════════════════════════════════════════════════
     4. NAV MOBILE — Hamburger toggle
     ═══════════════════════════════════════════════════════════════ */
  /* El .line-sidebar es position:fixed y se oculta via CSS en mobile.
     No requiere lógica JS adicional. */
  function initNavMobile() {
    const sidebar = document.querySelector('.line-sidebar');
    if (!sidebar) return;   /* página sin sidebar (no debería pasar) */

    /* Se genera todo en runtime: ni index.html ni proyecto.html necesitan
       markup duplicado — los links se clonan del sidebar existente. */
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-label', 'Abrir menú de navegación');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'nav-panel');
    btn.innerHTML =
      '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'nav-panel';
    panel.className = 'nav-overlay';
    panel.hidden = true;
    panel.innerHTML =
      '<nav aria-label="Menú de navegación"><ul role="list">' +
      [...sidebar.querySelectorAll('.sidebar-link')].map(a => {
        const label = a.querySelector('.sidebar-label')?.textContent?.trim() || '';
        const href = a.getAttribute('href') || '#';
        return `<li><a href="${href}"><span class="nav-line" aria-hidden="true"></span>${label}</a></li>`;
      }).join('') +
      '</ul></nav>';
    document.body.appendChild(panel);

    function abrir() {
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Cerrar menú de navegación');
      panel.querySelector('a')?.focus();
    }
    function cerrar() {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menú de navegación');
    }

    btn.addEventListener('click', () => (panel.hidden ? abrir() : cerrar()));
    /* Clic en cualquier link del panel: navega y cierra */
    panel.addEventListener('click', e => { if (e.target.closest('a')) cerrar(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !panel.hidden) { cerrar(); btn.focus(); }
    });
    /* Si vuelven a desktop, el botón desaparece: el panel no puede quedar huerfano */
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && !panel.hidden) cerrar();
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     5. WIZARD INLINE
     ═══════════════════════════════════════════════════════════════ */
  const wizardState = { step: 1, objetivo: '', conexion: '' };

  function pulseAvatar() {
    const el = avatarVP();
    if (!el) return;
    el.classList.remove('avatar-pulse');
    void el.offsetWidth;
    el.classList.add('avatar-pulse');
    el.addEventListener('animationend', () => el.classList.remove('avatar-pulse'), { once: true });
    // Pulso del canvas de partículas (holograma)
    hologram.burst();
  }

  /* Cierre común de las 4 recomendaciones — voz del sitio (T1.2) */
  const ARCH_CIERRE = '\n\n↓ Dejame tus datos y te lo cotizo con números.';

  function getArchText(objetivo, conexion) {
    const offline = conexion === 'offline';
    const ecomm   = objetivo === 'ecommerce';
    let base;
    if (ecomm && offline)  base = 'Arquitectura recomendada:\n→ Frontend PWA con caché offline\n→ SQLite local para operaciones sin red\n→ Sincronización híbrida con Supabase al reconectar\n→ API REST para catálogo y pedidos';
    else if (ecomm && !offline) base = 'Arquitectura recomendada:\n→ Frontend dinámico con Supabase\n→ PostgreSQL en la nube\n→ API REST para catálogo, carrito y pagos\n→ Autenticación con Supabase Auth';
    else if (!ecomm && offline) base = 'Arquitectura recomendada:\n→ App web local con SQLite embebido\n→ Sincronización periódica con Supabase Cloud\n→ Panel de reportes con acceso offline\n→ Sin dependencia de conexión constante';
    else base = 'Arquitectura recomendada:\n→ Sistema web centralizado en Supabase\n→ PostgreSQL con RLS por roles\n→ Dashboard en tiempo real (Supabase Realtime)\n→ Acceso multi-usuario con permisos diferenciados';
    return base + ARCH_CIERRE;
  }

  function typewrite(el, text, speed = 20) {
    el.textContent = '';
    el.classList.add('typing');
    let i = 0;
    const id = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(id); el.classList.remove('typing'); }
    }, speed);
  }

  function transitionStep(currentEl, nextEl, onEnter) {
    currentEl.classList.add('slide-out-left');
    currentEl.setAttribute('aria-hidden', 'true');
    nextEl.classList.add('slide-right');
    nextEl.removeAttribute('aria-hidden');
    void nextEl.offsetWidth;
    requestAnimationFrame(() => nextEl.classList.remove('slide-right'));
    setTimeout(() => {
      currentEl.classList.remove('slide-out-left');
      onEnter?.();
    }, 360);
  }

  function goToStep(nextNum) {
    const wizard    = document.getElementById('wizard');
    const currentEl = wizard?.querySelector(`[data-step="${wizardState.step}"]`);
    const nextEl    = wizard?.querySelector(`[data-step="${nextNum}"]`);
    if (!currentEl || !nextEl) { if (wizard) wizard.dataset.transicion = '0'; return; }

    transitionStep(currentEl, nextEl, () => {
      wizard.dataset.transicion = '0';   /* fin de la transición: se reactivan los clics */
      wizardState.step = nextNum;

      const bar   = document.getElementById('wizard-progress-bar');
      const label = document.getElementById('wizard-progress-label');
      if (bar)   bar.style.width = `${(nextNum / 3) * 100}%`;
      if (label) label.textContent = `Paso ${nextNum} de 3`;

      if (nextNum === 3) {
        const archText = document.getElementById('arch-text');
        const textoCompleto = getArchText(wizardState.objetivo, wizardState.conexion);
        if (archText) typewrite(archText, textoCompleto);
        const form = nextEl.querySelector('form');
        if (form) {
          form.dataset.objetivo   = wizardState.objetivo;
          form.dataset.conexion   = wizardState.conexion;
          /* Texto COMPLETO guardado: si el usuario manda el form mientras
             el typewrite aún escribe, el payload no queda truncado. */
          form.dataset.archCompleta = textoCompleto;
          initContactForm(form);
        }
      }
    });
  }

  function initWizard() {
    const wizard = document.getElementById('wizard');
    if (!wizard) return;

    wizard.addEventListener('click', (e) => {
      const btn = e.target.closest('.wizard-option');
      /* Ignora clics durante la transición entre pasos: si no, un click
         rápido llega con wizardState.step viejo y pisa la respuesta
         anterior (bug hallado en la verificación de T1.6). */
      if (!btn || wizard.dataset.transicion === '1') return;

      btn.closest('.wizard-options')
        ?.querySelectorAll('.wizard-option')
        .forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');

      const value    = btn.dataset.value;
      const nextStep = parseInt(btn.dataset.next, 10);

      if (wizardState.step === 1) wizardState.objetivo = value;
      if (wizardState.step === 2) wizardState.conexion = value;

      wizard.dataset.transicion = '1';   /* bloquea clics hasta terminar la transición */
      pulseAvatar();
      setTimeout(() => goToStep(nextStep), 200);
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     6. FORMULARIO DE CONTACTO
     ═══════════════════════════════════════════════════════════════ */
  function initContactForm(form) {
    if (!form || form._initialized) return;
    form._initialized = true;

    const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const submitBtn = form.querySelector('button[type="submit"]');
    const fields    = {
      nombre:  form.querySelector('#nombre'),
      email:   form.querySelector('#email'),
      mensaje: form.querySelector('#mensaje'),
    };

    function validateField(input, fn) {
      if (!input) return true;
      const ok    = fn(input.value.trim());
      const group = input.closest('.form-group');
      input.classList.toggle('field-error', !ok);
      let err = group.querySelector('.form-error-msg');
      if (!ok) {
        if (!err) {
          err = document.createElement('span');
          err.className = 'form-error-msg';
          err.setAttribute('role', 'alert');
          group.appendChild(err);
        }
        err.textContent = (input.id === 'email' && input.value.trim())
          ? 'Ingresá un email válido (ej: nombre@dominio.com).'
          : 'Este campo es obligatorio.';
      } else { err?.remove(); }
      return ok;
    }

    function validateAll() {
      return [
        validateField(fields.nombre, v => v.length > 0),
        validateField(fields.email,  v => v.length > 0 && EMAIL_RE.test(v)),
      ].every(Boolean);
    }

    fields.nombre?.addEventListener('blur', () => validateField(fields.nombre, v => v.length > 0));
    fields.email?.addEventListener('blur',  () => validateField(fields.email,  v => v.length > 0 && EMAIL_RE.test(v)));

    const STATES = {
      idle:       { text: 'Enviar propuesta →', disabled: false },
      processing: { text: 'Enviando...',         disabled: true  },
      success:    { text: '✓ Propuesta enviada', disabled: true  },
      error:      { text: 'Reintentar →',         disabled: false },
    };

    function setBtn(state) {
      submitBtn.textContent = STATES[state].text;
      submitBtn.disabled    = STATES[state].disabled;
    }

    /* POST al web app de Google Apps Script.
       Content-Type text/plain mantiene el request "simple" (sin preflight
       OPTIONS, que Apps Script no maneja). La respuesta final llega con
       Access-Control-Allow-Origin: * → la leemos y verificamos
       {"status":"ok"}: el ✓ del botón ahora significa que el servidor
       confirmó el guardado, no un éxito optimista (antes: no-cors opaco). */
    async function enviarForm(row) {
      if (!FORM_ENDPOINT) throw new Error('[Form] endpoint no configurado');
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(row),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      let data;
      try { data = await res.json(); }
      catch { throw new Error('respuesta inesperada del servidor'); }
      if (data.status !== 'ok') {
        const err = new Error(data.message || 'el servidor rechazó el mensaje');
        err.detalle = data.detalle;
        throw err;
      }
      return data;
    }

    /* Éxito compartido: el envío real y el descarte por honeypot
       muestran el mismo mensaje (no se avisa a los bots). */
    function mostrarExito() {
      setBtn('success');
      form.reset();
      const msg = document.createElement('div');
      msg.className = 'form-success';
      msg.setAttribute('role', 'status');
      msg.textContent = '✓ ¡Propuesta enviada! Alan la recibió y se pondrá en contacto pronto.';
      submitBtn.insertAdjacentElement('beforebegin', msg);
      setTimeout(() => { msg.remove(); setBtn('idle'); }, 7000);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateAll()) { form.querySelector('.field-error')?.focus(); return; }

      form.querySelector('.form-success')?.remove();
      form.querySelector('.form-send-error')?.remove();

      /* Honeypot: el campo oculto "empresa" solo lo rellenan bots.
         Éxito fingido, sin insertar nada (T1.6 — anti-spam). */
      const honeypot = form.querySelector('#empresa');
      if (honeypot && honeypot.value.trim() !== '') {
        console.warn('[ContactForm] envío descartado: honeypot relleno');
        mostrarExito();
        return;
      }

      setBtn('processing');

      const payload = {
        nombre:                fields.nombre.value.trim(),
        email:                 fields.email.value.trim(),
        mensaje:               fields.mensaje?.value.trim() ?? '',
        objetivo_negocio:      form.dataset.objetivo || '',
        requiere_offline:      form.dataset.conexion === 'offline',
        arquitectura_sugerida: form.dataset.archCompleta
                               || document.getElementById('arch-text')?.textContent.trim()
                               || '',
        empresa:               '',   /* honeypot: vacío = humano */
      };

      try {
        await enviarForm(payload);
        pulseAvatar();
        mostrarExito();
      } catch (err) {
        console.error('[ContactForm]', err, err.detalle || '');
        setBtn('error');
        const errEl = document.createElement('p');
        errEl.className = 'form-send-error';
        errEl.setAttribute('role', 'alert');
        errEl.textContent = 'No se pudo enviar. Reintentá o escribime por WhatsApp.';
        submitBtn.insertAdjacentElement('beforebegin', errEl);
        setTimeout(() => { errEl.remove(); setBtn('idle'); }, 7000);
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════════ */
  function init() {
    /* 0 — BlurText en el h1 del Hero (Web Animations API, sin dependencias) */
    initBlurText('#hero-heading', {
      animateBy:    'words',
      direction:    'top',
      delay:        150,
      stepDuration: 0.35,
      threshold:    0.1,
    });

    const canvasEl = document.getElementById('hologram-canvas');
    if (canvasEl) hologram.init(canvasEl);

    initScrollytelling();
    initReveal();
    initNavMobile();
    initWizard();
    initProyectosGrid();   /* tarjetas desde data/proyectos.json (async) */
    initSkills();          /* chips de skills desde los stack del JSON (async) */
    initOrbita();          /* carrusel de destacados desde el JSON (async) */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
