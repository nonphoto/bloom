import { mat2d, vec2 } from 'gl-matrix'

export function borderRadius(radius: number, size: vec2, transform: mat2d) {
  const x = (radius / (size[0] * transform[0])) * 100
  const y = (radius / (size[1] * transform[3])) * 100
  return `${x}% / ${y}%`
}

export function boxShadow(
  inset: boolean,
  offsetX: number,
  offsetY: number,
  blurRadius: number,
  spreadRadius: number,
  color: string,
  transform: mat2d,
) {
  const meanScale = (transform[0] + transform[3]) / 2
  return `${inset ? 'inset ' : ''}${offsetX / transform[0]}px ${offsetY / transform[3]}px ${
    blurRadius / meanScale
  }px ${spreadRadius / meanScale}px ${color}`
}

export function transform(m: mat2d) {
  return `matrix(${m.join(', ')})`
}

export function getScaling(out: vec2, a: mat2d) {
  let m11 = a[0]
  let m12 = a[1]
  let m21 = a[2]
  let m22 = a[3]
  out[0] = Math.hypot(m11, m12)
  out[1] = Math.hypot(m21, m22)
  return out
}
