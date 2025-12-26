import controller from "infra/controller";
import activation from "models/activation";
import { createRouter } from "next-connect";

const router = createRouter();

router.patch(patchHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function patchHandler(request, response) {
  const tokenId = request.query.token_id;
  const updatedTokenObject = await activation.markTokenAsUsed(tokenId);

  await activation.activateUserById(updatedTokenObject.user_id);

  return response.status(200).json(updatedTokenObject);
}
