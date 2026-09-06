const AUTH_BASE = "/api/auth";
const MEMBERS_BASE = "/api/members";

export function getCsrfToken() {
  const match = document.cookie.match(/(?:^|; )csrftoken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

async function request(path, { method = "GET", body, csrf = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (csrf) {
    headers["X-CSRFToken"] = getCsrfToken();
  }
  const response = await fetch(path, {
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
  return request(`${AUTH_BASE}/login/`, { method: "POST", body: { username, password } });
}

export function me() {
  return request(`${AUTH_BASE}/me/`);
}

export function logout() {
  return request(`${AUTH_BASE}/logout/`, { method: "POST", csrf: true });
}

export function createUser(username, password) {
  return request(`${AUTH_BASE}/users/`, { method: "POST", body: { username, password }, csrf: true });
}

export function listMembers({ search = "", status = "active", page = 1 } = {}) {
  const params = new URLSearchParams();
  const trimmed = search.trim();
  if (trimmed) {
    params.set("search", trimmed);
  }
  if (status) {
    params.set("status", status);
  }
  if (page && page > 1) {
    params.set("page", String(page));
  }
  const query = params.toString();
  return request(query ? `${MEMBERS_BASE}/?${query}` : `${MEMBERS_BASE}/`);
}

export function getMember(id) {
  return request(`${MEMBERS_BASE}/${id}/`);
}

export function createMember(data) {
  return request(`${MEMBERS_BASE}/`, { method: "POST", body: data, csrf: true });
}

export function updateMember(id, data, { partial = false } = {}) {
  return request(`${MEMBERS_BASE}/${id}/`, {
    method: partial ? "PATCH" : "PUT",
    body: data,
    csrf: true,
  });
}

export function deactivateMember(id) {
  return request(`${MEMBERS_BASE}/${id}/deactivate/`, { method: "POST", csrf: true });
}
