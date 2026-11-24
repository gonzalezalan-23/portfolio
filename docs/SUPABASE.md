# SUPABASE — backend del formulario (T1.6)

> ⛔ **DESCARTADO — no usar.** Supabase Free llegó a su límite de proyectos
> en la cuenta del usuario y no se pudo crear el proyecto nuevo. El backend
> del form es ahora **Google Sheets + Apps Script** → ver
> **`docs/GOOGLE_SHEETS.md`**. Este archivo y la migración de `supabase/`
> quedan archivados por si el plan se retoma (el SQL ya está escrito y
> probado en su lógica).

> **Estado:** el código del sitio ya está listo y probado. Falta **tu paso**: crear
> el proyecto en Supabase (gratis, 3 minutos) y correr la migración.
> Mientras tanto, el form muestra "Error al enviar" — es esperado.

---

## Por qué Supabase y no otra cosa

- **Gratis**: plan Free de Supabase (sin tarjeta, 500 MB de base + 50k usuarios/mes — para un form sobra por años).
- **Seguro por diseño**: la clave `anon` vive en el JavaScript del sitio (es pública **a propósito**) y lo único que protege es el **RLS**: cualquiera puede *escribir* un mensaje, nadie puede *leer* los tuyos.
- Cero servidores, cero mantenimiento.

---

## Paso 1 — Crear el proyecto (tu cuenta, 2 min)

1. Entrá a [supabase.com](https://supabase.com) → **Sign up** (con GitHub o email, gratis).
2. **New project**:
   - Name: `portfolio-alan` (o el que quieras)
   - Database password: guardalo en un lugar seguro (no lo necesitás para el form)
   - Region: **South America (São Paulo)** ← lo más cerca para Argentina
3. Esperá ~2 minutos a que termine de crear.

## Paso 2 — Correr la migración (1 min)

1. En el panel: **SQL Editor** → **New query**.
2. Abrí el archivo `D:\Portfolio\supabase\01_crear_tabla_contactos.sql`,
   copiá **todo** el contenido y pegalo.
3. **Run** (botón abajo a la derecha). Debe decir `Success. No rows returned`.

Eso crea la tabla `proyectos_recibidos` con todo el RLS adentro.

### Verificación obligatoria (misma ventana de SQL)

**5b — el campo trampa funciona** (pegar y Run):

```sql
insert into public.proyectos_recibidos (nombre, email, mensaje, honeypot)
values ('TEST', 'test@test.com', 'prueba', 'bot-lleno');
```

- ✅ **Debe FALLAR** con `violates check constraint ... honeypot_check` → perfecto.
- ❌ Si entró: borrá la fila desde Table Editor y avisame.

**5c — el insert normal funciona** (pegar y Run):

```sql
insert into public.proyectos_recibidos (nombre, email, mensaje)
values ('TEST borrar', 'test@test.com', 'prueba de envío — borrar después');
```

- ✅ Debe funcionar (`1 row inserted`). Borrala después desde **Table Editor**.

## Paso 3 — Sacar las credenciales (1 min)

1. **Project Settings** (engranaje arriba a la izquierda) → **API**.
2. Copiá dos cosas:
   - **Project URL** → algo como `https://xxxxxxxx.supabase.co`
   - **anon public** key → un JWT largo que empieza `eyJ...`

> La `anon` key es **pública por diseño**: no la escondas ni la consideres
> secreta. Lo que no se comparte **nunca** es la `service_role` key — esa
> sirve para saltarse el RLS y solo vive en el servidor.

## Paso 4 — Pasame los datos

**Opción A (recomendada):** pegame acá la **Project URL** y la **anon key** y
las actualizo yo en el código, subo el cache-buster y corro toda la batería de
verificación (es tu regla: yo verifico, vos mirás el resultado).

**Opción B:** las cambiás vos en `D:\Portfolio\assets\js\app.js`, líneas 15 y 16
(`SUPABASE_URL` y `SUPABASE_ANON_KEY`) — son solo dos strings, no se rompe nada
más.

## Paso 5 — Verificación final (la corro yo desde acá)

Con la URL nueva en el código:

1. **Happy path**: form completo → botón `✓ Propuesta enviada` → la fila aparece
   en Table Editor.
2. **RLS de lectura**: con la anon key hago `GET /rest/v1/proyectos_recibidos`
   → debe devolver **`[]`** (vacío), nunca tus mensajes. Si devuelve filas,
   el RLS está mal y no se publica.
3. **RLS de borrado**: intento `DELETE` con anon key → debe afectar **0 filas**.
4. **Honeypot**: envío con el campo trampa lleno → éxito fingido, **0 filas**
   nuevas en la base.
5. Te dejo captura de cada resultado.

---

## Cómo llegan los mensajes

| Dónde | Cómo |
|---|---|
| **Verlos rápido** | Supabase → **Table Editor** → `proyectos_recibidos` |
| Columnas | `nombre`, `email`, `mensaje`, + el contexto del wizard (`objetivo_negocio`, `requiere_offline`, `arquitectura_sugerida`), `created_at` |
| Responder | Contestás desde tu mail, a mano (por ahora no hay notificaciones) |

## Qué ya está hecho en el código

- ✅ Validación en el form (nombre + email con formato, errores inline con `role="alert"`)
- ✅ Estados del botón: idle → Enviando… → ✓ / Reintentar
- ✅ Payload con el contexto del wizard (qué negocio + offline + arquitectura sugerida)
- ✅ **Honeypot** (campo oculto `empresa`): si un bot lo rellena → éxito fingido sin insertar; y la base lo rechaza igual por `CHECK` (doble red)
- ✅ Mensaje de éxito/error accesible (`role="status"` / `role="alert"`)
- ✅ Si Supabase falla, **solo cae el form**: el resto del sitio sigue vivo

## Futuro (opcional, no bloquea)

- **Notificación por email** al llegar un mensaje: Supabase Database Webhooks →
  tu mail (gratis) o un Edge Function (también gratis, 500k invocaciones/mes).
- **Anti-spam avanzado**: Cloudflare Turnstile (gratis) si el honeypot no alcanza.
- **Rate limit**: Edge Function delante del insert si algún día hay spam real.
