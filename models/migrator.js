import database from "infra/database";
import { runner as migrationRunner } from "node-pg-migrate";
import { join } from "node:path";
import { ServiceError } from "infra/errors";

const defaultMigrationOptions = {
  dir: join("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function runMigrations({ dryRun }) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const PendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun,
    });

    return PendingMigrations;
  } catch (error) {
    const databaseError = new ServiceError({
      cause: error,
      message: "Erro ao rodar as migrations no banco de dados",
    });
    throw databaseError;
  } finally {
    if (dbClient) {
      await dbClient?.end();
    }
  }
}

export default runMigrations;
