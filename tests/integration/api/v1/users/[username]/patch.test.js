import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique username", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueAnonymousUsername",
      });

      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "Application/json",
          },
          body: JSON.stringify({
            username: "updatedusername",
          }),
        },
      );

      expect(response2.status).toBe(403);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        action: 'Verifique se o seu usuário possui a feature "update:user"',
        message: "Você não possui permissão para executar est ação",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With noexistent username", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/noexistent",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "Application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "newUsername",
          }),
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        message: "Usuario não localizado no sistema",
        name: "NotFoundError",
        action: "Verifique o nome digitado e tente novamente",
        status_code: 404,
      });
    });

    test("With already existent username", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      const createdUser2 = await orchestrator.createUser({
        username: "user2",
      });

      const activatedUser2 = await orchestrator.activateUser(createdUser2);
      const sessionObject = await orchestrator.createSession(activatedUser2.id);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/user1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "Application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "user2",
          }),
        },
      );

      expect(response3.status).toBe(400);

      const response3Body = await response3.json();

      expect(response3Body).toEqual({
        name: "ValidationError",
        message: "O username informado ja esta sendo utilizado",
        action: "Utilize outro username para realizar a operação",
        status_code: 400,
      });
    });

    test("With duplicated email", async () => {
      const user1 = await orchestrator.createUser({
        email: "emailExistente@curso.dev",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "emailExistente2@curso.dev",
      });

      const activatedUser2 = await orchestrator.activateUser(createdUser2);
      const sessionObject = await orchestrator.createSession(activatedUser2.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "Application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "emailExistente2@curso.dev",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado ja esta sendo utilizado",
        action: "Utilize outro email para realizar a operação",
        status_code: 400,
      });
    });

    test("With unique username", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueusername",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "Application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "updatedusername",
          }),
        },
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "updatedusername",
        email: response2Body.email,
        features: ["create:session", "read:session", "update:user"],
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBe(NaN);
      expect(Date.parse(response2Body.updated_at)).not.toBe(NaN);

      expect(Date.parse(response2Body.updated_at)).toBeGreaterThan(
        Date.parse(response2Body.created_at),
      );
    });

    test("With unique email", async () => {
      const createdUser = await orchestrator.createUser({
        email: "uniqueEmail1@curso.dev",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "Application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "uniqueEmail2@curso.dev",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: "uniqueemail2@curso.dev",
        features: ["create:session", "read:session", "update:user"],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
      expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new password", async () => {
      const createdUser = await orchestrator.createUser({
        password: "uniquePassword",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "Application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            password: "updatedPassword",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        features: ["create:session", "read:session", "update:user"],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
      expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);

      const updatedPasswordIsHash = await password.compare(
        "updatedPassword",
        responseBody.password,
      );

      expect(updatedPasswordIsHash).toBe(true);
      expect(responseBody.password).not.toBe(createdUser.password);
    });
  });
});
