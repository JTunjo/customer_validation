// Maneja el estado de la entrevista en curso y su persistencia en localStorage.
// Esto permite recuperar la entrevista si el navegador se cierra a mitad de camino.

const STORAGE_KEY = "vg_interview_draft_v1";

function uid() {
  return "vg_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function todayISO() {
  return new Date().toISOString();
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("No se pudo leer el borrador guardado:", e);
    return null;
  }
}

export function saveDraft(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("No se pudo guardar el borrador:", e);
  }
}

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}

export function createNewDraft(meta) {
  const state = {
    localId: uid(),
    interviewId: null, // lo asigna el backend en /interview/start
    meta: {
      entrevistador: meta.entrevistador || "",
      ciudad: meta.ciudad || "",
      edad: meta.edad || "",
      profesion: meta.profesion || "",
      fecha: todayISO(),
    },
    answers: {}, // { [questionId]: string }
    cardChoices: {}, // { [comparativeId]: { choice: string, reason: string } }
    currentIndex: 0,
    startedAt: todayISO(),
    finishedAt: null,
  };
  saveDraft(state);
  return state;
}

export function setAnswer(state, questionId, value) {
  state.answers[questionId] = value;
  saveDraft(state);
  return state;
}

export function setCardChoice(state, comparativeId, choice, reason) {
  state.cardChoices[comparativeId] = { choice, reason };
  saveDraft(state);
  return state;
}

export function goTo(state, index) {
  state.currentIndex = index;
  saveDraft(state);
  return state;
}
