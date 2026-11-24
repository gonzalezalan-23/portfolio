# Biblioteca Virtual — EEST N.º 5

Aplicación web para consultar el catálogo de la biblioteca escolar y gestionar usuarios, material de estudio, reservas, préstamos y devoluciones.

## Contenido del repositorio

```text
Biblioteca-Virtual/
├── Sistema/                         # Aplicación web estática
│   ├── index.html                   # Catálogo público
│   ├── portal-login.html             # Acceso y registro
│   ├── panel-alumno.html             # Portal del alumno
│   ├── panel-docente.html            # Portal del docente
│   ├── admin/                        # Administración
│   └── assets/{css,js,img}/          # Recursos compartidos
├── Documentación/                   # Base de datos, seguridad, SQL y capturas
├── Manuales/                        # Manuales HTML para los roles
├── Fotos/                           # Material del proyecto (si se completa)
├── Presentación/                    # Material de exposición (si se completa)
├── Carpeta de Campo/                # Entregables escolares (si se completa)
├── .github/workflows/pages.yml      # Publicación de Sistema en GitHub Pages
├── .gitignore
└── README.md
```

Los archivos de la aplicación permanecen agrupados en `Sistema`. No necesita compilación: el navegador carga HTML, CSS y JavaScript directamente.

## Funcionalidades

| Perfil | Funciones principales |
|---|---|
| Visitante | Buscar y filtrar el catálogo, consultar disponibilidad y estadísticas públicas. |
| Alumno | Consultar préstamos, reservar libros, pedir extensiones y acceder a material de estudio. |
| Docente | Consultar historial y pedir libros individualmente o por lotes para un curso. |
| Administrador | Aprobar cuentas y gestionar préstamos, usuarios, inventario, categorías, materiales y estadísticas. |

## Tecnologías

- HTML, CSS y JavaScript sin framework ni paso de compilación.
- Supabase para PostgreSQL, autenticación y API.
- EmailJS para notificaciones desde el panel administrativo.
- Open Library para autocompletar datos bibliográficos por ISBN.
- GitHub Pages para alojar el frontend.

## Ejecutar localmente

Desde la raíz del repositorio:

```bash
cd Sistema
npx serve .
```

También puede usarse `python -m http.server 8080` si Python está instalado. Abrí la URL local que indique el servidor. No abras los HTML directamente con `file://`, porque el navegador limita algunas funciones de autenticación.

La aplicación requiere que `Sistema/assets/js/config.js` apunte a un proyecto Supabase configurado. La URL y la clave `anon` son valores públicos de frontend; nunca debe incluirse una clave `service_role`, contraseñas ni tokens privados.

## Configurar Supabase

1. Crear un proyecto Supabase.
2. Seguir el esquema de [`Documentación/database.md`](Documentación/database.md).
3. Aplicar, en orden, los cambios de [`Documentación/DB-cambios-pendientes.md`](Documentación/DB-cambios-pendientes.md), [`Documentación/seguridad-rls.sql`](Documentación/seguridad-rls.sql), [`Documentación/migracion-flujos-criticos.sql`](Documentación/migracion-flujos-criticos.sql) y [`Documentación/migracion-asignacion-lotes-docente.sql`](Documentación/migracion-asignacion-lotes-docente.sql). Revisar las instrucciones de cada script y respaldar la base antes de aplicar cambios.
4. Configurar la URL y clave pública `anon` en `Sistema/assets/js/config.js`.
5. Crear el primer usuario administrador en Supabase Auth y darlo de alta con rol `admin` según [`Documentación/SEGURIDAD.md`](Documentación/SEGURIDAD.md).

Las políticas RLS son parte esencial de la seguridad: una clave `anon` en el navegador no protege por sí sola los datos. EmailJS también utiliza configuración pública en cliente; limitar sus orígenes y cuotas desde su panel.

## Publicar en GitHub Pages

El frontend vive en `Sistema/`. GitHub Pages no permite elegir cualquier subcarpeta como fuente de una rama, así que el workflow de este repositorio publica esa carpeta mediante GitHub Actions.

1. En GitHub, abrir **Settings → Pages**.
2. En **Build and deployment → Source**, elegir **GitHub Actions**.
3. Enviar los cambios a la rama `main`; el workflow `.github/workflows/pages.yml` publicará `Sistema/`.

La URL de Pages depende del propietario y nombre efectivos del repositorio; consultala en Settings → Pages.

## Seguridad antes de hacer público el repositorio

Los archivos actuales fueron revisados para evitar publicar credenciales privadas y datos personales evidentes en capturas. Sin embargo, el historial Git ya existente contiene versiones anteriores con una credencial expuesta y capturas con datos personales. Quitar esos datos de los archivos actuales **no los elimina de los commits anteriores**. Antes de publicar el historial, hay que rotar cualquier contraseña que pudiera seguir activa y decidir entre sanear el historial completo o publicar una copia limpia. Ver [`Documentación/SEGURIDAD.md`](Documentación/SEGURIDAD.md).

## Documentación

- [`Documentación/database.md`](Documentación/database.md): esquema de datos.
- [`Documentación/SEGURIDAD.md`](Documentación/SEGURIDAD.md): preparación segura y configuración.
- [`Documentación/Diagramas/diagrama-er.html`](Documentación/Diagramas/diagrama-er.html): diagrama de entidades.
- [`Documentación/Análisis de requerimientos/analisis-requerimientos.md`](Documentación/Análisis%20de%20requerimientos/analisis-requerimientos.md): requisitos.
- [`Manuales/`](Manuales/): guías de uso.

## Equipo

Proyecto escolar de la EEST N.º 5, Berazategui.
