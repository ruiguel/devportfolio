import express from "express";
import { db } from "../db/connection.js";
import { verifyToken } from "../middleware/auth.js";
import { validateProject } from "../middleware/validate.js";

const router = express.Router();

const SELECT_FIELDS = `
  p.id, p.userId, p.title, p.description, p.longDescription,
  p.imageUrl, p.githubUrl, p.liveUrl,
  p.createdAt, p.updatedAt,
  GROUP_CONCAT(t.name, ', ') AS techs
`;

// Liga (ou cria, se ainda não existir) as tecnologias de um projeto.
// `technologies` pode ser um array de nomes (strings) ou de ids (números).
async function syncProjectTechnologies(projectId, technologies) {
  await db.execute({
    sql: "DELETE FROM project_technologies WHERE projectId = ?",
    args: [projectId],
  });

  if (!Array.isArray(technologies) || technologies.length === 0) return;

  for (const raw of technologies) {
    let technologyId = null;

    if (typeof raw === "number" || /^\d+$/.test(String(raw))) {
      technologyId = Number(raw);
    } else {
      const name = String(raw).trim();
      if (!name) continue;

      const existing = await db.execute({
        sql: "SELECT id FROM technologies WHERE name = ?",
        args: [name],
      });

      if (existing.rows && existing.rows.length > 0) {
        technologyId = existing.rows[0].id;
      } else {
        const inserted = await db.execute({
          sql: "INSERT INTO technologies (name) VALUES (?)",
          args: [name],
        });
        technologyId = inserted.lastInsertRowid ? Number(inserted.lastInsertRowid) : null;
      }
    }

    if (technologyId) {
      await db.execute({
        sql: "INSERT OR IGNORE INTO project_technologies (projectId, technologyId) VALUES (?, ?)",
        args: [projectId, technologyId],
      });
    }
  }
}

// GET /api/projects  (público) - suporta ?tech=nome ou ?tech=id para filtrar
router.get("/", async (req, res) => {
  try {
    const { tech } = req.query;

    let sql = `
      SELECT ${SELECT_FIELDS}
      FROM projects p
      LEFT JOIN project_technologies pt ON pt.projectId = p.id
      LEFT JOIN technologies t ON t.id = pt.technologyId
    `;
    const args = [];

    if (tech) {
      sql += `
        WHERE p.id IN (
          SELECT pt2.projectId FROM project_technologies pt2
          JOIN technologies t2 ON t2.id = pt2.technologyId
          WHERE t2.name = ? OR t2.id = ?
        )
      `;
      args.push(tech, /^\d+$/.test(tech) ? Number(tech) : -1);
    }

    sql += " GROUP BY p.id ORDER BY p.id DESC;";

    const r = await db.execute({ sql, args });
    return res.json(r.rows || []);
  } catch (error) {
    console.error("Erro ao listar projetos:", error.message);
    return res.status(500).json({ error: "Erro ao procurar projetos na base de dados." });
  }
});

// GET /api/projects/:id  (público)
router.get("/:id", async (req, res) => {
  try {
    const r = await db.execute({
      sql: `
        SELECT ${SELECT_FIELDS}
        FROM projects p
        LEFT JOIN project_technologies pt ON pt.projectId = p.id
        LEFT JOIN technologies t ON t.id = pt.technologyId
        WHERE p.id = ?
        GROUP BY p.id;
      `,
      args: [req.params.id],
    });
    if (!r.rows || r.rows.length === 0) {
      return res.status(404).json({ error: "Projeto não encontrado." });
    }
    return res.json(r.rows[0]);
  } catch (error) {
    console.error("Erro ao procurar projeto:", error.message);
    return res.status(500).json({ error: "Erro ao procurar o projeto." });
  }
});

// POST /api/projects  (protegido - requer login)
router.post("/", verifyToken, async (req, res) => {
  const { valid, errors } = validateProject(req.body);
  if (!valid) return res.status(400).json({ error: errors.join(" ") });

  try {
    const { title, description, longDescription, imageUrl, githubUrl, liveUrl, technologies } =
      req.body;

    const now = new Date().toISOString();
    const userId = req.user.id;

    const projectResult = await db.execute({
      sql: `INSERT INTO projects
              (userId, title, description, longDescription, imageUrl, githubUrl, liveUrl, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        userId,
        title.trim(),
        description.trim(),
        longDescription?.trim() || null,
        imageUrl?.trim() || null,
        githubUrl?.trim() || null,
        liveUrl?.trim() || null,
        now,
        now,
      ],
    });

    const newProjectId = projectResult.lastInsertRowid
      ? Number(projectResult.lastInsertRowid)
      : null;

    if (newProjectId && technologies) {
      await syncProjectTechnologies(newProjectId, technologies);
    }

    return res.status(201).json({ message: "Projeto criado com sucesso!", id: newProjectId });
  } catch (error) {
    console.error("Erro ao criar projeto:", error.message);
    return res.status(500).json({ error: "Erro interno do servidor ao criar o projeto." });
  }
});

// PUT /api/projects/:id  (protegido - requer login)
router.put("/:id", verifyToken, async (req, res) => {
  const { valid, errors } = validateProject(req.body);
  if (!valid) return res.status(400).json({ error: errors.join(" ") });

  try {
    const { id } = req.params;
    const existing = await db.execute({
      sql: "SELECT id FROM projects WHERE id = ?",
      args: [id],
    });
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ error: "Projeto não encontrado." });
    }

    const { title, description, longDescription, imageUrl, githubUrl, liveUrl, technologies } =
      req.body;
    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE projects SET
              title = ?, description = ?, longDescription = ?,
              imageUrl = ?, githubUrl = ?, liveUrl = ?, updatedAt = ?
            WHERE id = ?`,
      args: [
        title.trim(),
        description.trim(),
        longDescription?.trim() || null,
        imageUrl?.trim() || null,
        githubUrl?.trim() || null,
        liveUrl?.trim() || null,
        now,
        id,
      ],
    });

    if (technologies) {
      await syncProjectTechnologies(id, technologies);
    }

    return res.json({ message: "Projeto atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error.message);
    return res.status(500).json({ error: "Erro interno do servidor ao atualizar o projeto." });
  }
});

// DELETE /api/projects/:id  (protegido - requer login)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.execute({
      sql: "SELECT id FROM projects WHERE id = ?",
      args: [id],
    });
    if (!existing.rows || existing.rows.length === 0) {
      return res.status(404).json({ error: "Projeto não encontrado." });
    }

    await db.execute({ sql: "DELETE FROM project_technologies WHERE projectId = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM projects WHERE id = ?", args: [id] });

    return res.json({ message: "Projeto eliminado com sucesso!" });
  } catch (error) {
    console.error("Erro ao eliminar projeto:", error.message);
    return res.status(500).json({ error: "Erro interno do servidor ao eliminar o projeto." });
  }
});

export default router;
