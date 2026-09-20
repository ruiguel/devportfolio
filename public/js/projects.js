import { apiFetch } from "./api.js";

function renderProjectCard(p) {
  const link = p.liveUrl || "";
  return `
    <div class="project-card" style="border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; background: var(--card-bg);">
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      ${p.techs ? `<div class="skills">${p.techs.split(", ").map(t => `<span>${t}</span>`).join("")}</div>` : ""}
      <p style="margin-top: 0.75rem;">
        <a href="portfolio.html?id=${p.id}" class="btn-secondary" style="text-decoration:none; display:inline-block;">Ver detalhe</a>
        ${link ? ` <a href="${link}" target="_blank" style="margin-left:0.5rem;">Abrir projeto ↗</a>` : ""}
      </p>
    </div>
  `;
}

async function loadTechFilters(container, onSelect) {
  try {
    const technologies = await apiFetch("/technologies");
    if (!technologies.length) return;

    const filterBar = document.createElement("div");
    filterBar.className = "tech-filter-bar";
    filterBar.style.cssText = "display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.5rem;";

    const allBtn = document.createElement("button");
    allBtn.textContent = "Todas";
    allBtn.className = "btn-secondary tech-filter-btn active";
    allBtn.addEventListener("click", () => onSelect(null, allBtn));
    filterBar.appendChild(allBtn);

    technologies.forEach((tech) => {
      const btn = document.createElement("button");
      btn.textContent = tech.name;
      btn.className = "btn-secondary tech-filter-btn";
      btn.addEventListener("click", () => onSelect(tech.name, btn));
      filterBar.appendChild(btn);
    });

    container.parentElement.insertBefore(filterBar, container);
  } catch (err) {
    console.error("Erro ao carregar tecnologias para filtro:", err.message);
  }
}

export async function loadPublicProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  async function fetchAndRender(tech) {
    grid.innerHTML = "<p>A carregar projetos...</p>";
    try {
      const endpoint = tech ? `/projects?tech=${encodeURIComponent(tech)}` : "/projects";
      const projects = await apiFetch(endpoint);
      if (projects.length === 0) {
        grid.innerHTML = "<p>Ainda não existem projetos registados para este filtro.</p>";
        return;
      }
      grid.innerHTML = projects.map(renderProjectCard).join("");
    } catch (err) {
      grid.innerHTML = "<p style='color: red;'>Erro ao carregar os projetos.</p>";
    }
  }

  await loadTechFilters(grid, (tech, btn) => {
    document.querySelectorAll(".tech-filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    fetchAndRender(tech);
  });

  await fetchAndRender(null);
}
