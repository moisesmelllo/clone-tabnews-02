import database from "infra/database";
import { join } from "node:path";
import { ServiceError } from "infra/errors";

const defaultMigrationOptions = {
  dir: join("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function runMigrations({ dryRun }) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    // v8 fix: Importamos o módulo e buscamos a função 'runner' explicitamente
    const mod = await import("node-pg-migrate");

    // Na v8, a função principal costuma ser o named export 'runner'
    const runner = mod.runner || mod.default;

    if (typeof runner !== "function") {
      console.error("Conteúdo do módulo para debug:", mod);
      throw new Error(
        "Não foi possível localizar a função de migração. Verifique a versão do node-pg-migrate.",
      );
    }

    const PendingMigrations = await runner({
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
