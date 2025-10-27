/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>'],
    moduleNameMapper: {
        // This setup allows Jest to understand aliased paths if needed in the future.
        // For now, it's a standard setup.
    },
};

export default config;