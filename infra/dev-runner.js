const { spawn, spawnSync } = require("child_process");

// Garante compatibilidade Windows (npm.cmd) vs Linux/Mac (npm)
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

// 1. Inicia o Next.js
// Usamos 'inherit' para você continuar vendo os logs coloridos do Next no terminal
const nextApp = spawn(npm, ["exec", "next", "dev"], { stdio: "inherit" });

// 2. Função de Limpeza
function stopServices() {
  console.log("\n🛑 Encerrando... Parando containers...");

  // Executa o stop de forma Síncrona (trava o terminal até terminar de limpar)
  spawnSync(npm, ["run", "services:stop"], { stdio: "inherit" });

  process.exit();
}

// 3. Captura o Ctrl + C
process.on("SIGINT", stopServices);
process.on("SIGTERM", stopServices);

// Caso o Next.js morra sozinho (erro), também limpa
nextApp.on("exit", stopServices);
