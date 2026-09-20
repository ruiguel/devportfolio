// Validação simples de dados de entrada, sem dependências externas.
// Cada função devolve { valid: boolean, errors: string[] }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(body) {
  const errors = [];
  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const password = body.password || "";

  if (name.length < 2) errors.push("O nome deve ter pelo menos 2 caracteres.");
  if (!EMAIL_REGEX.test(email)) errors.push("Indica um e-mail válido.");
  if (password.length < 6) errors.push("A password deve ter pelo menos 6 caracteres.");

  return { valid: errors.length === 0, errors };
}

export function validateLogin(body) {
  const errors = [];
  const email = (body.email || "").trim();
  const password = body.password || "";

  if (!EMAIL_REGEX.test(email)) errors.push("Indica um e-mail válido.");
  if (!password) errors.push("A password é obrigatória.");

  return { valid: errors.length === 0, errors };
}

export function validateProject(body) {
  const errors = [];
  const title = (body.title || "").trim();
  const description = (body.description || "").trim();
  const urlFields = ["imageUrl", "githubUrl", "liveUrl"];

  if (title.length < 2 || title.length > 120) {
    errors.push("O título deve ter entre 2 e 120 caracteres.");
  }
  if (description.length < 5 || description.length > 500) {
    errors.push("A descrição deve ter entre 5 e 500 caracteres.");
  }
  if (body.longDescription && String(body.longDescription).length > 5000) {
    errors.push("A descrição longa não pode exceder 5000 caracteres.");
  }
  for (const field of urlFields) {
    const value = body[field];
    if (value && String(value).trim().length > 500) {
      errors.push(`O campo ${field} é demasiado longo.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateProfile(body) {
  const errors = [];
  if (body.name !== undefined && String(body.name).trim().length < 2) {
    errors.push("O nome deve ter pelo menos 2 caracteres.");
  }
  if (body.bio !== undefined && String(body.bio).length > 1000) {
    errors.push("A biografia não pode exceder 1000 caracteres.");
  }
  return { valid: errors.length === 0, errors };
}
