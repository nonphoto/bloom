import {
  Spring,
  Spring2,
  duration as springDuration,
  duration2 as springDuration2,
  velocityAt as springVelocityAt,
  velocityAt2 as springVelocityAt2,
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
  s: Spring2,
  epsilon?: number,
): Transducer<number, Vec> {
  return comp(
    duration(springDuration2(s, epsilon ?? 1)),
    map((t) => springVelocityAt2([0, 0], s, t)),
  );
}
