import {
  Spring,
  Spring2,
  duration as springDuration,
  duration2 as springDuration2,
  positionAt as springPositionAt,
  positionAt2 as springPositionAt2,
} from "@nonphoto/spring";
import { comp, map, Transducer } from "@thi.ng/transducers";
import { Vec } from "@thi.ng/vectors";
import { duration } from "./duration";

export function springPosition(
  s: Spring,
  epsilon?: number,
): Transducer<number, number> {
  return comp(
    duration(springDuration(s, epsilon)),
    map((t) => springPositionAt(s, t)),
  );
}

export function springPosition2(
  s: Spring2 | undefined,
  epsilon?: number,
): Transducer<number, Vec | undefined> {
  return comp(
    duration(s ? springDuration2(s, epsilon ?? 1) : 0),
    map((t) => (s ? springPositionAt2([0, 0], s, t) : undefined)),
  );
}
