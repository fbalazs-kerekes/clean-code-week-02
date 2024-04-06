module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/test/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    collectCoverage: false,
    collectCoverageFrom: ["<rootDir>/src/*.ts"],
    coverageThreshold: {
      global: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  };