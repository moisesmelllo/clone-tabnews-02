import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";

export default [
  // 1. Configuração de arquivos comuns (JavaScript e React)
  {
    files: ["**/*.js", "**/*.jsx"],
    plugins: {
      react: fixupPluginRules(reactPlugin),
      "react-hooks": fixupPluginRules(hooksPlugin),
      "@next/next": fixupPluginRules(nextPlugin),
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.node, // Define process, module, require, console
        ...globals.browser, // Define fetch, window, document
      },
    },
    settings: {
      react: {
        version: "detect", // Resolve o aviso da versão do React
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": "warn",
    },
  },

  // 2. Configuração Específica para Testes (Jest)
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest, // Define describe, test, expect, beforeAll
      },
    },
  },

  // 3. Pastas para ignorar
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**"],
  },
];
