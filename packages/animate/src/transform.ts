import { mat2d } from "gl-matrix";

export function toStyleString(m: mat2d) {
  return `matrix(${m.join(", ")})`;
}
