import { API_URL } from "./config.js";

export async function fetchAnalytics(method) {
  const query = method ? `&method=${encodeURIComponent(method)}` : "";
  const res = await fetch(`${API_URL}?action=analytics${query}`);
  if (!res.ok) {
    throw new Error(`Error de red (${res.status}) al pedir la analítica`);
  }
  return res.json();
}
