import { takeWhile, Transducer } from "@thi.ng/transducers";

export function duration(ms: number): Transducer<number, number> {
  return takeWhile((t) => t < ms);
}
