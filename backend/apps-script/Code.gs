/**
 * Velvet Greens — Customer Discovery
 * Backend en Google Apps Script.
 *
 * QUÉ HACE
 *  - POST { action: "start", meta }   -> devuelve un interviewId nuevo
 *  - POST { action: "save",  interview } -> escribe UNA fila plana en la hoja "Interviews"
 *  - GET  ?action=health              -> responde "OK" (health check)
 *
 * CONFIGURACIÓN (hacer una sola vez)
 *  1. Crea una Google Sheet nueva (o usa una existente).
 *  2. Copia su ID (está en la URL, entre /d/ y /edit) y pégalo en SHEET_ID más abajo.
 *  3. Extensiones > Apps Script, pega este archivo completo como Code.gs.
 *  4. Implementar > Nueva implementación > tipo "Aplicación web".
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier usuario
 *  5. Copia la URL /exec resultante y pégala en apps/interview-app/src/lib/config.js
 */

const SHEET_ID = "PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET";
const SHEET_NAME = "Interviews";
const META_SHEET_NAME = "Metadata";

// ---------------------------------------------------------------------------
// Entradas HTTP
// ---------------------------------------------------------------------------

function doGet(e) {
  const action = e?.parameter?.action;
  if (action === "health") {
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  }
  return ContentService.createTextOutput("Velvet Greens Customer Discovery API").setMimeType(
    ContentService.MimeType.TEXT
  );
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === "start") {
      return jsonResponse({ ok: true, interviewId: generateInterviewId() });
    }

    if (action === "save") {
      const interviewId = saveInterview(body.interview || {});
      return jsonResponse({ ok: true, interviewId });
    }

    return jsonResponse({ ok: false, error: "Acción no reconocida: " + action });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function generateInterviewId() {
  return "VG-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
}

// ---------------------------------------------------------------------------
// Lógica de guardado
// ---------------------------------------------------------------------------

function saveInterview(interview) {
  const sheet = getOrCreateSheet(SHEET_NAME);
  const row = flattenInterview(interview);
  appendRowMatchingHeaders(sheet, row);
  return interview.interviewId || row["InterviewID"] || generateInterviewId();
}

/**
 * Convierte el estado de la entrevista (anidado) en un objeto plano
 * columna -> valor, listo para escribir en la hoja.
 */
function flattenInterview(interview) {
  const meta = interview.meta || {};
  const answers = interview.answers || {};
  const cardChoices = interview.cardChoices || {};

  const row = {
    Timestamp: new Date().toISOString(),
    InterviewID: interview.interviewId || interview.localId || generateInterviewId(),
    Entrevistador: meta.entrevistador || "",
    Ciudad: meta.ciudad || "",
    Edad: meta.edad || "",
    Profesion: meta.profesion || "",
    FechaInicio: meta.fecha || interview.startedAt || "",
    FechaFin: interview.finishedAt || "",
  };

  // Preguntas abiertas (Bloques 1-6): una columna por pregunta, con el mismo id
  // que usa el frontend en src/data/flow.js (así siempre queda alineado).
  Object.keys(answers).forEach((questionId) => {
    row["Q_" + questionId] = answers[questionId];
  });

  // Preguntas comparativas (tarjetas): una columna de elección + una de motivo.
  Object.keys(cardChoices).forEach((comparativeId) => {
    row["C_" + comparativeId + "_eleccion"] = cardChoices[comparativeId].choice || "";
    row["C_" + comparativeId + "_motivo"] = cardChoices[comparativeId].reason || "";
  });

  return row;
}

/**
 * Escribe `row` (objeto columna->valor) en `sheet`, creando encabezados si
 * la hoja está vacía, y agregando columnas nuevas al final si aparecen
 * claves que todavía no existían (por ejemplo, si el flujo de preguntas cambia).
 */
function appendRowMatchingHeaders(sheet, row) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  let headers = sheet.getLastRow() === 0 ? [] : sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  headers = headers.filter((h) => h !== "");

  const newKeys = Object.keys(row).filter((k) => headers.indexOf(k) === -1);
  if (newKeys.length > 0) {
    headers = headers.concat(newKeys);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  const rowValues = headers.map((h) => (h in row ? row[h] : ""));
  sheet.appendRow(rowValues);
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// Utilidad opcional: correr UNA VEZ manualmente desde el editor de Apps Script
// para crear las pestañas "Interviews" y "Metadata" vacías de antemano.
// ---------------------------------------------------------------------------
function setup() {
  getOrCreateSheet(SHEET_NAME);
  const meta = getOrCreateSheet(META_SHEET_NAME);
  if (meta.getLastRow() === 0) {
    meta.getRange(1, 1, 1, 2).setValues([["Clave", "Valor"]]);
    meta.appendRow(["Version", "1.0.0"]);
    meta.appendRow(["Proyecto", "Velvet Greens - Customer Discovery"]);
  }
}
