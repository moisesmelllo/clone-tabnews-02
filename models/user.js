import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors";

async function create(userInputValues) {
  await hashPassword(userInputValues);

  try {
    const newUser = await runInsertQuery(
      userInputValues.username,
      userInputValues.email,
      userInputValues.password,
    );
    return newUser;
  } catch (error) {
    verifyError(error);
  }

  function verifyError(error) {
    if (error.cause.code === "23505") {
      if (error.cause.constraint.includes("email")) {
        throw new ValidationError({
          message: "O email informado ja esta sendo utilizado",
          action: "Utilize outro email para realizar o cadastro",
        });
      }

      if (error.cause.constraint.includes("username")) {
        throw new ValidationError({
          message: "O username informado ja esta sendo utilizado",
          action: "Utilize outro username para realizar o cadastro",
        });
      }
      throw error;
    }
  }
}

async function findOneByUsername(username) {
  const response = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT
        1
    ;`,
    values: [username],
  });

  if (response.rowCount === 0) {
    throw new NotFoundError({
      action: "Verifique o nome digitado e tente novamente",
      message: "Usuario não localizado no sistema",
    });
  }

  return response.rows[0];
}

async function hashPassword(textPassword) {
  await password.hash(textPassword);
}

async function runInsertQuery(username, email, textPassword) {
  const result = await database.query({
    text: `
        INSERT INTO 
          users (username, email, password) 
        VALUES 
          (LOWER($1), LOWER($2), $3) 
        RETURNING 
          *
        ;`,
    values: [username, email, textPassword],
  });

  const user = result.rows[0];

  return user;
}

const user = {
  create,
  findOneByUsername,
};

export default user;
