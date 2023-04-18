import { mat2d, vec2 } from "gl-matrix";

function getScaling(out: vec2, a: mat2d) {
  let m11 = a[0];
  let m12 = a[1];
  let m21 = a[2];
  let m22 = a[3];
  out[0] = Math.hypot(m11, m12);
  out[1] = Math.hypot(m21, m22);
  return out;
}
