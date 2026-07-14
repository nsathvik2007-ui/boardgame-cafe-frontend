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

export function getAvailableGames({ apiKey, apiSecret }) {
  return apiCall(
    "/api/method/boardgame_cafe.api.get_available_games",
    "GET",
    null,
    apiKey,
    apiSecret
  );
}

export function checkoutGame({ customerSession, gameCopy, apiKey, apiSecret }) {
  return apiCall(
    "/api/method/boardgame_cafe.api.checkout_game",
    "POST",
    { customer_session: customerSession, game_copy: gameCopy },
    apiKey,
    apiSecret
  );
}

export function getFirstAvailableCopy({ gameTitle, apiKey, apiSecret }) {
  return apiCall(
    `/api/method/boardgame_cafe.api.get_first_available_copy?game_title=${encodeURIComponent(gameTitle)}`,
    "GET",
    null,
    apiKey,
    apiSecret
  );
}

export function createPaymentOrder({ customerSession, apiKey, apiSecret }) {
  return apiCall(
    "/api/method/boardgame_cafe.api.create_payment_order",
    "POST",
    { customer_session: customerSession },
    apiKey,
    apiSecret
  );
}

export function verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature, apiKey, apiSecret }) {
  return apiCall(
    "/api/method/boardgame_cafe.api.verify_payment",
    "POST",
    {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    },
    apiKey,
    apiSecret
  );
}

export function openRazorpayCheckout({ orderData, customerName, customerEmail, onSuccess, onFailure }) {
  const options = {
    key: orderData.message.key_id,
    amount: orderData.message.amount,
    currency: "INR",
    name: "BoardGame Café",
    description: "Table bill payment",
    order_id: orderData.message.razorpay_order_id,
    prefill: {
      name: customerName,
      email: customerEmail,
    },
    theme: {
      color: "#D64550",
    },
    handler: function (response) {
      onSuccess({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: function () {
        onFailure("Payment cancelled.");
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}

export function getSession({ sessionId, apiKey, apiSecret }) {
  return apiCall(
    `/api/resource/Customer Session/${sessionId}`,
    "GET",
    null,
    apiKey,
    apiSecret
  );
}



export function placeFoodOrder({ customerSession, items, apiKey, apiSecret }) {
  return apiCall(
    "/api/method/boardgame_cafe.api.place_food_order",
    "POST",
    { customer_session: customerSession, items },
    apiKey,
    apiSecret
  );
}

export function getMenuItems({ apiKey, apiSecret }) {
  const fields = encodeURIComponent(JSON.stringify(["name", "item_name", "category", "price", "is_available"]));
  const filters = encodeURIComponent(JSON.stringify([["is_available", "=", 1]]));
  return apiCall(
    `/api/resource/Menu Item?fields=${fields}&filters=${filters}`,
    "GET",
    null,
    apiKey,
    apiSecret
  );
}