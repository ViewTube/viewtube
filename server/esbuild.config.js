import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

esbuild.build({

}).catch(error => {
  console.error(error);
  process.exit(1);
});