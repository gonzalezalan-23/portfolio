# Pendientes del portfolio

Estado al 27/11/2026, después de publicar el sitio en GitHub Pages.

## Publicación

El sitio ya está publicado en **https://gonzalezalan-23.github.io/portfolio/**. La fuente de Pages es la rama `main` (no hace falta GitHub Actions para publicar: `.github/workflows/validar.yml` sólo valida `data/proyectos.json`). La URL está en `docs/README-perfil-github.md` y en la descripción/Website del repo; se sacó del header del CV para mantenerlo en una línea.

## Correo del formulario

- **Cuota de Web3Forms:** el form envía por `https://api.web3forms.com/submit` con la `access_key` en `assets/js/app.js`. El plan gratis permite **250 mensajes/mes**; al superarlo el servicio responde error y el panel lo muestra (nunca un ✓ falso). Si querés rotar la clave, creás otro form y cambiás `WEB3FORMS_KEY`.
- **FormSubmit descartado:** respondía `500 Server Error` en `/ajax/` y timeout en el endpoint normal, así que no entregaba mensajes. Se reemplazó por Web3Forms.

## Datos reales que faltan (no inventar)

1. **SAD:** cantidad exacta de legajos/docentes (hoy sólo hay "cerca de 5 años") y link de la documentación en Drive/Docs. Se puede agregar al CV, al portfolio y al README de perfil.
2. **Volumen de Biblioteca:** `count(*) de libros, préstamos, usuarios` en Supabase. Las 6 pantallas y 4 roles ya están documentados; el catálogo real todavía no está cargado.
3. **Métrica de CoursED:** usuarios, cursos o ventas; hoy sólo hay funcionalidades.

## Contenido del portfolio

4. **Orden sugerido de proyectos destacados:** SAD, Biblioteca, CoursED, ScoreEd, Milonga, Totem o Mini Pekka (elegir uno de hardware). SAD ya está en el catálogo pero **no** en el carrusel, para no agrandar los seis destacados aprobados. Si querés que entre, hay que sacar uno de los actuales.
5. **Repos ajenos:** ScoreEd y Nexo Destinos apuntan a `jjclassroomnico`. Si no son tuyos, aclarar crédito o migrar el código a tu cuenta antes de mostrarlos como propios.
6. **Comando Estelar:** prototipo incompleto. Mantenerlo como *experimento* o sacarlo del portfolio; no va en el CV Web Junior.
7. **Certificados:** el link a `curso-python-basico-santander.pdf` todavía existe en `index.html`. Si no lo querés mostrar, quitar la tarjeta; si lo querés, revisar que el archivo esté en `assets/img/`.

## Perfil de GitHub

8. **Crear repo público `gonzalezalan-23`** y pegar `docs/README-perfil-github.md` como README. GitHub sólo muestra ese README si el repo se llama exactamente como el usuario.
9. **Completar bio, ubicación y email** del perfil con los textos del draft.
10. **README y commits de los repos enlazados:** aplicar `docs/README-Biblioteca-Virtual.md` a Biblioteca. En los demás, revisar mensajes de commit y agregar README breve antes de compartirlos.

## Seguridad

11. **Rotar credenciales antiguas de Biblioteca Virtual** si siguen activas: el historial Git contuvo una credencial expuesta y capturas con datos personales. Quitar los archivos actuales no limpia commits anteriores.
12. **Revisar la demo de ViajesPro** antes de seguir linkeándola: es un ejemplo escolar con datos simulados.

## CV

13. **Variante Web & IoT:** lista para armar cuando quieras; ahí sí van Comando Estelar, ESP32 y C++.

## Ya resuelto

- GitHub Pages activo en `https://gonzalezalan-23.github.io/portfolio/`, servido desde `main`; el workflow de Actions es sólo de validación.
- URL pública cargada en el README de perfil; en el CV se prefirió no incluirla para mantener el encabezado en una línea (está en la descripción/Website del repo).
- Descripción del repo `portfolio` y campo Website cargados en GitHub con esa misma URL.
- Footer con logos SVG en vez de texto para GitHub, WhatsApp e Insta; el handle de Instagram sigue sólo en el href.
- Mascota en desktop achicada a `clamp(72px, 8vw, 104px)` (antes hasta 152px) para que tape menos el footer; en móvil se mantiene en 72–96px.
- Formulario con envío real por email (Web3Forms, sin backend propio): el ✓ aparece sólo cuando el servicio responde `success: true`. Gmail/Outlook y "Copiar mensaje" quedan como respaldo, sin abrir pestañas automáticamente. Tras el éxito se limpian campos y selección, y "Enviar otro mensaje" vuelve al paso 1; si falla, se conservan los datos para reintentar.
- Capturas del catálogo en `NN.webp` (79 en total, 9 de SAD) y originales movidos a `D:\Portfolio-originales-2026-11-26`.
- SAD reincorporado al catálogo: 9 capturas (se descartaron los 2 mockups previos), deploy de Render y `repo: null`.
- Validador: 0 errores, 16 advertencias informativas; el sitio se puede publicar.
- CV Web Junior: 1 página, links teal, sin Figma, sin IoT y sin Comando Estelar.
- Mail profesional en sitio, CV y documentación.
- Formulario: mayor contraste en la propuesta recomendada (superficie oscura y texto claro, 16,4:1).
- Modo Avengers: etiquetas sin numeración y collage compacto en móvil, sin tapar los hobbies.
- Mascota: frases nuevas con humor tipo Tony Stark, sin repetir epígrafes.
- Mini diagnóstico del formulario: en Avengers pasa a esmeralda (fondo `#101A15`, borde y degradado verdes, sin rojo); en cliente se mantiene en `#171717` con borde rojo. Contraste 16,32:1 y 16,44:1 respectivamente.
