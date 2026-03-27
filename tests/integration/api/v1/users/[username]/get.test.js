import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe(`GET /api/v1/users/[username]`, () => {
  const plainTextPassword = "senhas123";
  describe(`Anonymous user`, () => {
    test(`With exact case match`, async () => {
      await orchestrator.createUser({
        username: "MesmoCase",
        email: "mesmo.case@curso.dev",
        password: plainTextPassword,
      });

      const response2 = await fetch(
        `${webserver.origin}/api/v1/users/MesmoCase`,
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "mesmocase",
        features: ["read:activation_token"],
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test(`With case mismatch`, async () => {
      await orchestrator.createUser({
        username: "CaseMismatch",
        email: "CaseMismatch@curso.dev",
        password: plainTextPassword,
      });

      const response2 = await fetch(
        `${webserver.origin}/api/v1/users/CaseMismatch`,
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "casemismatch",
        features: ["read:activation_token"],
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    test(`With noexistent user`, async () => {
      const response2 = await fetch(
        `${webserver.origin}/api/v1/users/noExistentUser`,
      );

      expect(response2.status).toBe(404);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "NotFoundError",
        message: "Usuario não localizado no sistema",
        action: "Verifique o nome digitado e tente novamente",
        status_code: 404,
      });
    });
  });
});
