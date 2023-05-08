import { vec2 } from 'gl-matrix'
import { Axis } from './axis'

function createAxisFromObject<T extends string | number>(
  object: Record<T, number>,
  positionKey: T,
  velocityKey: T,
): Axis {
  return {
    get x() {
      return object[positionKey]
    },
    set x(value: number) {
      object[positionKey] = value
    },
    get v() {
      return object[velocityKey]
    },
    set v(value: number) {
      object[velocityKey] = value
    },
  }
}

function createAxisFromPair<T extends string | number>(
  position: Record<T, number>,
  velocity: Record<T, number>,
  key: T,
): Axis {
  return {
    get x() {
      return position[key]
    },
    set x(value: number) {
      position[key] = value
    },
    get v() {
      return velocity[key]
    },
    set v(value: number) {
      velocity[key] = value
    },
  }
}

export class Quad {
  translation = vec2.create()
  translationVelocity = vec2.create()
  scaling = vec2.fromValues(1, 1)
  scalingVelocity = vec2.create()
  rotation = 0
  rotationVelocity = 0
  translationX = createAxisFromPair<number>(this.translation, this.translationVelocity, 0)
  translationY = createAxisFromPair<number>(this.translation, this.translationVelocity, 1)
  scalingX = createAxisFromPair<number>(this.scaling, this.scalingVelocity, 0)
  scalingY = createAxisFromPair<number>(this.scaling, this.scalingVelocity, 1)
  rotationAxis: Axis = createAxisFromObject(this, 'rotation', 'rotationVelocity')
}
