import controller from "infra/controller";
import { createRouter } from "next-connect";
import user from "models/user.js";
import activation from "models/activation";

const router = createRouter();

router.post(posthandler);

export default router.handler({
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
});

async function posthandler(request, response) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  const activationToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, activationToken);

  return response.status(201).json(newUser);
}
