export function log<T>(...args: [T, ...any]) {
  console.log(...args);
  return args[0];
}
