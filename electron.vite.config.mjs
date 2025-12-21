import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// Plugin to copy schema.sql to output
const copySchemaPlugin = () => ({
    name: 'copy-schema',
    closeBundle() {
        const srcPath = resolve('src/main/database/schema.sql');
        const destDir = resolve('out/main/database');
        const destPath = resolve(destDir, 'schema.sql');
        
        if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
        }
        if (existsSync(srcPath)) {
            copyFileSync(srcPath, destPath);
            console.log('[Build] Copied schema.sql to out/main/database/');
        }
    }
});

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin(), copySchemaPlugin()],
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src'),
            },
        },
        plugins: [react()],
    },
});
