import { createClient } from "@libsql/client";
import dotenv from "dotenv";

// Garante que o .env é lido antes de criar a ligação
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠ DATABASE_URL não está definida. Cria um ficheiro .env com base em .env.example."
  );
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const RETRYABLE_ERROR_PATTERNS = [
  "ECONNRESET",
  "ETIMEDOUT",
  "fetch failed",
  "socket hang up",
  "network",
  "HRANA_WEBSOCKET_ERROR",
  "SERVER_ERROR",
];

function isRetryable(error) {
  const message = String(error?.message || error);
  return RETRYABLE_ERROR_PATTERNS.some((pattern) =>
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}

// Wrapper à volta do cliente Turso: em caso de falha de rede/conexão
// transitória (comum em bases de dados "free tier" que hibernam),
// tenta novamente uma vez antes de desistir. Mantém a mesma
// assinatura (db.execute / db.batch), pelo que nada mais no código
// precisa de mudar.
export const db = {
  async execute(query) {
    try {
      return await client.execute(query);
    } catch (error) {
      if (isRetryable(error)) {
        console.warn("Ligação à base de dados falhou, a tentar novamente...", error.message);
        await new Promise((resolve) => setTimeout(resolve, 400));
        return await client.execute(query);
      }
      throw error;
    }
  },

  async batch(statements, mode) {
    try {
      return await client.batch(statements, mode);
    } catch (error) {
      if (isRetryable(error)) {
        console.warn("Ligação à base de dados falhou, a tentar novamente...", error.message);
        await new Promise((resolve) => setTimeout(resolve, 400));
        return await client.batch(statements, mode);
      }
      throw error;
    }
  },

  raw: client,
};
