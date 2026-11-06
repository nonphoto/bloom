import { take, Transducer } from "@thi.ng/transducers";
import { frameDuration } from "./const";

export function duration(ms: number): Transducer<number, number> {
  return take(Math.ceil(ms / frameDuration));
}
