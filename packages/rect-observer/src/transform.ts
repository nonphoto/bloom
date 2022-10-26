import type { Mat2d } from "./gl-matrix";

export function toStyleString(m: Mat2d) {
  return `matrix(${m.join(", ")})`;
}
