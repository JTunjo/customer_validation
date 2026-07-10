import "./style.css";
import { fetchAnalytics } from "./lib/api.js";

const app = document.getElementById("app");

const HYPOTHESIS_IDS = ["tarjeta_1", "tarjeta_2", "tarjeta_3"];

// Filtro global por la columna manual "method" (ej. Presencial/Virtual).
// Afecta a toda la analítica porque se le pasa al backend, que recalcula
// todo (hipótesis, ranking, matriz, wordcloud) solo con las filas filtradas.
let currentMethod = "";

function esc(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function pct(fraction) {
  return `${Math.round(fraction * 100)}%`;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

async function load() {
  renderShell(`<p class="hint">Cargando analítica…</p>`);
  try {
    const data = await fetchAnalytics(currentMethod);
    render(data);
  } catch (err) {
    renderShell(`<p class="empty">No se pudo cargar la analítica: ${esc(err.message)}</p>`);
  }
}

function renderShell(bodyHTML) {
  app.innerHTML = `
    <div class="wrap">
      <div class="header">
        <div>
          <h1 class="title">Analítica · Velvet Greens</h1>
          <p class="subtitle">Customer Discovery — validación de hipótesis</p>
        </div>
        <button type="button" id="refresh-btn" class="btn">Actualizar</button>
      </div>
      ${bodyHTML}
    </div>
  `;
  document.getElementById("refresh-btn")?.addEventListener("click", load);
  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentMethod = btn.dataset.method || "";
      load();
    });
  });
}

function render(data) {
  const sections = [
    renderInterviewsSection(data),
    renderGlobalResultsSection(data),
    renderRankingSection(data),
    renderPerQuestionSection(data),
    renderWordcloudSection(data),
  ].join("");

  const countLabel = data.selectedMethod
    ? `${data.numInterviews} de ${data.numInterviewsUnfiltered} entrevista${
        data.numInterviewsUnfiltered === 1 ? "" : "s"
      } · filtrado por "${esc(data.selectedMethod)}"`
    : `${data.numInterviews} entrevista${data.numInterviews === 1 ? "" : "s"} registrada${
        data.numInterviews === 1 ? "" : "s"
      }`;

  renderShell(`
    ${renderFilterBar(data)}
    <p class="subtitle">${countLabel} · actualizado ${formatDate(data.generatedAt)}</p>
    ${sections}
  `);
}

// ---------------------------------------------------------------------------
// Filtro global por método (columna manual "method" en Interviews)
// ---------------------------------------------------------------------------
function renderFilterBar(data) {
  if (!data.availableMethods || !data.availableMethods.length) return "";

  const pills = [{ value: "", label: `Todos (${data.numInterviewsUnfiltered})` }, ...data.availableMethods.map((m) => ({ value: m, label: m }))];

  const buttons = pills
    .map(
      (p) => `
      <button type="button" class="filter-pill ${data.selectedMethod === p.value ? "is-active" : ""}" data-method="${esc(
        p.value
      )}">${esc(p.label)}</button>`
    )
    .join("");

  return `<div class="filter-bar">${buttons}</div>`;
}

// ---------------------------------------------------------------------------
// 1. Hipótesis por encuesta
// ---------------------------------------------------------------------------
function renderInterviewsSection(data) {
  const rows = [...data.interviews].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const body = rows.length
    ? `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Entrevista</th>
            <th>Fecha</th>
            <th>Hipótesis ganadora</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (iv) => `
            <tr>
              <td>${esc(iv.entrevistador)} · ${esc(iv.ciudad)}</td>
              <td>${formatDate(iv.fecha)}</td>
              <td><span class="badge">${esc(data.hypotheses[iv.winner]?.label || iv.winner)}</span></td>
              <td>${pct(iv.score)}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`
    : `<p class="empty">Todavía no hay entrevistas guardadas.</p>`;

  return section(
    "Hipótesis por encuesta",
    'Hipótesis ganadora y score (veces elegida / 8 preguntas comparativas positivas) de cada entrevista. No cuenta la pregunta "¿demasiado buena para ser verdad?" (c8), que mide desconfianza, no preferencia.',
    body
  );
}

// ---------------------------------------------------------------------------
// 2. Resultados globales
// ---------------------------------------------------------------------------
function renderGlobalResultsSection(data) {
  const cards = HYPOTHESIS_IDS.map((hid) => {
    const h = data.hypotheses[hid];
    const rawWidth = data.maxPossiblePoints > 0 ? (h.totalPoints / data.maxPossiblePoints) * 100 : 0;
    const width = Math.min(100, Math.max(0, rawWidth));
    return `
      <div class="card hypo-card">
        <h3>${esc(h.label)}</h3>
        <p class="points">${h.totalPoints} <small>puntos</small></p>
        <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
      </div>`;
  }).join("");

  return section(
    "Resultados globales",
    `Suma de veces elegida cada hipótesis en las 8 preguntas comparativas positivas, menos las veces que fue señalada como "demasiado buena para ser verdad" (pregunta c8). Máximo teórico: ${data.maxPossiblePoints} puntos (8 × número de encuestas, si nadie marca ninguna tarjeta en esa pregunta).`,
    `<div class="hypo-grid">${cards}</div>`
  );
}

// ---------------------------------------------------------------------------
// 3. Ranking de hipótesis (con medida de variación)
// ---------------------------------------------------------------------------
function renderRankingSection(data) {
  const rows = data.ranking
    .map((hid, i) => {
      const h = data.hypotheses[hid];
      return `
        <tr>
          <td>${i === 0 ? '<span class="badge badge-rank1">#1</span>' : `#${i + 1}`}</td>
          <td>${esc(h.label)}</td>
          <td>${pct(h.meanScore)}</td>
          <td>${pct(h.stdDev)}</td>
          <td>${h.pctValid.toFixed(0)}%</td>
        </tr>`;
    })
    .join("");

  const body = `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Hipótesis</th>
            <th>Score promedio</th>
            <th>Desv. estándar</th>
            <th>% encuestas válidas (≥65%)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  return section(
    "Ranking de hipótesis",
    'Ordenado por % de encuestas donde la hipótesis alcanzó al menos 65% de score (sobre las 8 preguntas positivas, sin contar c8); en empate, por score promedio.',
    body
  );
}

