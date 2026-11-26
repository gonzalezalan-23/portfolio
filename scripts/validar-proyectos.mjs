#!/usr/bin/env node
/**
 * validar-proyectos.mjs — Validación de data/proyectos.json
 *
 * Uso:  node scripts/validar-proyectos.mjs [ruta/al/archivo.json]
 *
 * Sale con código 1 si hay ERRORES (para que GitHub Actions bloquee el deploy
 * y el sitio nunca se publique roto). Los WARNINGS no bloquean: son la lista
 * de "cosas que faltan poner" (capturas, anio, rol…).
 *
 * Cero dependencias — Node 18+.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const archivo = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'data', 'proyectos.json');

const CATEGORIAS = ['sistema-web', 'saas', 'ecommerce', 'landing', 'app-escritorio', 'hardware-iot'];
const PLANTILLAS = ['A', 'B', 'C'];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const URL_RE = /^https:\/\//;
// Demos 100% offline: rutas relativas servidas desde la raíz del sitio.
const DEMO_LOCAL_RE = /^demos\/[a-z0-9-]+(?:\/[a-zA-Z0-9_-]+)*\.html$/;
const DOC_RE = /^https:\/\/(?:drive|docs)\.google\.com\//;
const CAPTURA_RE = /^assets\/img\/proyectos\/[a-z0-9-]+\/[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg|avif)$/;
const TEC_CATEGORIAS = ['Lo que se ve', 'Detrás de escena', 'Datos', 'Dispositivos', 'Herramientas'];

const errores = [];
const warnings = [];
const err = (slug, campo, msg) => errores.push({ slug, campo, msg });
const warn = (slug, campo, msg) => warnings.push({ slug, campo, msg });

const esStr = (v) => typeof v === 'string' && v.trim().length > 0;
const esStrArr = (v) => Array.isArray(v) && v.length > 0 && v.every(esStr);

// ── 1. Lectura y parseo ──────────────────────────────────────────────
let data;
try {
  data = JSON.parse(readFileSync(archivo, 'utf8'));
} catch (e) {
  console.error(`\n✖ ERROR DE SINTAXIS en ${archivo}\n  ${e.message}\n`);
  console.error('  El sitio NO se desplegaría con este archivo. Corregí la sintaxis JSON y volvé a correr.');
  process.exit(1);
}

// ── 2. Estructura raíz ───────────────────────────────────────────────
if (data.version !== 1) err('(raiz)', 'version', `version debe ser 1 (llegó ${JSON.stringify(data.version)})`);
if (!Array.isArray(data.proyectos)) {
  err('(raiz)', 'proyectos', 'falta el array "proyectos"');
  data.proyectos = [];
}
if (data.proyectos.length === 0) err('(raiz)', 'proyectos', 'el array está vacío');

// ── 2b. Mapa de tecnologías (stack por categorías) ──────────────────
const declaradas = new Map();
if (!data.tecnologias || typeof data.tecnologias !== 'object' || Array.isArray(data.tecnologias)) {
  err('(raiz)', 'tecnologias', 'falta el mapa de categorías (objeto)');
} else {
  for (const cat of TEC_CATEGORIAS) {
    if (!Object.prototype.hasOwnProperty.call(data.tecnologias, cat)) {
      err('(raiz)', 'tecnologias', `falta la categoría "${cat}"`);
    }
  }
  for (const [cat, techs] of Object.entries(data.tecnologias)) {
    if (!esStrArr(techs)) {
      err('(raiz)', `tecnologias.${cat}`, 'debe ser un array no vacío de textos');
      continue;
    }
    const vistos = new Set();
    for (const t of techs) {
      const k = t.trim().toLowerCase();
      if (vistos.has(k)) err('(raiz)', `tecnologias.${cat}`, `duplicado: "${t}"`);
      vistos.add(k);
      declaradas.set(k, cat);
    }
  }
}

// ── 3. Por proyecto ──────────────────────────────────────────────────
const slugsVistos = new Map();
const ordenesVistos = new Map();
let destacados = 0;

for (const [i, p] of data.proyectos.entries()) {
  const slug = p && esStr(p.slug) ? p.slug : `#${i + 1}`;
  const donde = `proyecto "${slug}"`;

  if (!p || typeof p !== 'object') { err(slug, '(objeto)', 'la entrada no es un objeto'); continue; }

  // slug
  if (!esStr(p.slug)) err(slug, 'slug', 'falta o está vacío');
  else {
    if (!SLUG_RE.test(p.slug)) err(slug, 'slug', 'debe ser kebab-case (minúsculas, números, guiones)');
    if (slugsVistos.has(p.slug)) err(slug, 'slug', `duplicado — ya lo usa el proyecto #${slugsVistos.get(p.slug) + 1}`);
    else slugsVistos.set(p.slug, i);
  }

  // strings obligatorios
  for (const campo of ['titulo', 'categoria', 'plantilla', 'resumen', 'problema', 'solucion', 'resultado']) {
    if (!esStr(p[campo])) err(slug, campo, 'falta o está vacío');
  }

  if (esStr(p.titulo) && p.titulo.length > 60) warn(slug, 'titulo', `${p.titulo.length} chars (recomendado ≤60)`);
  if (esStr(p.resumen) && p.resumen.length > 160) err(slug, 'resumen', `${p.resumen.length} chars — el máximo es 160`);

  // categoria / plantilla
  if (esStr(p.categoria) && !CATEGORIAS.includes(p.categoria)) {
    err(slug, 'categoria', `"${p.categoria}" no está en: ${CATEGORIAS.join(', ')}`);
  }
  if (esStr(p.plantilla) && !PLANTILLAS.includes(p.plantilla)) {
    err(slug, 'plantilla', `"${p.plantilla}" debe ser A, B o C`);
  }

  // orden
  if (typeof p.orden !== 'number' || !Number.isInteger(p.orden) || p.orden < 1) {
    err(slug, 'orden', 'debe ser un entero ≥ 1');
  } else if (ordenesVistos.has(p.orden)) {
    err(slug, 'orden', `duplicado — ya lo usa "${ordenesVistos.get(p.orden)}"`);
  } else ordenesVistos.set(p.orden, slug);

  // anio / rol (opcionales pero avisados)
  if (p.anio !== null && (typeof p.anio !== 'number' || p.anio < 2000 || p.anio > 2100)) {
    err(slug, 'anio', 'debe ser un número (ej. 2025) o null');
  } else if (p.anio === null) warn(slug, 'anio', 'pendiente de completar');
  if (p.rol !== null && !esStr(p.rol)) err(slug, 'rol', 'debe ser texto o null');
  else if (p.rol === null) warn(slug, 'rol', 'pendiente de completar');

  // arrays
  if (!esStrArr(p.stack)) err(slug, 'stack', 'debe ser un array con al menos 1 elemento de texto');
  else if (p.stack.length < 3 || p.stack.length > 6) warn(slug, 'stack', `${p.stack.length} elementos (recomendado 3–6)`);
  if (!Array.isArray(p.funcionalidades) || p.funcionalidades.length < 3 || !p.funcionalidades.every(esStr)) {
    err(slug, 'funcionalidades', 'mínimo 3 elementos de texto');
  }

  // capturas
  if (!Array.isArray(p.capturas) || p.capturas.length < 1) {
    err(slug, 'capturas', 'mínimo 1 captura');
  } else {
    for (const c of p.capturas) {
      if (!CAPTURA_RE.test(c)) err(slug, 'capturas', `ruta inválida: "${c}" (formato: assets/img/proyectos/<slug>/NN.webp)`);
      else if (!existsSync(join(ROOT, c))) warn(slug, 'capturas', `el archivo aún no existe: ${c} (T5.1)`);
    }
    const carpetaMala = p.capturas.filter(c => esStr(p.slug) && c.includes(`/proyectos/${p.slug}/`) === false && CAPTURA_RE.test(c));
    if (carpetaMala.length) warn(slug, 'capturas', 'hay capturas en la carpeta de otro proyecto');
  }

  // demo / repo / video
  if (p.demo !== null && !(esStr(p.demo) && (URL_RE.test(p.demo) || DEMO_LOCAL_RE.test(p.demo)))) {
    err(slug, 'demo', 'debe ser una URL https://, una ruta demos/<proyecto>/index.html o null');
  } else if (DEMO_LOCAL_RE.test(p.demo) && !existsSync(join(ROOT, p.demo))) {
    err(slug, 'demo', `la demo local no existe: ${p.demo}`);
  }
  if (p.repo !== null && !(esStr(p.repo) && URL_RE.test(p.repo))) err(slug, 'repo', 'debe ser una URL https:// o null');
  else if (esStr(p.repo) && !p.repo.includes('gonzalezalan-23')) warn(slug, 'repo', 'apunta a otra cuenta de GitHub — ¿querés migrarlo a gonzalezalan-23?');
  if (p.video !== null && !(esStr(p.video) && URL_RE.test(p.video))) err(slug, 'video', 'debe ser una URL https:// o null');

  // Documentación: link de Drive/Docs, o null mientras se carga.
  if (p.documentacion === undefined || p.documentacion === null) {
    warn(slug, 'documentacion', 'pendiente: cargar el link de Google Drive/Docs');
  } else if (!esStr(p.documentacion) || !DOC_RE.test(p.documentacion)) {
    err(slug, 'documentacion', 'debe ser una URL de drive.google.com o docs.google.com, o null');
  }

  // Regla de las dos capas (F6): Capa 2 = decisiones técnicas.
  // Es opcional mientras el dueño completa el JSON; avisamos, no bloqueamos.
  if (p.decisiones === undefined || p.decisiones === null) {
    warn(slug, 'decisiones', 'pendiente de completar (2–3 decisiones técnicas para la ficha)');
  } else if (!Array.isArray(p.decisiones) || p.decisiones.length < 2 || p.decisiones.length > 3 || !p.decisiones.every(esStr)) {
    err(slug, 'decisiones', 'debe ser un array de 2–3 textos no vacíos');
  }

  // demoAcceso = acceso rápido / usuario de prueba de la Capa 1.
  if (p.demoAcceso !== undefined && p.demoAcceso !== null && !esStr(p.demoAcceso)) {
    err(slug, 'demoAcceso', 'debe ser texto o null');
  } else if (esStr(p.demoAcceso) && p.demo === null) {
    err(slug, 'demoAcceso', `hay acceso de prueba pero demo es null — no se puede ofrecer una demo inexistente`);
  } else if (p.demo !== null && !esStr(p.demoAcceso)) {
    warn(slug, 'demoAcceso', 'la demo tiene URL: agregá cómo acceder (o usuario de prueba)');
  }

  // SAD es interno: su código NO se expone ni aunque exista el repo.
  if (slug === 'sistema-sad' && p.repo !== null) {
    err(slug, 'repo', 'sistema-sad es interno: debe ser null (no exponer el repositorio)');
  }

  // destacado
  if (typeof p.destacado !== 'boolean') err(slug, 'destacado', 'debe ser true o false');
  else if (p.destacado) destacados++;

  void donde;
}

// ── 4. Globales ──────────────────────────────────────────────────────
for (const p of data.proyectos) {
  if (!p || !Array.isArray(p.stack)) continue;
  const slug = esStr(p.slug) ? p.slug : '(sin slug)';
  for (const t of p.stack) {
    if (esStr(t) && !declaradas.has(t.trim().toLowerCase())) {
      warn(slug, 'stack', `"${t}" no está en el mapa tecnologias — agregalo a una categoría`);
    }
  }
}

if (destacados > 6) err('(global)', 'destacado', `${destacados} destacados — el máximo es 6 (Órbita)`);
if (destacados === 0) warn('(global)', 'destacado', 'ningún proyecto destacado — el carrusel Órbita quedaría vacío');

const ordenes = [...ordenesVistos.keys()].sort((a, b) => a - b);
if (ordenes.length) {
  const huecos = [];
  for (let n = 1; n <= ordenes[ordenes.length - 1]; n++) if (!ordenesVistos.has(n)) huecos.push(n);
  if (huecos.length) warn('(global)', 'orden', `huecos en la secuencia: falta ${huecos.join(', ')}`);
}

// ── 5. Reporte ───────────────────────────────────────────────────────
console.log(`\nValidando: ${archivo}`);
console.log(`Proyectos: ${data.proyectos.length} · Destacados: ${destacados}\n`);

if (warnings.length) {
  console.log(`⚠ WARNINGS (${warnings.length}) — cosas que faltan, no bloquean:`);
  for (const w of warnings) console.log(`   · [${w.slug}] ${w.campo}: ${w.msg}`);
  console.log('');
}

if (errores.length) {
  console.log(`✖ ERRORES (${errores.length}) — el deploy debería bloquearse:`);
  for (const e of errores) console.log(`   · [${e.slug}] ${e.campo}: ${e.msg}`);
  console.log('\nRESULTADO: ✖ INVÁLIDO\n');
  process.exit(1);
}

console.log('RESULTADO: ✓ VÁLIDO — se puede publicar.\n');
process.exit(0);
