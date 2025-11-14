test("GET tp /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
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
