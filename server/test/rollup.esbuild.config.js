import esbuild from 'rollup-plugin-esbuild';
import pkg from '../package.json';
import tsPaths from 'rollup-plugin-tsconfig-paths';
import { builtinModules } from 'module';

const deps = d => (d ? Object.keys(d) : []);

/** @type {import('rollup').RollupOptions} */
const options = {
  input: 'src/main.ts',
  plugins: [
    tsPaths(),
    esbuild({
      target: 'esnext'
    })
  ],
  output: { file: 'dist/main.cjs', format: 'cjs' },
  external: [
    ...builtinModules,
    ...deps(pkg.dependencies),
    ...deps(pkg.devDependencies),
    ...deps(pkg.peerDependencies)
  ]
};

export default options;
