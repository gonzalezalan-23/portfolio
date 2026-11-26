# SITE_MAP — Sitemap final (T1.3)

> **Estado:** vigente · 2026-11-24
> Documento maestro de estructura. Toda sección o página nueva se agrega acá **primero**.

---

## 1. Arquitectura general

- **Una página principal** (scroll vertical libre, sin `scroll-snap`) + **`/proyectos.html`** (catálogo filtrable) + **10 páginas de detalle** de proyecto.
- Rutas **estáticas** (GitHub Pages, sin servidor propio). URL base: `/`.
- Idioma: **es-AR** (voseo consistente en todo el copy).

---

## 2. Página principal — `/`

Secciones en orden (cada una `min-height:100vh`):

| # | Sección | Anchor | Estado actual | Detalle |
|---|---------|--------|---------------|---------|
| 1 | **Hero** | `#hero` | ✅ existe | — |
| 2 | **Proyectos destacados** | `#proyectos` | ✅ existe | Órbita (6 destacados) en una pantalla + link a `/proyectos.html`. Sin grilla infinita en el home |
| 3 | **Proceso** | `#proceso` | ✅ vuelve (F7) | 4 pasos; el mismo bloque sigue embebido en cada ficha |
| 4 | **Stack** | `#skills` | ✅ existe | 5 categorías curadas desde el mapa `tecnologias`; tarjetas con logo SVG local y proyectos donde se usó cada herramienta |
| 5 | **Sobre mí** | `#sobre-mi` | ✅ existe | marquee tipográfico + mini-timeline con link a Formación |
| 6 | **Formación académica** | `#formacion` | ✅ existe (F3) | timeline con 5 hitos: tecnicatura, +200 hs y 3 certificados (PDF de Python linkeado) |
| 7 | **Contacto / Brief rápido** | `#contacto` | ✅ renombrado (antes `#cotizador`) | wizard + form que abre Gmail/Outlook web con el mensaje listo; copiado como respaldo |

### Fuera del sitemap (borrados o embebidos)

| Qué | Motivo |
|-----|--------|
| `#metodologia` (sección "Cómo trabajo") | Se eliminó en T2.9 y **vuelve en F7 como `#proceso`**; además sigue embebida en cada ficha |
| `#logic-cube`, `.tech-stack` | Ya eliminados en T1.4 (poda técnica) |
| Cotizador como página/objetivo propio | Reconvertido a "Contacto / Brief rápido" (decisión aceptada) |

### Navegación

| Superficie | Elemento | Estado |
|------------|----------|--------|
| Desktop (≥981px) | `.topbar` fija: marca + 6 links (Inicio, Proyectos, Cómo trabajo, Herramientas, Sobre mí, Formación) + CTA rojo "Hablemos" | ✅ se comprime al scrollear y muestra línea de progreso |
| Mobile (≤980px) | Hamburguesa dentro de la barra + panel clonado de los links por `nav.js` | ✅ probado en 390/557/768px; Escape y resize cierran el panel |
| Footer (todas las rutas) | marca + enlaces reales | ✅ GitHub `gonzalezalan-23`, WhatsApp `5491139053672`, mail `gonzalez.alan.dev@gmail.com`. Sin Instagram ni LinkedIn |

---

## 3. Detalle de proyecto — `proyecto.html?slug=<slug>`

- **10 fichas**, generadas desde `data/proyectos.json` (fuente única de verdad). `sistema-sad` volvió al catálogo; `python-lab` sigue fuera.
- URL con query param (`proyecto.html?slug=biblioteca-virtual`): GitHub Pages no hace rewrite y así un proyecto nuevo entra **solo con editar el JSON** — sin build ni un archivo HTML por slug.
- **3 plantillas** (tipos aún **por confirmar** contra la tabla maestra — ver §6):

| Plantilla | Para qué | Bloques obligatorios |
|-----------|----------|----------------------|
| **A — Caso de negocio** | Proyectos con problema → solución → resultado medible | problema, solución, resultado, capturas |
| **B — Producto / demo** | Productos usables (demo funcional es requisito de recepción R9) | demo **funcional (debe responder 200)**, capturas, stack |
| **C — Ficha técnica** | Proyectos donde brilla la arquitectura | stack + diagrama/arquitectura, funcionamiento |

- **Corte Must**: ✅ plantilla **A** implementada (T2.2, 2026-11-22 — `proyecto.html` + `assets/js/proyecto.js`); B y C comparten su estructura.
- **Regla de dos capas (F6):**
  - **Capa 1 (visible):** nombre comercial + historia problema → solución → resultado + botón de demo con `demoAcceso` cuando existe (nunca demo falsa).
  - **Capa 2 (`<details class="ficha-tecnica">`):** stack, `decisiones[]` (2–3 decisiones técnicas) y GitHub. Es nativamente accesible por teclado y lector de pantalla.
- Cada ficha incluye: navegación de vuelta al portfolio, metodología embebida, footer global y prev/next.
- Los trabajos en equipo se acreditan con `equipo[]` (nombre y rol opcional): ScoreEd, ViajesPro, Biblioteca, Tótem, Mini Pekka, Monumento, Comando Estelar y Milonga.

---

## 4. Otras rutas

| Ruta | Propósito | Estado |
|------|-----------|--------|
| `/proyectos.html` | Catálogo completo con filtros por tipo y créditos en equipo | ✅ existe (render desde el JSON; no duplica proyectos en HTML) |
| `/404.html` | Página de error propia (GitHub Pages la sirve automático) | ✅ existe (paleta negra/roja, bug de color corregido en F2) |
| `/sitemap.xml`, `/robots.txt` | SEO | pendiente T4.x |

---

## 5. Diagrama

```
/                                    ← página principal (7 secciones)
├── #hero            (1) Hero
├── #proyectos       (2) Proyectos destacados → Órbita (una pantalla)
│   ├── proyecto.html?slug=<slug>  ×10  (plantilla A ✅ · dos capas ✅)
│   └── /proyectos.html            catálogo filtrable
├── #proceso         (3) Proceso (4 pasos)      [vuelve en F7]
├── #skills          (4) Stack (5 categorías)
├── #sobre-mi        (5) Sobre mí (marquee + mini-timeline)
├── #formacion       (6) Formación académica
└── #contacto        (7) Contacto / Brief rápido (wizard + correo web)

/404.html
```

---

## 6. Por confirmar (bloqueos de T1.3)

1. ~~Tabla maestra de los 12 proyectos~~ → resuelto: la fuente única es `data/proyectos.json` (10 proyectos; `sistema-sad` se reincorporó el 26/11/2026 y `python-lab` sigue fuera).
2. **Las 3 plantillas**: propuse A/B/C arriba (razón: coinciden con las 3 categorías de las tarjetas actuales: Control Interno / Ecommerce / SaaS-Dashboard). Confirmar o corregir.
3. **Orden final**: ✅ decidido por el dueño e implementado en F7: **Hero → Destacados → Proceso → Stack → Sobre mí → Formación → Contacto**. Los proyectos van temprano porque venden; Sobre mí y Formación quedan como respaldo, después de saber qué hace y cómo trabaja.
4. **Los 10 proyectos**: confirmados por el dueño; `sistema-sad` se reincorporó con `repo: null` (sólo deploy en Render, acceso interno) y `python-lab` quedó fuera. Ver `INVENTARIO_2026.md` para el histórico.