// ---------------------------------------------------------------------------
// 4. Resultados por pregunta (matriz)
// ---------------------------------------------------------------------------
function renderPerQuestionSection(data) {
  const header = HYPOTHESIS_IDS.map((hid) => `<th>${esc(data.hypotheses[hid].label)}</th>`).join("");

  const rows = data.perQuestion
    .map((q) => {
      const values = HYPOTHESIS_IDS.map((hid) => q.counts[hid] || 0);
      const max = Math.max(...values, 1);
      const cells = HYPOTHESIS_IDS.map((hid) => {
        const value = q.counts[hid] || 0;
        const intensity = value / max;
        const bg = `rgba(23, 23, 21, ${intensity.toFixed(2)})`;
        return `<td class="matrix-cell" data-intensity="${value === 0 ? 0 : 1}" style="background:${bg}">${value}</td>`;
      }).join("");
      return `<tr><td>${esc(q.question)}</td>${cells}</tr>`;
    })
    .join("");

  const body = `
    <div class="table-scroll">
      <table>
        <thead><tr><th>Pregunta</th>${header}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  return section(
    "Resultados por pregunta",
    "Veces elegida cada hipótesis en cada una de las 9 preguntas comparativas. El color resalta cuál domina esa pregunta.",
    body
  );
}

// ---------------------------------------------------------------------------
// 5. Wordcloud por hipótesis ganadora
// ---------------------------------------------------------------------------
function renderWordcloudSection(data) {
  const columns = HYPOTHESIS_IDS.map((hid) => {
    const h = data.hypotheses[hid];
    const terms = data.wordcloud[hid] || [];
    const maxCount = Math.max(...terms.map((t) => t.count), 1);

    const termsHTML = terms.length
      ? `<div class="wordcloud-terms">
          ${terms
            .map((t) => {
              const ratio = t.count / maxCount; // 0 (menos frecuente) .. 1 (más frecuente)
              const size = 0.8 + ratio * 1.7; // rem
              const color = wordcloudColor(ratio);
              const weight = Math.round(500 + ratio * 300);
              return `<span class="wordcloud-term" style="font-size:${size.toFixed(2)}rem;color:${color};font-weight:${weight}">${esc(
                t.term
              )}</span>`;
            })
            .join("")}
        </div>`
      : `<p class="empty">Sin datos todavía. Agrega la columna <code>key_terms</code> en la hoja "Interviews" (términos separados por comas) para ver esto.</p>`;

    return `<div class="wordcloud-col"><h3>${esc(h.label)}</h3>${termsHTML}</div>`;
  }).join("");

  return section(
    "Sesión abierta — Wordcloud por hipótesis ganadora",
    "Términos más frecuentes (columna manual key_terms) entre las entrevistas donde ganó cada hipótesis, sin stopwords.",
    `<div class="wordcloud-grid">${columns}</div>`
  );
}

// Interpola entre un gris claro (términos poco frecuentes, discretos) y el
// color de texto principal casi negro (términos muy frecuentes, que deben
// resaltar de inmediato), para reforzar la jerarquía visual del wordcloud.
function wordcloudColor(ratio) {
  const light = [180, 178, 172]; // gris claro
  const dark = [23, 23, 21]; // --text
  const rgb = light.map((c, i) => Math.round(c + (dark[i] - c) * ratio));
  return `rgb(${rgb.join(",")})`;
}

// ---------------------------------------------------------------------------
function section(title, hint, bodyHTML) {
  return `
    <div class="section">
      <h2>${esc(title)}</h2>
      <p class="hint">${esc(hint)}</p>
      <div class="card">${bodyHTML}</div>
    </div>`;
}

load();
