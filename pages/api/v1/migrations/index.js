import { createRouter } from "next-connect";
import runMigrations from "models/migrator";
import controller from "infra/controller";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:migration"), getHandler);
router.post(controller.canRequest("create:migration"), postHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const PendingMigrations = await runMigrations({ dryRun: true });

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:migration",
    PendingMigrations,
  );

  return response.status(200).json(secureOutputValues);
}

async function postHandler(request, response) {
  const userTryingToPost = request.context.user;
  const MigratedMigrations = await runMigrations({ dryRun: false });

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:migration",
    MigratedMigrations,
  );

  if (MigratedMigrations.length > 0) {
    return response.status(201).json(secureOutputValues);
  }

  return response.status(200).json(secureOutputValues);
}
