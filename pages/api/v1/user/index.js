import { createRouter } from "next-connect";
import controller from "infra/controller";
import session from "models/session";
import user from "models/user";

const router = createRouter();

router.get(getHandler);

export default router.handler({
  onError: controller.onErrorHandler,
  onNoMatch: controller.onNoMatchHandler,
});

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewdSessionObject = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewdSessionObject.token, response);

  const userFound = await user.findOneById(sessionObject.user_id);

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  return response.status(200).json(userFound);
}
