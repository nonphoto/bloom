/**
 * A generic physics body
 *
 * @typeParam T - The vector type for this body.
 */

export interface Body<T> {
  /**
   * The position of the body
   */
  p: T

  /**
   * The velocity of the body
   */
  v: T
}
