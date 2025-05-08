import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['./tests/**/*.{test,spec}.ts'],
        name: 'perfect-cache',
        browser: {
            enabled: true,
            provider: 'playwright', // or 'webdriverio'
            // at least one instance is required
            instances: [{ browser: 'chromium' }],
        },
        coverage: {
            enabled: true,
            include: ['src/**/*.{ts,js}'],
            provider: 'v8', // or 'istanbul'
        },
    },
});
