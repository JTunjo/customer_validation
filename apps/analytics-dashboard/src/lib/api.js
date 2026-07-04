import { API_URL } from "./config.js";

export async function fetchAnalytics() {
  const res = await fetch(`${API_URL}?action=analytics`);
  if (!res.ok) {
    throw new Error(`Error de red (${res.status}) al pedir la analítica`);
  }
  return res.json();
}
