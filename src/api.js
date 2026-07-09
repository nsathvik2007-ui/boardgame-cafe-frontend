// api.js — reusable API helper for the Board Game Café app.
// Token-based auth (NO cookies). Handles Frappe-style error extraction.

const BASE_URL = "http://cafe.local:8000";

function extractErrorMessage(data, fallback = "Something went wrong") {
  if (!data) return fallback;

  if (data._server_messages) {
    try {
      const arr = JSON.parse(data._server_messages);
      if (Array.isArray(arr) && arr.length) {
        const first = typeof arr[0] === "string" ? JSON.parse(arr[0]) : arr[0];
        if (first && first.message) return first.message;
      }
    } catch (_) {}
  }

  if (typeof data.message === "string") return data.message;
  if (data.message && typeof data.message.message === "string") return data.message.message;
  if (data.exception) return data.exception;
  return fallback;
}

export async function apiCall(endpoint, method = "GET", body = null, apiKey, apiSecret) {
  const headers = { "Content-Type": "application/json" };
  if (apiKey && apiSecret) headers["Authorization"] = `token ${apiKey}:${apiSecret}`;

  const options = { method, headers }; // no credentials: 'include' — token-based
  if (body && method !== "GET") options.body = JSON.stringify(body);

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  let res;
  try {
    res = await fetch(url, options);
  } catch (_) {
    throw new Error("Network error — please check your connection and try again.");
  }

  let data = null;
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) throw new Error(extractErrorMessage(data, `Request failed (${res.status})`));
  return data;
}

export function signup({ email, full_name, password }) {
  return apiCall(
    "/api/method/boardgame_cafe.api.customer_signup",
    "POST",
    { email, full_name, password }
  );
}

export function login({ email, password }) {
  return apiCall(
    "/api/method/boardgame_cafe.api.customer_login",
    "POST",
    { email, password }
  );
}

export function getStoredAuth() {
  return {
    apiKey: localStorage.getItem("api_key"),
    apiSecret: localStorage.getItem("api_secret"),
  };
}

export function storeAuth(apiKey, apiSecret) {
  localStorage.setItem("api_key", apiKey);
  localStorage.setItem("api_secret", apiSecret);
}

export function clearAuth() {
  localStorage.removeItem("api_key");
  localStorage.removeItem("api_secret");
}

export function checkin({ table, apiKey, apiSecret }) {
  return apiCall(
    "/api/method/boardgame_cafe.api.checkin",
    "POST",
    { table },
    apiKey,
    apiSecret
  );
}