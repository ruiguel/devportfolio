import express from "express";
import { db } from "../db/connection.js";
import { verifyToken } from "../middleware/auth.js";
import { validateProfile } from "../middleware/validate.js";

const router = express.Router();

// GET /api/users/profile (protegido) - dados do utilizador autenticado
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT id, name, email, bio, avatarUrl, githubUrl, linkedinUrl, createdAt
            FROM users WHERE id = ?`,
      args: [req.user.id],
    });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: "Utilizador não encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error.message);
    res.status(500).json({ error: "Erro ao carregar perfil." });
  }
});

// PUT /api/users/profile (protegido) - atualiza os dados do próprio utilizador
router.put("/profile", verifyToken, async (req, res) => {
  const { valid, errors } = validateProfile(req.body);
  if (!valid) return res.status(400).json({ error: errors.join(" ") });

  try {
    const { name, bio, avatarUrl, githubUrl, linkedinUrl } = req.body;

    const current = await db.execute({
      sql: "SELECT name, bio, avatarUrl, githubUrl, linkedinUrl FROM users WHERE id = ?",
      args: [req.user.id],
    });
    if (!current.rows || current.rows.length === 0) {
      return res.status(404).json({ error: "Utilizador não encontrado." });
    }
    const existing = current.rows[0];

    await db.execute({
      sql: `UPDATE users SET name = ?, bio = ?, avatarUrl = ?, githubUrl = ?, linkedinUrl = ?
            WHERE id = ?`,
      args: [
        name?.trim() || existing.name,
        bio !== undefined ? bio : existing.bio,
        avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
        githubUrl !== undefined ? githubUrl : existing.githubUrl,
        linkedinUrl !== undefined ? linkedinUrl : existing.linkedinUrl,
        req.user.id,
      ],
    });

    res.json({ message: "Perfil atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error.message);
    res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
});

export default router;
