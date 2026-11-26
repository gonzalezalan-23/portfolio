# GOOGLE SHEETS + APPS SCRIPT — backend del formulario (T1.6)

> ⛔ **HISTÓRICO — ya no está en el sitio.** El formulario de contacto abre
> Gmail/Outlook web con el mensaje ya redactado, sin servidores propios.
> Este documento queda como registro de la opción descartada.

> ✅ **OPERATIVO — verificado 2026-11-24.**
> El servicio responde 200 y **escribe** en esta hoja (abrila para ver
> los mensajes):
> **https://docs.google.com/spreadsheets/d/1fhpJBBD3HxyzPYVMg5HIsI08TpcxwPTynm3gJHD3gVM/edit**
> Pestaña `Mensajes`. La hoja vieja (`1iycHrKw-…`) ya **no** se usa: por
> eso parecía que no llegaba nada. Hay **5 filas de prueba** (`TEST F1 …`)
> que podés borrar cuando quieras.
>
> **Cómo se verificó:** GET `/exec` → `status:ok` + campo `hoja` · POST
> directo → `{"status":"ok"}` · POST desde el navegador → `{"status":"ok"}`
> con respuesta **legible** (Google devuelve
> `Access-Control-Allow-Origin: *`). Por eso el form pasó de `no-cors`
> (respuesta opaca, éxito optimista) a `cors`: ahora el ✓ aparece solo
> cuando el servidor confirma que guardó la fila.
>
> **Por qué cambiamos de Supabase:** el límite de proyectos de Supabase
> Free (2 por cuenta) ya está lleno con tus otros proyectos. Un form de
> contacto guarda pocos KB por mensaje: una planilla de Google es gratis
> sin cuotas y vos ya manejás Apps Script (el puente de Drive del SAD).

---

## Paso 1 — Crear la hoja (1 min)

