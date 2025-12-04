import { createRouter } from "next-connect";
import runMigrations from "models/migrator";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getHandler(request, response) {
  const PendingMigrations = await runMigrations({ dryRun: true });
  return response.status(200).json(PendingMigrations);
}

async function postHandler(request, response) {
  const MigratedMigrations = await runMigrations({ dryRun: false });

  if (MigratedMigrations.length > 0) {
    return response.status(201).json(MigratedMigrations);
  }

  return response.status(200).json(MigratedMigrations);
}
