/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/valid-title */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-export */

export const defineIt = (name: string, fn?: jest.ProvidesCallback, timeout?: number): void => {
  name = name.replace('GET', '[48;2;97;175;254m[38;2;255;255;255mGET[39m[49m');
  name = name.replace('POST', '[48;2;73;204;144m[38;2;255;255;255mPOST[39m[49m');
  name = name.replace('PUT', '[48;2;252;161;48m[38;2;255;255;255mPUT[39m[49m');
  name = name.replace('DELETE', '[48;2;249;62;62m[38;2;255;255;255mDELETE[39m[49m');

  return it(name, fn, timeout);
};

export const getPayloadJson = <T = any>(payload: string): T => {
  const payloadString = payload;
  const payloadJson = JSON.parse(payloadString);
  return payloadJson;
};
