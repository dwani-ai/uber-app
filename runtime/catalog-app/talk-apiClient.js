/**
 * UberApp catalog build: dwani-ai/talk upstream omits this module.
 * Matches talk-server POST /v1/chat and /v1/speech_to_speech (format=json).
 */
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function authHeaders(apiKey) {
  if (!apiKey) return {};
  return { Authorization: `Bearer ${apiKey}` };
}

async function errorFromResponse(res) {
  let message = `${res.status} ${res.statusText}`;
  try {
    const body = await res.json();
    const d = body?.detail;
    if (d != null) {
      message = typeof d === "string" ? d : JSON.stringify(d);
    }
  } catch (_) {}
  return new Error(message);
}

export async function sendChatRequest({ text, mode, agentName, sessionId, apiKey }) {
  const body = { text, mode };
  if (mode === "agent" && agentName) {
    body.agent_name = agentName;
  }
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(apiKey),
  };
  if (sessionId) {
    headers["X-Session-ID"] = sessionId;
  }
  const res = await fetch(`${API_BASE}/v1/chat`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await errorFromResponse(res);
  return res.json();
}

export async function sendSpeechRequest({ blob, language, mode, agentName, sessionId, apiKey }) {
  const form = new FormData();
  form.append("file", blob, "recording.wav");
  const params = new URLSearchParams({
    language,
    mode,
    format: "json",
  });
  if (mode === "agent" && agentName) {
    params.set("agent_name", agentName);
  }
  const headers = { ...authHeaders(apiKey) };
  if (sessionId) {
    headers["X-Session-ID"] = sessionId;
  }
  const res = await fetch(`${API_BASE}/v1/speech_to_speech?${params.toString()}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: form,
  });
  if (!res.ok) throw await errorFromResponse(res);
  return res.json();
}
