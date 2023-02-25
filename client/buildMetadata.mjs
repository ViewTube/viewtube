import { exec } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const outFile = 'buildMetadata.json';

exec(`git log --no-decorate --pretty=format:'%H;%h;%s -n 1`, (_, stdout) => {
  const [commit, abbreviated_commit, subject] = stdout.split(';');
  const metadata = {
    commit,
    abbreviated_commit,
    subject
  };
  writeFileSync(outFile, JSON.stringify(metadata, null, 2));
});
