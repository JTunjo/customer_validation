/**
 * Velvet Greens — Customer Discovery
 * Backend en Google Apps Script.
 *
 * QUÉ HACE
 *  - POST { action: "start", meta }   -> devuelve un interviewId nuevo
 *  - POST { action: "save",  interview } -> escribe UNA fila plana en la hoja "Interviews"
 *  - GET  ?action=health              -> responde "OK" (health check)
 *  - GET  ?action=analytics           -> devuelve JSON con la analítica agregada
 *
 * CONFIGURACIÓN (hacer una sola vez)
 *  1. Crea una Google Sheet nueva (o usa una existente).
 *  2. Copia su ID (está en la URL, entre /d/ y /edit) y pégalo en SHEET_ID más abajo.
 *  3. Extensiones > Apps Script, pega este archivo completo como Code.gs.
 *  4. Implementar > Nueva implementación > tipo "Aplicación web".
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier usuario
 *  5. Copia la URL /exec resultante y pégala en apps/interview-app/src/lib/config.js
 *     y en apps/analytics-dashboard/src/lib/config.js
 */

const SHEET_ID = "1wamHIKNCYcHGxmBtTo7p2uhbGBPi_G2fCqYX8KEJtk8";
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
  if (action === "analytics") {
    return jsonResponse(getAnalytics());
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
// Analítica
// ---------------------------------------------------------------------------
// Metadata duplicada de apps/interview-app/src/data/flow.js (Apps Script no
// puede importar ese archivo). Si el flujo de preguntas/tarjetas cambia allá,
// actualizar también aquí.

const HYPOTHESES = {
  tarjeta_1: { label: "Indulgencia consciente" },
  tarjeta_2: { label: "Feel-good reset" },
  tarjeta_3: { label: "Tu momento" },
};
const HYPOTHESIS_IDS = ["tarjeta_1", "tarjeta_2", "tarjeta_3"];
const COMPARATIVE_QUESTIONS = [
  { id: "c1", question: "¿Cuál te llamó primero la atención?" },
  { id: "c2", question: "¿Cuál entendiste más rápido?" },
  { id: "c3", question: "¿Cuál te genera más curiosidad?" },
  { id: "c4", question: "¿Cuál probarías primero?" },
  { id: "c5", question: "¿Cuál comprarías?" },
  { id: "c6", question: "¿Cuál le contarías a un amigo?" },
  { id: "c7", question: "¿Cuál te parece más creíble?" },
  { id: "c8", question: "¿Hay alguna que te haya sonado demasiado buena para ser verdad?" },
  { id: "c9", question: "Si solo una de estas tres ideas pudiera existir, ¿cuál te daría más tristeza que desapareciera?" },
];

// c8 mide un atributo negativo (desconfianza), así que NO suma como las demás:
// se excluye del score por encuesta / ranking, y se resta en los puntos globales.
const NEGATIVE_QUESTION_ID = "c8";
const POSITIVE_QUESTION_IDS = COMPARATIVE_QUESTIONS.filter((q) => q.id !== NEGATIVE_QUESTION_ID).map((q) => q.id);
const POSITIVE_COMPARATIVE_COUNT = POSITIVE_QUESTION_IDS.length; // 8, denominador del score
const VALID_SCORE_THRESHOLD = 0.65;

const STOPWORDS_ES = new Set(
  (
    "de la que el en y a los del se las por un para con no una su al lo como mas pero sus le ya o " +
    "este si porque esta entre cuando muy sin sobre tambien me hasta hay donde quien desde todo nos " +
    "durante todos uno les ni contra otros ese eso ante ellos e esto mi antes algunos que sí porque " +
    "esa eso ellas nosotros vosotros mismo yo tu tú te ti tu mi mí es soy eres somos son fue fueron " +
    "ser estar tener hacer mas más muy poco mucho tan tanto cada algo alguien nada nadie algún alguna " +
    "algunos algunas cual cuales cuyo cuya cuyos cuyas etc"
  ).split(/\s+/)
);

/**
 * Endpoint principal de analítica: lee toda la hoja "Interviews" y devuelve
 * un JSON ya listo para pintar el dashboard (apps/analytics-dashboard).
 */
function getAnalytics() {
  const sheet = getOrCreateSheet(SHEET_NAME);
  const rows = sheetToObjects_(sheet);
  return computeAnalytics_(rows);
}

/**
 * Convierte una hoja (fila 1 = headers) en un arreglo de objetos header->valor.
 */
function sheetToObjects_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0];
  return values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      if (header) obj[header] = row[i];
    });
    return obj;
  });
}

