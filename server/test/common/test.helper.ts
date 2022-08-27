/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/valid-title */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-export */
import chalk from 'chalk';

export const defineIt = (name: string, fn?: jest.ProvidesCallback, timeout?: number): void => {
  name = chalkHex(name, 'GET', '#61affe');
  name = chalkHex(name, 'POST', '#49cc90');
  name = chalkHex(name, 'PUT', '#fca130');
  name = chalkHex(name, 'DELETE', '#f93e3e');

  return it(name, fn, timeout);
};

export const getPayloadJson = <T = any>(payload: string): T => {
  const payloadString = payload;
  const payloadJson = JSON.parse(payloadString);
  return payloadJson;
};

const chalkHex = (input: string, repl: string, hex: string): string =>
  input.replace(repl, chalk.bgHex(hex).hex('#ffffff')(repl));
