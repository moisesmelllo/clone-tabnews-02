import { createRouter } from "next-connect";
import { runner as migrationRunner } from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

const defaultMigrationOptions = {
  dir: join("infra", "migrations"),
  direction: "up",
  dryRun: true,
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const PendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });

    return response.status(200).json(PendingMigrations);
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}

async function postHandler(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const MigratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    if (MigratedMigrations.length > 0) {
      return response.status(201).json(MigratedMigrations);
    }

    return response.status(200).json(MigratedMigrations);
  } finally {
    dbClient.end();
  }
}