function computeAnalytics_(rows) {
  const interviews = rows.map((row) => analyzeInterviewRow_(row));

  // c8 ("demasiado buena para ser verdad") resta puntos a la hipótesis
  // señalada, en vez de sumar como las demás preguntas comparativas.
  const negativeCounts = { tarjeta_1: 0, tarjeta_2: 0, tarjeta_3: 0 };
  rows.forEach((row) => {
    const choice = row["C_" + NEGATIVE_QUESTION_ID + "_eleccion"];
    if (negativeCounts.hasOwnProperty(choice)) negativeCounts[choice] += 1;
  });

  const hypotheses = {};
  HYPOTHESIS_IDS.forEach((hid) => {
    const scores = interviews.map((iv) => iv.counts[hid] / POSITIVE_COMPARATIVE_COUNT);
    const validCount = scores.filter((s) => s >= VALID_SCORE_THRESHOLD).length;
    const positivePoints = interviews.reduce((sum, iv) => sum + iv.counts[hid], 0);
    hypotheses[hid] = {
      label: HYPOTHESES[hid].label,
      totalPoints: positivePoints - negativeCounts[hid],
      meanScore: mean_(scores),
      stdDev: stdDev_(scores),
      pctValid: interviews.length ? (validCount / interviews.length) * 100 : 0,
    };
  });

  const ranking = HYPOTHESIS_IDS.slice().sort((a, b) => {
    if (hypotheses[b].pctValid !== hypotheses[a].pctValid) {
      return hypotheses[b].pctValid - hypotheses[a].pctValid;
    }
    return hypotheses[b].meanScore - hypotheses[a].meanScore;
  });

  const perQuestion = COMPARATIVE_QUESTIONS.map((q) => {
    const counts = { tarjeta_1: 0, tarjeta_2: 0, tarjeta_3: 0 };
    rows.forEach((row) => {
      const choice = row["C_" + q.id + "_eleccion"];
      if (counts.hasOwnProperty(choice)) counts[choice] += 1;
    });
    return { id: q.id, question: q.question, counts };
  });

  // El wordcloud sigue agrupando por la hipótesis ganadora "clásica" (las 9
  // preguntas, c8 incluida como positiva) — a diferencia del score de arriba,
  // aquí se mantiene el criterio anterior a propósito.
  const legacyWinners = rows.map((row) => legacyWinnerForRow_(row));
  const wordcloud = buildWordcloud_(rows, legacyWinners);

  return {
    generatedAt: new Date().toISOString(),
    numInterviews: interviews.length,
    interviews,
    hypotheses,
    maxPossiblePoints: POSITIVE_COMPARATIVE_COUNT * interviews.length,
    ranking,
    perQuestion,
    wordcloud,
  };
}

/**
 * Calcula, para UNA fila de la hoja, cuántas veces ganó cada hipótesis, el
 * score de cada una y cuál fue la ganadora (empate -> tarjeta con # menor).
 * Ignora por completo c8 (no suma ni resta): mide únicamente las 8 preguntas
 * comparativas positivas.
 */
function analyzeInterviewRow_(row) {
  const counts = { tarjeta_1: 0, tarjeta_2: 0, tarjeta_3: 0 };
  POSITIVE_QUESTION_IDS.forEach((qid) => {
    const choice = row["C_" + qid + "_eleccion"];
    if (counts.hasOwnProperty(choice)) counts[choice] += 1;
  });

  let winner = HYPOTHESIS_IDS[0];
  HYPOTHESIS_IDS.forEach((hid) => {
    if (counts[hid] > counts[winner]) winner = hid;
  });

  return {
    interviewId: row["InterviewID"] || "",
    entrevistador: row["Entrevistador"] || "",
    ciudad: row["Ciudad"] || "",
    fecha: row["FechaInicio"] || "",
    counts,
    winner,
    score: counts[winner] / POSITIVE_COMPARATIVE_COUNT,
  };
}

/**
 * Ganadora "clásica" de una fila: las 9 preguntas comparativas, contando c8
 * como positiva igual que las demás. Se usa solo para agrupar el wordcloud.
 */
function legacyWinnerForRow_(row) {
  const counts = { tarjeta_1: 0, tarjeta_2: 0, tarjeta_3: 0 };
  COMPARATIVE_QUESTIONS.forEach((q) => {
    const choice = row["C_" + q.id + "_eleccion"];
    if (counts.hasOwnProperty(choice)) counts[choice] += 1;
  });
  let winner = HYPOTHESIS_IDS[0];
  HYPOTHESIS_IDS.forEach((hid) => {
    if (counts[hid] > counts[winner]) winner = hid;
  });
  return winner;
}

/**
 * Agrupa las filas por hipótesis ganadora (recibida en `winners`, paralelo a
 * `rows`) y cuenta frecuencia de términos en la columna manual "key_terms"
 * (separados por coma/salto de línea), sin stopwords. Si la columna no existe
 * todavía, devuelve listas vacías.
 */
function buildWordcloud_(rows, winners) {
  const wordcloud = {};
  HYPOTHESIS_IDS.forEach((hid) => (wordcloud[hid] = {}));

  rows.forEach((row, i) => {
    const raw = row["key_terms"];
    if (!raw) return;
    const winner = winners[i];
    tokenizeKeyTerms_(raw).forEach((term) => {
      wordcloud[winner][term] = (wordcloud[winner][term] || 0) + 1;
    });
  });

  const result = {};
  HYPOTHESIS_IDS.forEach((hid) => {
    result[hid] = Object.keys(wordcloud[hid])
      .map((term) => ({ term, count: wordcloud[hid][term] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40);
  });
  return result;
}

function tokenizeKeyTerms_(raw) {
  return String(raw)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos
    .split(/[,;\n]+/)
    .map((t) => t.replace(/[^a-z0-9\s-]/g, "").trim())
    .filter((t) => t.length > 1 && !STOPWORDS_ES.has(t));
}

function mean_(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stdDev_(values) {
  if (!values.length) return 0;
  const m = mean_(values);
  const variance = mean_(values.map((v) => (v - m) * (v - m)));
  return Math.sqrt(variance);
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
