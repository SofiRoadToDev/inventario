module.exports = {
  testEnvironment: 'node',
  globalSetup: './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',
  setupFilesAfterEnv: ['./tests/global-test-setup.js'], // Ejecuta esto después del setup del entorno
  transform: {}, // Evita transformaciones automáticas que pueden causar conflictos de módulos
};