import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { builtinModules } from 'module';

const deps = d => (d ? Object.keys(d) : []);

/** @type {import('rollup').RollupOptions} */
const options = {
  input: 'src/main.ts',
  plugins: [typescript()],
  output: { file: 'dist/main.cjs', format: 'cjs' },
  external: [
    ...builtinModules,
    ...deps(pkg.dependencies),
    ...deps(pkg.devDependencies),
    ...deps(pkg.peerDependencies)
  ]
};

export default options;
