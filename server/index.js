import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import userRoutes from "./routes/users.js";
import technologyRoutes from "./routes/technologies.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/technologies", technologyRoutes);

// Serve o site (public/) através do próprio Express.
// Importante: abrir os ficheiros com duplo clique (file://) impede os
// imports de módulos JS de funcionar. Acede sempre via http://localhost:3000
app.use(express.static(PUBLIC_DIR));

// 404 para chamadas à API que não correspondem a nenhuma rota
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Rota da API não encontrada." });
});

// 404 personalizado para todas as outras páginas
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, "404.html"));
});

// Tratamento de erros centralizado (evita que o servidor rebente
// com erros não tratados nas rotas)
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({ error: "Ocorreu um erro interno no servidor." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor ativo na porta ${PORT} - abre http://localhost:${PORT}`));
