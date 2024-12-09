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
import {
  comp,
  iterator,
  map,
  multiplex,
  partition,
  range,
  syncTuples,
  takeWhile,
  Transducer,
  TxLike,
} from "@thi.ng/transducers";
import { Vec } from "@thi.ng/vectors";
import { Properties } from "csstype";

const maxKeyframes = 60;
const frameDuration = 1_000 / 30;

export type CSSPropertyIterables = {
  [K in keyof Properties]: Iterable<Properties[K]>;
};

export type AnimateOptions =
  | Omit<KeyframeAnimationOptions, "duration" | "delay" | "easing">
  | undefined;

export function keyframes<T extends keyof Properties>(
  property: T,
): Transducer<Properties[T], Keyframe> {
  return map((value) => ({ [property]: value }));
}

export function animation(
  target: Element,
  options: AnimateOptions = {},
): Transducer<Keyframe, Animation> {
  return comp(
    partition(maxKeyframes + 1, maxKeyframes, true),
    map(
      (keyframes) =>
        new Animation(
          new KeyframeEffect(target, keyframes, {
            ...options,
            duration: keyframes.length * frameDuration,
          }),
        ),
    ),
  );
}

export function time() {
  return range(0, Infinity, frameDuration);
}

export async function run(
  tx: Transducer<number, Animation>,
  fnx: (animation: Animation) => void,
): Promise<void> {
  for (let animation of iterator(tx, time())) {
    animation.play();
    fnx(animation);
    await animation.finished;
  }
}

export function tuples<T, A, B>(
  a: TxLike<T, A>,
  b: TxLike<T, B>,
): Transducer<T, [A, B]>;
export function tuples<T, A, B, C>(
  a: TxLike<T, A>,
  b: TxLike<T, B>,
  c: TxLike<T, C>,
): Transducer<T, [A, B, C]>;
export function tuples(...args: any[]): any {
  return comp(
    multiplex(...(args as [TxLike<number, number>])),
    takeWhile((v) => v.some((x) => x != null)),
    syncTuples(args.length),
  );
}

export function delay(ms: number): Transducer<number, number> {
  return map((t) => t - ms);
}

export function duration(ms: number): Transducer<number, number> {
  return takeWhile((t) => t < ms);
}

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
