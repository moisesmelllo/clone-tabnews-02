const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const jestConfig = async () => {
  // 1. Gera a configuração base do Next.js
  const nextJestConfigFunction = createJestConfig({
    moduleDirectories: ["node_modules", "<rootDir>"],
  });

  // 2. Captura o objeto de configuração final
  const config = await nextJestConfigFunction();

  // 3. FORÇA a alteração na regra de ignorar arquivos
  // O padrão do Jest é ignorar TODA a node_modules.
  // A regex abaixo diz: "Ignore node_modules, EXCETO (?!...) a pasta uuid"
  config.transformIgnorePatterns = [
    "/node_modules/(?!uuid)/",
    "^.+\\.module\\.(css|sass|scss)$", // Mantém o suporte a CSS Modules
  ];

  config.testTimeout = 60000;

  return config;
};

module.exports = jestConfig;
