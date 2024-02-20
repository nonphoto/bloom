import type { Range } from "./range";

export type Behavior<T> = (t: number) => T;

const maxDuration = 10_000;
const frameDuration = 1_000 / 60;

let RANGES: Range[] | undefined = undefined;

export function withRanges<T>(
  fn: (ranges: Range[]) => Range[],
  b: Behavior<T>,
): Behavior<T> {
  return (t) => {
    if (RANGES) {
      RANGES = fn(RANGES);
    }
    return b(t);
  };
}

export function getRanges<T>(b: Behavior<T>, t: number): [Range[], T] {
  let prevRanges = RANGES;
  RANGES = [];
  const value = b(t);
  const ranges = RANGES;
  RANGES = prevRanges;
  return [ranges, value];
}

export function toAnimationGenerator(
  element: Element,
  prop: string,
  b: Behavior<string>,
  options?: Pick<KeyframeAnimationOptions, "timeline">,
): Generator<Animation> {
  return (function* () {
    let time = performance.now();
    const [ranges] = getRanges(b, time);
    for (const range of ranges) {
      console.log(range[0], range[1]);
      if (time >= range[0]) {
        while (time < range[1]) {
          const keyframes = [];
          const end = Math.min(range[1], maxDuration);
          while (time < end) {
            keyframes.push({ [prop]: b(time) });
            time += frameDuration;
          }
          console.log(keyframes);
          yield element.animate(keyframes, {
            duration: maxDuration,
            easing: "linear",
            ...(options ?? {}),
          });
        }
      } else {
        yield element.animate(null, { duration: range[0] - time });
        time = range[0];
      }
    }
  })();
}
