import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient: dbClient,
    dir: join("infra", "migrations"),
    direction: "up",
    dryRun: true,
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const PendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: true,
    });
    await dbClient.end();
    return response.status(200).json(PendingMigrations);
  }

  if (request.method === "POST") {
    const MigratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });
    await dbClient.end();
    if (MigratedMigrations.length > 0) {
      return response.status(201).json(MigratedMigrations);
    }

    return response.status(200).json(MigratedMigrations);
  }

  return response.status(405).end();
}
