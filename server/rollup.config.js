import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';
import { builtinModules } from 'module';

/** @type {import('rollup').RollupOptions} */
const options = {
  input: 'src/main.ts',
  plugins: [typescript(), commonjs()],
  output: { file: 'dist/main.cjs', format: 'cjs' },
  external: [
    ...builtinModules,
    ...(pkg.dependencies == null ? [] : Object.keys(pkg.dependencies)),
    ...(pkg.devDependencies == null ? [] : Object.keys(pkg.devDependencies)),
    ...(pkg.peerDependencies == null ? [] : Object.keys(pkg.peerDependencies))
  ]
};

export default options;
