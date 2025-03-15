import {
  Spring,
  duration as springDuration,
  duration2 as springDuration2,
  duration3 as springDuration3,
  duration4 as springDuration4,
  velocityAt as springVelocityAt,
  velocityAt2 as springVelocityAt2,
  velocityAt3 as springVelocityAt3,
  velocityAt4 as springVelocityAt4,
  VecSpring,
} from "@nonphoto/spring";
import { comp, map, Transducer } from "@thi.ng/transducers";
import { Vec } from "@thi.ng/vectors";
import { duration } from "./duration";

export function springVelocity(
  s: Spring,
  epsilon?: number,
): Transducer<number, number> {
  return comp(
    duration(springDuration(s, epsilon)),
    map((t) => springVelocityAt(s, t)),
  );
}

export function springVelocity2(
  s: VecSpring,
  epsilon?: number,
): Transducer<number, Vec> {
  return comp(
    duration(springDuration2(s, epsilon ?? 1)),
    map((t) => springVelocityAt2([0, 0], s, t)),
  );
}

export function springVelocity3(
  s: VecSpring,
  epsilon?: number,
): Transducer<number, Vec> {
  return comp(
    duration(springDuration3(s, epsilon ?? 1)),
    map((t) => springVelocityAt3([], s, t)),
  );
}

export function springVelocity4(
  s: VecSpring,
  epsilon?: number,
): Transducer<number, Vec> {
  return comp(
    duration(springDuration4(s, epsilon ?? 1)),
    map((t) => springVelocityAt4([], s, t)),
  );
}
