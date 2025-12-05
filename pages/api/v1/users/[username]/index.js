import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";

const router = createRouter();

router.get(getHandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function getHandler(request, response) {
  const requestedUser = request.query.username;
  const userFound = await user.findOneByUsername(requestedUser);

  return response.status(200).json(userFound);
}
