import database from "infra/database.js";
import password from "models/password.js";
import { NotFoundError, ValidationError } from "infra/errors";
import bcrypt from "bcryptjs";

async function create(userInputValues) {
  await hashPassword(userInputValues);
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);

  injectDefaultFeaturesInObject(userInputValues);

  try {
    const newUser = await runInsertQuery(userInputValues);
    return newUser;
  } catch (error) {
    throw error;
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPassword(userInputValues);
  }

  const updatedUserObject = {
    ...currentUser,
    ...userInputValues,
  };

  try {
    const updatedUser = await runUpdateQuery(updatedUserObject);
    return updatedUser;
  } catch (error) {
    throw error;
  }
}

async function runInsertQuery(userInputValues) {
  const result = await database.query({
    text: `
        INSERT INTO 
          users (username, email, password, features) 
        VALUES 
          (LOWER($1), LOWER($2), $3, $4) 
        RETURNING 
          *
        ;`,
    values: [
      userInputValues.username,
      userInputValues.email,
      userInputValues.password,
      userInputValues.features,
    ],
  });

  const user = result.rows[0];

  return user;
}

function injectDefaultFeaturesInObject(userInputValues) {
  userInputValues.features = ["read:activation_token"];
}

async function runUpdateQuery(updatedUser) {
  const result = await database.query({
    text: `
      UPDATE
        users
      SET
        email = LOWER($1),
        username = LOWER($2),
        password = $3,
        updated_at = timezone('utc', now())
      WHERE
        id = $4
      RETURNING
        *
    `,
    values: [
      updatedUser.email,
      updatedUser.username,
      updatedUser.password,
      updatedUser.id,
    ],
  });

  const user = result.rows[0];
  return user;
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

async function findOneByEmail(email) {
  const result = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      LIMIT
        1
    `,
    values: [email],
  });
  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "O email informado não foi encontrado no sistema",
      action: "Verifique se o email está digitado corretamente",
    });
  }

  return result.rows[0];
}

async function findOneById(id) {
  const result = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        id = $1
      LIMIT 
        1
    ;`,
    values: [id],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "O usuario informado não foi encontrado no sistema",
      action: "Verifique se o id está digitado corretamente",
    });
  }

  return result.rows[0];
}

async function hashPassword(textPassword) {
  await password.hash(textPassword);
}

async function validateUniqueUsername(username) {
  const response = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
    ;`,
    values: [username],
  });

  if (response.rows.length > 0) {
    throw new ValidationError({
      message: "O username informado ja esta sendo utilizado",
      action: "Utilize outro username para realizar a operação",
    });
  }
}

async function validateUniqueEmail(email) {
  const response = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
    `,
    values: [email],
  });

  if (response.rows.length > 0) {
    throw new ValidationError({
      message: "O email informado ja esta sendo utilizado",
      action: "Utilize outro email para realizar a operação",
    });
  }
}

async function validePassword(userInputValues, DBPassword) {
  await hashPassword(userInputValues);

  const isPasswordValid = await bcrypt.compare(
    userInputValues.password,
    DBPassword,
  );

  if (!isPasswordValid) {
    throw new ValidationError({
      message: "userInputValues",
      action: "Verifique a senha digitada e tente novamente",
    });
  }
}

async function setFeatures(userId, features) {
  const updatedUser = await runUpdateQuery(userId, features);
  return updatedUser;

  async function runUpdateQuery(userId, features) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          features = $2,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [userId, features],
    });

    return results.rows[0];
  }
}

const user = {
  create,
  update,
  findOneByUsername,
  findOneByEmail,
  findOneById,
  validePassword,
  setFeatures,
};

export default user;
