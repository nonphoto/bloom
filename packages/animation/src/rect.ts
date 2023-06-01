import { mat2d } from 'gl-matrix'

export class Rect extends DOMRect {
  static divide(out: mat2d, a: Rect, b: Rect) {
    out[0] = a.width / b.width
    out[1] = 0
    out[2] = 0
    out[3] = a.height / b.height
    out[4] = a.x + a.width / 2 - (b.x + b.width / 2)
    out[5] = a.y + a.height / 2 - (b.y + b.height / 2)
    return out
  }
}
