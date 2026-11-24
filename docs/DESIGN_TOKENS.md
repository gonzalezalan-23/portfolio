# DESIGN TOKENS — Alan.dev Portfolio

> **Documento maestro de dirección visual.**
> Toda tarea de este proyecto debe respetar estos valores. Si algo no está acá,
> primero se agrega acá y recién después se escribe en el CSS.
>
> Última actualización: F2 — paleta `NEGRO + ROJO` (aprobada por el dueño)

---

## 1. Dirección creativa

**Nombre interno:** `NEGRO + ROJO`

**Concepto:** fondo negro casi puro, tipografía clara y un rojo fuerte
(`#FF2D2D`) como única señal. El rojo no se limita a detalles: también
ocupa **bloques secundarios** (CTA principal, botón de envío y el panel
de "arquitectura recomendada") con **texto negro** encima. Es una estética
de producto firme y juguetona a la vez, sin azul neón ni terminal genérica.

**Principios de aceptación (criterio de "¿esto es mío?"):**

1. No debe parecerse a un portfolio dev genérico (negro + azul neón + terminal).
2. No debe copiar la estética de las referencias: debe **sentirse** como ellas.
3. La personalidad la pone el contenido y el personaje; el sistema visual es sobrio.
4. Máximo **2 colores** con rol activo (negro + rojo). Todo lo demás es neutro.
5. **Nunca texto claro sobre rojo**: usar siempre `--on-accent` (negro).

**Referencias de sensación (no de estética):**
lynnandtonic.com · bruno-simon.com · denisechandler.com · brittanychiang.com

---

## 2. Paleta de color

### 2.1 Tokens de superficie

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `--bg` | `#080808` | Fondo global (negro) | base |
| `--bg-surface` | `#141414` | Tarjetas, fichas, paneles | — |
| `--bg-elevated` | `#1E1E1E` | Bloques destacados, cabeceras de wizard | — |

### 2.2 Tokens de línea

| Token | Valor | Uso | Contraste vs `--bg` |
|---|---|---|---|
| `--border` | `#2B2B2B` | Divisores decorativos | decorativo, no aplica |
| `--border-inner` | `#666666` | Bordes de input, foco, líneas activas | **3.49:1** ✅ ≥3:1 UI |

### 2.3 Tokens de texto

| Token | Valor | Uso | Contraste vs `--bg` |
|---|---|---|---|
| `--text` | `#F5F5F5` | Texto principal | **18.37:1** ✅ AAA |
| `--text-muted` | `#A8A8A8` | Texto secundario, placeholders, footer | **8.42:1** ✅ AAA |

### 2.4 Tokens de señal (acento)

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `--accent` | `#FF2D2D` | Enlaces, labels, CTA, paneles rojos | **5.40:1** ✅ AA |
| `--accent` sobre `--bg-elevated` | `#FF2D2D` | Límite justo (4.50:1) — no usar para texto pequeño ahí | **4.50:1** ✅ AA |
| `--accent-strong` | `#FF5A5A` | Hover del acento | **6.54:1** ✅ AAA |
| `--on-accent` | `#080808` | Texto **sobre** rojo (botones y panel) | **5.40:1** ✅ AA |
| `--accent-dim` | `rgba(255,45,45,.12)` | Fondos de estado seleccionado | — |
| `--accent-2` | `#FF5A5A` | Secundario rojo claro | **6.54:1** ✅ AAA |
| `--accent-green` | `#FF5A5A` | Mensaje de éxito (sin verde: paleta cerrada) | **6.54:1** ✅ AAA |
| `--error` | `#FF8A8A` | Errores (rojo claro, distinguishable del acento) | **8.83:1** ✅ AAA |
| `--error-dim` | `rgba(255,138,138,.12)` | Fondo de error | — |
| `--ok-dim` | `rgba(255,45,45,.12)` | Fondo de éxito | — |

### 2.5 Regla de uso (importante)

> **Nunca** usar `opacity` sobre `--accent` para atenuar texto.
> El rojo sobre negro cae por debajo de AA al bajar la opacidad.
> Si un elemento debe verse más suave, usar `--text-muted`, no opacidad.

> **Nunca** usar texto claro sobre `--accent`: `#F5F5F5` sobre `#FF2D2D`
> da **3.40:1 = FAIL**. Siempre `--on-accent` (negro).

> **Nunca** usar `--border-inner` como color de **texto**.
> Es un token de borde (3.49:1, válido para UI, insuficiente para texto).

---

## 3. Tipografía

Cargadas desde Google Fonts en `index.html` (URL verificada, `display=swap`).

