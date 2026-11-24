import { clock, Clock, tick } from "./clock";

export type Chain<T, U> = {
  clock: Clock;
  acc: T;
  reduce: (acc: T, value: U, deltaTime: number) => T;
};

export function chain<T, U>(value: T, reduce: Chain<T, U>["reduce"]) {
  return {
    clock: clock(),
    value,
    reduce,
  };
}

export function step<T, U, V extends U>(
  prev: Chain<T, U>,
  value: V,
): Chain<T, U> {
  const clock = tick(prev.clock);
  return {
    clock,
    acc: prev.reduce(prev.acc, value, clock.deltaTime),
    reduce: prev.reduce,
  };
}
