const API_BASE = "https://weircheve.pythonanywhere.com/dispatch";

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

  return res.json();
}