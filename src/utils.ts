import { access, MaybeAccessor } from "@solid-primitives/utils";

const maybeError = new Error();

export function throwMaybe<T>(value: T | undefined): T {
  if (value != null) {
    return value;
  } else {
    throw maybeError;
  }
}

export function catchMaybe<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch (error) {
    if (error === maybeError) {
      return undefined;
    } else {
      throw error;
    }
  }
}

export function maybe<T, U>(
  accessor: MaybeAccessor<T | undefined>,
  fn: (value: T) => U,
): U | undefined {
  const value = access(accessor);
  return value ? fn(value) : undefined;
}

export function log<T>(...args: [T, ...any]) {
  console.log(...args);
  return args[0];
}
