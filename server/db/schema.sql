-- Schema DevPortfolio (Turso / libSQL - compatível com SQLite)
-- Podes correr este ficheiro manualmente na consola SQL do Turso,
-- ou simplesmente executar `node server/db/seed.js`, que aplica
-- este schema (incluindo migrações de colunas novas) automaticamente.

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  bio TEXT,
  avatarUrl TEXT,
  githubUrl TEXT,
  linkedinUrl TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  longDescription TEXT,
  imageUrl TEXT,
  githubUrl TEXT,
  liveUrl TEXT,
  createdAt TEXT,
  updatedAt TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS project_technologies (
  projectId INTEGER NOT NULL,
  technologyId INTEGER NOT NULL,
  PRIMARY KEY (projectId, technologyId),
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (technologyId) REFERENCES technologies(id) ON DELETE CASCADE
);
