export const API_URL = "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("railflow_token");
}

export function setToken(token) {
  localStorage.setItem("railflow_token", token);
}

export function clearToken() {
  localStorage.removeItem("railflow_token");
}

export async function api(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.detail || "Ошибка запроса к серверу");
  }

  return data;
}
