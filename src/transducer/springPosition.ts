import {
  Spring,
  duration as springDuration,
  positionAt as springPositionAt,
} from "@nonphoto/spring";
import {
  duration2 as springDuration2,
  positionAt2 as springPositionAt2,
  VectorSpring,
} from "@nonphoto/spring-vector";
import { comp, map, Transducer } from "@thi.ng/transducers";
import { Vec } from "@thi.ng/vectors";
import { duration } from "./duration";

export function springPosition(
  s: Spring,
  epsilon?: number,
): Transducer<number, number> {
  return comp(
    duration(springDuration(...s, epsilon)),
    map((t) => springPositionAt(...s, t)),
  );
}

export function springPosition2(
  s: VectorSpring,
  epsilon?: number,
): Transducer<number, Vec> {
  return comp(
    duration(Math.max(...springDuration2([], ...s, epsilon ?? 1))),
    map((t) => springPositionAt2([], ...s, t)),
  );
}
