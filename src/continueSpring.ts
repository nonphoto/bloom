import {
  defaultDamping,
  defaultStiffness,
  positionAt,
  positionAt2,
  velocityAt,
  velocityAt2,
} from "@nonphoto/spring";
import { copy, zeroes } from "@thi.ng/vectors";

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
}

export type GenericSpring<T> = {
  position: T;
  velocity: T;
  target: T;
  stiffness: number;
  damping: number;
};

export type ContinueSpring<V> = (
  spring: GenericSpring<V> | undefined,
  target: V | undefined,
  dt: number,
  options?: SpringOptions,
) => GenericSpring<V> | undefined;

function continueSpringFactory<V>(
  positionAt: (out: V, s: GenericSpring<V>, t: number) => V,
  velocityAt: (out: V, s: GenericSpring<V>, t: number) => V,
  copy: (v: V) => V,
  zero: () => V,
): ContinueSpring<V> {
  return (spring, target, dt, options) =>
    target
      ? {
          position: spring ? positionAt(zero(), spring, dt) : copy(target),
          velocity: spring ? velocityAt(zero(), spring, dt) : zero(),
          target: copy(target),
          stiffness:
            options?.stiffness ?? spring?.stiffness ?? defaultStiffness,
          damping: options?.damping ?? spring?.damping ?? defaultDamping,
        }
      : undefined;
}

export const continueSpring = continueSpringFactory(
  (_, s, t) => positionAt(s, t),
  (_, s, t) => velocityAt(s, t),
  (n) => n,
  () => 0,
);

export const continueSpring2 = continueSpringFactory(
  positionAt2,
  velocityAt2,
  copy,
  () => zeroes(2),
);

export const continueSpring3 = continueSpringFactory(
  positionAt2,
  velocityAt2,
  copy,
  () => zeroes(3),
);

export const continueSpring4 = continueSpringFactory(
  positionAt2,
  velocityAt2,
  copy,
  () => zeroes(4),
);
