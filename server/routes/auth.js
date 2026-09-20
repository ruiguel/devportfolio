import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/connection.js";
import { validateRegister, validateLogin } from "../middleware/validate.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_seguro";
const JWT_EXPIRES_IN = "7d";

function signToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { valid, errors } = validateRegister(req.body);
  if (!valid) return res.status(400).json({ error: errors.join(" ") });

  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  const { password } = req.body;

  try {
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ error: "Já existe uma conta com este e-mail." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute({
      sql: "INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)",
      args: [name, email, hashedPassword, new Date().toISOString()],
    });
    res.status(201).json({ message: "Utilizador registado com sucesso!" });
  } catch (e) {
    console.error("Erro no registo:", e.message);
    res.status(500).json({ error: "Erro interno ao registar o utilizador." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { valid, errors } = validateLogin(req.body);
  if (!valid) return res.status(400).json({ error: errors.join(" ") });

  const email = req.body.email.trim().toLowerCase();
  const { password } = req.body;

  try {
    const result = await db.execute({
      sql: "SELECT id, name, email, password FROM users WHERE email = ?",
      args: [email],
    });

    const user = result.rows && result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "E-mail ou password incorretos." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: "E-mail ou password incorretos." });
    }

    const token = signToken(user);
    res.json({
      message: "Login efetuado com sucesso!",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (e) {
    console.error("Erro no login:", e.message);
    res.status(500).json({ error: "Erro interno ao autenticar." });
  }
});

export default router;
