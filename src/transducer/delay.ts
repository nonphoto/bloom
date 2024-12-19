import { map, Transducer } from "@thi.ng/transducers";

export function delay(ms: number): Transducer<number, number> {
  return map((t) => t - ms);
}
