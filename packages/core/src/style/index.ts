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
