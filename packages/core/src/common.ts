type KeyOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

export function fit<T>(
  out: T,
  outWKey: KeyOfType<T, number>,
  outHKey: KeyOfType<T, number>,
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number,
  compare: (a: number, b: number) => number,
) {
  const sx = targetW / sourceW
  const sy = targetH / sourceH
  const s = compare(sx, sy)
  out[outWKey] = (sourceW * s) as never
  out[outHKey] = (sourceH * s) as never
}

export function setAspectRatio<T>(
  out: T,
  outWKey: KeyOfType<T, number>,
  outHKey: KeyOfType<T, number>,
  sourceW: number,
  sourceH: number,
  aspectRatio: number,
  compare: (a: number, b: number) => number,
) {
  const sy = sourceH === 0 ? aspectRatio : (sourceW * aspectRatio) / sourceH
  const s = compare(1, sy)
  out[outWKey] = (sourceW * s) as never
  out[outHKey] = (sourceH * s) as never
}

export function equals(a: number, b: number) {
  return Math.abs(a - b) <= 0.1
}
