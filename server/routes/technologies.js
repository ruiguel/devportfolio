import express from "express";
import { db } from "../db/connection.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/technologies (público) - usado para preencher o filtro
// na área pública e o campo de tecnologias no dashboard.
router.get("/", async (req, res) => {
  try {
    const r = await db.execute("SELECT id, name, color, icon FROM technologies ORDER BY name ASC;");
    return res.json(r.rows || []);
  } catch (error) {
    console.error("Erro ao listar tecnologias:", error.message);
    return res.status(500).json({ error: "Erro ao procurar tecnologias." });
  }
});

// POST /api/technologies (protegido) - cria uma nova tecnologia manualmente
router.post("/", verifyToken, async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "O nome da tecnologia é obrigatório." });

    await db.execute({
      sql: "INSERT OR IGNORE INTO technologies (name, color, icon) VALUES (?, ?, ?)",
      args: [name, req.body.color || null, req.body.icon || null],
    });
    return res.status(201).json({ message: "Tecnologia guardada com sucesso!" });
  } catch (error) {
    console.error("Erro ao criar tecnologia:", error.message);
    return res.status(500).json({ error: "Erro interno ao criar tecnologia." });
  }
});

export default router;