1. Entrá a [sheets.google.com](https://sheets.google.com) → **Hoja de cálculo en blanco**.
2. Título: `Portfolio — Mensajes`.
3. **No toques nada más**: la hoja "Mensajes" con sus encabezados la crea
   el script sola en el primer mensaje.

## Paso 2 — Pegar el script (2 min)

1. Con la hoja abierta: **Extensiones** → **Apps Script**.
2. Se abre el editor. **Borrá** el contenido de `Code.gs` que viene vacío/copiado.
3. Abrí el archivo `D:\Portfolio\apps-script\recibir_mensajes.js`, copiá
   **todo** y pegalo.
4. **Guardar** (💾 o `Ctrl+S`). Nombre: `recibir_mensajes` (o el que quieras).

### ⚠️ Si al elegir Extensiones → Apps Script te dice "No se pudo abrir el archivo"

Es el navegador bloqueando la **pestaña nueva** donde abre el editor (o dos
cuentas de Google mezcladas). Probá en este orden:

1. **Reintentá** y mirá la **barra de direcciones**: debe aparecer un ícono
   de popups bloqueados (🪟 con ×) → clic → **"Permitir pop-ups de
   script.google.com"** → repetí Extensiones → Apps Script.
2. **Una sola cuenta**: fijate que la hoja y el editor estén con la MISMA
   cuenta de Google (arriba a la derecha, avatar). Si tenés dos sesiones
   abiertas, cerrá una.
3. **Camino B (funciona siempre):**
   1. Andá directo a **[script.google.com](https://script.google.com)**
      → **Nuevos proyectos** → **Proyecto en blanco**.
   2. Pegá el contenido de `apps-script\recibir_mensajes.js`.
   3. Guardá y seguí en el **Paso 3** (el deploy es idéntico).
      - **No hace falta** configurar `SHEET_ID`: si el script no puede
        abrir ninguna hoja, **crea una** `Portfolio — Mensajes` solo y
        la dueña es su propia cuenta. La URL te la devuelve el Paso 4
        (campo `hoja`) y también aparece en Drive → Recientes.

## Paso 3 — Publicar como Web app (1 min)

1. Arriba a la derecha: **Implementar** → **Nueva implementación**.
2. Tipo de implementación: elegí la **ícono de engranaje → Web app**.
3. Configuralo exactamente así:
   - **Ejecutar como:** **Yo** (tu cuenta — así puede escribir en tu hoja)
   - **Quién tiene acceso:** **Cualquier persona**
4. **Implementar** → te pide autorizar: **Revisar permisos** → elegís tu
   cuenta → "no está verificado" → **Avanzado** → **Ir a (nombre del proyecto)**
   → permitir. (Es normal: es TU script, no una app de terceros.)
5. **Copiá la URL** que termina en `/exec`. Ejemplo:
   `https://script.google.com/macros/s/AKfyc.../exec`

> Esa URL es solo para **escribir**: no se pueden leer los mensajes con
> ella (la hoja sigue siendo tuya y privada).

## Paso 4 — Probar la publicación (30 seg)

Abrí la URL `/exec` en el navegador. Debe responder algo así:

```json
{"status":"ok","servicio":"portfolio-form","hoja":"https://docs.google.com/spreadsheets/d/..."}
```

El campo `hoja` es **la URL exacta donde caen los mensajes** — abrila y
guardala. Si ves `hoja_error`, pasame el texto.

## Paso 5 — Verificación (ya hecha; cómo repetirla)

La URL `/exec` definitiva ya está conectada en `FORM_ENDPOINT` de
`assets/js/app.js`. Para repetir el chequeo:

1. **Salud**: abrí la URL `/exec` → debe responder
   `{"status":"ok","servicio":"portfolio-form","hoja":"…"}`.
   El campo `hoja` es **siempre** la fuente de verdad: es donde caen los
   mensajes, aunque haya varias planillas en la cuenta.
2. **Happy path**: completá el form en el sitio → el botón dice
   `✓ Propuesta enviada` **solo si** el servidor respondió `status:ok`
   (ahora la respuesta se lee: `mode:'cors'` + `Content-Type:text/plain`).
   Recién ahí aparece la fila en la hoja del paso 1.
3. **Si algo falla**: el botón pasa a `Reintentar` y el console muestra
   `message` / `detalle` del script (antes era imposible: `no-cors`
   devolvía una respuesta opaca y el ✓ mentía).

Batería que ya pasó: POST directo con payload válido → `{"status":"ok"}` ·
POST desde el navegador → `{"status":"ok"}` · honeypot lleno → éxito fingido
y **0 filas** · email inválido → `status:error` y **0 filas**.

> **Si cambias de cuenta o de deployment**: volvé a correr el paso 1 y
> copiá la nueva URL `/exec` en `FORM_ENDPOINT`. Si el `/exec` sigue
> corriendo código viejo, *Implementar → Administrar implementaciones →
> ✏️ → Nueva versión*. El campo `hoja` del GET te dice dónde está escribiendo
> realmente, sin adivinar.

---

## Cómo llegan los mensajes

| Dónde | Cómo |
|---|---|
| **Verlos** | [Hoja real `1fhpJBBD3H…`](https://docs.google.com/spreadsheets/d/1fhpJBBD3HxyzPYVMg5HIsI08TpcxwPTynm3gJHD3gVM/edit) → pestaña **Mensajes** (también desde el celular) |
| Columnas | `Fecha · Nombre · Email · Mensaje · Negocio · Offline · Arquitectura sugerida` |
| Responder | Contestás desde tu mail, a mano (no hay notificaciones automáticas — ver "Futuro") |
| Privacidad | La hoja no se comparte con nadie; nadie puede leerla desde el form |

## Qué ya está hecho en el código

- ✅ Validación en el form (nombre + email con formato, errores inline con `role="alert"`)
- ✅ Estados del botón: idle → Enviando… → ✓ / Reintentar
- ✅ Payload con el contexto del wizard (negocio + offline + arquitectura sugerida)
- ✅ **Honeypot doble**: el sitio descarta bots antes de enviar; la planilla
   además rechaza cualquier POST que venga con el campo `empresa` lleno
   (aunque se salten el JavaScript)
- ✅ Límites de longitud en ambos lados (sitio y script)
- ✅ Si el form falla, **solo cae el form**: el resto del sitio sigue vivo
- ✅ **Éxito verificado**: el ✓ aparece solo cuando Apps Script responde
   `status:ok`; si falla, se muestra error y el `detalle` queda en consola
   (no se fingen envíos)

## Futuro (opcional, no bloquea)

- **Aviso por email** al llegar un mensaje: en el editor de Apps Script,
  **Activadores** → al recién agregado → función `avisarPorEmail`
  (10 líneas, gratis, te llega a Gmail).
- **Anti-spam avanzado**: Cloudflare Turnstile (gratis) si algún día el
  honeypot no alcanza.
