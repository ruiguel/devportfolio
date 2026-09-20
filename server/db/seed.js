// server/db/seed.js
//
// Script de inicialização da base de dados Turso.
// - Cria as tabelas (caso não existam).
// - Faz "migração" de colunas novas em tabelas já existentes
//   (necessário porque esta base de dados já tinha dados antes
//   do schema ter sido atualizado com os campos do enunciado).
// - Garante que existe a conta do formador com as credenciais
//   obrigatórias.
// - Insere algumas tecnologias base, se a tabela estiver vazia.
//
// Corre com:  node server/db/seed.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import "dotenv/config";
import { db } from "./connection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FORMADOR_EMAIL = process.env.FORMADOR_EMAIL || "formador@formador.com";
// Password documentada no README.md - pode ser alterada por variável de ambiente.
const FORMADOR_PASSWORD = process.env.FORMADOR_PASSWORD || "Formador_2026Belem";
// Email(s) usados anteriormente para a conta do formador - se existir uma
// conta antiga com um destes emails, é migrada (renomeada) em vez de criar
// uma conta duplicada.
const LEGACY_FORMADOR_EMAILS = ["xtare16.soares@gmail.com"];

async function createTables() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  // Divide o ficheiro em instruções individuais (separadas por ";")
  const statements = schemaSql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.execute(statement);
  }
  console.log("✔ Tabelas verificadas/criadas.");
}

async function migrateUsersColumns() {
  // Colunas que podem faltar em bases de dados criadas com o schema antigo.
  const newColumns = [
    { name: "password", ddl: "ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT ''" },
    { name: "bio", ddl: "ALTER TABLE users ADD COLUMN bio TEXT" },
    { name: "avatarUrl", ddl: "ALTER TABLE users ADD COLUMN avatarUrl TEXT" },
    { name: "githubUrl", ddl: "ALTER TABLE users ADD COLUMN githubUrl TEXT" },
    { name: "linkedinUrl", ddl: "ALTER TABLE users ADD COLUMN linkedinUrl TEXT" },
    { name: "createdAt", ddl: "ALTER TABLE users ADD COLUMN createdAt TEXT" },
  ];

  for (const col of newColumns) {
    try {
      await db.execute(col.ddl);
      console.log(`✔ Coluna "users.${col.name}" adicionada.`);
    } catch (err) {
      // Ignora o erro esperado quando a coluna já existe.
      if (!/duplicate column name/i.test(err.message)) {
        console.warn(`Aviso ao migrar coluna ${col.name}:`, err.message);
      }
    }
  }
}

async function seedFormador() {
  const hashedPassword = await bcrypt.hash(FORMADOR_PASSWORD, 10);

  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [FORMADOR_EMAIL],
  });

  if (existing.rows && existing.rows.length > 0) {
    // Já existe com o email atual - garante que a password fica sempre
    // sincronizada com a configurada aqui (útil se a mudares e voltares
    // a correr `npm run setup`).
    await db.execute({
      sql: "UPDATE users SET password = ? WHERE email = ?",
      args: [hashedPassword, FORMADOR_EMAIL],
    });
    console.log(`✔ Password do formador sincronizada (${FORMADOR_EMAIL}).`);
    return;
  }

  // Se existir uma conta com um email antigo do formador, migra-a
  // (renomeia) em vez de criar uma conta duplicada.
  for (const oldEmail of LEGACY_FORMADOR_EMAILS) {
    const legacy = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [oldEmail],
    });
    if (legacy.rows && legacy.rows.length > 0) {
      await db.execute({
        sql: "UPDATE users SET email = ?, password = ?, name = ? WHERE email = ?",
        args: [FORMADOR_EMAIL, hashedPassword, "Formador", oldEmail],
      });
      console.log(`✔ Conta do formador migrada de ${oldEmail} para ${FORMADOR_EMAIL}.`);
      return;
    }
  }

  await db.execute({
    sql: `INSERT INTO users (name, email, password, bio, createdAt)
          VALUES (?, ?, ?, ?, ?)`,
    args: [
      "Formador",
      FORMADOR_EMAIL,
      hashedPassword,
      "Conta de acesso do formador.",
      new Date().toISOString(),
    ],
  });
  console.log(`✔ Conta do formador criada (${FORMADOR_EMAIL}).`);
}

async function dropUnusedTables() {
  // Limpeza de segurança: remove a tabela "messages" caso tenhas
  // chegado a correr uma versão anterior deste script que a criava.
  // Não é um requisito do enunciado, por isso não faz parte do schema atual.
  try {
    await db.execute("DROP TABLE IF EXISTS messages;");
  } catch (err) {
    console.warn("Aviso ao limpar tabela messages:", err.message);
  }
}

async function seedTechnologies() {
  const result = await db.execute("SELECT COUNT(*) as total FROM technologies;");
  const total = result.rows?.[0]?.total ?? 0;
  if (total > 0) {
    console.log("✔ Tabela de tecnologias já tem dados.");
    return;
  }

  const defaults = [
    { name: "HTML", color: "#e34c26", icon: "html5" },
    { name: "CSS", color: "#264de4", icon: "css3" },
    { name: "JavaScript", color: "#f0db4f", icon: "javascript" },
    { name: "Node.js", color: "#3c873a", icon: "nodejs" },
    { name: "Express", color: "#000000", icon: "express" },
    { name: "Turso / SQLite", color: "#4ff8d2", icon: "database" },
  ];

  for (const tech of defaults) {
    await db.execute({
      sql: "INSERT OR IGNORE INTO technologies (name, color, icon) VALUES (?, ?, ?)",
      args: [tech.name, tech.color, tech.icon],
    });
  }
  console.log("✔ Tecnologias base inseridas.");
}

async function main() {
  try {
    console.log("A inicializar a base de dados Turso...");
    await createTables();
    await migrateUsersColumns();
    await dropUnusedTables();
    await seedFormador();
    await seedTechnologies();
    console.log("\nConcluído com sucesso.");
    console.log(`Login do formador -> email: ${FORMADOR_EMAIL} | password: ${FORMADOR_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error("\n✖ Erro ao inicializar a base de dados:", error.message);
    console.error(
      "Confirma que DATABASE_URL e DATABASE_AUTH_TOKEN estão corretamente definidos no ficheiro .env."
    );
    process.exit(1);
  }
}

main();
