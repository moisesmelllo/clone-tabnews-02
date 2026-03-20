import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const path = responseBody.dependencies.database;

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(path.max_connections).toEqual(100);

      expect(path.active_connections).toEqual(1);

      expect(responseBody.dependencies.database.version).toBe(undefined);
      expect(responseBody).not.toHaveProperty("password");
      expect(responseBody).not.toHaveProperty("email");
    });
  });

  describe("Default user", () => {
    test("Retrieving current system status", async () => {
      const createdUser = await orchestrator.createUser();

      const activatedUser = await orchestrator.activateUser(createdUser);

      const privilegedUserSession = await orchestrator.createSession(
        activatedUser.id,
      );

      const response = await fetch("http://localhost:3000/api/v1/status", {
        headers: {
          "Content-Type": "Application/json",
          Cookie: `session_id=${privilegedUserSession.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const path = responseBody.dependencies.database;

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(path.max_connections).toEqual(100);

      expect(path.active_connections).toEqual(1);

      expect(path.version).toEqual(undefined);

      expect(responseBody).not.toHaveProperty("password");
      expect(responseBody).not.toHaveProperty("email");
    });
  });

  describe("Privileged user", () => {
    test("Retrieving current system status", async () => {
      const privilegedUser = await orchestrator.createUser();

      const activatedPrivilegedUser =
        await orchestrator.activateUser(privilegedUser);

      const privilegedUserSession = await orchestrator.createSession(
        activatedPrivilegedUser.id,
      );

      await orchestrator.addFeaturesToUser(privilegedUser, ["read:status:all"]);

      const response = await fetch("http://localhost:3000/api/v1/status", {
        headers: {
          "Content-Type": "Application/json",
          Cookie: `session_id=${privilegedUserSession.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const path = responseBody.dependencies.database;

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(path.max_connections).toEqual(100);

      expect(path.active_connections).toEqual(1);

      expect(path.version).toEqual("16.0");

      expect(responseBody).not.toHaveProperty("password");
      expect(responseBody).not.toHaveProperty("email");
    });
  });
});
