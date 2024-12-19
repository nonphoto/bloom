import { Rect } from "@thi.ng/geom";
import { Mat } from "@thi.ng/matrices";

/**
 * This is basically dividing one Rect by another
 */
export function untransform(a: Rect, b: Rect, out: Mat): Mat {
  out[0] = b.size[0] / a.size[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = b.size[1] / a.size[1];
  out[4] = b.pos[0] + b.size[0] / 2 - (a.pos[0] + a.size[0] / 2);
  out[5] = b.pos[1] + b.size[1] / 2 - (a.pos[1] + a.size[1] / 2);
  return out;
}
