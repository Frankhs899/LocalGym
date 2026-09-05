const API_BASE = "/api/auth";

export function getCsrfToken() {
  const match = document.cookie.match(/(?:^|; )csrftoken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

async function request(path, { method = "GET", body, csrf = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (csrf) {
    headers["X-CSRFToken"] = getCsrfToken();
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const error = new Error(data?.detail ?? `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export function login(username, password) {
  return request("/login/", { method: "POST", body: { username, password } });
}

export function me() {
  return request("/me/");
}

export function logout() {
  return request("/logout/", { method: "POST", csrf: true });
}

export function createUser(username, password) {
  return request("/users/", { method: "POST", body: { username, password }, csrf: true });
}
