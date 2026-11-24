# MODELO DE DATOS — Proyectos (T1.3)

> Fuente única de verdad: **`data/proyectos.json`** (objeto con `tecnologias` y `proyectos`).
> El carrusel Órbita del home, el catálogo `proyectos.html` y las 10 fichas de detalle se **generan** de este archivo.
> Nada de proyecto se duplica en el HTML: si cambia un dato, cambia acá y se propaga.

---

## 1. Esquema por proyecto

| Campo | Tipo | Req. | Reglas |
|-------|------|------|--------|
| `slug` | string | ✅ | único, kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`); forma la URL `proyecto.html?slug=<slug>` |
| `titulo` | string | ✅ | ≤ 60 chars; título tal cual lo verá el cliente |
| `categoria` | string | ✅ | vocabulario controlado: `sistema-web` \| `saas` \| `ecommerce` \| `landing` \| `app-escritorio` \| `hardware-iot` |
| `plantilla` | string | ✅ | `A` (caso) \| `B` (producto) \| `C` (hardware) — ver §3 |
| `orden` | number | ✅ | 1…N, sin repetidos ni huecos (define el Órbita, el catálogo y el prev/next) |
| `anio` | number \| null | ✅ | ej. 2025; `null` si no se sabe (el validador avisa) |
| `rol` | string \| null | ✅ | ej. `Diseño UX/UI + Full Stack`; `null` si falta (el validador avisa) |
| `equipo` | object[] | ⚠️ | compañeros: `{ "nombre": "...", "rol": "..." }` (el `rol` es opcional). Obligatorio en trabajos en equipo; se muestra como "En equipo con…" en la ficha y el catálogo |
| `resumen` | string | ✅ | ≤ 160 chars — tarjeta home + meta description |
| `problema` | string | ✅ | 1–3 frases: el dolor del cliente/negocio |
| `solucion` | string | ✅ | 1–3 frases: qué se construyó y por qué así |
| `resultado` | string | ✅ | concreto y medible cuando se pueda (si no hay métrica: resultado observable) |
| `decisiones` | string[] | ⚠️ | **Capa 2**: 2–3 decisiones técnicas. Opcional mientras se completa el JSON; el validador avisa |
| `demoAcceso` | string \| null | ⚠️ | **Capa 1**: acceso rápido / usuario de prueba. Solo si `demo` es URL; `null` si no hay demo |
| `stack` | string[] | ✅ | 3–6 items (los mismos que se muestran como chips) |
| `funcionalidades` | string[] | ✅ | mín. 3 — bloque "qué hace" de la ficha |
| `capturas` | string[] | ✅ | paths relativos `assets/img/proyectos/<slug>/NN.webp`; **mín. 1** para el corte, ideal 3–5; webp ≤ 200 KB c/u |
| `demo` | string \| null | ⚠️ | **si existe debe responder 200** (requisito de recepción R9). `null` si no hay |
| `repo` | string \| null | ⚠️ | si existe: URL de `github.com/gonzalezalan-23/…`; `null` si es privado/inexistente |
| `destacado` | boolean | ✅ | `true` solo en los elegibles para el Órbita (máx. 6 — elegidos por el dueño) |
| `video` | string \| null | ❌ | opcional: screencast corto (webm/mp4) si existe |

**Campos obligatorios de cada plantilla** (si `plantilla = B`, además: `demo` no-nulo; si `plantilla = C`: `funcionalidades` debe incluir al menos un punto de arquitectura).
**Créditos:** los proyectos hechos con otras personas deben cargar `equipo[]` con los nombres (y roles, si los hay) que dio el dueño; los trabajos individuales lo dejan vacío o no lo incluyen.

---

## 2. Estructura del archivo

```json
{
  "version": 1,
  "actualizado": "AAAA-MM-DD",
  "tecnologias": {
    "Lo que se ve": ["HTML/CSS", "HTML/JS", "JS vanilla", "Vue 3", "Tailwind CSS", "CustomTkinter"],
    "Detrás de escena": ["PHP", "Python", "Mercado Pago", "IA (Groq)", "EmailJS"],
    "Datos": ["Supabase", "MySQL", "SQLite", "localStorage"],
    "Dispositivos": ["Arduino", "Arduino/ESP32", "ESP32", "C++", "WiFi AP", "RF 433 MHz", "Modelado 3D"],
    "Herramientas": ["Vite"]
  },
  "proyectos": [ { …esquema… }, … ]
}
```

- `version`: para migraciones futuras del formato.
- `tecnologias`: mapa raíz curado que arma la sección Stack del home por categorías (chips compactos; la evidencia va en `title`/`aria-label`). Lo que no esté en el mapa cae en "En proyectos", no se pierde.
- El archivo se valida con un checklist antes de cada deploy: slugs únicos, `orden` sin huecos, demos respondiendo 200, `resumen` ≤160 y regla de dos capas.

---

## 3. Las 3 plantillas de detalle

> **v2 (2026-11-19)** — redefinidas contra el material real de `D:\2026` (ver `INVENTARIO_2026.md`).
> El criterio ya no es "el tipo de proyecto" en abstracto, sino **qué puede mostrar** cada proyecto:
> evidencia de negocio (manuales, roles, usuarios reales) vs. producto visual vs. hardware.

| ID | Nombre | Para qué | Bloques clave | Proyectos que caen acá |
|----|--------|----------|---------------|------------------------|
| **A** | **Caso de negocio** | Proyectos con usuario/contexto real → vendible como "así resolví un problema" | Problema → Solución → Resultado + arquitectura + capturas + CTA "quiero algo así" → `#contacto` | `biblioteca-virtual`, `coursed`, `scoreed`, `viajespro` |
| **B** | **Producto / demo** | Proyectos donde **la interfaz es el argumento** (demo o capturas primero) | Demo/capturas arriba → qué hace (funcionalidades) → stack → CTA probar/contacto | `yamila-potel`, `milonga` |
| **C** | **Hardware / multidisciplinario** | Dispositivos y prototipos: sin dashboard, pero con historia técnica | Foto/diagrama del dispositivo → cómo funciona → stack embebido → resultado | `totem`, `mini-peka`, `monumento-audio`, `comando-estelar` |

