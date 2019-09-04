export const sleep = (ms: number) =>
  // tslint:disable-next-line: no-string-based-set-timeout
  new Promise((resolve, reject) => setTimeout(resolve, ms));
