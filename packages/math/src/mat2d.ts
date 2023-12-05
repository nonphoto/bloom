import type { Vec2, Mat2d } from '@nonphoto/gl-matrix'

export function decompose(
  outTranslation: Vec2,
  outScaling: Vec2,
  outShearing: Vec2,
  mat: Mat2d,
): number | null {
  const a = mat[0]
  const b = mat[1]
  const c = mat[2]
  const d = mat[3]
  const e = mat[4]
  const f = mat[5]

  const delta = a * d - b * c

  outTranslation[0] = e
  outTranslation[1] = f

  if (a != 0 || b != 0) {
    const r = Math.sqrt(a * a + b * b)
    outScaling[0] = r
    outScaling[1] = delta / r
    outShearing[0] = Math.atan((a * c + b * d) / (r * r))
    outShearing[1] = 0
    return b > 0 ? Math.acos(a / r) : -Math.acos(a / r)
  } else if (c != 0 || d != 0) {
    const s = Math.sqrt(c * c + d * d)
    outScaling[0] = delta / s
    outScaling[1] = s
    outShearing[0] = 0
    outShearing[1] = Math.atan((a * c + b * d) / (s * s))
    return Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s))
  } else {
    return null
  }
}
