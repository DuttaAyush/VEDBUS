import type { Config } from 'jest';

const shared = {
  rootDir: '.',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  verbose: true,
  testTimeout: 30000,
  clearMocks: true,
  restoreMocks: true,
};

const config: Config = {
  testTimeout: 30000,
  coverageReporters: ['text', 'lcov', 'clover'],
  projects: [
    {
      ...shared,
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      setupFiles: ['<rootDir>/tests/setup/unit-env.cjs'],
      collectCoverageFrom: [
        'src/routes/**/*.ts',
        'src/middleware/**/*.ts',
        'src/utils/**/*.ts',
        '!src/server.ts',
        '!src/seed.ts',
      ],
    },
    {
      ...shared,
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      setupFiles: ['<rootDir>/tests/setup/integration-env.cjs'],
      globalTeardown: '<rootDir>/tests/setup/integration-teardown.cjs',
    },
  ],
};

export default config;
