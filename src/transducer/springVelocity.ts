import {
  Spring,
  duration as springDuration,
  velocityAt as springVelocityAt,
} from "@nonphoto/spring";
import {
  duration2 as springDuration2,
  velocityAt2 as springVelocityAt2,
  VectorSpring,
} from "@nonphoto/spring-vector";
import { comp, map, Transducer } from "@thi.ng/transducers";
import { Vec } from "@thi.ng/vectors";
import { duration } from "./duration";

export function springVelocity(
  s: Spring,
  epsilon?: number,
): Transducer<number, number> {
  return comp(
    duration(springDuration(...s, epsilon)),
    map((t) => springVelocityAt(...s, t)),
  );
}

export function springVelocity2(
  s: VectorSpring,
  epsilon?: number,
): Transducer<number, Vec> {
  return comp(
    duration(Math.max(...springDuration2([], ...s, epsilon ?? 1))),
    map((t) => springVelocityAt2([], ...s, t)),
  );
}
