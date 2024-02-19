import type { Range } from "./range";

export type Behavior<T> = (t: number) => T;

const maxDuration = 10_000;
const frameDuration = 1_000 / 60;

let RANGES: Range[] | undefined = undefined;

export function withRange<T>(
  range: Range,
  flat: (ranges: Range[]) => Range[],
  b: Behavior<T>,
): Behavior<T> {
  return (t) => {
    if (RANGES) {
      RANGES = flat([...RANGES, range]);
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

function timeout(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function toAnimationGenerator(
  element: Element,
  prop: string,
  b: Behavior<string>,
  options?: Pick<KeyframeAnimationOptions, "timeline">,
): Generator<Animation | Promise<void>> {
  return (function* () {
    let time = performance.now();
    const [ranges] = getRanges(b, time);
    for (const range of ranges) {
      if (range[1] > time) {
        if (range[0] <= time) {
          while (time < range[1]) {
            const keyframes = [];
            const end = Math.min(range[1], maxDuration);
            while (time <= end) {
              keyframes.push({ [prop]: b(time) });
              time += frameDuration;
            }
            yield element.animate(keyframes, {
              duration: maxDuration,
              easing: "linear",
              ...(options ?? {}),
            });
          }
        } else {
          yield timeout(range[0] - time);
          time = range[0];
        }
      }
    }
  })();
}
