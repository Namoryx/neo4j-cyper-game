import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_REPO_NAME = 'neo4j-cyper-game';

export default defineConfig(({ command }) => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || DEFAULT_REPO_NAME;
  // GitHub Pages는 repo 하위 경로를 사용하므로, 빌드 시 base를 자동으로 맞춥니다.
  // 하지만 정적 호스팅/파일 미러 환경에서도 404가 발생하지 않도록, 빌드 시에는
  // 항상 상대 경로(`./`)를 사용해 번들을 참조합니다.
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
