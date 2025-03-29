import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm', // <- use ESM preset
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { useESM: true, tsconfig: '<rootDir>/tsconfig.jest.json' },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.jsx?$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

export default config;
