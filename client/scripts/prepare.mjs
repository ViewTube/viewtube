import { execSync } from 'child_process';

const commands = [
  'pnpm -w run build:shared',
  'pnpm -w run build:metadata',
  'pnpm -w run nuxt:prepare'
];

if (process.env.CI !== 'true') {
  commands.forEach(command => {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(error);
    }
  });
}
