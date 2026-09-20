import { apiFetch } from "./api.js";

export function initAuth() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const feedback = document.getElementById("form-feedback");

  // Se já estiver autenticado, não faz sentido ver o login/registo outra vez.
  if ((loginForm || registerForm) && isLoggedIn()) {
    window.location.href = "/dashboard/index.html";
    return;
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (feedback) feedback.textContent = "";
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const data = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/dashboard/index.html";
      } catch (err) {
        if (feedback) feedback.textContent = err.message;
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (feedback) feedback.textContent = "";
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });

        alert("Registo efetuado com sucesso! Faça login.");
        window.location.href = "/login.html";
      } catch (err) {
        if (feedback) feedback.textContent = err.message;
      }
    });
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

// Atualiza o link "Login" da navegação pública para "Dashboard" / "Sair"
// quando o utilizador já está autenticado.
export function updateAuthNav() {
  const navItem = document.getElementById("nav-auth");
  if (!navItem) return;

  if (isLoggedIn()) {
    navItem.innerHTML = `
      <a href="/dashboard/index.html" class="nav-btn">Dashboard</a>
      <a href="#" id="nav-logout" class="nav-btn">Sair</a>
    `;
    const logoutBtn = document.getElementById("nav-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    }
  } else {
    navItem.innerHTML = `<a href="/login.html" class="nav-btn">Login</a>`;
  }
}
