const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000/dispatch"
    : "https://weircheve.pythonanywhere.com/dispatch";

export async function apiFetch(path, options = {}) {
  const access = localStorage.getItem("access");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.status !== 204 ? res.json() : null;
}