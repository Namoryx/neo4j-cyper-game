import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_REPO_NAME = 'neo4j-cyper-game';

export default defineConfig(({ command }) => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || DEFAULT_REPO_NAME;
  // GitHub Pages는 repo 하위 경로를 사용하므로, 빌드 시 base를 자동으로 맞춥니다.
  // 절대 경로 대신 상대 경로를 사용해 404(main.jsx) 오류를 방지합니다.
  const base = command === 'build' ? './' : '/';

  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'docs',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app.js',
          chunkFileNames: 'assets/chunk-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'assets/app.css';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      emptyOutDir: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      globals: true,
      include: ['src/test/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    },
  };
});
