import type { Vec2 } from "./gl-matrix";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function create(): Rect {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
}

export function difference(out: Vec2, a: Rect, b: Rect): Vec2 {
  out[0] = b.x + b.width / 2 - (a.x + a.width / 2);
  out[1] = b.y + b.height / 2 - (a.y + a.height / 2);
  return out;
}
