import password from "models/password";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  const plainTextPassword = "senhas123";
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "Application/json",
        },
        body: JSON.stringify({
          username: "MesmoCase",
          email: "mesmo.case@curso.dev",
          password: plainTextPassword,
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "mesmocase",
        email: "mesmo.case@curso.dev",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      const isHash = await password.compare(
        plainTextPassword,
        response2Body.password,
      );

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
      expect(isHash).toBe(true);
    });

    test("With case mismatch", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "Application/json",
        },
        body: JSON.stringify({
          username: "CaseMismatch",
          email: "CaseMismatch@curso.dev",
          password: plainTextPassword,
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/CaseMismatch",
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "casemismatch",
        email: "casemismatch@curso.dev",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      const isHash = await password.compare(
        plainTextPassword,
        response2Body.password,
      );

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
      expect(isHash).toBe(true);
    });

    test("With noexistent user", async () => {
      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/noExistentUser",
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
