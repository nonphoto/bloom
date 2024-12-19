import { range } from "@thi.ng/transducers";
import { frameDuration } from "./const";

export function time() {
  return range(0, Infinity, frameDuration);
}
