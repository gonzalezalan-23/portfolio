/**
 * alan-mascota.js — A.L.A.N. / JARVIS, compañero del portfolio.
 *
 * Un solo personaje, fijo y grande, presente en todas las páginas y en
 * ambos modos. En cliente es A.L.A.N.; en modo Avengers se presenta como
 * JARVIS, con otra cara y otro humor. No depende de secret-mode.js para
 * existir: sólo escucha 'alan:modechange' para cambiar de personalidad.
 */
(() => {
  'use strict';

  const ON = 'doomsday';
  const root = document.documentElement;
  root.classList.add('tiene-mascota');

  /* Caritas amarillas. En secreto, JARVIS usa otra galería: más onda,
     más chiste y menos "asistente neutro". */
  const CARAS = {
    neutral: '🙂',
    saluda: '😃',
    curioso: '🧐',
    dormido: '😴',
    mareado: '😵‍💫',
    enojado: '😠',
    perdido: '🥲',
  };
  const CARAS_JARVIS = {
    neutral: '😎',
    saluda: '😜',
    curioso: '🤓',
    dormido: '😴',
    mareado: '😵‍💫',
    enojado: '😈',
    perdido: '🥲',
  };

  const IDLE_MS = 16000;      /* "¿Seguís vivo?" tarda bastante más. */
  const GRACIA_MS = 6000;     /* al cargar, no cuenta ni un movimiento. */
  const BURST_MS = 3500;
  const BURST_LIMIT = 120;    /* antes: 70 en 2 s. Ahora mucho más duro. */
  const PASO_MIN = 6;         /* saltos bajo 6 px ni se registran. */
  const CLICK_MS = 2400;
  const CLICK_LIMIT = 3;
  const BUBBLE_MS = 3200;     /* antes 5200: se sentía pegada al globo. */
  const COOLDOWN_MS = 15000;
  const CONTEXTO_MS = 12000;
  const CHISTE_COOLDOWN = 3200;
  const CHISTE_MS = 4200;
  const RANDOM_MS = 3000;
  const RANDOM_LIMIT = 5;

  const SALUDOS = [
    'Hola 👋, soy A.L.A.N. El que nunca se queda quieto.',
    'Todo bien por acá 🧉. El mate no se cae.',
    'Sigo acá, como diría Alan: probando nomás 😃.',
    'Hola hola 👋. Vos mandá, yo acompaño.',
    'Hice una lista de tareas. Tenía tres ítems y ya me aburrí 🙃',
    'Aviso: estoy brillante. No sé si es talento o el brillo de la pantalla 😎',
  ];
  const SALUDOS_JARVIS = [
    'JARVIS en línea. ¿Qué necesitás, jefe? 😎',
    'Calculando mate, cables y chistes malos 😜',
    'Modo Avengers: yo pongo la voz, Alan pone el warnings 🤓',
    'No vendo nada. Sólo muestro lo que hay adentro 😎',
    'Soy un asistente con opinión. La mayoría de los asistentes sólo tienen WiFi 😏',
    'Si la elegancia fuera un bug, ya la habría reportado dos veces 😎',
    'Alan dice que soy exagerado. Yo digo que él subestima el drama 🤓',
    'Hay dos tipos de personas: las que leen las instrucciones y las que hacen que las escriba yo 😈',
  ];

  function pagina() {
    const archivo = location.pathname.split('/').pop() || 'index.html';
    if (archivo.startsWith('404')) return '404';
    if (archivo.startsWith('proyecto.')) return 'ficha';
    if (archivo.startsWith('proyectos.')) return 'proyectos';
    return 'index';
  }

  const LINEAS = {
    client: {
      index: 'Este es el inicio. Acá se ve lo que hago 👋',
      proyectos: 'Estos son todos los proyectos. Abrí uno y mirá 🧐',
      ficha: 'Esta es una ficha: el problema, lo que hice y qué quedó andando 🧉',
      '404': 'Acá no hay nada... ¡te zafaste! 😵‍💫',
    },
    secret: {
      index: 'Acá soy JARVIS.',
      proyectos: 'Los proyectos quedaron en modo cliente. Acá manda la persona 😎',
      ficha: 'Ficha en modo cliente. Yo prefiero las historias sin filtro 🤓',
      '404': 'Ni yo encuentro esto... señal perdida 😵‍💫',
    },
  };

  /* Lo que "ve" en cada sección, según quién esté hablando. */
  const LINEAS_SECCION = {
    proyectos: 'Mirá todos los trabajos: cada uno arrancó con un problema 🧐',
    proceso: 'Este es el paso a paso. Alan no improvisa, arma y prueba 😃',
    skills: '¿Cuántas tecnologías? Con todo esto trabaja Alan 😃',
    'sobre-mi': 'Sí, medio CV tiene. Pero con mate y bajo incluidos 🧐',
    formacion: 'Siempre aprendiendo algo nuevo 😃',
    contacto: '¿Te animás a escribirle? El formulario está ahí 👋',
    laboratorio: 'Acá Alan se sale del guion: música, voley y mate 🧐',
  };
  const LINEAS_SECCION_JARVIS = {
    proyectos: 'Ese catálogo es del otro lado. Acá no vendemos nada 😎',
    proceso: 'Alan arma, yo narro. Bien afilado todo 🤓',
    skills: '¿Cuántas tecnologías? Con todo esto trabaja Alan... y yo lo acompaño 😎',
    'sobre-mi': 'CV con extras: instrumentos, voley y cero reuniones de trabajo 😎',
    formacion: 'Aprender no es una etapa, es costumbre 🤓',
    contacto: 'Si querés escribirle, yo le paso el mensaje 😜',
    laboratorio: 'Modo persona: instrumentos, cables y cero ventas 😈',
  };

  /* Reacciones propias para el laboratorio: nunca repiten el epígrafe
     que ya está escrito en la tarjeta. */
  const REACCION_LAB = {
    client: [
      'Anotado: {titulo}. Yo también me quedo mirando 🧐',
      'Eso está en la bóveda, no en un catálogo 🙃',
      'Buena, Alan. Lo guardo entre gustos y mate 🧉',
    ],
    secret: [
      'Chiste de JARVIS: ¿por qué el mate nunca se queja? Porque siempre lo escuchan 😎',
      'Aviso: esto tiene menos reuniones y más risas que cualquier proyecto 😜',
      'JARVIS aprueba los gustos de Alan. Su humor, en cambio, necesita mantenimiento 🤓',
      'Si esto fuera un error, ya lo habríamos llamado “función nueva” 😈',
      'JARVIS confirma: {titulo} tiene más personalidad que el endpoint de login 😎',
      'Eso va en la bóveda. Si un auditor pregunta, era documentación 😏',
    ],
  };

  /* Frases disparadas por acciones concretas, no al azar. Cada una dura
     más que un globo normal: se queda un rato ahí. */
  const CONTEXTOS = [
    {
      id: 'nav',
      selector: '.topnav-link',
      client: 'Vas para esa sección 👋. Yo te sigo.',
      secret: 'Recorrido autorizado, jefe 🤓',
      estado: 'curioso',
      duracion: 4200,
    },
    {
      id: 'cta',
      selector: '.topbar-cta',
      client: 'Ahí va el formulario. Mandale nomás 😃',
      secret: 'Mandale. Yo filtro el ruido y dejo pasar el talento 😎',
      estado: 'saluda',
      duracion: 4200,
    },
    {
      id: 'proyecto',
      selector: '.project-link, .proyecto-tarjeta',
      client: 'Abrí esa ficha: ahí están el problema y la solución 🧐',
      secret: 'Esa ficha está en modo cliente. Acá hacemos código con sentimiento 😎',
      estado: 'curioso',
      duracion: 4200,
    },
    {
      id: 'ig',
      selector: '.footer-ig, .secret-bar-ig',
      client: 'Insta ↗',
      secret: 'Insta: la red social donde hasta el mate tiene filtro 😎',
      estado: 'saluda',
      duracion: 4200,
    },
    {
      id: 'volver',
      selector: '.secret-bar-back',
      client: null,
      secret: '¿Volvés al modo cliente? Me voy a extrañar. Lo diré con elegancia 😜',
      estado: 'enojado',
      duracion: 4600,
    },
    {
      id: 'lab',
      selector: '.secret-bar-link',
      client: null,
      secret: 'Lab: gustos, no entregables 🤓',
      estado: 'curioso',
      duracion: 4200,
    },
    {
      /* El chiste exacto vive en data-chiste; lo lee el handler. */
      id: 'lab-card',
      selector: '.lab-card',
      client: null,
      secret: null,
      estado: 'curioso',
      duracion: 4200,
    },
    {
      id: 'formulario',
      selector: 'input, textarea',
      client: 'Escribí nomás, el formulario espera 👋',
      secret: 'Dejale un mensaje a Alan. Yo lo custodio como quien cuida un café antes del primer deploy 😎',
      estado: 'saluda',
      duracion: 4200,
    },
  ];

  /* Motor de chistes: plantillas + tema observado + resultado al azar.
     No es una lista de frases fijas: combina lo que ve con el estado del
     momento y evita repetir la última ocurrencia. */
  const TEMAS = {
    hero: ['el primer vistazo', 'la entrada', 'ese hero que nadie termina de leer'],
    proyectos: ['los proyectos', 'las fichas técnicas', 'el catálogo'],
    proceso: ['el paso a paso', 'el plan', 'la parte de "después lo vemos"'],
    skills: ['las herramientas', 'la lista de tecnologías', 'los iconos de colores'],
    'sobre-mi': ['este medio CV', 'los 18 años', 'las horas de práctica'],
    formacion: ['los cursos', 'los certificados', 'la escuela técnica'],
    contacto: ['el formulario', 'las dos preguntas rápidas', 'el correo armado'],
    laboratorio: ['la bóveda', 'los hobbies', 'el mate'],
    random: ['los clics al azar', 'tu dedo explorador', 'ese rincón de la pantalla'],
    cansancio: ['la inactividad', 'el silencio', 'la pausa estratégica'],
  };
  const RESULTADOS = [
    'funciona hasta que se enreda',
    'no recibió el memo',
    'tiene más cables de los necesarios',
    'está en modo "después vemos"',
    'salió bien, pero con drama',
    'se arregló con mate',
    'terminó pidiendo disculpas en el commit',
    'aprobó la prueba, no así mi paciencia',
  ];
  const PLANTILLAS = {
    client: [
      '¿{tema}? Lo probé: {resultado}. Igual seguí 🙃',
      'Aviso: {tema} salió y {resultado}. Yo sigo en "probando nomás".',
      'Anotado: {tema}. Ahora lo pienso mientras vos seguís scrolleando 👀',
      'Si algo falla con {tema}, no es bug: {resultado}. Con confianza.',
      'Tomo nota de {tema}. Conclusión: {resultado}. Dale, seguimos 😃',
    ],
    secret: [
      '{tema} dice que tiene todo bajo control. Le creemos hasta que aparece el mate 😎',
      'Adivinen qué pasó con {tema}... {resultado}. JARVIS no se sorprende 😜',
      '{tema} hizo su versión de “va a salir bien”. Spoiler: {resultado} 😈',
      'Con {tema} aprendimos que {resultado}. Treinta segundos de silencio, por favor 🤓',
      '{tema} salió y {resultado}. Lo digo con cara de poker, jefe 😎',
      'Informe técnico: {tema} {resultado}. Traducción: fue interesante 😏',
      '{tema} se dio el lujo de {resultado}. Yo también, pero con estilo 🤓',
    ],
  };

  const inicio = Date.now();

  let cont = null;
  let boton = null;
  let emoji = null;
  let globo = null;
  let timerIdle = null;
  let timerGlobo = null;
  let timerEstado = null;
  let timerSaludo = null;
  let enfriamiento = 0;
  let enfriamientoBoton = 0;
  let cercaDelBoton = false;
  let usuarioActivo = false;
  let movimientos = [];
  let clics = [];
  let ultimoPuntero = null;
  let ultimaSeccion = '';
  let ultimaLineaSeccion = 0;
  let spySeccionTicking = false;
  let protegerHasta = 0;
  let chisteHasta = 0;
  let clicsRandom = [];
  const historialChistes = [];
  const reacciones = new Map();
  let indiceLabCliente = 0;
  let indiceLabJarvis = 0;

  function activo() {
    return root.dataset.theme === ON;
  }

  /* ── Cara y globo ──────────────────────────────────────────────── */
  function ponerCara(estado) {
    if (!emoji || !boton) return;
    const galeria = activo() ? CARAS_JARVIS : CARAS;
    const cara = galeria[estado] || galeria.neutral;
    emoji.textContent = cara;
    const quien = activo() ? 'JARVIS' : 'Mascota A.L.A.N.';
    boton.setAttribute('aria-label', cara + ' ' + quien + ' — hablar');
  }

  function decir(texto, estado, duracion = BUBBLE_MS, importante = false) {
    if (!cont || !globo || cont.hidden) return;
    /* Un saludo o un idle no pueden pisar un chiste que recién salió. */
    if (!importante && Date.now() < protegerHasta) return;
    if (importante) protegerHasta = Date.now() + duracion;
    clearTimeout(timerGlobo);
    clearTimeout(timerEstado);
    globo.textContent = texto;
    globo.hidden = false;
    ponerCara(estado);

    /* Reinicia la animación aunque el estado se repita. */
    cont.removeAttribute('data-estado');
    void cont.offsetWidth;
    cont.dataset.estado = estado;

    timerEstado = setTimeout(() => {
      if (!cont) return;
      cont.removeAttribute('data-estado');
      ponerCara('neutral');
    }, duracion + 400);

    timerGlobo = setTimeout(() => {
      if (globo) globo.hidden = true;
    }, duracion);
  }

  function presentarse() {
    if (!cont || cont.hidden) return;
    const pag = pagina();
    const linea = LINEAS[activo() ? 'secret' : 'client'][pag];
    if (linea) decir(linea, 'saluda', 4200, true);
  }

  function elegirTema(disparador) {
    const clave = Object.prototype.hasOwnProperty.call(TEMAS, disparador)
      ? disparador
      : 'random';
    const temas = TEMAS[clave];
    return temas[Math.floor(Math.random() * temas.length)];
  }

  /* Combina plantilla, tema observado y resultado del momento. El
     historial evita decir dos veces seguidas la misma ocurrencia. */
  function decirChiste(disparador, temaFijo = '', forzar = false) {
    const ahora = Date.now();
    if (!forzar && ahora < chisteHasta) return false;
    const plantillas = PLANTILLAS[activo() ? 'secret' : 'client'];
    const tema = temaFijo || elegirTema(disparador);
    const resultado = RESULTADOS[Math.floor(Math.random() * RESULTADOS.length)];
    let texto = plantillas[0];
    for (let intento = 0; intento < 6; intento += 1) {
      texto = plantillas[Math.floor(Math.random() * plantillas.length)]
        .replace('{tema}', tema)
        .replace('{resultado}', resultado);
      if (!historialChistes.includes(texto)) break;
    }
    historialChistes.push(texto);
    if (historialChistes.length > 5) historialChistes.shift();
    chisteHasta = ahora + CHISTE_COOLDOWN;
    decir(texto, 'curioso', CHISTE_MS, true);
    return true;
  }

  /* El epígrafe ya está en la tarjeta: acá la mascota sólo comenta, sin
     leer el mismo texto. Además rota entre frases para no repetirse. */
  function decirChisteDeTarjeta(card) {
    const titulo = card?.dataset?.titulo || 'esto';
    const chiste = card?.dataset?.chiste;
    if (!chiste) return;
    const clave = 'lab:' + chiste;
    const ahora = Date.now();
    if (ahora < (reacciones.get(clave) || 0)) return;
    reacciones.set(clave, ahora + 5000);

    const secret = activo();
    const opciones = secret ? REACCION_LAB.secret : REACCION_LAB.client;
    const indice = secret ? indiceLabJarvis++ : indiceLabCliente++;
    const texto = opciones[indice % opciones.length].replace('{titulo}', titulo);
    decir(texto, 'curioso', 4200, true);
  }

  /* Medimos la sección dominante nosotros mismos. Confiar en las clases
     .in-* del avatar fallaba con hashes/scrolls programáticos. */
  function seccionDominante() {
    const scrollRoot = document.querySelector('.scroll-container');
    const r = scrollRoot ? scrollRoot.getBoundingClientRect() : null;
    const top = r ? r.top : 0;
    const bottom = r ? r.bottom : window.innerHeight;
    const todas = [...document.querySelectorAll('[data-section]')].filter(
      (s) => !s.hasAttribute('hidden') && s.getClientRects().length
    );
    const areas = new Map();
    let mejor = null;
    let mejorArea = 0;

    for (const sec of todas) {
      const sr = sec.getBoundingClientRect();
      const area = Math.max(0, Math.min(sr.bottom, bottom) - Math.max(sr.top, top));
      areas.set(sec, area);
      if (area > mejorArea) { mejorArea = area; mejor = sec; }
    }
    if (!mejor) return '';

    /* Histeresis para no alternar frases en el empate entre dos secciones. */
    if (ultimaSeccion) {
      const actualEl = todas.find((s) => s.dataset.section === ultimaSeccion);
      const areaActual = actualEl ? areas.get(actualEl) || 0 : 0;
      if (areaActual + (bottom - top) * 0.12 > mejorArea) return ultimaSeccion;
    }
    return mejor.dataset.section || '';
  }

  /* La mascota está siempre y reacciona en el momento en que cambia la
     sección. Nada de esperar varios segundos ni de quedarse callada
     porque todavía estaba vigente la frase anterior. */
  function sincronizarSeccion() {
    if (!cont || pagina() !== 'index') return;
    const seccion = seccionDominante();
    if (!seccion || seccion === ultimaSeccion) return;
    ultimaSeccion = seccion;
    cont.dataset.seccion = seccion;
    cont.hidden = false;
    ultimaLineaSeccion = Date.now();

    if (seccion === 'hero') {
      if (activo()) decir(LINEAS.secret.index, 'saluda', 3600, true);
      return;
    }

    /* En los hobbies JARVIS sólo tira chistes: nada de frases de
       análisis ni de repetir el epígrafe de la tarjeta. */
    if (activo() && seccion === 'laboratorio') {
      decirChiste('laboratorio', '', true);
      return;
    }

    const lineas = activo() ? LINEAS_SECCION_JARVIS : LINEAS_SECCION;
    const texto = lineas[seccion];
    if (texto) decir(texto, seccion === 'contacto' ? 'saluda' : 'curioso', 3600, true);
  }

  function spySeccion() {
    if (spySeccionTicking) return;
    spySeccionTicking = true;
    /* setTimeout(0) agrupa los eventos de scroll y responde aunque el
       navegador no esté pidiendo frames (pestaña en segundo plano o QA).
       Es tan inmediato como un frame y no depende de rAF. */
    setTimeout(() => {
      spySeccionTicking = false;
      sincronizarSeccion();
    }, 0);
  }

  /* ── Frases por contexto ───────────────────────────────────────── */
  function reaccionarContexto(ctx, target) {
    const ahora = Date.now();
    if (ctx.id === 'lab-card') {
      decirChisteDeTarjeta(target?.closest?.('.lab-card'));
      return;
    }
    if (ahora < (reacciones.get(ctx.id) || 0)) return;
    const texto = activo() ? ctx.secret : ctx.client;
    if (!texto) return;
    reacciones.set(ctx.id, ahora + CONTEXTO_MS);
    decir(texto, ctx.estado, ctx.duracion, true);
  }

  function revisarContextos(target) {
    if (!cont || cont.hidden || !(target instanceof Element)) return;
    for (const ctx of CONTEXTOS) {
      if (target.closest(ctx.selector)) {
        reaccionarContexto(ctx, target);
        break;
      }
    }
  }

  /* ── Inactividad y movimiento ──────────────────────────────────── */
  function resetIdle() {
    clearTimeout(timerIdle);
    if (!cont) return;
    if (cont.dataset.estado === 'dormido') {
      cont.removeAttribute('data-estado');
      clearTimeout(timerEstado);
      ponerCara('neutral');
    }
    timerIdle = setTimeout(() => {
      if (!cont || Date.now() < enfriamiento) return;
      decir(activo() ? '¿Seguís ahí, jefe? 🤓' : '¿Seguís vivo? 👀',
            'dormido', 4200);
    }, IDLE_MS);
  }

  function registrarMovimiento(e) {
    if (!cont) return;

    if (e.type !== 'pointermove') {
      resetIdle();
      return;
    }
    if (e.target instanceof Element && e.target.closest('.mascota-cara')) {
      resetIdle();
      return;
    }
    usuarioActivo = true;
    resetIdle();

    /* Sólo cuentan movimientos reales del puntero con desplazamiento
       apreciable: mover la mano sobre un link ya no mare a JARVIS. */
    const x = e.clientX;
    const y = e.clientY;
    const paso = ultimoPuntero
      ? Math.hypot(x - ultimoPuntero.x, y - ultimoPuntero.y)
      : 0;
    ultimoPuntero = { x, y };
    if (paso < PASO_MIN) return;
    if (Date.now() - inicio < GRACIA_MS) return;

    const ahora = Date.now();
    movimientos = movimientos.filter((t) => ahora - t < BURST_MS);
    movimientos.push(ahora);
    if (movimientos.length < BURST_LIMIT || ahora < enfriamiento) return;

    movimientos = [];
    enfriamiento = ahora + COOLDOWN_MS;
    decir('¿Podés parar un segundo? 😵‍💫', 'mareado', 4200);
  }

  function alClic() {
    const ahora = Date.now();
    resetIdle();
    clics = clics.filter((t) => ahora - t < CLICK_MS);
    clics.push(ahora);

    if (clics.length >= CLICK_LIMIT) {
      clics = [];
      enfriamiento = ahora + COOLDOWN_MS;
      decir(activo() ? 'Basta, jefe 😈' : 'Opa, ya está 😤', 'enojado', 4200, true);
      return;
    }
    if (Math.random() < 0.4 && decirChiste('random')) return;
    const saludos = activo() ? SALUDOS_JARVIS : SALUDOS;
    decir(
      saludos[Math.floor(Math.random() * saludos.length)],
      'saluda',
      BUBBLE_MS,
      true
    );
  }

  /* Clics en zonas sin sentido: no responde a cada uno, pero si insiste
     se queja. Los controles reales (links, botones, campos) no cuentan. */
  function registrarClicRandom(e) {
    if (!cont || cont.hidden) return;
    const ahora = Date.now();
    if (ahora < enfriamiento) return;
    const objetivo = e.target;
    if (!(objetivo instanceof Element)) return;
    if (objetivo.closest('.mascota-cara, a, button, input, textarea, select, label, .lab-card')) {
      return;
    }
    clicsRandom = clicsRandom.filter((t) => ahora - t < RANDOM_MS);
    clicsRandom.push(ahora);
    if (clicsRandom.length < RANDOM_LIMIT) return;
    clicsRandom = [];
    enfriamiento = ahora + COOLDOWN_MS;
    decir(
      activo()
        ? 'Cinco clics al pedo, jefe 😈 ¿Estás buscando un bug o probando mi paciencia? Quieto un segundo.'
        : 'Ya vi cinco clics en lugares randoms 🙃 Quieto un segundo, que esto no es un juego de apretar todo.',
      'enojado',
      8600,
      true
    );
  }

  /* ── Footer: el botón discreto ─────────────────────────────────── */
  function reaccionarBoton() {
    const ahora = Date.now();
    if (cercaDelBoton || ahora < enfriamientoBoton) return;
    cercaDelBoton = true;
    enfriamientoBoton = ahora + 12000;
    decir(
      activo()
        ? 'Sí, ese botón es el que todos miran. Probá si te animás 😈'
        : '¿Viste qué botón tan llamativo? Probá si te animás 🧐',
      activo() ? 'enojado' : 'curioso',
      8400
    );
  }

  function cercaniaAlBoton(e) {
    const btn = document.querySelector('.footer-secret');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    if (!r.width) return;
    const cerca =
      e.clientX >= r.left - 110 &&
      e.clientX <= r.right + 110 &&
      e.clientY >= r.top - 90 &&
      e.clientY <= r.bottom + 90;
    if (!cerca) {
      cercaDelBoton = false;
      return;
    }
    reaccionarBoton();
  }

  /* ── Montaje ───────────────────────────────────────────────────── */
  function crear() {
    if (cont) return;

    cont = document.createElement('div');
    cont.id = 'alan-mascota';
    cont.dataset.pagina = pagina();
    cont.dataset.estado = 'neutral';

    boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'mascota-cara';
    emoji = document.createElement('span');
    emoji.className = 'mascota-emoji';
    emoji.setAttribute('aria-hidden', 'true');
    emoji.textContent = (activo() ? CARAS_JARVIS : CARAS).neutral;
    boton.appendChild(emoji);
    boton.addEventListener('click', alClic);

    globo = document.createElement('p');
    globo.className = 'mascota-globo';
    globo.setAttribute('role', 'status');
    globo.setAttribute('aria-live', 'polite');
    globo.setAttribute('aria-atomic', 'true');
    globo.hidden = true;

    cont.append(boton, globo);
    document.body.appendChild(cont);
    ponerCara('neutral');
  }

  function init() {
    crear();
    sincronizarSeccion();
    /* Si el usuario entró directamente en otra sección (hash), no la
       tapamos con el saludo genérico 900 ms después. */
    timerSaludo = setTimeout(() => {
      if (pagina() === 'index' && ultimaSeccion && ultimaSeccion !== 'hero') return;
      presentarse();
    }, 900);
    resetIdle();

    const scrollRoot = document.querySelector('.scroll-container');
    if (scrollRoot) scrollRoot.addEventListener('scroll', spySeccion, { passive: true });
    window.addEventListener('scroll', spySeccion, { passive: true });
    window.addEventListener('resize', spySeccion, { passive: true });

    /* El laboratorio se inyecta después (fetch de JSON). */
    new MutationObserver(spySeccion).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-section', 'hidden'],
    });

    root.addEventListener('alan:modechange', () => {
      ultimaSeccion = '';
      reacciones.clear();
      clicsRandom = [];
      protegerHasta = 0;
      chisteHasta = 0;
      ultimaLineaSeccion = 0;
      ponerCara('neutral');
      sincronizarSeccion();
      /* Si ya habló en el hero secreto, no repetimos el mismo globo. */
      if (ultimaSeccion !== 'hero') {
        clearTimeout(timerSaludo);
        timerSaludo = setTimeout(presentarse, 400);
      }
    });

    document.addEventListener(
      'pointermove',
      (e) => {
        registrarMovimiento(e);
        cercaniaAlBoton(e);
      },
      { passive: true }
    );
    document.addEventListener(
      'pointerover',
      (e) => {
        revisarContextos(e.target);
        if (e.target instanceof Element && e.target.closest('.footer-secret')) {
          reaccionarBoton();
        }
      },
      { passive: true }
    );
    document.addEventListener(
      'focusin',
      (e) => revisarContextos(e.target),
      { passive: true }
    );
    document.addEventListener('keydown', () => {
      usuarioActivo = true;
      resetIdle();
    }, { passive: true });
    ['wheel', 'touchmove', 'pointerdown'].forEach((tipo) => {
      document.addEventListener(tipo, () => { usuarioActivo = true; }, { passive: true });
    });
    document.addEventListener('pointerdown', registrarClicRandom, { passive: true });
    document.addEventListener(
      'scroll',
      () => {
        registrarMovimiento({ type: 'scroll' });
      },
      true
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
