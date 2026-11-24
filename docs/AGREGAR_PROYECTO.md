# CÓMO AGREGAR UN PROYECTO (sin tocar código)

> Esta es **tu única guía**. Regla de oro: se edita **solo** `data/proyectos.json`.
> **Nunca** `index.html`, ni el CSS, ni el JS — ellos ya están conectados al JSON.

---

## Pasos

### 1. Abrí `data/proyectos.json`

Está en `D:\Portfolio\data\proyectos.json`. Es un archivo de datos (no código).

### 2. Copiá este bloque y pegalo dentro de `"proyectos": [ … ]`

```json
{
  "slug": "mi-nuevo-proyecto",
  "titulo": "Título del Proyecto",
  "categoria": "sistema-web",
  "plantilla": "A",
  "orden": 13,
  "anio": null,
  "rol": null,
  "resumen": "Una frase (máx. 160 caracteres) que se ve en la tarjeta de la home.",
  "problema": "¿Qué problema del cliente o negocio tenía?",
  "solucion": "¿Qué construiste y por qué así?",
  "resultado": "¿Qué cambió después? Concreto, medible si se puede.",
  "decisiones": [
    "Por qué elegí esta base de datos en vez de otra.",
    "Por qué separé estos módulos.",
    "Qué limitación técnica condicionó el diseño."
  ],
  "demoAcceso": null,
  "stack": ["Tech 1", "Tech 2", "Tech 3"],
  "funcionalidades": ["Función 1", "Función 2", "Función 3"],
  "capturas": ["assets/img/proyectos/mi-nuevo-proyecto/01.webp"],
  "demo": null,
  "repo": null,
  "destacado": false,
  "video": null
}
```

**Ojo con las comas**: cada proyecto va separado por `,` del anterior, y el último **no** lleva coma final.

### 3. Campos — qué poner en cada uno

| Campo | Qué es | Ejemplo / regla |
|---|---|---|
| `slug` | Nombre técnico de la URL: `proyecto.html?slug=<slug>` | minúsculas y guiones: `mi-nuevo-proyecto`. **Único** |
| `titulo` | Lo que se ve en la tarjeta | ≤ 60 caracteres |
| `categoria` | Para el ícono/etiqueta | `sistema-web`, `saas`, `ecommerce`, `landing`, `app-escritorio`, `hardware-iot` |
| `plantilla` | Tipo de ficha de detalle | `A` caso de negocio · `B` producto/demo · `C` hardware |
| `orden` | Posición en la home (de menor a mayor) | 1, 2, 3… sin repetir. Usá 13, 14… para seguir al final |
| `anio` | Año del proyecto | número `2025` o `null` si no lo sabés |
| `rol` | Tu rol | `"Full Stack"` / `"Diseño + Front-end"` o `null` |
| `resumen` | Frase de la tarjeta | **máx. 160 caracteres** |
| `problema` / `solucion` / `resultado` | El corazón del caso | 1–3 frases cada uno (Capa 1) |
| `decisiones` | Por qué construiste así | 2–3 frases técnicas (Capa 2, va en "Ficha técnica") |
| `demoAcceso` | Cómo entrar a la demo | texto con acceso rápido/usuario de prueba **solo si hay `demo`**; si no, `null` |
| `stack` | Chips de tecnologías | 3–6 textos |
| `funcionalidades` | Qué hace | mínimo 3 |
| `capturas` | Fotos de la interfaz | ruta dentro del sitio, formato `…/NN.webp`. **mínimo 1** |
| `demo` | Link a la versión funcionando | URL `https://…` o `null` (**si existe, debe abrirse**) |
| `repo` | Link al código | URL `https://github.com/…` o `null` |
| `destacado` | ¿Entra al carrusel Órbita? | `true`/`false` — **máximo 6 en total** |
| `equipo` | Compañeros del proyecto | array de `{ "nombre": "...", "rol": "..." }`; el `rol` es opcional. Si trabajaste solo, `[]` o no lo pongas |
| `video` | Video corto opcional | URL o `null` |

### 3b. El mapa `tecnologias` (arriba del todo, fuera de `"proyectos"`)

La sección Stack del home se arma con este mapa, no con una lista fija en el
código. Está en la raíz del JSON y ya tiene estas categorías:

