import {
  defaultDamping,
  defaultStiffness,
  positionAt,
  positionAt2,
  positionAt3,
  positionAt4,
  Spring,
  VecSpring,
  velocityAt,
  velocityAt2,
  velocityAt3,
  velocityAt4,
} from "@nonphoto/spring";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { copy, Vec, zeroes } from "@thi.ng/vectors";
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
): Accessor<VecSpring | undefined> {
  const clock = new Clock();
  return createMemo((prev) => {
    clock.tick();
    const targetValue = access(target);
    console.log(prev);
    return targetValue
      ? {
          position: prev
            ? positionAt2([], prev, clock.deltaTime)
            : copy(targetValue),
          velocity: prev ? velocityAt2([], prev, clock.deltaTime) : zeroes(2),
          target: copy(targetValue),
          damping: access(options?.damping) ?? defaultDamping,
          stiffness: access(options?.stiffness) ?? defaultStiffness,
        }
      : undefined;
  });
}

export function createSpring3(
  target?: MaybeAccessor<Vec | undefined>,
  options?: {
    stiffness?: MaybeAccessor<number | undefined>;
    damping?: MaybeAccessor<number | undefined>;
  },
): Accessor<VecSpring | undefined> {
  const clock = new Clock();
  return createMemo((prev) => {
    clock.tick();
    const targetValue = access(target);
    return targetValue
      ? {
          position: prev
            ? positionAt3(prev.position, prev, clock.deltaTime)
            : copy(targetValue),
          velocity: prev
            ? velocityAt3(prev.velocity, prev, clock.deltaTime)
            : zeroes(3),
          target: copy(targetValue),
          damping: access(options?.damping) ?? defaultDamping,
          stiffness: access(options?.stiffness) ?? defaultStiffness,
        }
      : undefined;
  });
}

export function createSpring4(
  target?: MaybeAccessor<Vec | undefined>,
  options?: {
    stiffness?: MaybeAccessor<number | undefined>;
    damping?: MaybeAccessor<number | undefined>;
  },
): Accessor<VecSpring | undefined> {
  const clock = new Clock();
  return createMemo((prev) => {
    clock.tick();
    const targetValue = access(target);
    return targetValue
      ? {
          position: prev
            ? positionAt4(prev.position, prev, clock.deltaTime)
            : targetValue,
          velocity: prev
            ? velocityAt4(prev.velocity, prev, clock.deltaTime)
            : zeroes(4),
          target: targetValue,
          damping: access(options?.damping) ?? defaultDamping,
          stiffness: access(options?.stiffness) ?? defaultStiffness,
        }
      : undefined;
  });
}
