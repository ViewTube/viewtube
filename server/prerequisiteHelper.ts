import chalk from 'chalk';

// Without these, ViewTube won't work
const requiredEnvironmentVariables = [
  { var: 'VIEWTUBE_JWT_SECRET', default: null },
  { var: 'VIEWTUBE_PUBLIC_VAPID', default: null },
  { var: 'VIEWTUBE_PRIVATE_VAPID', default: null }
];

// These have a usable default value
const voluntaryEnvironmentVariables = [
  { var: 'PORT', default: 8066 },
  { var: 'VIEWTUBE_API_URL', default: 'http://localhost:8066/api/' },
  { var: 'VIEWTUBE_DATABASE_HOST', default: 'localhost' },
  { var: 'VIEWTUBE_DATABASE_PORT', default: 27017 },
  { var: 'VIEWTUBE_DATABASE_USER', default: null },
  { var: 'VIEWTUBE_DATABASE_PASSWORD', default: null },
  { var: 'VIEWTUBE_REDIS_HOST', default: 'localhost' },
  { var: 'VIEWTUBE_REDIS_PORT', default: 6379 },
  { var: 'VIEWTUBE_REDIS_PASSWORD', default: null },
  { var: 'VIEWTUBE_JWT_EXPIRATION_TIME', default: 43200 },
  { var: 'VIEWTUBE_ALLOWED_DOMAIN', default: /^viewtube\.io|\.viewtube\.io$/ }
];

// These are not required for ViewTube to run
const availableEnvironmentVariables = [
  { var: 'VIEWTUBE_YOUTUBE_COOKIE', default: null },
  { var: 'VIEWTUBE_YOUTUBE_IDENTIFIER', default: null }
];

export const checkEnvironmentVariables = () => {
  const definedRequired = [];
  const definedVoluntary = [];
  const definedAvailable = [];

  const missingRequired = [];
  const missingVoluntary = [];
  const missingAvailable = [];

  requiredEnvironmentVariables.forEach(envVar => {
    if (process.env[envVar.var] !== undefined) {
      definedRequired.push({ var: envVar.var, value: process.env[envVar.var] });
    } else {
      missingRequired.push(envVar);
    }
  });

  voluntaryEnvironmentVariables.forEach(envVar => {
    if (process.env[envVar.var] !== undefined) {
      definedVoluntary.push({ var: envVar.var, value: process.env[envVar.var] });
    } else {
      missingVoluntary.push(envVar);
      if (envVar.default) {
        process.env[envVar.var] = envVar.default.toString();
      }
    }
  });

  availableEnvironmentVariables.forEach(envVar => {
    if (process.env[envVar.var] !== undefined) {
      definedAvailable.push({ var: envVar.var, value: process.env[envVar.var] });
    } else {
      missingAvailable.push(envVar);
    }
  });

  console.log(chalk.bgBlueBright.white('--- Environment variables ---'));

  if (missingRequired.length > 0) {
    console.log(chalk.bold.bgRed.white('\n! Missing the following required environment variables'));
    logEnvResults(missingRequired);
    process.exit(1);
  }

  if (missingVoluntary.length > 0) {
    console.log(
      chalk.bold.bgYellow.black('\n~ Used default value for the following environment variables')
    );
    logEnvResults(missingVoluntary);
  }

  if (definedRequired.length > 0) {
    console.log(
      chalk.bgGreenBright.black('\n\u2713 Found values for the following environment variables')
    );
    logEnvResults(definedRequired);
    logEnvResults(definedVoluntary);
    logEnvResults(definedAvailable);
  }
};

const logEnvResults = (envArray: Array<any>) => {
  if (envArray.length > 0) {
    const sortedEnvArray = envArray.slice().sort((a, b) => b.var.length - a.var.length);
    let maxStringLength = sortedEnvArray[0].var.length;

    maxStringLength = maxStringLength > 30 ? maxStringLength : 30;

    envArray.forEach(envVar => {
      const whitespace = getWhitespace(maxStringLength - envVar.var.length + 1);
      let val = envVar.value !== undefined ? envVar.value : envVar.default;
      if (val) {
        val = redact(val, envVar.var);
      } else {
        val = chalk.gray.italic('empty');
      }
      console.log(`${chalk.bold(envVar.var)}:${whitespace}${val}`);
    });
  }
};

const getWhitespace = (num: number) => {
  let rString = '';
  for (let i = 0; i < num; i++) {
    rString += ' ';
  }
  return rString;
};

const redact = (value: string, valueName: string) => {
  if (valueName.match(/private|secret|password/i)) {
    return '*****';
  }
  return value;
};
