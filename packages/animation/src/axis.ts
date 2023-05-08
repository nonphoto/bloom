export type Axis = {
  x: number
  v: number
}

export function create() {
  return {
    x: 0,
    v: 0,
  }
}

export function copy(out: Axis, a: Axis) {
  out.x = a.x
  out.v = a.v
  return out
}

export function clone(a: Axis) {
  return copy(create(), a)
}

export function equals(a: Axis, b: Axis) {
  return a.x === b.x && a.v === b.v
}

export function equivalent(
  a: Axis,
  b: Axis,
  positionThreshold: number = 0.001,
  velocityThreshold: number = 0.001,
) {
  return Math.abs(b.v - a.v) <= velocityThreshold && Math.abs(b.x - a.x) <= positionThreshold
}
