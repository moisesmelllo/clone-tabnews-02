import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { NotFoundError } from "infra/errors";

const PEPPER_KEY = process.env.PEPPER_SECRET;

if (!PEPPER_KEY) {
  throw new NotFoundError({
    message: "PEPPER nao encontrado ao gerar o hash",
    action: "Verifique se o valor foi adicionado as variaveis de ambiente",
  });
}

function pepperPassword(password) {
  return crypto.createHmac("sha256", PEPPER_KEY).update(password).digest("hex");
}

async function hash(userInputValues) {
  const rounds = process.env.NODE_ENV === "production" ? 14 : 1;
  const salt = await bcrypt.genSalt(rounds);

  const pepperedPassword = pepperPassword(userInputValues.password);
  const hash = await bcrypt.hash(pepperedPassword, salt);
  userInputValues.password = hash;
}

async function compare(plainPassword, hashFromDb) {
  const pepperedPassword = pepperPassword(plainPassword);

  return await bcrypt.compare(pepperedPassword, hashFromDb);
}

const password = {
  hash,
  compare,
};

export default password;
