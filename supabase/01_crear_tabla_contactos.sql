-- ═══════════════════════════════════════════════════════════════
--  T1.6 — Tabla de contactos del portfolio + RLS
--  Proyecto: alan.dev  ·  Tabla: proyectos_recibidos
--
--  DÓNDE SE EJECUTA: Supabase → SQL Editor → New query → pegar → Run
--  (lo corrés con tu usuario de Supabase; corre como postgres)
--
--  QUÉ GARANTIZA:
--   · El form del sitio puede INSERTAR (público)…
--   · …pero NADIE anónimo puede LEER, BORRAR o ACTUALIZAR filas.
--   · La anon key que vive en el JS es segura SOLO por este RLS.
--   · Un bot que llene el campo trampa (honeypot) es rechazado por
--     la base aunque se salte el JavaScript.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Tabla ────────────────────────────────────────────────────
create table if not exists public.proyectos_recibidos (
  id                   bigint generated always as identity primary key,
  nombre               text not null
                       check (char_length(nombre) between 1 and 120),
  email                text not null
                       check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
                              and char_length(email) <= 254),
  mensaje              text not null default ''
                       check (char_length(mensaje) <= 2000),
  objetivo_negocio     text not null default ''
                       check (char_length(objetivo_negocio) <= 50),
  requiere_offline     boolean not null default false,
  arquitectura_sugerida text not null default ''
                       check (char_length(arquitectura_sugerida) <= 1500),
  -- Campo trampa: los humans nunca lo ven (oculto por CSS), los bots
  -- sí. Si llega con texto, la CHECK lo rechaza en la base.
  honeypot             text not null default ''
                       check (char_length(honeypot) = 0),
  created_at           timestamptz not null default now()
);

-- Ver los mensajes más recientes primero
create index if not exists idx_proyectos_recibidos_created_at
  on public.proyectos_recibidos (created_at desc);

-- ── 2. RLS: activar ─────────────────────────────────────────────
alter table public.proyectos_recibidos enable row level security;

-- ── 3. Permisos explícitos (defensa en profundidad) ─────────────
-- Aunque alguien cambie las policies, el anon jamás recibe UPDATE/DELETE.
revoke all on table public.proyectos_recibidos from anon;
grant  insert on table public.proyectos_recibidos to anon;
revoke all on table public.proyectos_recibidos from authenticated;
grant  select on table public.proyectos_recibidos to authenticated;

-- ── 4. Policies ─────────────────────────────────────────────────
-- El público (rol anon) puede INSERTAR: es el form del portfolio.
drop policy if exists "anon_puede_insertar_contactos"
  on public.proyectos_recibidos;
create policy "anon_puede_insertar_contactos"
  on public.proyectos_recibidos
  for insert
  to anon
  with check (true);

-- Vos (authenticated / desde el dashboard) podés LEER los mensajes.
-- En el dashboard de Supabase siempre los ves: Table Editor usa
-- la service_role, que está por encima del RLS.
drop policy if exists "authenticated_puede_leer_contactos"
  on public.proyectos_recibidos;
create policy "authenticated_puede_leer_contactos"
  on public.proyectos_recibidos
  for select
  to authenticated
  using (true);

-- NO se crean policies de update/delete para anon → operan 0 filas.

-- ── 5. Verificación (copiar y pegar en el SQL Editor) ───────────
-- 5a. Debe devolver 0 (ninguna policy de SELECT para anon):
--     (se verifica de verdad con curl/REST desde afuera — ver
--      docs/SUPABASE.md, "Paso 4")
--
-- 5b. Probá que la CHECK del honeypot funciona:
insert into public.proyectos_recibidos
  (nombre, email, mensaje, honeypot)
values
  ('TEST borrar', 'test@example.com', 'fila de prueba — borrar después', 'bot-lleno');
-- → Debe FALLAR con: new row for relation violates check constraint
--   "proyectos_recibidos_honeypot_check"
--   (si falló como esperás: perfecto. Si entró: borrá la fila y avisame.)
--
-- 5c. Filá de prueba real (opcional, para ver el form llegar):
insert into public.proyectos_recibidos (nombre, email, mensaje)
values ('TEST borrar', 'test@example.com', 'prueba de envío — borrar después');
-- → Debe funcionar. Borrala después desde Table Editor.
