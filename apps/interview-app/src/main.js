import "./style.css";
import { QUESTION_STEPS, CARD_INTRO, CARDS, COMPARATIVE_STEPS, CARD_OPTIONS } from "./data/flow.js";
import { loadDraft, createNewDraft, saveDraft, clearDraft, setAnswer, setCardChoice, goTo } from "./lib/store.js";
import { startInterview, saveInterview } from "./lib/api.js";

const app = document.getElementById("app");

// Construimos la secuencia completa de pantallas de la entrevista.
const STEPS = [
  ...QUESTION_STEPS,
  CARD_INTRO,
  ...CARDS.map((c) => ({ id: c.id, type: "card", card: c })),
  ...COMPARATIVE_STEPS,
];
const TOTAL_STEPS = STEPS.length;

let state = loadDraft();
let timerInterval = null;

function esc(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// Enrutamiento principal
// ---------------------------------------------------------------------------
function render() {
  stopTimer();
  if (!state || state.finishedAt) {
    renderSetup();
    return;
  }
  if (state.currentIndex >= TOTAL_STEPS) {
    renderReview();
    return;
  }
  renderStep();
}

function renderShell(innerHTML, { showProgress = false, showTimer = false } = {}) {
  app.innerHTML = `
    <div class="screen">
      ${showProgress ? progressBarHTML() : ""}
      ${showTimer ? `<div class="timer" id="timer">00:00</div>` : ""}
      <div class="screen-content">${innerHTML}</div>
    </div>
  `;
  if (showTimer) startTimer();
}

function progressBarHTML() {
  const current = Math.min(state.currentIndex + 1, TOTAL_STEPS);
  const pct = Math.round((current / TOTAL_STEPS) * 100);
  return `
    <div class="progress" aria-label="Progreso de la entrevista">
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-label">Pregunta ${current} de ${TOTAL_STEPS}</div>
    </div>
  `;
}

function startTimer() {
  const el = document.getElementById("timer");
  if (!el || !state?.startedAt) return;
  const started = new Date(state.startedAt).getTime();
  function tick() {
    const s = Math.max(0, Math.floor((Date.now() - started) / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    el.textContent = `${mm}:${ss}`;
  }
  tick();
  timerInterval = setInterval(tick, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

// ---------------------------------------------------------------------------
// Pantalla 1 — Nueva entrevista
// ---------------------------------------------------------------------------
function renderSetup() {
  renderShell(`
    <h1 class="title">Nueva entrevista</h1>
    <p class="subtitle">Velvet Greens · Customer Discovery</p>

    <form id="setup-form" class="form">
      <label class="field">
        <span>Nombre</span>
        <input type="text" name="entrevistador" required autocomplete="off" />
      </label>
      <label class="field">
        <span>Ciudad</span>
        <input type="text" name="ciudad" required autocomplete="off" />
      </label>
      <label class="field">
        <span>Edad (del entrevistado)</span>
        <input type="number" name="edad" min="10" max="110" required inputmode="numeric" />
      </label>
      <label class="field">
        <span>Profesión</span>
        <input type="text" name="profesion" required autocomplete="off" />
      </label>
      <button type="submit" class="btn btn-primary btn-block">Comenzar</button>
    </form>
  `);

  document.getElementById("setup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const meta = {
      entrevistador: fd.get("entrevistador").trim(),
      ciudad: fd.get("ciudad").trim(),
      edad: fd.get("edad").trim(),
      profesion: fd.get("profesion").trim(),
    };
    state = createNewDraft(meta);
    render();

    // Intentamos reservar un ID de entrevista en el backend en segundo plano.
    // Si falla, seguimos igual: el ID se puede generar/confirmar al guardar.
    startInterview(meta)
      .then((id) => {
        state.interviewId = id;
        saveDraft(state);
      })
      .catch(() => {
        /* silencioso: no bloquea la entrevista si no hay red */
      });
  });
}

// ---------------------------------------------------------------------------
// Pantalla 2 y 3 — Pregunta abierta / Tarjeta
// Pantalla 4 — Pregunta comparativa
// ---------------------------------------------------------------------------
function renderStep() {
  const step = STEPS[state.currentIndex];
  const isLast = state.currentIndex === TOTAL_STEPS - 1;

  if (step.type === "question") return renderQuestionStep(step);
  if (step.type === "intro") return renderIntroStep(step);
  if (step.type === "card") return renderCardStep(step);
  if (step.type === "choice" || step.type === "choice_with_none") return renderComparativeStep(step, isLast);
}

// ---------------------------------------------------------------------------
// Pantalla previa a las tarjetas — guion que el entrevistador lee en voz alta
// ---------------------------------------------------------------------------
function renderIntroStep(step) {
  renderShell(
    `
      <h2 class="question">${esc(step.title)}</h2>

      <div class="intro-text">
        ${step.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>

      <div class="actions actions-center">
        ${backButtonHTML()}
        <button type="button" id="next-btn" class="btn btn-primary btn-wide">Continuar</button>
      </div>
    `,
    { showProgress: true, showTimer: true }
  );
  document.getElementById("next-btn").addEventListener("click", () => advance());
  bindBackButton();
  bindEnterToAdvance(null);
}

function renderQuestionStep(step) {
  const saved = state.answers[step.id] || "";
  renderShell(
    `
      <div class="block-label">${esc(step.block)}</div>
      <h2 class="question">${esc(step.question)}</h2>
      ${step.hint ? `<p class="hint">${esc(step.hint)}</p>` : ""}
      ${step.note ? `<p class="note">${esc(step.note)}</p>` : ""}
      ${
        step.followups && step.followups.length
          ? `<ul class="followups">${step.followups.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`
          : ""
      }

      <textarea id="answer" class="answer-box" placeholder="Escribe aquí lo que dice el entrevistado…" autofocus>${esc(
        saved
      )}</textarea>

      <div class="actions">
        ${backButtonHTML()}
        <div class="kbd-hint">Enter para continuar · Shift+Enter para salto de línea</div>
        <button type="button" id="next-btn" class="btn btn-primary">Siguiente</button>
      </div>
    `,
    { showProgress: true, showTimer: true }
  );

  const textarea = document.getElementById("answer");
  textarea.focus();
  textarea.addEventListener("input", () => {
    setAnswer(state, step.id, textarea.value);
  });

  document.getElementById("next-btn").addEventListener("click", () => advance());
  bindBackButton();
  bindEnterToAdvance(textarea);
}

function renderCardStep(step) {
  const card = step.card;
  const cardIndexInSet = CARDS.findIndex((c) => c.id === card.id);
  renderShell(
    `
      <div class="block-label">${esc(card.label)}</div>
      <div class="card">
        <h2 class="card-title">${esc(card.title)}</h2>
        <p class="card-subtitle">${esc(card.subtitle)}</p>
        <p class="card-body">${esc(card.body).replace(/\n/g, "<br/>")}</p>
      </div>

      <div class="actions actions-center">
        ${backButtonHTML()}
        <button type="button" id="next-btn" class="btn btn-primary btn-wide">
          ${cardIndexInSet === CARDS.length - 1 ? "Continuar" : "Siguiente"}
        </button>
      </div>
    `,
    { showProgress: true, showTimer: true }
  );
  document.getElementById("next-btn").addEventListener("click", () => advance());
  bindBackButton();
  bindEnterToAdvance(null);
}

function renderComparativeStep(step, isLast) {
  const saved = state.cardChoices[step.id] || { choice: "", reason: "" };
  const options = [...CARD_OPTIONS];
  if (step.type === "choice_with_none") {
    options.push({ value: "ninguna", label: "Ninguna" });
  }

  renderShell(
    `
      <h2 class="question">${esc(step.question)}</h2>

      <div class="radio-group" role="radiogroup">
        ${options
          .map(
            (opt) => `
          <label class="radio-option ${saved.choice === opt.value ? "is-selected" : ""}">
            <input type="radio" name="choice" value="${esc(opt.value)}" ${
              saved.choice === opt.value ? "checked" : ""
            } />
            <span>${esc(opt.label)}</span>
          </label>`
          )
          .join("")}
      </div>

      <label class="field">
        <span>${esc(step.reasonLabel || "¿Por qué?")}</span>
        <textarea id="reason" class="answer-box answer-box-small" placeholder="Escribe la respuesta del entrevistado…">${esc(
          saved.reason
        )}</textarea>
      </label>

      <div class="actions">
        ${backButtonHTML()}
        <div class="kbd-hint">Enter para continuar · Shift+Enter para salto de línea</div>
        <button type="button" id="next-btn" class="btn btn-primary" disabled>
          ${isLast ? "Guardar entrevista" : "Siguiente"}
        </button>
      </div>
    `,
    { showProgress: true, showTimer: true }
  );

  bindBackButton();
  const nextBtn = document.getElementById("next-btn");
  const reasonBox = document.getElementById("reason");

  function persist() {
    const checked = document.querySelector('input[name="choice"]:checked');
    setCardChoice(state, step.id, checked ? checked.value : "", reasonBox.value);
    nextBtn.disabled = !checked;
  }

  document.querySelectorAll('input[name="choice"]').forEach((input) => {
    input.addEventListener("change", () => {
      document.querySelectorAll(".radio-option").forEach((l) => l.classList.remove("is-selected"));
      input.closest(".radio-option").classList.add("is-selected");
      persist();
    });
  });
  reasonBox.addEventListener("input", persist);
  persist();

  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    if (isLast) {
      finishAndSave();
    } else {
      advance();
    }
  });
  bindEnterToAdvance(reasonBox);
}

function bindEnterToAdvance(textareaEl) {
  function handler(e) {
    if (e.key !== "Enter" || e.shiftKey) return;
    if (textareaEl && document.activeElement === textareaEl) {
      // Enter simple avanza igual; Shift+Enter deja salto de línea (ver arriba).
      e.preventDefault();
    }
    const btn = document.getElementById("next-btn");
    if (btn && !btn.disabled) btn.click();
  }
  document.addEventListener("keydown", handler, { once: false });
  // Limpieza: se reemplaza en cada render porque el DOM se reconstruye,
  // pero evitamos fugas quitando el listener anterior.
  render._lastKeyHandler && document.removeEventListener("keydown", render._lastKeyHandler);
  render._lastKeyHandler = handler;
}

function advance() {
  goTo(state, state.currentIndex + 1);
  render();
}

// Botón "Atrás": corrige un "Siguiente" presionado sin querer, en cualquier
// pantalla (pregunta, tarjeta o comparativa). No se muestra en la primera
// pregunta porque antes de eso está la pantalla de inicio (datos del entrevistador).
function backButtonHTML() {
  if (state.currentIndex <= 0) return "";
  return `<button type="button" id="back-btn" class="btn btn-secondary">Atrás</button>`;
}

function bindBackButton() {
  document.getElementById("back-btn")?.addEventListener("click", () => goBack());
}

function goBack() {
  goTo(state, state.currentIndex - 1);
  render();
}

// ---------------------------------------------------------------------------
// Guardado final
// ---------------------------------------------------------------------------
function renderReview() {
  // No debería llegar aquí normalmente (el guardado ocurre en el último paso),
  // pero sirve como red de seguridad si se recarga justo en el límite.
  finishAndSave();
}

function finishAndSave() {
  renderShell(
    `
      <h1 class="title">Guardando…</h1>
      <p class="subtitle">Un momento, estamos registrando la entrevista.</p>
      <div class="spinner" aria-hidden="true"></div>
    `,
    { showProgress: false, showTimer: false }
  );

  state.finishedAt = new Date().toISOString();
  saveDraft(state);

  saveInterview(state)
    .then(() => {
      clearDraft();
      renderDone(true);
    })
    .catch((err) => {
      renderDone(false, err.message);
    });
}

function renderDone(success, errorMessage) {
  if (success) {
    app.innerHTML = `
      <div class="screen">
        <div class="screen-content center">
          <div class="check">✓</div>
          <h1 class="title">Entrevista registrada correctamente</h1>
          <button type="button" id="new-btn" class="btn btn-primary btn-wide">Nueva entrevista</button>
        </div>
      </div>
    `;
    document.getElementById("new-btn").addEventListener("click", () => {
      state = null;
      render();
    });
    return;
  }

  app.innerHTML = `
    <div class="screen">
      <div class="screen-content center">
        <h1 class="title">No se pudo guardar</h1>
        <p class="subtitle">${esc(errorMessage || "Revisa tu conexión e inténtalo de nuevo.")}</p>
        <p class="hint">Tus respuestas siguen guardadas en este dispositivo, no se ha perdido nada.</p>
        <button type="button" id="retry-btn" class="btn btn-primary btn-wide">Reintentar</button>
      </div>
    </div>
  `;
  document.getElementById("retry-btn").addEventListener("click", () => finishAndSave());
}

render();
