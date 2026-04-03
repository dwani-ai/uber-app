/**
 * UberApp catalog build: dwani-ai/talk upstream omits this module; Vite resolves
 * ../lib/authClient from src/contexts/AuthContext.jsx → src/lib/authClient.js
 */
const BASE = "/v1/auth";

async function jsonRequest(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body && body.detail) message = body.detail;
    } catch (_) {}
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

export function getCurrentUser() {
  return jsonRequest("/me", { method: "GET" });
}

export function signup(payload) {
  return jsonRequest("/signup", { method: "POST", body: JSON.stringify(payload) });
}

export function login(payload) {
  return jsonRequest("/login", { method: "POST", body: JSON.stringify(payload) });
}

export function logout() {
  return jsonRequest("/logout", { method: "POST" });
}
