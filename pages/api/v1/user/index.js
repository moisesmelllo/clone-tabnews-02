import { createRouter } from "next-connect";
import controller from "infra/controller";
import session from "models/session";
import user from "models/user";
import authorization from "models/authorization";
import { ForbiddenError } from "infra/errors";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest("read:session"), getHandler)
  .handler({
    onError: controller.onErrorHandler,
    onNoMatch: controller.onNoMatchHandler,
  });

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const userObject = await user.findOneById(sessionObject.user_id);

  if (!authorization.can(userObject, "create:session")) {
    throw new ForbiddenError({
      message: "Você não possui permissão para fazer login",
      action: "Contate o suporte caso você acredite que isto seja um erro.",
    });
  }

  const renewdSessionObject = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewdSessionObject.token, response);

  const userFound = await user.findOneById(sessionObject.user_id);

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user:self",
    userFound,
  );
  return response.status(200).json(secureOutputValues);
}
