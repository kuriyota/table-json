import { defineConfig } from 'vite';
import ts from '@rollup/plugin-typescript';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'TableJSON',
      formats: ['es', 'umd', 'cjs'],
      fileName: (format) => `main.${format}.js`
    }
  },
  plugins: [ts()]
});
