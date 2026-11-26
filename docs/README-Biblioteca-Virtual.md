# Biblioteca Virtual — EEST N.º 5

**Demo:** https://gonzalezalan-23.github.io/Biblioteca-Virtual/ · **Repositorio:** https://github.com/gonzalezalan-23/Biblioteca-Virtual

Sistema web para reemplazar el catálogo de la biblioteca escolar, que antes estaba publicado en Google Sites. Reúne catálogo público, préstamos, reservas y panel de administración en una sola aplicación.

## Problema

Los préstamos se anotaban en papel y el catálogo vivía en un sitio de Google Sites sin gestión de datos. Cuando faltaba un registro, nadie podía saber con certeza qué libro estaba prestado ni cuándo tenía que volver. Tampoco había una forma clara de separar lo que podía hacer cada rol.

## Solución

Se construyó una aplicación estática con un catálogo consultable y un panel administrativo. El acceso a los datos se controla con autenticación y políticas RLS de Supabase: cada perfil ve y hace sólo lo que le corresponde. Los avisos de préstamos y reservas se envían automáticamente por correo.

## Alcance

| Dato | Valor |
|---|---|
| Roles | 4 (visitante, alumno, docente, administrador) |
| Vistas HTML | 6 |
| Módulos JavaScript del panel | 14 |
| Manuales de usuario | 3 |
| Capturas de interfaces | 16 |
| Scripts SQL de esquema y seguridad | 3 |

## Funcionalidades

| Perfil | Funciones principales |
|---|---|
| Visitante | Buscar y filtrar el catálogo, consultar disponibilidad y estadísticas públicas. |
| Alumno | Consultar préstamos, reservar libros, pedir extensiones y acceder a material de estudio. |
| Docente | Consultar historial y pedir libros individualmente o por lotes para un curso. |
| Administrador | Aprobar cuentas y gestionar préstamos, usuarios, inventario, categorías, materiales y estadísticas. |

## Stack

- **Frontend:** HTML, CSS y JavaScript vanilla, sin framework ni paso de compilación. Tailwind CDN en las vistas públicas.
- **Datos y autenticación:** Supabase (PostgreSQL, Auth, Storage y RLS).
- **Notificaciones:** EmailJS.
- **Datos bibliográficos:** Open Library API para completar por ISBN.
- **Despliegue:** GitHub Pages mediante GitHub Actions.

## Arquitectura y decisiones

- **Frontend estático, sin build.** La escuela puede abrir y mantener el sistema sin instalar Node ni depender de un servidor propio. Todo se publica como archivos estáticos.
- **Supabase como único backend.** Evita administrar una base propia y resuelve autenticación, permisos y API en un mismo lugar.
- **RLS desde el primer día.** La clave `anon` es pública por diseño; la protección real está en las políticas de la base, no en ocultar la clave. Nunca se usa `service_role` en el navegador.
- **Panel separado en `Sistema/admin/`.** Aísla las vistas privilegiadas del catálogo público y permite publicar todo junto sin mezclar rutas.
- **Sin framework.** El proyecto es de alcance escolar y se alumnos y docentes pueden entender el código; incorporar React o Vue habría sumado compilación y configuración sin una necesidad real.

El esquema está documentado en [`Documentación/database.md`](Documentación/database.md) y el modelo relacional en [`Documentación/Diagramas/diagrama-er.html`](Documentación/Diagramas/diagrama-er.html).

## Ejecutar localmente

```bash
cd Sistema
npx serve .
```

También funciona con `python -m http.server 8080`. Abrí la URL local que indique el servidor; no abras los HTML con `file://`, porque el navegador limita algunas funciones de autenticación.

## Configurar Supabase

1. Crear un proyecto Supabase.
2. Seguir el esquema de [`Documentación/database.md`](Documentación/database.md).
3. Aplicar en orden `Documentación/seguridad-rls.sql`, `Documentación/migracion-flujos-criticos.sql` y `Documentación/migracion-asignacion-lotes-docente.sql`. Revisar cada script y respaldar la base antes de ejecutarlo; los cambios pendientes están en [`Documentación/DB-cambios-pendientes.md`](Documentación/DB-cambios-pendientes.md).
4. Cargar la URL y la clave `anon` en `Sistema/assets/js/config.js`. Nunca incluir una clave `service_role`, contraseñas ni tokens privados.
5. Crear el primer usuario administrador en Supabase Auth y darlo de alta con rol `admin` según [`Documentación/SEGURIDAD.md`](Documentación/SEGURIDAD.md).
6. Configurar EmailJS y restringir sus orígenes permitidos desde el panel del servicio.

## Despliegue

El frontend vive en `Sistema/`. GitHub Pages no permite elegir una subcarpeta como fuente desde la configuración, así que `.github/workflows/pages.yml` publica esa carpeta con GitHub Actions.

1. En GitHub: **Settings → Pages**.
2. En **Build and deployment → Source**, elegir **GitHub Actions**.
3. Publicar en `main`; el workflow se encarga del resto.

Demo pública: https://gonzalezalan-23.github.io/Biblioteca-Virtual/

## Estado actual

- La aplicación y sus cuatro roles están funcionando.
- **La instancia pública todavía no tiene cargado el catálogo real.** La migración del catálogo histórico (más de 500 ejemplares) está pendiente.
- Las capturas y manuales de `Documentación/` corresponden al sistema implementado.

## Seguridad

Los archivos actuales fueron revisados para no publicar credenciales privadas ni datos personales evidentes en capturas. El historial Git anterior sí contuvo una credencial expuesta y capturas con datos personales: sacarlos de los archivos actuales **no los elimina de commits anteriores**. Si esa credencial sigue activa, rotarla antes de seguir publicando. Ver [`Documentación/SEGURIDAD.md`](Documentación/SEGURIDAD.md).

## Documentación

- [Requerimientos](Documentación/Análisis%20de%20requerimientos/analisis-requerimientos.md)
- [Esquema de base de datos](Documentación/database.md)
- [Seguridad](Documentación/SEGURIDAD.md)
- [Diagrama entidad-relación](Documentación/Diagramas/diagrama-er.html)
- [Manual visitante](Documentación/Manuales/manual-visitante.html)
- [Manual alumnos y docentes](Documentación/Manuales/manual-alumnos-docentes.html)
- [Manual bibliotecaria](Documentación/Manuales/manual-bibliotecaria.html)
- [Capturas de interfaces](Documentación/Interfaces/)
- [Informe del proyecto](Documentación/Informe/Biblioteca-Escolar.pdf)

## Autor y equipo

Proyecto escolar de la EEST N.º 5, Berazategui, realizado en equipo. Alan González implementó la búsqueda, los préstamos y el panel de administración, y participó en requerimientos y diseño.

- GitHub: https://github.com/gonzalezalan-23
