import { runner } from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = {
      dbClient: dbClient,
      dir: join("infra", "migrations"),
      direction: "up",
      dryRun: true,
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      const PendingMigrations = await runner({
        ...defaultMigrationOptions,
        dryRun: true,
      });
      return response.status(200).json(PendingMigrations);
    }

    if (request.method === "POST") {
      const MigratedMigrations = await runner({
        ...defaultMigrationOptions,
        dryRun: false,
      });
      if (MigratedMigrations.length > 0) {
        return response.status(201).json(MigratedMigrations);
      }

      return response.status(200).json(MigratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}
