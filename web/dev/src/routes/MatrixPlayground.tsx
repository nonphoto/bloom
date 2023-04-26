import classes from './MatrixPlayground.module.css'
import { mat4, vec2, vec3 } from 'gl-matrix'

function styleTransform(transform: mat4) {
  return `matrix3d(${transform.join(',')})`
}

const rem = 16
const parentSize = 20
const childSize = 10

export default function MatrixPlayground() {
  const layoutVector = vec3.fromValues(
    ((parentSize - childSize) / 2) * rem,
    ((parentSize - childSize) / 2) * rem,
    0,
  )

  const matrix = mat4.create()
  mat4.translate(matrix, matrix, vec3.scale(layoutVector, layoutVector, -1))
  mat4.scale(matrix, matrix, vec3.fromValues(1.5, 1, 1))
  mat4.rotateZ(matrix, matrix, 1)
  mat4.translate(matrix, matrix, vec3.fromValues(5 * rem, -5 * rem, 0))
  mat4.translate(matrix, matrix, vec3.scale(layoutVector, layoutVector, -1))

  return (
    <>
      <div class={classes.scale}>
        <div class={classes.rotate}>
          <div class={classes.translate}></div>
        </div>
      </div>
      <div class={classes.matrix} style={{ transform: styleTransform(matrix) }}></div>
    </>
  )
}
