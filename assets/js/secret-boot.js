/**
 * secret-boot.js — aplica el tema ANTES del primer paint.
 * Se carga sin defer en el <head>: si el modo secreto quedó activo en
 * localStorage, el documento arranca directo en doomsday y no parpadea
 * con la paleta cliente. Si storage no está disponible, no pasa nada.
 */
(() => {
  'use strict';
  try {
    if (window.localStorage.getItem('alan:mode') === 'doomsday') {
      document.documentElement.dataset.theme = 'doomsday';
    }
  } catch (_) {
    /* modo privado / storage bloqueado: se usa el tema cliente */
  }
})();
