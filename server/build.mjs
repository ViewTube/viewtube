import { build } from 'esbuild';
import { esbuildDecorators } from '@anatine/esbuild-decorators';
import { builtinModules } from 'module';
import pkg from './package.json' assert {type: "json"};

const deps = d => (d ? Object.keys(d) : []);

async function myBuilder(tsconfig, entryPoints, outfile, cwd = process.cwd()) {
  const buildResult = await build({
    platform: 'node',
    target: 'node18',
    bundle: true,
    sourcemap: 'external',
    plugins: [
      esbuildDecorators({
        tsconfig,
        cwd
      })
    ],
    tsconfig,
    entryPoints,
    outfile,
    external: [...builtinModules, ...deps(pkg.dependencies), ...deps(pkg.devDependencies)]
  });
  console.log(buildResult);
}

myBuilder('./tsconfig.json', ['./src/main.ts'], './dist/main.cjs');
