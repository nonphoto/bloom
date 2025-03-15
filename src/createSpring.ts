import {
  defaultDamping,
  defaultStiffness,
  positionAt,
  positionAt2,
  Spring,
  Spring2,
  velocityAt,
  velocityAt2,
} from "@nonphoto/spring";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Vec } from "@thi.ng/vectors";
import { Accessor, createMemo } from "solid-js";
import { Clock } from "./clock";

export function createSpring(
  target?: MaybeAccessor<number | undefined>,
  options?: {
    stiffness?: MaybeAccessor<number | undefined>;
    damping?: MaybeAccessor<number | undefined>;
  },
): Accessor<Spring | undefined> {
  const clock = new Clock();
  return createMemo((prev) => {
    clock.tick();
    const targetValue = access(target);
    return targetValue
      ? {
          position: prev ? positionAt(prev, clock.deltaTime) : targetValue,
          velocity: prev ? velocityAt(prev, clock.deltaTime) : 0,
          target: targetValue,
          damping: access(options?.damping) ?? defaultDamping,
          stiffness: access(options?.stiffness) ?? defaultStiffness,
        }
      : undefined;
  });
}

export function createSpring2(
  target?: MaybeAccessor<Vec | undefined>,
  options?: {
    stiffness?: MaybeAccessor<number | undefined>;
    damping?: MaybeAccessor<number | undefined>;
  },
): Accessor<Spring2 | undefined> {
  const clock = new Clock();
  return createMemo((prev) => {
    clock.tick();
    const targetValue = access(target);
    return targetValue
      ? {
          position: prev
            ? positionAt2([0, 0], prev, clock.deltaTime)
            : targetValue,
          velocity: prev ? velocityAt2([0, 0], prev, clock.deltaTime) : 0,
          target: targetValue,
          damping: access(options?.damping) ?? defaultDamping,
          stiffness: access(options?.stiffness) ?? defaultStiffness,
        }
      : undefined;
  });
}

export function createSpring3(
  target?: MaybeAccessor<Vec | undefined>,
  damping?: MaybeAccessor<number | undefined>,
  criticality?: MaybeAccessor<number | undefined>,
): Accessor<VectorSpring> {
  const clock = new Clock();
  return createMemo(
    (prev) => {
      clock.tick();
      return prev
        ? setValues3(
            prev,
            positionAt3([], ...prev, clock.deltaTime),
            velocityAt3([], ...prev, clock.deltaTime),
            access(target),
            access(damping),
            access(criticality),
          )
        : fromValues3(
            undefined,
            undefined,
            access(target),
            access(damping),
            access(criticality),
          );
    },
    undefined,
    { equals: false },
  );
}

export function createSpring4(
  target?: MaybeAccessor<Vec | undefined>,
  damping?: MaybeAccessor<number | undefined>,
  criticality?: MaybeAccessor<number | undefined>,
): Accessor<VectorSpring> {
  const clock = new Clock();
  return createMemo(
    (prev) => {
      clock.tick();
      return prev
        ? setValues4(
            prev,
            positionAt4([], ...prev, clock.deltaTime),
            velocityAt4([], ...prev, clock.deltaTime),
            access(target),
            access(damping),
            access(criticality),
          )
        : fromValues4(
            undefined,
            undefined,
            access(target),
            access(damping),
            access(criticality),
          );
    },
    undefined,
    { equals: false },
  );
}
