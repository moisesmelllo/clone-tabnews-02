/* eslint-disable no-console */
import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database";
import runMigrations from "models/migrator";
import user from "models/user";
import session from "models/session";

const emailhttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  try {
    await waitForWebServer();
    await waitForEmailServer();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function waitForWebServer() {
  return retry(fetchStatusPage, {
    retries: 100,
    maxTimeout: 1000,
  });

  async function fetchStatusPage() {
    const response = await fetch("http://localhost:3000/api/v1/status");

    if (response.status !== 200) {
      throw new Error(`Status code incorreto: ${response.status}`);
    }
  }
}

async function waitForEmailServer() {
  return retry(fetchEmailPage, {
    retries: 100,
    maxTimeout: 1000,
  });

  async function fetchEmailPage() {
    const response = await fetch(emailhttpUrl);

    if (response.status !== 200) {
      throw new Error(`Status code incorreto: ${response.status}`);
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await runMigrations({ dryRun: false });
}

async function createUser(userObject = {}) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "validpassword",
  });
}

async function deleteAllEmails() {
  await fetch(`${emailhttpUrl}/messages`, {
    method: "DELETE",
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailhttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();

  const lastEmailItem = emailListBody.pop();
  const emailTextResponse = await fetch(
    `${emailhttpUrl}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();

  lastEmailItem.text = emailTextBody;
  return lastEmailItem;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
};
export default orchestrator;
