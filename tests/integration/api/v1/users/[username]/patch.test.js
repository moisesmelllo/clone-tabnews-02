import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import webserver from "infra/webserver"

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe(`PATCH /api/v1/users/[username]`, () => {
  describe(`Anonymous user`, () => {
    test(`With unique username`, async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueAnonymousUsername",
      });

      const response2 = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser.username}`,
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
        message: "Você não possui permissão para executar esta ação",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe(`Default user`, () => {
    test(`With noexistent username`, async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/noexistent`,
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

    test(`With already existent username`, async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      const createdUser2 = await orchestrator.createUser({
        username: "user2",
      });

      const activatedUser2 = await orchestrator.activateUser(createdUser2);
      const sessionObject = await orchestrator.createSession(activatedUser2.id);

      const response3 = await fetch(
        `${webserver.origin}/api/v1/users/user2`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "Application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "user1",
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

    test(`With duplicated email`, async () => {
      await orchestrator.createUser({
        email: "emailExistente@curso.dev",
      });

      const user2 = await orchestrator.createUser({
        email: "emailExistente2@curso.dev",
      });

      const activatedUser2 = await orchestrator.activateUser(user2);
      const sessionObject = await orchestrator.createSession(activatedUser2.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${user2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "Application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "emailExistente@curso.dev",
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

    test(`With 'user2' targeting 'user1'`, async () => {
      await orchestrator.createUser({
        username: "userA",
      });

      const createdUser2 = await orchestrator.createUser({
        username: "userB",
      });

      const activatedUser2 = await orchestrator.activateUser(createdUser2);
      const sessionObject = await orchestrator.createSession(activatedUser2.id);

      const response = await fetch(`${webserver.origin}/api/v1/users/userA`, {
        method: "PATCH",
        headers: {
          "Content-Type": "Application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          username: "userC",
        }),
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action:
          "Verifique se você possui a feature necessaria para atualizar outro usuario",
        message: "Você não possui permissão para atualizar outro usuário.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });

    test(`With unique username`, async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueusername",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response2 = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser.username}`,
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
        features: ["create:session", "read:session", "update:user"],
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

    test(`With unique email`, async () => {
      const createdUser = await orchestrator.createUser({
        email: "uniqueEmail1@curso.dev",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser.username}`,
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
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
      expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test(`With new password`, async () => {
      const createdUser = await orchestrator.createUser({
        password: "uniquePassword",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser.username}`,
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
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
      expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);

      expect(responseBody.password).not.toBe(createdUser.password);
    });
  });

  describe(`Privileged user`, () => {
    test(`With 'update:user:others' targeting 'defaultUser'`, async () => {
      const privilegedUser = await orchestrator.createUser();

      const activatedPrivilegedUser =
        await orchestrator.activateUser(privilegedUser);
      const privilegedUserSession = await orchestrator.createSession(
        activatedPrivilegedUser.id,
      );

      await orchestrator.addFeaturesToUser(privilegedUser, [
        "update:user:others",
      ]);

      const defaultUser = await orchestrator.createUser();

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${defaultUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "Application/json",
            Cookie: `session_id=${privilegedUserSession.token}`,
          },
          body: JSON.stringify({
            username: "AlteredByPrivelegedUser",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: defaultUser.id,
        username: "alteredbyprivelegeduser",
        features: defaultUser.features,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
      expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);

      expect(Date.parse(responseBody.updated_at)).toBeGreaterThan(
        Date.parse(responseBody.created_at),
      );
    });
  });
});
