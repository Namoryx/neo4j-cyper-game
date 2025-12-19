import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/neo4j-cyper-game/',
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    include: ['src/test/**/*.{test,spec}.{js,jsx,ts,tsx}']
  }
});
