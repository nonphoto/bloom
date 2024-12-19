import { map, Transducer } from "@thi.ng/transducers";
import { Properties } from "csstype";

export function keyframes<T extends keyof Properties>(
  property: T,
): Transducer<Properties[T], Keyframe> {
  return map((value) => ({ [property]: value }));
}
