/* ═══════════════════════════════════════════════════════════════
 *  recibir_mensajes.js — Backend del formulario de contacto
 *  Portfolio alan.dev · T1.6 (Google Sheets + Apps Script)
 *
 *  CÓMO SE USA: ver docs/GOOGLE_SHEETS.md
 *  (hoja nueva → Extensiones → Apps Script → pegar esto →
 *   Deploy → Web app → Execute as: Me → Access: Anyone)
 *
 *  QUÉ HACE:
 *   · doGet  → chequeo de salud (abrí la URL /exec y responderá ok)
 *   · doPost → recibe el JSON del sitio y agrega una fila a la
 *              hoja "Mensajes" (la crea con encabezados si no existe)
 *
 *  SEGURIDAD:
 *   · La hoja es tuya y NO es pública: desde este script solo se
 *     ESCRIBE. Nadie puede leer los mensajes sin tu sesión de Google.
 *   · Honeypot: si el campo "empresa" viene con texto → es un bot →
 *     éxito fingido, no se guarda nada.
 *   · Validaciones y límites de longitud espejan los del sitio.
 *   · Nunca expongas ni pegues acá una service key: no hace falta.
 * ═══════════════════════════════════════════════════════════════ */

const HOJA = 'Mensajes';
const ENCABEZADOS = ['Fecha', 'Nombre', 'Email', 'Mensaje', 'Negocio', 'Offline', 'Arquitectura sugerida'];
const MAX = { nombre: 120, email: 254, mensaje: 2000, negocio: 50, arquitectura: 1500 };

/* OPCIONAL: si querés que los mensajes vayan a una hoja concreta, pegá
   acá su ID (docs.google.com/spreadsheets/d/ESTE_ID/edit). Si lo dejás
   vacío o no tenés acceso, el script usa la hoja ligada o —si no hay—
   crea una hoja propia "Portfolio — Mensajes" automáticamente. */
const SHEET_ID = '';

/** GET — salud del servicio. Además informa la URL de la hoja donde
 *  caen los mensajes (para saber dónde mirar sin adivinar). */
function doGet() {
  const out = { status: 'ok', servicio: 'portfolio-form' };
  try {
    out.hoja = obtenerLibro().getUrl();
  } catch (err) {
    out.hoja_error = String((err && err.message) || err);
  }
  return json(out);
}

/** POST — recibe un mensaje del form y lo guarda en la hoja. */
function doPost(e) {
  try {
    let datos = {};
    if (e && e.postData && e.postData.contents) {
      datos = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      datos = e.parameter; // por si llega como form-urlencoded
    }

    // ── Campo trampa: si "empresa" tiene texto, es un bot.
    //    Éxito fingido y no se escribe nada (mismo criterio que el sitio).
    if (datos.empresa) {
      Logger.log('doPost: descartado por honeypot');
      return json({ status: 'ok' });
    }

    const nombre  = String(datos.nombre  || '').trim();
    const email   = String(datos.email   || '').trim();
    const mensaje = String(datos.mensaje || '').trim();

    // ── Validaciones (espejo de las del sitio)
    if (!nombre || nombre.length > MAX.nombre) {
      return json({ status: 'error', message: 'nombre inválido' });
    }
    if (!email || email.length > MAX.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ status: 'error', message: 'email inválido' });
    }
    if (!mensaje || mensaje.length > MAX.mensaje) {
      return json({ status: 'error', message: 'mensaje inválido' });
    }

    obtenerHoja().appendRow([
      new Date(),
      nombre,
      email,
      mensaje,
      String(datos.objetivo_negocio || '').slice(0, MAX.negocio),
      datos.requiere_offline === true || datos.requiere_offline === 'true',
      String(datos.arquitectura_sugerida || '').slice(0, MAX.arquitectura),
    ]);

    return json({ status: 'ok' });
  } catch (err) {
    Logger.log('doPost error: ' + err);
    /* detalle: solo durante la puesta a marcha — sirve para ver desde
       afuera por qué falló la escritura (quitar si se prefiere). */
    return json({
      status: 'error',
      message: 'error interno',
      detalle: String((err && err.message) || err).slice(0, 300),
    });
  }
}

/** Libro donde viven los mensajes. Orden:
   1) SHEET_ID si está configurado (y es accesible)
   2) la hoja ligada al script (camino A: Extensiones → Apps Script)
   3) una hoja propia creada por el script (se guarda el ID la primera
      vez) — así el dueño de la hoja y quien ejecuta son la misma
      cuenta, sin depender de compartir entre cuentas. */
function obtenerLibro() {
  if (SHEET_ID) {
    try {
      return SpreadsheetApp.openById(SHEET_ID);
    } catch (e) {
      Logger.log('SHEET_ID inaccesible: ' + e);
    }
  }
  const props = PropertiesService.getScriptProperties();
  const guardado = props.getProperty('HOJA_MENSAJES_ID');
  if (guardado) return SpreadsheetApp.openById(guardado);

  const activo = SpreadsheetApp.getActiveSpreadsheet();
  if (activo) return activo;

  const libro = SpreadsheetApp.create('Portfolio — Mensajes');
  props.setProperty('HOJA_MENSAJES_ID', libro.getId());
  Logger.log('Hoja creada por el script: ' + libro.getUrl());
  return libro;
}

/** Hoja "Mensajes"; la crea con encabezados si es la primera vez. */
function obtenerHoja() {
  const ss = obtenerLibro();
  let hoja = ss.getSheetByName(HOJA);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA);
    hoja.appendRow(ENCABEZADOS);
    hoja.setFrozenRows(1);
    hoja.getRange(1, 1, 1, ENCABEZADOS.length).setFontWeight('bold');
  }
  return hoja;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