\* *Los proyectos de hardware mantienen `C++` en el stack cuando aplica (Mini Pekka, Tótem, Monumento y Comando Estelar).*

**Diferencia A vs B:** A arranca con el **problema** (el cliente se ve reflejado); B arranca con el **producto** (el visitante ve algo lindo de inmediato). Ambas terminan en CTA.

**Regla de selección:** el campo `plantilla` del JSON decide; si un proyecto duda, gana **A** (es la que mejor vende contratación).

**Corte Must**: ✅ plantilla **A** implementada (T2.2, 2026-11-22). B y C completan en T2.x/T5 — hasta entonces usan la estructura de A.

> **v1 (descartada):** A caso / B producto-demo / C "ficha técnica" — C era redundante con A; el material real mostró que la tercera dimensión del portfolio es el **hardware**, no la ficha técnica.

---

## 4. Ejemplo de entrada

```json
{
  "slug": "biblioteca-virtual",
  "titulo": "Biblioteca Virtual EEST N°5",
  "categoria": "sistema-web",
  "plantilla": "A",
  "orden": 1,
  "anio": 2026,
  "rol": "Diseño, Front-end, Back-end y Documentación",
  "equipo": [
    { "nombre": "Alondra Peralta", "rol": "Analista, diseñadora" }
  ],
  "resumen": "Sistema web de biblioteca escolar: catálogo público, préstamos y reservas con 4 roles y seguridad RLS en Supabase.",
  "problema": "La biblioteca de la EEST N°5 manejaba préstamos y reservas en papel: registros que se perdían, devoluciones rastreadas a pulso y nadie que supiera quién sacó qué.",
  "solucion": "Un sitio con catálogo público y paneles separados por rol (alumno, docente, administración) sobre Supabase: Auth, PostgreSQL y RLS. Avisos automáticos por EmailJS y fichas enriquecidas con la API de Open Library.",
  "resultado": "Cada préstamo queda registrado y trazable, y cada usuario solo ve lo que le corresponde. Publicado en GitHub Pages.",
  "decisiones": [
    "Supabase Auth + PostgreSQL con RLS: el mismo catálogo sirve a alumnos, docentes y administración sin mezclar permisos.",
    "EmailJS para los avisos de préstamos y reservas: sin servidor de correo propio que mantener.",
    "API de Open Library para enriquecer las fichas: menos carga manual de datos y portadas consistentes."
  ],
  "demoAcceso": "Demo pública: el catálogo se abre sin login. Para probar préstamos, pedime un usuario de prueba con rol alumno.",
  "stack": ["JS vanilla", "Tailwind CSS", "Supabase", "EmailJS"],
  "funcionalidades": ["Catálogo público de libros", "Préstamos y reservas", "4 roles con RLS", "Panel de administración"],
  "capturas": [
    "assets/img/proyectos/biblioteca-virtual/01.webp",
    "assets/img/proyectos/biblioteca-virtual/02.webp",
    "assets/img/proyectos/biblioteca-virtual/03.webp"
  ],
  "demo": "https://alan-gonzalez-23.github.io/Biblioteca-Virtual/",
  "repo": "https://github.com/alan-gonzalez-23/Biblioteca-Virtual",
  "destacado": true,
  "video": null
}
```

*(Copia real de `data/proyectos.json` — el archivo está poblado con los 10 proyectos vigentes.)*

---

## 5. Checklist de validación (previo a deploy, T5)

> **Automatizado:** `node scripts/validar-proyectos.mjs` hace este checklist y bloquea el deploy si hay errores.
> **Guía de alta para no-programar:** ver `docs/AGREGAR_PROYECTO.md`.

- [ ] 10 entradas, `orden` 1–10 sin repetidos ni huecos
- [ ] `slug` únicos y kebab-case
- [ ] `resumen` ≤ 160 chars
- [ ] `capturas`: mínimo 1 por proyecto, rutas existentes, webp ≤ 200 KB
- [ ] `demo`: todas responden **200** (las `null` se muestran sin botón)
- [ ] `demoAcceso`: texto cuando hay demo; `null` cuando no la hay
- [ ] `decisiones`: 2–3 textos por proyecto (Capa 2 de la ficha)
- [ ] `equipo[]`: nombres y roles reales en los trabajos en equipo (ScoreEd, ViajesPro, Biblioteca, Tótem, Mini Pekka, Monumento, Comando Estelar, Milonga)
- [ ] `repo`: apuntan a `gonzalezalan-23` o a la cuenta real del proyecto (los `null` no renderizan enlace)
- [ ] `destacado: true` ≤ 6 proyectos
- [ ] Todo campo de texto sin placeholders ni lorem ipsum
