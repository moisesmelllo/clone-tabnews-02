async function fetchMigrations(fetchMethod) {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: fetchMethod,
  });

  return response;
}

test("not POST to /api/v1/migrations should return 405", async () => {
  const response = await fetchMigrations("DELETE");
  const response1 = await fetchMigrations("PUT");
  const response2 = await fetchMigrations("PATCH");

  expect(response.status).toBe(405);
  expect(response1.status).toBe(405);
  expect(response2.status).toBe(405);
});
