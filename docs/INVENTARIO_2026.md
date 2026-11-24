# INVENTARIO — D:\2026 (T1.3, apoyo)

> Fuente: exploración directa de `D:\2026` · 2026-11-19
> Sirve de base para poblar `data/proyectos.json`, definir plantillas y planificar T5.1 (capturas).
> Excluidos: node_modules, dist, .git, vendor, caches.

---

## Resumen ejecutivo

| Cantidad | Qué |
|---|---|
| **4** | Casos de estudio **sólidos** (interfaz + docs + código) |
| **5** | **Casi** presentables (les falta 1 de: capturas, docs o código completo) |
| **1** | Hardware documentado |
| **1** | Landing completa sin docs (rescatable con capturas) |
| **4-5** | Ejercicios menores / incompletos (no entran como caso de estudio) |
| **189** | Imágenes totales · ~100+ son capturas/mockups de UI útiles |

---

## ⚠️ Seguridad — NO subir al portfolio

| Archivo | Riesgo |
|---|---|
| `CoursED/Sistema/.env` | service_role key Supabase, token Mercado Pago, session secret |
| `sistema SAD/.env` | secretos reales (ver `docs/ESTADO.md`) |
| `Mini proyectos/List To Do - Firebase/conexion.js` | API key Firebase expuesta |
| `ScoreEd/…/scoreEd_credenciales.txt` | credenciales en texto plano |

Antes de publicar cualquier demo/repo: auditar `.env`, credenciales y keys (T5 incluye checklist de seguridad).

---

## Casos de estudio sólidos (4)

### 1. Biblioteca-Virtual ⭐
- **Qué es:** Sistema web de gestión de biblioteca escolar EEST N°5 — catálogo público, préstamos, reservas, panel admin.
- **Stack:** HTML/CSS/JS vanilla + Tailwind CDN + **Supabase** (PostgreSQL/Auth/RLS) + EmailJS + Open Library API.
- **Web:** 6 HTML (público, alumno, docente, admin) · **publicado en GitHub Pages** (`alonesteservian-cell.github.io/Biblioteca-virtual1/`).
- **Activos:** README · 3 manuales HTML con capturas · **16 capturas** (`Documentación/Interfaces/`) · `diagrama-er.html` · `branding.html` · informe PDF + 2 DOCX · `SEGURIDAD.md` · `database.md`.
- **Estado:** Maduro y publicado; pendientes documentados (no código a medias).
- **Complejidad:** **alta** — 4 roles, ~14 módulos, RLS.
- **Falta para el portfolio:** migrar el deploy a la cuenta `gonzalezalan-23`.

### 2. ScoreEd ⭐
- **Qué es:** Gestión de torneos escolares — resultados en vivo, tabla, fixture, equipos/jugadores/árbitros.
- **Stack:** **PHP + MySQL** (38 endpoints REST) + HTML/CSS/JS vanilla (14 js, tiempo real) · Apache/XAMPP.
- **Web:** 17 vistas en 3 áreas: pública (4), admin (8), árbitro (4).
- **Activos:** informe DOCX+PDF · **14 diagramas** (DCU, 4 DFD, Gantt, ER, modelo relacional) · presentación PPTX · **27 capturas** (`Carpeta de Campo/img/`).
- **Estado:** Completo y funcional (3 roles, API completa).
- **Complejidad:** **alta**.
- **A limpiar:** `trabajo-nico.html` suelto, credenciales en txt.

### 3. CoursED ⭐
- **Qué es:** Marketplace de cursos online (SaaS multi-tenant para academias: crear/gestionar/vender cursos).
- **Stack:** **Vue 3 + Vite + Tailwind 4 + Pinia + Router** + **Supabase** (Auth, Edge Functions, Storage, pgvector) + Mercado Pago + **IA (Groq)** chatbot FAQ + jspdf (certificados).
- **Web:** 18 vistas `.vue` + 7 componentes · `dist/` compilado.
- **Activos:** `PROJECT_CONTEXT.md` · `DATABASE_SCHEMA.md` · UML/casos de uso/flujo · manual-usuario · **72 capturas/mockups PNG** · branding (Logotip.png) · modelo relacional.
- **Estado:** Muy completo y pulido · marca `paymentService.js` como código muerto en su doc.
- **Complejidad:** **alta** — 3 roles, pagos, chatbot IA, 14 migraciones.
- **⚠️** `.env` con secretos — no subir.

### 4. sistema SAD ⭐
- **Qué es:** Gestión documental de titulares e interinos — buscar/visualizar/exportar/cargar legajos PDF de docentes desde Google Drive, con roles. (Pasantías 2026, oficinas SAD.)
- **Stack:** **Node nativo** (sin framework) + frontend ES modules puro + **Firebase Auth/Firestore** + **Supabase** (índice + RLS) + **Google Apps Script** (puente Drive) + xlsx/CSV + cookie HMAC + **vitest (10 tests)**.
- **Web:** login + dashboard (35KB) + 12 módulos JS · deploy Render (`render.yaml`).
- **Activos:** **14 docs profesionales** (manual-usuario, manual-admin, informe, api, arquitectura-y-decisiones, guía dev, plan-produccion, CHANGELOG, ESTADO…) · README · AGENTS.md · 2 mockups Figma.
- **Estado:** v0.3 "en desarrollo" (roadmap explícito, no código a medias).
- **Complejidad:** **alta** — 3 stores de datos, proxy Node, roles, tests.

