const { exec } = require("node:child_process");

function checkForPostgres() {
  const result = exec(
    "docker exec postgres-dev pg_isready --host localhost",
    callBackFunction,
  );

  function callBackFunction(stderr, stdout) {
    if (stdout.includes("accepting connections")) {
      console.log("\n\n🟢 Banco esta pronto para receber conexôes");
      return true;
    }
    process.stdout.write(".");
    checkForPostgres();
  }
}

process.stdout.write(
  "\n\n🔴 Aguardando banco estar pronto para receber conexôes",
);
checkForPostgres();
