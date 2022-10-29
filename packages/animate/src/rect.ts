import { vec2, mat2d } from "gl-matrix";

export type Rect = {
  position: vec2;
  size: vec2;
};

export function create() {
  return {
    position: vec2.create(),
    size: vec2.create(),
  };
}

export function fromDOMRect(out: Rect, source: DOMRect) {
  out.position[0] = source.x + source.width / 2;
  out.position[1] = source.y + source.height / 2;
  out.size[0] = source.width;
  out.size[1] = source.height;
  return out;
}

export function divide(out: mat2d, a: Rect, b: Rect) {
  out[0] = a.size[0] / b.size[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = a.size[1] / b.size[1];
  out[4] = a.position[0] - b.position[0];
  out[5] = a.position[1] - b.position[1];
  return out;
}

export function fit(
  out: Rect,
  a: Rect,
  b: Rect,
  compare: (a: number, b: number) => number
) {
  const sx = a.size[0] / b.size[0];
  const sy = a.size[1] / b.size[1];
  vec2.copy(out.position, a.position);
  vec2.scale(out.size, b.size, compare(sx, sy));
  return out;
}

export function contain(out: Rect, a: Rect, b: Rect) {
  return fit(out, a, b, Math.min);
}

export function cover(out: Rect, a: Rect, b: Rect) {
  return fit(out, a, b, Math.max);
}

export function copy(out: Rect, a: Rect) {
  vec2.copy(out.position, a.position);
  vec2.copy(out.size, a.size);
  return out;
}

export function clone(a: Rect) {
  return copy(create(), a);
}
