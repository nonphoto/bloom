export type Entity = {
  x: number
  v: number
}

export function create() {
  return { x: 0, v: 0 }
}

export function copy(out: Entity, a: Entity) {
  out.x = a.x
  out.v = a.v
  return out
}

export function clone(a: Entity) {
  return copy(create(), a)
}

export function equals(a: Entity, b: Entity) {
  return a.x === b.x && a.v === b.v
}

export function equivalent(
  a: Entity,
  b: Entity,
  positionThreshold: number = 0.001,
  velocityThreshold: number = 0.001,
) {
  return Math.abs(b.v - a.v) <= velocityThreshold && Math.abs(b.x - a.x) <= positionThreshold
}
