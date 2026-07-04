import { API_URL } from "./config.js";

// Apps Script no maneja bien el preflight de CORS (OPTIONS) en despliegues simples,
// así que enviamos el body como texto plano (text/plain) para que el navegador
// NO dispare un preflight, y del lado del servidor parseamos JSON manualmente.
async function post(action, payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });

  if (!res.ok) {
    throw new Error(`Error de red (${res.status}) al llamar a "${action}"`);
  }

  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.error || `El backend devolvió un error en "${action}"`);
  }
  return data;
}

export async function startInterview(meta) {
  const data = await post("start", { meta });
  return data.interviewId;
}

export async function saveInterview(state) {
  return post("save", { interview: state });
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_URL}?action=health`);
    const text = await res.text();
    return text.trim() === "OK";
  } catch (e) {
    return false;
  }
}