---

## Casi presentables (5) — les falta 1 cosa

| Proyecto | Qué es | Stack | Qué tiene | **Qué falta** |
|---|---|---|---|---|
| **Olimpiadas / ViajesPro** | Tienda de paquetes turísticos (Olimpiada Nacional de Prog. 2025) | HTML/CSS/JS + localStorage + DDL MySQL | **13 capturas**, 10+ diagramas (Gantt, SCRUM, DFD, ER), branding, 2 PPTX, video entrevista (773 MB) | `Sistema/` **vacío** — la web es "Web-ejem" (ejemplo de 6 vistas con roles simulados) |
| **Ejercicios Python (Python Lab)** | App de escritorio con 8 ejercicios (anagrama, Fibonacci, FizzBuzz…) | Python 3.11 + CustomTkinter + Pillow | **README excelente**, tests (95 líneas), ~2.100 líneas, design system | **0 capturas** — hay que sacarle fotos |
| **Mini Pekka** | Robot triatlón (sumo, seguidor, despeje) + WiFi AP con control táctil | Arduino/ESP32 + STL + Tinkercad | Manual interactivo, 2 informes, diagramas, STL | Manual con **4 placeholders sin imagen** |
| **Totem** | Asistente virtual con **cara animada + lip-sync** (visemas) + sensor PIR | HTML/JS canvas + Arduino + **Rhubarb Lip Sync** (20 audios + 20 JSON visemas) | Informe DOCX, assets de audio/visemas | **0 capturas** — prototipo sin documentación de usuario |
| **Bazar (Milonga)** | App de escritorio de gestión de stock de bazar | Python + CustomTkinter + SQLite | **4 mockups JPG** 1440×830 + PPTX mockups | Docs casi vacías; web a medias (export estático sin lógica) |

---

## Hardware documentado (1)

| Proyecto | Qué es | Stack | Activos | Falta |
|---|---|---|---|---|
| **Municipalidad** | Reproductor MP3 con sensor PIR para monumento público | Arduino + DFPlayer (101 líneas) | 5 informes DOCX/PDF, manual de uso, 2 diagramas | 0 capturas de UI (no aplica), fotos del dispositivo |

---

## Rescatable (1)

| Proyecto | Qué es | Stack | Estado |
|---|---|---|---|
| **Yamila Potel** | Landing institucional — asesoría contable/impositiva (6 páginas + diagnóstico interactivo) | HTML/CSS/JS vanilla, a11y con aria-labels | Sitio completo y cuidado · **0 docs, 0 capturas** → sacar capturas y entra |

---

## No presentables como caso de estudio (4-5)

- **Mini proyectos** (3 mini apps: gráficos Python, To-Do Firebase, Flask saludos — sin README, CSS/JS vacíos, TODOs)
- **Milagroso** (5 `.ino` sueltos, todas las carpetas de docs vacías)
- **Comando Estelar** (hardware ESP32 — `Sistema/` vacío, manual con 5 placeholders; sí tiene diagramas de bloques/PCB)
- **Plantilla - Web** (**carpeta vacía al 100%**)

---

## Capturas disponibles por proyecto (para T5.1)

| Carpeta | Cantidad | Contenido |
|---|---|---|
| `CoursED/Carpeta de Campo/1/ y 2/` | **72 PNG** | mockups/capturas landing CoursEd/Cursalia (nombres numéricos: 1_.png…) |
| `ScoreEd/Carpeta de Campo/img/` | **27 PNG** | admin ×17, login ×3, público ×7 |
| `Biblioteca-Virtual/Documentación/Interfaces/` | **16 PNG** | admin ×9 + público ×6 + 1 |
| `Olimpiadas/Carpeta de Campo/…/Web-ejem/img/` | **16 PNG** | home, login, registro, logos |
| `Olimpiadas/Documentación/Interfaces/` | **13 PNG** | ViajesPro: admin (dashboard, guías, hoteles, pedidos, vehículos, ventas, vuelos), login, registro, usuario (carrito, footer, home) |
| `Bazar/Carpeta de Campo/` | **4 JPG** | mockups app Milonga (Stock, Avisos, Ingresos, Ventas) 1440×830 |
| `sistema SAD/assets/img/` + `capturas de sistema/` | **4 PNG** | 2 mockups Figma + 1 captura editor GAS + 1 pantalla de error |
| Diagramas (ScoreEd 14, Olimpiadas ~10, +others) | ~35 | DCU, DFD, Gantt, ER, casos de uso, modelo relacional |
| `Olimpiadas/…/Entrevista.mp4` | 1 video | **773 MB** — b-roll posible; comprimir/trimar si se usa |

---

## Candidatos a los 12 del portfolio (propuesta)

**Presentables hoy (10):** Biblioteca-Virtual, ScoreEd, CoursED, sistema SAD, ViajesPro, Python Lab, Mini Pekka, Totem, Bazar/Milonga, Municipalidad.
**Rescatables con capturas (2):** Yamila Potel, Comando Estelar *(o Ejercicios Python ya contado — definir con la tabla maestra)*.

> **Pendiente:** confirmar contra la tabla maestra del usuario cuáles son los 12 definitivos.
