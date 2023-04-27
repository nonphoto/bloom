import classes from './MatrixPlayground.module.css'
import { mat4, quat, vec2, vec3 } from 'gl-matrix'

function styleTransform(transform: mat4) {
  return `matrix3d(${transform.join(',')})`
}

const rem = 16

export default function MatrixPlayground() {
  const scaling = mat4.fromRotationTranslationScaleOrigin(
    mat4.create(),
    quat.create(),
    vec3.create(),
    vec3.fromValues(1.5, 1, 1),
    vec3.fromValues(-7.5 * rem, -7.5 * rem, 0),
  )

  const rotation = mat4.fromRotationTranslationScaleOrigin(
    mat4.create(),
    quat.fromEuler(quat.create(), 0, 0, 30),
    vec3.create(),
    vec3.fromValues(1, 1, 1),
    vec3.fromValues(-2.5 * rem, -2.5 * rem, 0),
  )

  const translation = mat4.fromRotationTranslationScaleOrigin(
    mat4.create(),
    quat.create(),
    vec3.fromValues(5 * rem, -5 * rem, 0),
    vec3.fromValues(1, 1, 1),
    vec3.create(),
  )

  const matrix = mat4.create()
  mat4.multiply(matrix, matrix, scaling)
  mat4.multiply(matrix, matrix, rotation)
  mat4.multiply(matrix, matrix, translation)

  /**
   * Undo translate layout
   * Undo rotate layout
   * Undo scale layout
   * scale
   * Redo scale layout
   * rotate
   * Redo rotate layout
   * translate
   * Redo translate layout
   */

  return (
    <>
      <div class={classes.scale}>
        <div class={classes.rotate}>
          <div class={classes.translate}></div>
        </div>
      </div>
      <div class={classes.matrix} style={{ transform: styleTransform(matrix) }}></div>
      <div class={classes.shadow}></div>
    </>
  )
}
