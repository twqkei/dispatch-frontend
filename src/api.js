const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000/dispatch"
    : "https://weircheve.pythonanywhere.com/dispatch";

export async function apiFetch(path, options = {}, { auth = true } = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (auth) {
    const access = localStorage.getItem("access");
    if (access) {
      headers.Authorization = `Bearer ${access}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (auth && res.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    throw new Error("Unauthorized");
  }

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(data?.detail || `Request failed: ${res.status}`);
  }

  return data;
}