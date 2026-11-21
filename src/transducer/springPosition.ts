import {
  duration as springDuration,
  duration2 as springDuration2,
  duration3 as springDuration3,
  duration4 as springDuration4,
  positionAt,
  positionAt2,
  positionAt3,
  positionAt4,
} from "@nonphoto/spring";
import { comp, map, Transducer } from "@thi.ng/transducers";
import { Vec } from "@thi.ng/vectors";
import { duration } from "./duration";
import { GenericSpring } from "../continueSpring";

export type SpringPositionTx<T> = (
  s: GenericSpring<T>,
  epsilon?: number,
) => Transducer<number, T>;

export function springPositionTx(
  s: GenericSpring<number>,
  epsilon?: number,
): Transducer<number, number> {
  return comp(
    duration(springDuration(s, epsilon)),
    map((t) => positionAt(s, t)),
  );
}

export function springPositionTx2(
  s: GenericSpring<Vec>,
  epsilon?: number,
): Transducer<number, Vec> {
  return comp(
    duration(springDuration2(s, epsilon)),
    map((t) => positionAt2([], s, t)),
  );
}

export function springPositionTx3(
  s: GenericSpring<Vec>,
  epsilon?: number,
): Transducer<number, Vec> {
  return comp(
    duration(springDuration3(s, epsilon)),
    map((t) => positionAt3([], s, t)),
  );
}

export function springPositionTx4(
  s: GenericSpring<Vec>,
  epsilon?: number,
): Transducer<number, Vec> {
  return comp(
    duration(springDuration4(s, epsilon)),
    map((t) => positionAt4([], s, t)),
  );
}
