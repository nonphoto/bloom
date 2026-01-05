import {
  Spring,
  duration as springDuration,
  duration2 as springDuration2,
  duration3 as springDuration3,
  duration4 as springDuration4,
  positionAt as springPositionAt,
  positionAt2 as springPositionAt2,
  positionAt3 as springPositionAt3,
  positionAt4 as springPositionAt4,
  VecSpring,
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
  s: VecSpring | undefined,
  epsilon?: number,
): Transducer<number, Vec | undefined> {
  console.log(s, s ? springDuration2(s) : undefined);
  return comp(
    duration(s ? springDuration2(s, epsilon) : 0),
    map((t) => (s ? springPositionAt2([], s, t) : undefined)),
  );
}

export function springPosition3(
  s: VecSpring | undefined,
  epsilon?: number,
): Transducer<number, Vec | undefined> {
  return comp(
    duration(s ? springDuration3(s, epsilon) : 0),
    map((t) => (s ? springPositionAt3([], s, t) : undefined)),
  );
}

export function springPosition4(
  s: VecSpring | undefined,
  epsilon?: number,
): Transducer<number, Vec | undefined> {
  return comp(
    duration(s ? springDuration4(s, epsilon) : 0),
    map((t) => (s ? springPositionAt4([], s, t) : undefined)),
  );
}
