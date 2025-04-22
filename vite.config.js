import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(() => {
    return {
        build: {
            target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
            sourcemap: true,
            lib: {
                entry: resolve(__dirname, 'src/index.ts'),
                name: 'PerfectCache',
                formats: ['es', 'cjs'],
                fileName: (format) => `perfect-cache.${format}.js`,
            },
        },
        plugins: [
            dts({
                entryRoot: resolve(__dirname, './src'),
                tsconfigPath: './tsconfig.app.json',
                outDir: resolve(__dirname, 'dist', 'typings'),
            }),
        ],
    };
});
