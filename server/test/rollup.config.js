import typescript from 'rollup-plugin-typescript2';
import pkg from '../package.json';
import run from '@rollup/plugin-run';
import { builtinModules } from 'module';

const deps = d => (d ? Object.keys(d) : []);

const watch = process.env.ROLLUP_WATCH;

/** @type {import('rollup').RollupOptions} */
const options = {
  input: 'src/main.ts',
  plugins: [typescript(), watch ? run() : null],
  output: { file: 'dist/main.cjs', format: 'cjs' },
  external: [
    ...builtinModules,
    ...deps(pkg.dependencies),
    ...deps(pkg.devDependencies),
    ...deps(pkg.peerDependencies)
  ]
};

export default options;
