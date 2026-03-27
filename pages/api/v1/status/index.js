import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller";
import authorization from "models/authorization";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(getHandler)
  .handler({
    onNoMatch: controller.onNoMatchHandler,
    onError: controller.onErrorHandler,
  });

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  console.log(userTryingToGet);
  const updatedAt = new Date().toISOString();

  const maxConnectionsQuery = await database.query("SHOW max_connections");
  const maxConnections = maxConnectionsQuery.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const activeConnectionsQuery = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const activeConnections = activeConnectionsQuery.rows[0].count;

  const versionQuery = await database.query("SHOW server_version;");
  const version = versionQuery.rows[0].server_version;

  const responseBody = {
    updated_at: updatedAt,
    dependencies: {
      database: {
        max_connections: parseInt(maxConnections),
        active_connections: parseInt(activeConnections),
        version: version,
      },
    },
  };

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:status",
    responseBody,
  );

  return response.status(200).json(secureOutputValues);
}
