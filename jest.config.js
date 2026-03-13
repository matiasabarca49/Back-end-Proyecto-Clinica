export default {
  testEnvironment: 'node',    // Tests corren en Node.js (no navegador)
  transform: {},              // No transformar código (ya usamos ES modules)
  setupFilesAfterEnv: ["./__test__/jest.setup.js"], // Archivo para setup global de tests
  testMatch: ["**/__test__/**/*.test.js"], // Dónde buscar los archivos de test
  silent: true, // Evitar logs innecesarios durante los tests
  verbose: true, // No mostrar detalles de cada test a menos que fallen
};