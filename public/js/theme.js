// Aplica o tema guardado (persistência via localStorage) em TODAS as
// páginas, independentemente de terem ou não o botão de alternância.
export function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
  }

  const themeToggleBtn = document.getElementById("theme-toggle");
  if (!themeToggleBtn) return;

  themeToggleBtn.textContent = document.body.classList.contains("light") ? "Modo Escuro" : "Modo Claro";

  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    themeToggleBtn.textContent = isLight ? "Modo Escuro" : "Modo Claro";
  });
}
