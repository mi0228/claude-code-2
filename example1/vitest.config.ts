import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // happy-domをテスト環境として使用（ブラウザ環境を模擬）
    environment: 'happy-dom',
    // グローバル設定（describe, it, expectなどをインポート不要にする）
    globals: true,
    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/app/api/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
    },
  },
  resolve: {
    // Next.jsのパスエイリアス（@/*）を解決
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
