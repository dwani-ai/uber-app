/**
 * UberApp catalog build: dwani-ai/talk upstream omits this module.
 * Session id aligns with ChessView/WarehouseView (talk_session_id).
 */
const SESSION_KEY = "talk_session_id";
const CONVERSATIONS_KEY = "talk_conversations";

export function createSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateSessionId() {
  if (typeof sessionStorage === "undefined") return createSessionId();
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = createSessionId();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function setSessionId(id) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, id);
}

export function loadConversations() {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveConversations(list) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota */
  }
}
