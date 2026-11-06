import {
  defaultDamping,
  defaultStiffness,
  positionAt2,
  VecSpring,
  velocityAt2,
} from "@nonphoto/spring";
import { copy, Vec, zeroes } from "@thi.ng/vectors";

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
}

export function continueSpring2(
  spring: VecSpring | undefined,
  target: Vec | undefined,
  dt: number,
  options?: SpringOptions,
): VecSpring | undefined {
  return target
    ? {
        position: spring ? positionAt2([], spring, dt) : copy(target),
        velocity: spring ? velocityAt2([], spring, dt) : zeroes(2),
        target: copy(target),
        stiffness: options?.stiffness ?? spring?.stiffness ?? defaultStiffness,
        damping: options?.damping ?? spring?.damping ?? defaultDamping,
      }
    : undefined;
}
