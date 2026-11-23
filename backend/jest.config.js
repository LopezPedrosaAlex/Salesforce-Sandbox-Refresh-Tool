module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Coverage configuration
    collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/**/*.spec.js', '!node_modules/**'],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },

    // Module name mapper for aliases
    moduleNameMapper: {
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@enums/(.*)$': '<rootDir>/src/enums/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1'
    },

    // Test match patterns
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

    // Setup files
    setupFilesAfterEnv: [],

    // Verbose output
    verbose: true,

    // Clear mocks between tests
    clearMocks: true,

    // Reset mocks between tests
    resetMocks: true,

    // Restore mocks between tests
    restoreMocks: true
};
