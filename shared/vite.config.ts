import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({ insertTypesEntry: true }),
    checker({
      typescript: true
    })
  ],
  resolve: {
    tsconfigPaths: true
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    sourcemap: 'inline'
  }
});
