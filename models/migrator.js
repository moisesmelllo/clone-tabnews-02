import database from "infra/database";
import { runner as migrationRunner } from "node-pg-migrate";
import { join } from "node:path";

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
  } finally {
    if (dbClient) {
      await dbClient?.end();
    }
  }
}

export default runMigrations;