| Rol | Familia | Pesos | Dónde se aplica |
|---|---|---|---|
| Display | **Bricolage Grotesque** | 400–800 | `h1, h2, h3, h4` |
| Cuerpo | **Instrument Sans** | 400–700 | `body` y texto general |
| Mono | **IBM Plex Mono** | 400, 500, 600 | Labels, eyebrows, código, sidebar |

**Tokens:**

```css
--font-display: 'Bricolage Grotesque', 'Instrument Sans', sans-serif;
--font-sans:    'Instrument Sans', 'Segoe UI', system-ui, sans-serif;
--font-mono:    'IBM Plex Mono', 'Fira Code', monospace;
```

**Nota histórica (H-01, resuelto):** el archivo declaraba `'Montserrat'` como
primera opción pero nunca se cargaba, por lo que el sitio caía a Inter por azar.
Hoy cada familia declarada está realmente descargada.

---

## 4. Motion

```css
--dur-1: 120ms;  /* micro: hover, focus           */
--dur-2: 200ms;  /* base: toggles, estados        */
--dur-3: 400ms;  /* medio: reveals, paneles       */
--dur-4: 700ms;  /* largo: entrada de sección     */

--transition:  var(--dur-2) ease;
--ease-out:    cubic-bezier(0.22, 1, 0.36, 1);   /* salidas */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);   /* transiciones */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);/* personaje / burbujas */
```

**Regla:** cualquier animación nueva debe usar uno de estos tokens.
No escribir duraciones ni easings sueltos en el CSS.

---

## 5. Geometría y elevación

```css
--radius:      10px;  /* tarjetas, paneles */
--radius-sm:    6px;  /* inputs, botones   */
--max-w:       760px; /* ancho de columna  */

--card-glow:         0 0 0 1px var(--border);
--card-glow-hover:   0 0 0 1px rgba(255,45,45,.35), 0 0 24px rgba(255,45,45,.10), 0 0 48px rgba(255,45,45,.05);
--btn-glow-primary:  0 0 0 1px rgba(255,45,45,.45), 0 0 16px rgba(255,45,45,.25), 0 0 40px rgba(255,45,45,.12);
--btn-glow-secondary:0 0 0 1px rgba(255,45,45,.35), 0 0 12px rgba(255,45,45,.15), 0 0 28px rgba(255,45,45,.07);
--btn-transition:     all var(--dur-3) var(--ease-out);
```

**Sombra del personaje:**

```css
--avatar-shadow:   0 6px 24px rgba(0, 0, 0, 0.55);
--avatar-shadow-2: 0 0 34px rgba(255, 45, 45, 0.55);  /* pulso */
```

---

## 6. Componentes con reglas de contraste propias

| Componente | Regla |
|---|---|
| `.btn-primary` | `background: var(--accent)` + `color: var(--on-accent)` → **5.40:1**. Jamás texto claro sobre rojo. |
| `.btn-submit` | `background: var(--accent)` + `color: var(--bg)` → **5.40:1**. |
| `.arch-recommendation` | Panel rojo sólido + `color: var(--on-accent)` → **5.40:1**. Es el "bloque secundario" pedido por el dueño. |
| `.btn-secondary` | Fondo tinta clara al 5% sobre negro. Nunca blanco al 3% (invisible en oscuro) ni tinta al 3% (invisible en claro). |
| Placeholders | `--text-muted`. Nunca `--border-inner`. |
| `.field-optional`, `.footer-inner small` | `--text-muted`. Nunca `--border-inner`. |
| Canvas de partículas | `ACCENT = '255, 45, 45'` · `GREEN = '255, 90, 90'` (en `app.js`). Anillos: `0.07 + i * 0.03`. |

---

## 7. Paletas descartadas (no reutilizar sin revalidar)

| Nombre | Motivo de descarte |
|---|---|
| GitHub Primer (original) | Los 10 colores eran literalmente los de GitHub → "podría ser de cualquiera". |
| "Cuaderno de banco" (papel + óxido) | Rechazada por el dueño: los colores no le representaban. |
| `NAVY + ÁMBAR` (`#0D1B2A` + `#FFB020`) | Reemplazada en F2 por decisión del dueño: quiere negro y rojo, colores fuertes. |

> Si se cambia la paleta, **hay que recalcular todos los contrastes de la
> tabla §2** antes de escribir los valores en `:root`.

---

## 8. Checklist de accesibilidad obligatorio por tarea

- [ ] Todos los pares de texto ≥ **4.5:1** (AA) o ≥ 7:1 (AAA).
- [ ] Bordes de input / indicadores de foco ≥ **3:1** (WCAG 1.4.11).
- [ ] Ningún texto depende de `opacity` para verse secundario.
- [ ] `prefers-reduced-motion` respetado en animaciones nuevas (T4.1).
- [ ] Navegación por teclado y foco visible en elementos interactivos nuevos.
