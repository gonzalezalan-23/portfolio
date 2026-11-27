/**
 * app.js — Alan.dev Portfolio
 * Módulos:
 *   0. initBlurText       — BlurText replica: anima el h1 del Hero palabra a palabra (Web Animations API)
 *   1. initHologramCanvas — Canvas de partículas/threads orbitales bajo el avatar
 *   2. initScrollytelling — detecta la sección dominante para la nav y el canvas
 *   3. initReveal         — Anima .reveal al entrar en viewport
 *   4. (nav.js)           — Barra superior, menú móvil y progreso
 *   5. initWizard         — Pasos del wizard de contacto + pulso del canvas
 *   6. initContactForm    — Validación y envío real del mensaje por email
 */
(() => {
  'use strict';

  /* Envío real sin backend propio: Web3Forms recibe el POST y reenvía el
     mensaje al mail. La access_key es pública por diseño (equivale a la
     dirección de destino), no es un secreto. Gmail/Outlook y Copiar
     quedan sólo como respaldo. */
  const CONTACTO_EMAIL = 'gonzalez.alan.dev@gmail.com';
  const FORM_ENDPOINT = 'https://api.web3forms.com/submit';
  const WEB3FORMS_KEY = '1d5d00cc-40ae-441b-af80-e6057d6f5d29';


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
     Detecta la sección dominante para marcar la navegación y ajustar
     la velocidad del canvas. Los avatares son imágenes en flujo.
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
    const navItems     = document.querySelectorAll('.topnav-item');
    const navCta       = document.querySelector('.topbar-cta');
    const scrollRoot   = document.querySelector('.scroll-container');
    const secciones    = [...document.querySelectorAll('[data-section]')];
    let actual         = null;

    function syncNav(sectionId) {
      navItems.forEach(item => {
        const link   = item.querySelector('.topnav-link');
        const target = link?.dataset.target;
        const activo = target === sectionId;
        item.classList.toggle('is-active', activo);
        if (activo) link?.setAttribute('aria-current', 'page');
        else link?.removeAttribute('aria-current');
      });
      /* Contacto no está en la lista de links: vive en el CTA rojo. */
      navCta?.classList.toggle('is-active', sectionId === 'contacto');
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

      /* a) Barra superior */
      syncNav(section);

      /* b) Velocidad del holograma */
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
       no notifica — la barra/avatar quedaban congelados en la anterior.
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
         barra y el avatar quedan trabados en la sección inicial (F7 QA). */
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

      /* Si el dueño agrega una tecnología nueva y todavía no la categoria,
         igual aparece: nunca se cae información del JSON. */
      const sinCategoria = ordenadas.filter(s => !asignadas.has(s.key));
      if (sinCategoria.length) bloques.push({ nombre: 'En proyectos', chips: sinCategoria });

      /* Logos guardados en local (Simple Icons, CC0). Ninguna petición
         externa: el sitio sigue andando sin wifi. Si una herramienta no
         tiene logo, cae a un monograma con el mismo estilo. */
      const ICONOS = {
        'html/css':      ['html5', 'css'],
        'html/js':       ['html5', 'javascript'],
        'js vanilla':    ['javascript'],
        'vue 3':         ['vuedotjs'],
        'tailwind css':  ['tailwindcss'],
        'php':           ['php'],
        'python':        ['python'],
        'mercado pago':  ['mercadopago'],
        'supabase':      ['supabase'],
        'mysql':         ['mysql'],
        'sqlite':        ['sqlite'],
        'arduino':       ['arduino'],
        'arduino/esp32': ['arduino'],
        'c++':           ['cplusplus'],
        'vite':          ['vite'],
      };
      const MONOGRAMAS = {
        'customtkinter': 'CT', 'ia (groq)': 'IA', 'emailjs': 'EJ',
        'localstorage': 'LS', 'esp32': 'E32', 'wifi ap': 'AP',
        'rf 433 mhz': 'RF', 'modelado 3d': '3D',
      };
      const iconoHTML = (s) => {
        const archivos = ICONOS[s.key] || [];
        if (archivos.length) {
          return `<span class="skill-icon" aria-hidden="true">${archivos
            .map(a => `<img src="assets/img/icons/${a}.svg" alt="" />`).join('')}</span>`;
        }
        const siglas = MONOGRAMAS[s.key] || s.label.slice(0, 2).toUpperCase();
        return `<span class="skill-icon skill-icon-text" aria-hidden="true">${escapeHTML(siglas)}</span>`;
      };

      /* Chips compactos: la evidencia sigue disponible en el tooltip y en
         el aria-label, pero la grilla de 5 columnas desaparece. */
      const chipHTML = (s) => {
        const n = s.proyectos.length;
        const ver = s.proyectos.slice(0, 2).map(p => p.titulo).join(' · ');
        const resto = n > 2 ? ` +${n - 2}` : '';
        const detalle = `${ver}${resto}`;
        return `
          <li class="skill-chip" title="Usado en ${escapeHTML(detalle)}">
            ${iconoHTML(s)}
            <span class="skill-chip-name">${escapeHTML(s.label)}</span>
            <span class="skill-chip-count" aria-label="usado en ${n} proyecto${n === 1 ? '' : 's'}: ${escapeHTML(detalle)}">×${n}</span>
          </li>`;
      };

      grid.innerHTML = bloques.map(b => `
        <section class="skill-row">
          <h3 class="skill-row-title">
            <span aria-hidden="true">// </span>${escapeHTML(b.nombre)}
            <span class="skill-row-count" aria-hidden="true">${b.chips.length}</span>
          </h3>
          <ul class="skill-chips" role="list">${b.chips.map(chipHTML).join('')}</ul>
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


  /* 4. Navegación: la gestiona nav.js (barra superior + panel móvil). */


  /* ═══════════════════════════════════════════════════════════════
     5. WIZARD INLINE
     ═══════════════════════════════════════════════════════════════ */
  const wizardState = { step: 1, objetivo: '', conexion: '' };

  function pulseAvatar() {
    /* El avatar es una imagen estática: sólo responde el holograma. */
    hologram.burst();
  }

  /* Cierre común de las 4 recomendaciones — voz del sitio (T1.2) */
  const ARCH_CIERRE = '\n\n↓ Deje sus datos y recibirá una cotización con valores.';

  function getArchText(objetivo, conexion) {
    const offline = conexion === 'offline';
    const ecomm   = objetivo === 'ecommerce';
    let base;
    if (ecomm && offline)  base = 'Propuesta recomendada:\n→ Una tienda que funcione también sin internet\n→ Los pedidos se guardan y se envían al volver la conexión\n→ Catálogo y cobros fáciles de administrar';
    else if (ecomm && !offline) base = 'Propuesta recomendada:\n→ Una tienda propia, con su marca y sus cobros\n→ Catálogo, carrito y pagos en un mismo lugar\n→ Accesos distintos para quien administra y quien compra';
    else if (!ecomm && offline) base = 'Propuesta recomendada:\n→ Una herramienta que funcione también sin internet\n→ Los datos se guardan y se acomodan después\n→ Informes claros para seguir el estado del trabajo';
    else base = 'Propuesta recomendada:\n→ Un sistema único, al que se accede desde donde se trabaje\n→ Cada persona ve sólo lo que le corresponde\n→ Datos e informes al día, sin planillas duplicadas';
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
    currentEl.setAttribute('inert', '');
    nextEl.classList.add('slide-right');
    nextEl.removeAttribute('aria-hidden');
    nextEl.removeAttribute('inert');
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
      idle:     { text: 'Enviar mensaje →',  disabled: false },
      enviando: { text: 'Enviando…',         disabled: true  },
      success:  { text: '✓ Mensaje enviado', disabled: true  },
      error:    { text: 'Reintentar envío →', disabled: false },
    };

    function setBtn(state) {
      submitBtn.textContent = STATES[state].text;
      submitBtn.disabled    = STATES[state].disabled;
    }

    const OBJETIVO_LABEL = {
      ecommerce:         'Vender online / Ecommerce',
      'control-interno': 'Control interno / Stock',
    };
    const CONEXION_LABEL = {
      offline: 'Sí, es crítico',
      online:  'No, siempre hay conexión',
    };

    /* Arma el correo con lo que eligió en el wizard: el mismo texto se
       envía por Web3Forms y se ofrece como respaldo en el panel. */
    function armarMensaje() {
      const nombre   = fields.nombre.value.trim();
      const email    = fields.email.value.trim();
      const mensaje  = fields.mensaje?.value.trim() ?? '';
      const objetivo = OBJETIVO_LABEL[form.dataset.objetivo] || 'No especificado';
      const conexion = CONEXION_LABEL[form.dataset.conexion] || 'No especificado';
      const idea     = form.dataset.archCompleta
                       || document.getElementById('arch-text')?.textContent.trim()
                       || '';

      const asunto = `Consulta desde alan.dev — ${objetivo}`;
      const cuerpo = [
        'Hola Alan,',
        '',
        'Me contacto desde su portfolio.',
        '',
        `Nombre: ${nombre}`,
        `Email: ${email}`,
        `Qué necesito: ${objetivo}`,
        `Sin internet: ${conexion}`,
        '',
        idea,
        '',
        'Contexto adicional:',
        mensaje || '(sin datos adicionales)',
        '',
        'Gracias.',
      ].join('\n');

      /* Web3Forms usa access_key, subject y replyto; el resto llega tal cual
         al mail. `mensaje` lleva el correo completo redactado arriba. */
      const payload = {
        access_key: WEB3FORMS_KEY,
        subject: asunto,
        from_name: 'Portfolio alan.dev',
        replyto: email,
        email,
        botcheck: '',
        nombre,
        necesito: objetivo,
        sin_internet: conexion,
        propuesta_recomendada: idea,
        mensaje: cuerpo,
      };

      const gmail = 'https://mail.google.com/mail/?view=cm&fs=1'
                  + `&to=${encodeURIComponent(CONTACTO_EMAIL)}`
                  + `&su=${encodeURIComponent(asunto)}`
                  + `&body=${encodeURIComponent(cuerpo)}`;
      const outlook = 'https://outlook.live.com/mail/0/deeplink/compose'
                    + `?to=${encodeURIComponent(CONTACTO_EMAIL)}`
                    + `&subject=${encodeURIComponent(asunto)}`
                    + `&body=${encodeURIComponent(cuerpo)}`;
      return { asunto, cuerpo, gmail, outlook, payload };
    }

    /* El panel deja el mensaje visible y ofrece Gmail/Outlook/Copiar como
       respaldo. Nunca borramos lo que escribió la persona. */
    function mostrarListo(datos, estado = 'enviado', detalle = '') {
      form.querySelector('.form-mail-ready')?.remove();
      const enviado = estado === 'enviado';

      const panel = document.createElement('div');
      panel.className = 'form-mail-ready' + (enviado ? '' : ' is-error');
      panel.setAttribute('role', enviado ? 'status' : 'alert');

      const titulo = document.createElement('p');
      titulo.className = 'form-ready-title';
      titulo.textContent = enviado
        ? '✓ Mensaje enviado. Te respondo por email.'
        : '✗ No se pudo enviar automáticamente.';

      const copy = document.createElement('p');
      copy.className = 'form-ready-copy';
      if (enviado) {
        copy.textContent = 'Tu mensaje llegó a ';
        const mailLink = document.createElement('a');
        mailLink.href = `mailto:${CONTACTO_EMAIL}`;
        mailLink.textContent = CONTACTO_EMAIL;
        copy.appendChild(mailLink);
        copy.appendChild(document.createTextNode('. Si querés, también podés copiarlo o abrirlo en tu correo.'));
      } else {
        copy.textContent = 'El servicio no pudo enviarlo'
          + (detalle ? `: ${detalle.replace(/\.$/, '')}` : '')
          + '. Copiá el texto y enviálo desde Gmail, Outlook o tu correo: ';
        const mailLink = document.createElement('a');
        mailLink.href = `mailto:${CONTACTO_EMAIL}`;
        mailLink.textContent = CONTACTO_EMAIL;
        copy.appendChild(mailLink);
        copy.appendChild(document.createTextNode('.'));
      }

      const meta = document.createElement('dl');
      meta.className = 'form-ready-meta';
      const fila = (etiqueta, valor) => {
        const div = document.createElement('div');
        const dt = document.createElement('dt');
        dt.textContent = etiqueta;
        const dd = document.createElement('dd');
        dd.textContent = valor;
        div.append(dt, dd);
        return div;
      };
      meta.append(
        fila('Para', CONTACTO_EMAIL),
        fila('Asunto', datos.asunto),
        fila('Estado', enviado ? 'Enviado' : 'Sin enviar')
      );

      const label = document.createElement('label');
      label.className = 'form-ready-label';
      label.htmlFor = 'mensaje-listo';
      label.textContent = 'Mensaje';

      const area = document.createElement('textarea');
      area.id = 'mensaje-listo';
      area.className = 'form-ready-text';
      area.rows = 9;
      area.readOnly = true;
      area.value = datos.cuerpo;

      const actions = document.createElement('div');
      actions.className = 'form-ready-actions';

      const copiar = document.createElement('button');
      copiar.type = 'button';
      copiar.className = 'btn-open-mail';
      copiar.textContent = 'Copiar mensaje';

      const gmail = document.createElement('a');
      gmail.className = 'btn-secondary';
      gmail.href = datos.gmail;
      gmail.target = '_blank';
      gmail.rel = 'noopener noreferrer';
      gmail.textContent = 'Abrir Gmail ↗';

      const outlook = document.createElement('a');
      outlook.className = 'btn-secondary';
      outlook.href = datos.outlook;
      outlook.target = '_blank';
      outlook.rel = 'noopener noreferrer';
      outlook.textContent = 'Abrir Outlook ↗';

      const cerrar = document.createElement('button');
      cerrar.type = 'button';
      cerrar.className = 'btn-ready-close';
      cerrar.textContent = 'Cerrar';

      copiar.addEventListener('click', async () => {
        let ok = false;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(datos.cuerpo);
            ok = true;
          }
        } catch { /* cae al método de abajo */ }
        if (!ok) {
          area.focus();
          area.select();
          ok = document.execCommand('copy');
        }
        copiar.textContent = ok ? '✓ Copiado' : 'Seleccioná y copiá el texto';
        setTimeout(() => { copiar.textContent = 'Copiar mensaje'; }, 2500);
      });

      cerrar.addEventListener('click', () => {
        panel.remove();
        setBtn(enviado ? 'success' : 'idle');
      });

      actions.append(copiar, gmail, outlook, cerrar);
      panel.append(titulo, copy, meta, label, area, actions);
      submitBtn.insertAdjacentElement('beforebegin', panel);
      panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateAll() || submitBtn.disabled) {
        form.querySelector('.field-error')?.focus();
        return;
      }

      const datos = armarMensaje();
      setBtn('enviando');
      form.querySelector('.form-mail-ready')?.remove();

      let detalle = '';
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(datos.payload),
        });
        const respuesta = (await res.json().catch(() => ({}))) || {};
        /* Web3Forms responde success en booleano; aceptamos también el
           string por si el servicio cambia el formato. */
        if (res.ok && (respuesta.success === true || String(respuesta.success) === 'true')) {
          setBtn('success');
          pulseAvatar();
          mostrarListo(datos, 'enviado');
          return;
        }
        const msg = typeof respuesta.message === 'string'
          ? respuesta.message
          : (respuesta.message?.detail || respuesta.message?.error || '');
        detalle = msg || `error ${res.status} del servicio de correo`;
      } catch (err) {
        detalle = 'sin conexión con el servicio de correo';
      }
      setBtn('error');
      mostrarListo(datos, 'error', detalle);
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     NAVEGACIÓN INTERNA — offset exacto para la barra fija
     El scroll vive en .scroll-container, no en window. Apoyarse en el
     #hash del navegador solo era impreciso: el contenido de proyectos y
     skills se inyecta después y el ancla se movía. Acá calculamos el
     destino contra la altura real de la barra y lo corregimos al terminar
     de cargar el JSON.
     ═══════════════════════════════════════════════════════════════ */
  function irASeccion(id, suave = true) {
    const destino = document.getElementById(id);
    if (!destino) return;
    const scroller = document.querySelector('.scroll-container');
    const barra = document.querySelector('.topbar');
    const altoBarra = barra ? barra.getBoundingClientRect().height : 0;
    const barraSecreta = document.getElementById('secret-bar');
    const altoSecreta = barraSecreta ? barraSecreta.getBoundingClientRect().height : 0;
    const offset = altoBarra + altoSecreta > 0 ? altoBarra + altoSecreta : 72;
    const actual = scroller ? scroller.scrollTop : window.scrollY;
    const top = Math.max(0, destino.getBoundingClientRect().top + actual - offset);
    if (scroller) scroller.scrollTo({ top, behavior: suave ? 'smooth' : 'instant' });
    else window.scrollTo({ top, behavior: suave ? 'smooth' : 'instant' });
  }

  function initNavegacionInterna() {
    let navegoUsuario = false;

    document.addEventListener('click', (evento) => {
      const link = evento.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href').slice(1);
      if (!id || !document.getElementById(id)) return;
      evento.preventDefault();
      navegoUsuario = true;
      irASeccion(id);
      history.replaceState(null, '', `#${id}`);
    });

    /* Al llegar con #hash desde otra página, sacamos el fragmento antes de
       que el navegador haga SU scroll (que calcula con un layout todavía
       incompleto) y lo reaplicamos cuando el JSON ya renderizó. */
    const hashInicial = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    if (hashInicial) history.replaceState(null, '', location.pathname + location.search);

    Promise.allSettled([initSkillsPromise, initOrbitaPromise]).then(() => {
      if (navegoUsuario || !hashInicial || !document.getElementById(hashInicial)) return;
      irASeccion(hashInicial, false);
      history.replaceState(null, '', `#${hashInicial}`);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════════ */
  let initSkillsPromise = Promise.resolve();
  let initOrbitaPromise = Promise.resolve();

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
    initWizard();
    initSkillsPromise  = Promise.resolve(initSkills());  /* skills desde el JSON */
    initOrbitaPromise  = Promise.resolve(initOrbita());  /* destacados desde el JSON */
    initNavegacionInterna();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
