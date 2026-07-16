/**
 * app.js — Alan.dev Portfolio
 *
 * Módulos:
 *   1. initScrollAnimations  — Fade-in-up con Intersection Observer
 *   2. initMobileNav         — Menú hamburguesa responsivo
 *   3. initContactForm       — Validación y estados del formulario (paso 3 del wizard)
 *   4. initHeroCanvas        — Simulador de flujo de datos (Canvas 2D + rAF)
 *   5. initQuotationWizard   — Cotizador interactivo por pasos con transiciones slide
 *
 * Patrón: IIFE para encapsular todo y no contaminar el scope global.
 * Requisito: ES6+ nativo, sin dependencias externas.
 */
(() => {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     CONFIGURACIÓN SUPABASE
     Reemplazá los valores de las constantes con tus credenciales
     reales del proyecto en https://supabase.com/dashboard
     ═══════════════════════════════════════════════════════════════ */
  const SUPABASE_URL      = 'https://odlhbmeaessdemdizeru.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbGhibWVhZXNzZGVtZGl6ZXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMjQzMjAsImV4cCI6MjA5OTgwMDMyMH0.k7e1sne2hSDYybNcPmePQ_IZD7ZZe_OA4EMrkmroibQ';
  const SUPABASE_TABLE    = 'proyectos_recibidos';


  /* ═══════════════════════════════════════════════════════════════
     1. ANIMACIONES DE ENTRADA AL HACER SCROLL
     ═══════════════════════════════════════════════════════════════ */
  function initScrollAnimations() {
    const SELECTORS = [
      'main > section > header',
      '.step',
      '.project-card',
      '#quotation-wizard',
    ];

    const targets = document.querySelectorAll(SELECTORS.join(', '));
    if (!targets.length) return;

    targets.forEach(el => el.classList.add('animate-on-scroll'));

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(el => observer.observe(el));
  }


  /* ═══════════════════════════════════════════════════════════════
     2. MENÚ DE NAVEGACIÓN MOBILE
     ═══════════════════════════════════════════════════════════════ */
  function initMobileNav() {
    const toggle   = document.querySelector('.nav-toggle');
    const navMenu  = document.getElementById('nav-menu');
    const navLinks = navMenu?.querySelectorAll('a');

    if (!toggle || !navMenu) return;

    function setMenuState(isOpen) {
      toggle.setAttribute('aria-expanded', String(isOpen));
      navMenu.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    toggle.addEventListener('click', () => {
      setMenuState(toggle.getAttribute('aria-expanded') !== 'true');
    });

    navLinks?.forEach(link => {
      link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('click', (e) => {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (!e.target.closest('header[role="banner"]')) setMenuState(false);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 640) setMenuState(false);
    }, { passive: true });
  }


  /* ═══════════════════════════════════════════════════════════════
     3. FORMULARIO DE CONTACTO (paso 3 del wizard)
        Se inicializa desde initQuotationWizard al llegar al paso 3.
        Envía los datos a Supabase via fetch nativo (REST API).
     ═══════════════════════════════════════════════════════════════ */
  function initContactForm(form) {
    if (!form) return;

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const submitBtn   = form.querySelector('button[type="submit"]');

    /* ── Campos del formulario ──────────────────────────────────── */
    const fields = {
      nombre:  form.querySelector('#nombre'),
      email:   form.querySelector('#email'),
      mensaje: form.querySelector('#mensaje'),
    };

    /* ── Validación inline ──────────────────────────────────────── */

    /**
     * Valida un campo y gestiona su mensaje de error accesible.
     * @param {HTMLElement} input
     * @param {Function}    validatorFn  — recibe el valor trimmed, retorna boolean
     * @returns {boolean}
     */
    function validateField(input, validatorFn) {
      if (!input) return true; // campo opcional ausente en el DOM
      const isValid = validatorFn(input.value.trim());
      const group   = input.closest('.form-group');
      input.classList.toggle('field-error', !isValid);

      let errorEl = group.querySelector('.form-error-msg');
      if (!isValid) {
        if (!errorEl) {
          errorEl = document.createElement('span');
          errorEl.className = 'form-error-msg';
          errorEl.setAttribute('role', 'alert');
          group.appendChild(errorEl);
        }
        errorEl.textContent = (input.id === 'email' && input.value.trim())
          ? 'Ingresá un email con formato válido (ej: nombre@dominio.com).'
          : 'Este campo es obligatorio.';
      } else {
        errorEl?.remove();
      }
      return isValid;
    }

    function validateForm() {
      return [
        validateField(fields.nombre,  val => val.length > 0),
        validateField(fields.email,   val => val.length > 0 && EMAIL_REGEX.test(val)),
        validateField(fields.mensaje, val => !fields.mensaje || val.length > 0),
      ].every(Boolean);
    }

    // Feedback inmediato al salir de cada campo
    fields.nombre?.addEventListener('blur',  () => validateField(fields.nombre,  val => val.length > 0));
    fields.email?.addEventListener('blur',   () => validateField(fields.email,   val => val.length > 0 && EMAIL_REGEX.test(val)));
    fields.mensaje?.addEventListener('blur', () => validateField(fields.mensaje, val => val.length > 0));

    /* ── Estados del botón ──────────────────────────────────────── */

    const BTN_STATES = {
      idle:       { text: 'Enviar propuesta →',          disabled: false },
      processing: { text: 'Procesando Arquitectura...',  disabled: true  },
      success:    { text: '✓ Propuesta enviada',         disabled: true  },
      error:      { text: 'Reintentar →',                disabled: false },
    };

    function setButtonState(state) {
      const { text, disabled } = BTN_STATES[state];
      submitBtn.textContent   = text;
      submitBtn.disabled      = disabled;
      submitBtn.dataset.state = state;
    }

    /* ── Cliente HTTP Supabase (fetch nativo) ───────────────────── */

    /**
     * Inserta una fila en SUPABASE_TABLE usando la REST API de Supabase.
     * Supabase devuelve 201 Created en inserciones exitosas.
     * @param {Object} row — objeto con los campos de la tabla
     * @throws {Error}     — si la respuesta HTTP no es ok
     */
    async function supabaseInsert(row) {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'apikey':        SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            // Solicita que Supabase devuelva la fila insertada
            'Prefer':        'return=minimal',
          },
          body: JSON.stringify(row),
        }
      );

      if (!response.ok) {
        // Intenta extraer el mensaje de error del body de Supabase
        let detail = `HTTP ${response.status}`;
        try {
          const errBody = await response.json();
          detail = errBody.message || errBody.error || detail;
        } catch (_) { /* body no es JSON, usa el status */ }
        throw new Error(`[Supabase] ${detail}`);
      }
    }

    /* ── Feedback visual de éxito ───────────────────────────────── */

    function showSuccess() {
      // Evita duplicados si el usuario envía varias veces
      if (form.querySelector('.form-success')) return;

      const msg = document.createElement('div');
      msg.className = 'form-success';
      msg.setAttribute('role', 'status');
      msg.innerHTML = [
        '<span class="form-success-icon" aria-hidden="true">✓</span>',
        '<p>¡Propuesta recibida con éxito!</p>',
        '<p>Alan se pondrá en contacto pronto.</p>',
      ].join('');

      // Inserta el mensaje antes del botón para que sea visible sin scroll
      submitBtn.insertAdjacentElement('beforebegin', msg);

      // Auto-elimina después de 7 segundos
      setTimeout(() => msg.remove(), 7000);
    }

    /* ── Feedback visual de error ───────────────────────────────── */

    function showError(message) {
      // Reutiliza el elemento si ya existe
      let errorEl = form.querySelector('.form-send-error');
      if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.className = 'form-send-error';
        errorEl.setAttribute('role', 'alert');
        submitBtn.insertAdjacentElement('beforebegin', errorEl);
      }
      errorEl.textContent = message;
      setTimeout(() => errorEl?.remove(), 7000);
    }

    /* ── Limpieza del formulario ────────────────────────────────── */

    function resetForm() {
      form.reset();
      form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
      form.querySelectorAll('.form-error-msg').forEach(el => el.remove());
    }

    /* ── Submit handler ─────────────────────────────────────────── */

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        form.querySelector('.field-error')?.focus();
        return;
      }

      // Elimina mensajes de estado previos antes de un nuevo intento
      form.querySelector('.form-success')?.remove();
      form.querySelector('.form-send-error')?.remove();

      setButtonState('processing');

      /* ── Payload estructurado para la tabla 'proyectos_recibidos' ── */
      const payload = {
        nombre:              fields.nombre.value.trim(),
        email:               fields.email.value.trim(),
        mensaje:             fields.mensaje?.value.trim() ?? '',
        objetivo_negocio:    form.dataset.objetivo  || '',
        requiere_offline:    form.dataset.conexion === 'offline',
        arquitectura_sugerida: document.getElementById('arch-text')?.textContent.trim() ?? '',
      };

      try {
        await supabaseInsert(payload);

        setButtonState('success');
        resetForm();
        showSuccess();

        // Restaura el botón al estado idle después de que el mensaje desaparezca
        setTimeout(() => setButtonState('idle'), 7000);

      } catch (err) {
        console.error('[ContactForm] Error al enviar a Supabase:', err);
        setButtonState('error');
        showError('Hubo un problema al enviar. Revisá tu conexión e intentá de nuevo.');

        // Restaura el botón idle después de 7 segundos para no bloquear al usuario
        setTimeout(() => setButtonState('idle'), 7000);
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     4. HERO CANVAS — Simulador de flujo de datos
        Renderiza 3 nodos conectados por líneas con partículas
        que viajan entre ellos. El mouse ejerce una fuerza de
        atracción suave sobre las partículas cercanas.
     ═══════════════════════════════════════════════════════════════ */
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx    = canvas.getContext('2d');
    const ACCENT = '#58a6ff';
    const MUTED  = '#30363d';

    /* ── Configuración ──────────────────────────────────────────── */
    const NODE_DEFS = [
      { label: 'Cliente / Web',       relX: 0.18, relY: 0.38 },
      { label: 'Base de Datos Local', relX: 0.50, relY: 0.65 },
      { label: 'Nube / Supabase',     relX: 0.82, relY: 0.38 },
    ];

    const PARTICLE_COUNT  = 18;
    const PARTICLE_RADIUS = 2.5;
    const BASE_SPEED      = 0.0018;  // fracción del segmento por frame
    const MOUSE_RADIUS    = 140;     // px de influencia del mouse
    const MOUSE_STRENGTH  = 0.28;    // factor de aceleración máxima

    /* ── Estado ─────────────────────────────────────────────────── */
    let W, H;
    let nodes      = [];
    let particles  = [];
    let mouse      = { x: -9999, y: -9999 };
    let rafId      = null;
    let isVisible  = true;

    /* ── Resize ─────────────────────────────────────────────────── */
    function resize() {
      const hero = canvas.parentElement;
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;

      // Recalcula posiciones absolutas de nodos al cambiar tamaño
      nodes = NODE_DEFS.map(def => ({
        x:     W * def.relX,
        y:     H * def.relY,
        label: def.label,
      }));
    }

    /* ── Partículas ─────────────────────────────────────────────── */

    /**
     * Crea una partícula en un punto aleatorio de un segmento
     * entre dos nodos consecutivos (o aleatorios).
     */
    function createParticle(forceNew = false) {
      // Elige un segmento: 0→1, 1→2, o 2→0
      const EDGES = [[0, 1], [1, 2], [2, 0]];
      const edge  = EDGES[Math.floor(Math.random() * EDGES.length)];

      return {
        fromIdx:  edge[0],
        toIdx:    edge[1],
        progress: forceNew ? Math.random() : 0,  // posición en el segmento [0,1]
        speed:    BASE_SPEED * (0.6 + Math.random() * 0.8),
        size:     PARTICLE_RADIUS * (0.7 + Math.random() * 0.6),
        opacity:  0.5 + Math.random() * 0.5,
      };
    }

    function initParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(true));
    }

    /* ── Render loop ────────────────────────────────────────────── */
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // — Líneas de conexión entre nodos —
      ctx.strokeStyle = MUTED;
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 6]);

      [[0, 1], [1, 2], [2, 0]].forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
      });

      ctx.setLineDash([]);

      // — Nodos —
      nodes.forEach(node => {
        // Halo exterior
        const grad = ctx.createRadialGradient(node.x, node.y, 4, node.x, node.y, 22);
        grad.addColorStop(0, 'rgba(88,166,255,0.18)');
        grad.addColorStop(1, 'rgba(88,166,255,0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Círculo del nodo
        ctx.beginPath();
        ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
        ctx.fillStyle   = ACCENT;
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur  = 10;
        ctx.fill();
        ctx.shadowBlur  = 0;

        // Etiqueta del nodo
        ctx.font      = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(139,148,158,0.85)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + 22);
      });

      // — Partículas —
      particles.forEach(p => {
        const from = nodes[p.fromIdx];
        const to   = nodes[p.toIdx];

        // Posición actual en el segmento
        const x = from.x + (to.x - from.x) * p.progress;
        const y = from.y + (to.y - from.y) * p.progress;

        // Influencia del mouse: acelera si está cerca
        const dx   = mouse.x - x;
        const dy   = mouse.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const boost = dist < MOUSE_RADIUS
          ? 1 + MOUSE_STRENGTH * (1 - dist / MOUSE_RADIUS)
          : 1;

        p.progress += p.speed * boost;

        // Al llegar al nodo destino, elige un nuevo segmento
        if (p.progress >= 1) {
          const nextEdges = [[0, 1], [1, 2], [2, 0]].filter(
            ([a]) => a === p.toIdx
          );
          const next = nextEdges[Math.floor(Math.random() * nextEdges.length)];
          p.fromIdx  = next[0];
          p.toIdx    = next[1];
          p.progress = 0;
          p.speed    = BASE_SPEED * (0.6 + Math.random() * 0.8);
        }

        // Dibuja la partícula
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle   = `rgba(88,166,255,${p.opacity})`;
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur  = 6;
        ctx.fill();
        ctx.shadowBlur  = 0;
      });

      rafId = requestAnimationFrame(draw);
    }

    /* ── Eventos ────────────────────────────────────────────────── */
    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });

    canvas.parentElement.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
    }, { passive: true });

    // Pausa el loop cuando el hero no es visible (ahorro de CPU)
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !rafId) { rafId = requestAnimationFrame(draw); }
        if (!isVisible && rafId) { cancelAnimationFrame(rafId); rafId = null; }
      },
      { threshold: 0.01 }
    );
    heroObserver.observe(canvas.parentElement);

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    }, { passive: true });

    /* ── Arranque ───────────────────────────────────────────────── */
    resize();
    initParticles();
    rafId = requestAnimationFrame(draw);
  }


  /* ═══════════════════════════════════════════════════════════════
     5. COTIZADOR WIZARD — Pasos interactivos con transición slide
        Estado: { step, objetivo, conexion }
        Transición: fade-out izquierda → fade-in derecha via clases CSS
     ═══════════════════════════════════════════════════════════════ */
  function initQuotationWizard() {
    const wizard      = document.getElementById('quotation-wizard');
    const progressBar = document.getElementById('wizard-progress-bar');
    if (!wizard || !progressBar) return;

    const TOTAL_STEPS = 3;

    // Estado acumulado de las respuestas del usuario
    const state = { step: 1, objetivo: '', conexion: '' };

    /* ── Arquitectura recomendada según respuestas ──────────────── */
    function getArchText(objetivo, conexion) {
      const isOffline = conexion === 'offline';
      const isEcomm   = objetivo === 'ecommerce';

      if (isEcomm && isOffline) {
        return 'Arquitectura recomendada:\n→ Frontend PWA con caché offline\n→ Base de datos local SQLite para operaciones sin red\n→ Sincronización híbrida con Supabase Cloud al reconectar\n→ API REST para gestión de catálogo y pedidos';
      }
      if (isEcomm && !isOffline) {
        return 'Arquitectura recomendada:\n→ Frontend dinámico conectado a Supabase\n→ Base de datos PostgreSQL en la nube\n→ API REST para catálogo, carrito y pagos\n→ Autenticación con Supabase Auth';
      }
      if (!isEcomm && isOffline) {
        return 'Arquitectura recomendada:\n→ Aplicación de escritorio o web local\n→ Base de datos SQLite embebida (sin servidor)\n→ Sincronización periódica con Supabase Cloud\n→ Panel de reportes con acceso offline';
      }
      return 'Arquitectura recomendada:\n→ Sistema web centralizado en Supabase\n→ Base de datos PostgreSQL con RLS por roles\n→ Dashboard en tiempo real con Supabase Realtime\n→ Acceso multi-usuario con permisos diferenciados';
    }

    /* ── Efecto typewriter ──────────────────────────────────────── */
    function typewrite(el, text, speed = 22) {
      el.textContent = '';
      el.classList.add('typing');
      let i = 0;

      const interval = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          el.classList.remove('typing');
        }
      }, speed);
    }

    /* ── Actualiza la barra de progreso ─────────────────────────── */
    function updateProgress(step) {
      progressBar.style.width = `${(step / TOTAL_STEPS) * 100}%`;
    }

    /* ── Transición entre pasos ─────────────────────────────────── */
    /**
     * Anima la salida del paso actual y la entrada del siguiente.
     * @param {HTMLElement} current  — paso que sale
     * @param {HTMLElement} next     — paso que entra
     * @param {Function}    onEnter  — callback ejecutado cuando el nuevo paso es visible
     */
    function transitionTo(current, next, onEnter) {
      const DURATION = 380; // debe coincidir con la transición CSS

      // 1. Saca el paso actual hacia la izquierda
      current.classList.add('slide-out-left');
      current.setAttribute('aria-hidden', 'true');

      // 2. Prepara el siguiente paso fuera de pantalla (derecha)
      next.classList.add('slide-right');
      next.removeAttribute('aria-hidden');

      // 3. Fuerza reflow para que la transición CSS se dispare
      void next.offsetWidth;

      // 4. Anima la entrada del siguiente paso
      requestAnimationFrame(() => {
        next.classList.remove('slide-right');
      });

      // 5. Limpia clases del paso saliente y ejecuta callback
      setTimeout(() => {
        current.classList.remove('slide-out-left');
        current.setAttribute('aria-hidden', 'true');
        onEnter?.();
      }, DURATION);
    }

    /* ── Avanza al paso indicado ────────────────────────────────── */
    function goToStep(nextStepNum) {
      const currentEl = wizard.querySelector(`[data-step="${state.step}"]`);
      const nextEl    = wizard.querySelector(`[data-step="${nextStepNum}"]`);
      if (!currentEl || !nextEl) return;

      transitionTo(currentEl, nextEl, () => {
        state.step = nextStepNum;
        updateProgress(nextStepNum);

        // Al llegar al paso 3: inicia typewriter y conecta el formulario
        if (nextStepNum === 3) {
          const archText = document.getElementById('arch-text');
          if (archText) {
            typewrite(archText, getArchText(state.objetivo, state.conexion));
          }

          // Pasa el estado acumulado al formulario como data attributes
          const form = nextEl.querySelector('form');
          if (form) {
            form.dataset.objetivo = state.objetivo;
            form.dataset.conexion = state.conexion;
            initContactForm(form);
          }
        }
      });
    }

    /* ── Delegación de eventos en los botones de opción ────────── */
    wizard.addEventListener('click', (e) => {
      const btn = e.target.closest('.wizard-option');
      if (!btn) return;

      const value    = btn.dataset.value;
      const nextStep = parseInt(btn.dataset.next, 10);

      // Marca visualmente la opción seleccionada
      btn.closest('.wizard-options')
        ?.querySelectorAll('.wizard-option')
        .forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');

      // Guarda la respuesta en el estado
      if (state.step === 1) state.objetivo = value;
      if (state.step === 2) state.conexion = value;

      // Pequeño delay para que el usuario vea la selección antes de avanzar
      setTimeout(() => goToStep(nextStep), 220);
    });

    /* ── Estado inicial ─────────────────────────────────────────── */
    updateProgress(1);

    // Asegura que solo el paso 1 sea visible al cargar
    wizard.querySelectorAll('.wizard-step').forEach((step, i) => {
      if (i !== 0) {
        step.setAttribute('aria-hidden', 'true');
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     INIT — Punto de entrada único
     ═══════════════════════════════════════════════════════════════ */
  function init() {
    initScrollAnimations();
    initMobileNav();
    initHeroCanvas();
    initQuotationWizard();
    // initContactForm se llama desde initQuotationWizard al llegar al paso 3
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
