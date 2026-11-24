# SITE_MAP — Sitemap final (T1.3)

> **Estado:** propuesta para validar con el usuario · 2026-11-18
> Documento maestro de estructura. Toda sección o página nueva se agrega acá **primero**.

---

## 1. Arquitectura general

- **Una página principal** (scroll vertical con `scroll-snap-type: y proximity`) + **12 páginas de detalle** de proyecto.
- Rutas **estáticas** (GitHub Pages, sin servidor propio). URL base: `/`.
- Idioma: **es-AR** (voseo consistente en todo el copy).

---

## 2. Página principal — `/`

Secciones en orden (cada una `min-height:100vh`):

| # | Sección | Anchor | Estado actual | Detalle |
|---|---------|--------|---------------|---------|
| 1 | **Hero** | `#hero` | ✅ existe | — |
| 2 | **Proyectos destacados** | `#proyectos` | ✅ existe | Órbita (6 destacados) + tarjetas → detalle. Ahora va derecho después del hero |
| 3 | **Proceso** | `#proceso` | ✅ vuelve (F7) | 4 pasos; el mismo bloque sigue embebido en cada ficha |
| 4 | **Stack** | `#skills` | ✅ existe | 5 categorías desde el mapa `tecnologias` del JSON (39 chips) |
| 5 | **Sobre mí** | `#sobre-mi` | ✅ existe | marquee tipográfico + mini-timeline con link a Formación |
| 6 | **Formación académica** | `#formacion` | ✅ existe (F3) | timeline con 5 hitos: tecnicatura, +200 hs y 3 certificados (PDF de Python linkeado) |
| 7 | **Contacto / Brief rápido** | `#contacto` | ✅ renombrado (antes `#cotizador`) | wizard + form verificado contra Google Sheets |

### Fuera del sitemap (borrados o embebidos)

| Qué | Motivo |
|-----|--------|
| `#metodologia` (sección "Cómo trabajo") | Se eliminó en T2.9 y **vuelve en F7 como `#proceso`**; además sigue embebida en cada ficha |
| `#logic-cube`, `.tech-stack` | Ya eliminados en T1.4 (poda técnica) |
| Cotizador como página/objetivo propio | Reconvertido a "Contacto / Brief rápido" (decisión aceptada) |

### Navegación

| Superficie | Elemento | Estado |
|------------|----------|--------|
| Desktop (≥769px) | `line-sidebar` vertical fija: hero → proyectos → proceso → skills → sobre-mi → formacion → contacto | ✅ 7 links, mismo orden que el scroll (F7) |
| Mobile (≤768px) | Hamburguesa + menú overlay generado desde el sidebar | ✅ existe; clona los 6 links del sidebar (nav probado en 557px) |
| Footer (todas las rutas) | marca + enlaces reales | ✅ GitHub `gonzalezalan-23`, WhatsApp `1139053673`, Instagram `gonzalezalan.23`, mail `facundoalanfafa@gmail.com`. **LinkedIn no existe → no se muestra** |

---

## 3. Detalle de proyecto — `proyecto.html?slug=<slug>`

- **12 fichas**, generadas desde `data/proyectos.json` (fuente única de verdad).
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
- `sistema-sad` es interno: `repo: null`, no se expone código.

---

## 4. Otras rutas

| Ruta | Propósito | Estado |
|------|-----------|--------|
| `/404.html` | Página de error propia (GitHub Pages la sirve automático) | ✅ existe (paleta negra/roja, bug de color corregido en F2) |
| `/sitemap.xml`, `/robots.txt` | SEO | pendiente T4.x |

---

## 5. Diagrama

```
/                                    ← página principal (7 secciones)
├── #hero            (1) Hero
├── #proyectos       (2) Proyectos destacados → Órbita + tarjetas
│   └── proyecto.html?slug=<slug>  ×12  (plantilla A ✅ · dos capas ✅)
├── #proceso         (3) Proceso (4 pasos)      [vuelve en F7]
├── #skills          (4) Stack (5 categorías)
├── #sobre-mi        (5) Sobre mí (marquee + mini-timeline)
├── #formacion       (6) Formación académica
└── #contacto        (7) Contacto / Brief rápido (wizard + form Google Sheets)

/404.html
```

---

## 6. Por confirmar (bloqueos de T1.3)

1. **Tabla maestra de los 12 proyectos** (título, categoría, año, links/demo/repo) → sin ella no se puede poblar `data/proyectos.json`.
2. **Las 3 plantillas**: propuse A/B/C arriba (razón: coinciden con las 3 categorías de las tarjetas actuales: Control Interno / Ecommerce / SaaS-Dashboard). Confirmar o corregir.
3. **Orden final**: ✅ decidido por el dueño e implementado en F7: **Hero → Destacados → Proceso → Stack → Sobre mí → Formación → Contacto**. Los proyectos van temprano porque venden; Sobre mí y Formación quedan como respaldo, después de saber qué hace y cómo trabaja.
4. **Los 12 proyectos**: ver `INVENTARIO_2026.md` — candidatos propuestos; falta confirmar la lista definitiva contra la tabla maestra del usuario.
