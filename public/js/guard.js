import { apiFetch } from "./api.js";

// Protege as páginas do dashboard: se não houver token, ou se o token
// for inválido/expirado, redireciona de imediato para o login.
// Devolve os dados do utilizador quando a validação é bem-sucedida.
export async function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return null;
  }

  try {
    const user = await apiFetch("/users/profile");
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (err) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
    return null;
  }
}
