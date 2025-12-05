import controller from "infra/controller";
import { createRouter } from "next-connect";
import user from "models/user.js";

const router = createRouter();

router.post(posthandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function posthandler(request, response) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  return response.status(201).json(newUser);
}
