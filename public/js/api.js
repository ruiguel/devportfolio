const API_URL = "/api";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Ocorreu um erro na requisição.");
    return data;
  } catch (error) {
    console.error("Erro na API:", error.message);
    throw error;
  }
}