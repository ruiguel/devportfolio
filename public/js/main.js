import { initTheme } from "./theme.js";
import { initAuth, updateAuthNav } from "./auth.js";
import { loadPublicProjects } from "./projects.js";

initTheme();
initAuth();
updateAuthNav();

// ---------- Lista de projetos (index.html) ----------
async function carregarProjetosDoTurso() {
  const container = document.getElementById("projects-container");
  if (!container) return; // só corre na página que tem este elemento

  try {
    const response = await fetch("/api/projects");
    const projetos = await response.json();

    container.innerHTML = "";

    if (!projetos.length) {
      container.innerHTML = "<p>Nenhum projeto encontrado na base de dados.</p>";
      return;
    }

    projetos.forEach(projeto => {
      container.innerHTML += `
        <div class="project-card">
          <h3>${projeto.title}</h3>
          <p>${projeto.description}</p>
          ${projeto.techs ? `<div class="skills"><span>${projeto.techs.split(", ").join("</span><span>")}</span></div>` : ""}
          <button class="btn-secondary"><a href="portfolio.html?id=${projeto.id}">ver detalhe</a></button>
        </div>
      `;
    });
  } catch (error) {
    console.error("Erro ao carregar os projetos do Turso:", error);
    container.innerHTML = "<p>Erro ao carregar projetos. Confirma que o servidor está a correr.</p>";
  }
}

// ---------- Detalhe de um projeto (portfolio.html) ----------
async function carregarDetalheProjeto() {
  const titleEl = document.getElementById("proj-title");
  if (!titleEl) return; // só corre na página de detalhe

  const descEl = document.getElementById("proj-desc");
  const techsEl = document.getElementById("proj-techs");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    titleEl.textContent = "Projeto não especificado.";
    return;
  }

  try {
    const response = await fetch(`/api/projects/${id}`);
    if (!response.ok) throw new Error("Projeto não encontrado.");
    const projeto = await response.json();

    titleEl.textContent = projeto.title;
    descEl.textContent = projeto.longDescription || projeto.description;

    if (projeto.techs && techsEl) {
      techsEl.innerHTML = projeto.techs.split(", ").map(t => `<span>${t}</span>`).join("");
    }

    const links = [];
    if (projeto.liveUrl) links.push(`<a href="${projeto.liveUrl}" target="_blank" class="btn-secondary" style="text-decoration:none; display:inline-block; margin-top:1rem;">Abrir projeto</a>`);
    if (projeto.githubUrl) links.push(`<a href="${projeto.githubUrl}" target="_blank" class="btn-secondary" style="text-decoration:none; display:inline-block; margin-top:1rem; margin-left:0.5rem;">Ver código-fonte</a>`);
    if (links.length) descEl.insertAdjacentHTML("afterend", `<p>${links.join("")}</p>`);
  } catch (error) {
    console.error("Erro ao carregar o projeto:", error);
    titleEl.textContent = "Não foi possível carregar este projeto.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarProjetosDoTurso();
  carregarDetalheProjeto();
  loadPublicProjects();
});
