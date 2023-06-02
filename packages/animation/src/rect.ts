import { mat2d } from 'gl-matrix'

interface RectLike {
  x: number
  y: number
  width: number
  height: number
}

export class Rect implements RectLike {
  x: number
  y: number
  width: number
  height: number

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  static divide(out: mat2d, a: Rect, b: Rect) {
    out[0] = a.width / b.width
    out[1] = 0z
    out[2] = 0
    out[3] = a.height / b.height
    out[4] = a.x + a.width / 2 - (b.x + b.width / 2)
    out[5] = a.y + a.height / 2 - (b.y + b.height / 2)
    return out
  }
}
