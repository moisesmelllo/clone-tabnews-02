import database from "../../../../infra/database.js";

async function status(request, response) {
  const result = await database.query("SELECT 1 + 1 as sum;");
  console.log(result.rows);
  response.status(200).json({
    statusCode: response.statusCode,
    url: response.req.url,
    version: response.req.httpVersion,
  });
}

export default status;
