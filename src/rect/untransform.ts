import { Rect } from "@thi.ng/geom";
import { Mat } from "@thi.ng/matrices";

export function untransform23(out: Mat, a: Rect, b: Rect): Mat {
  out[0] = b.size[0] / a.size[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = b.size[1] / a.size[1];
  out[4] = b.pos[0] + b.size[0] / 2 - (a.pos[0] + a.size[0] / 2);
  out[5] = b.pos[1] + b.size[1] / 2 - (a.pos[1] + a.size[1] / 2);
  return out;
}

export function untransform33(out: Mat, a: Rect, b: Rect): Mat {
  out[0] = b.size[0] / a.size[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = b.size[1] / a.size[1];
  out[5] = 0;
  out[6] = b.pos[0] + b.size[0] / 2 - (a.pos[0] + a.size[0] / 2);
  out[7] = b.pos[1] + b.size[1] / 2 - (a.pos[1] + a.size[1] / 2);
  out[8] = 1;
  return out;
}
