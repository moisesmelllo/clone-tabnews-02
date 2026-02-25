import email from "infra/email.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteAllEmails();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await email.send({
      from: "Curso.live <contato@curso.live>",
      to: "contato@curso.dev",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });

    await email.send({
      from: "Curso.live <contato@curso.live>",
      to: "contato@curso.dev",
      subject: "Ultimo email enviado",
      text: "corpo do ultimo email",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail).toEqual({
      id: 2,
      sender: "<contato@curso.live>",
      recipients: ["<contato@curso.dev>"],
      subject: "Ultimo email enviado",
      size: lastEmail.size,
      created_at: lastEmail.created_at,
      text: "corpo do ultimo email\n",
    });

    expect(Date.parse(lastEmail.created_at)).not.toBeNaN();
  });
});