```json
"tecnologias": {
  "Lo que se ve": ["HTML/CSS", "HTML/JS", "JS vanilla", "Vue 3", "Tailwind CSS", "CustomTkinter"],
  "Detrás de escena": ["PHP", "Python", "Mercado Pago", "IA (Groq)", "EmailJS"],
  "Datos": ["Supabase", "MySQL", "SQLite", "localStorage"],
  "Dispositivos": ["Arduino", "Arduino/ESP32", "ESP32", "C++", "WiFi AP", "RF 433 MHz", "Modelado 3D"],
  "Herramientas": ["Vite"]
}
```

**Regla:** si en un proyecto usás una tecnología nueva, agregala **también**
al array de la categoría que corresponda (mismo texto, con la misma
ortografía). El validador te avisa si te olvidaste; mientras tanto la tech
aparece igual, en un bloque "En proyectos", para que no se pierda evidencia.
El home muestra chips compactos; `proyectos.html` muestra el catálogo completo
con filtros por `categoria` y los créditos de `equipo[]`.

### 3c. Regla de las dos capas (cómo se arma la ficha)

La ficha de detalle tiene dos niveles, pensados para que cualquiera entienda
el proyecto en 30 segundos y puedo profundizar si quiere:

- **Capa 1 (siempre visible):** nombre comercial, historia
  problema → solución → resultado, y —si el proyecto tiene `demo`— botón
  "Ver demo" con el `demoAcceso` debajo. Si `demo` es `null`, **no aparece
  ningún botón de demo** (nunca mostramos algo que no existe).
- **Capa 2 (al desplegar "Ficha técnica"):** `stack`, tus `decisiones`
  técnicas y el link a GitHub (`repo`). Si no hay repo, no aparece el link.

> Proyectos en equipo: cargá siempre `equipo[]` con nombre y rol real. El
> catálogo y la ficha lo muestran como "En equipo con…". `sistema-sad` y
> `python-lab` ya no están en el catálogo.

### 4. Validá (30 segundos, evita romper nada)

Desde `D:\Portfolio`:

```
node scripts/validar-proyectos.mjs
```

- **`✓ VÁLIDO`** → listo, se puede publicar.
- **`✖ ERRORES`** → el validador te dice exactamente qué campo corregir (slug duplicado, resumen largo, etc.). Corregí y volvé a correr.
- **`⚠ WARNINGS`** → no bloquean: son tus pendientes (capturas que faltan, `anio`/`rol` por completar).

### 5. Miralo

Recargá el sitio (`Ctrl+Shift+R`) — la tarjeta aparece sola, en el lugar que le corresponde por `orden`. Su ficha de detalle se abre con **"Ver caso completo →"** (misma regla: sale solo del JSON).

### 6. Subilo

`git add data/proyectos.json && git commit && git push` — cuando exista el deploy automático (T4), la Action **corre el validador antes de publicar**: si el JSON está roto, **no se despliega** y el sitio en producción sigue quedando con la última versión buena. Nunca se rompe.

---

## Capturas (cuando haga falta)

1. Creá la carpeta `D:\Portfolio\assets\img\proyectos\<slug>\`
2. Guardá ahí tus imágenes como `01.webp`, `02.webp`… (convertí a WebP ≤ 200 KB)
3. Referencialas en el campo `capturas` con esa misma ruta

---

## Lo que NO hay que tocar

| Archivo | Por qué |
|---|---|
| `index.html` | Las tarjetas ya se generan solas desde el JSON |
| `proyecto.html` | La ficha de detalle también se genera desde el JSON (`?slug=`) |
| `assets/css/styles.css` | El diseño ya está aplicado a las tarjetas |
| `assets/js/app.js` | Ya lee el JSON y pinta las tarjetas |
| `assets/js/proyecto.js` | Ya lee el JSON y pinta la ficha del proyecto |

Si algo se ve mal en una tarjeta puntual, es un dato del JSON (campo vacío o texto raro), no el código.

---

## Errores comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `node:... Unexpected token` | Falta o sobra una `,` o `}` | Mirá la línea que te marca el validador |
| La tarjeta no aparece | `orden` duplicado u otro error | Corré el validador y corregí lo rojo |
| Las capturas no se ven | Todavía no copiaste las imágenes | Ver "Capturas" arriba (no bloquea) |
| "No se pudieron cargar los proyectos" | JSON roto o sitio abierto como archivo | Corré el validador; serví el sitio por http://localhost |
