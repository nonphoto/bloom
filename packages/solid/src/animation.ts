import { Accessor, batch, createEffect, createMemo, createSignal, on } from 'solid-js'
import { createRAF } from '@solid-primitives/raf'
import { createMousePosition as createMousePositionStore } from '@solid-primitives/mouse'
import { maybe, safeWindow } from './utils'
import { vec2 } from 'gl-matrix'
import { Body2d } from '@chloranthy/core'

/**
 * A callback for an animation frame.
 * @param time - The time that the animation frame occurred.
 * @param deltaTime - The time since the last animation frame occurred.
 */
export type TimeCallback = (time: number, deltaTime: number) => void

/**
 * Creates a new effect that calls the callback on every animation frame.
 * @param fn - The callback to call on animation frame.
 */
export function createTimeCallback(fn: TimeCallback): void {
  let time = performance.now()
  let deltaTime = 0
  const startTime = time

  const [, start] = createRAF(nextTime => {
    deltaTime = nextTime - time
    time = nextTime
    fn(time - startTime, deltaTime)
  })

  createEffect(() => {
    start()
  })
}

/**
 * A time and delta-time accessor pair.
 */
export type CreateTimeReturn = [
  /**
   * The time that the animation frame occurred. Updates every animation frame.
   */
  Accessor<number>,

  /**
   * The time since the last animation frame occurred. Updates every animation frame.
   */
  Accessor<number>,
]

/**
 * Creates a new time and delta-time accessor pair.
 */
export function createTime(): CreateTimeReturn {
  const [time, setTime] = createSignal(0, { equals: false })
  const [deltaTime, setDeltaTime] = createSignal(0, { equals: false })

  createTimeCallback((t, dt) => {
    batch(() => {
      setTime(t)
      setDeltaTime(dt)
    })
  })

  return [time, deltaTime]
}

/**
 * Creates a signal for the position of the mouse on screen.
 * @returns An accessor that returns the screen-relative mouse position as a 2d vector.
 */
export function createMousePosition(): Accessor<vec2> {
  const store = createMousePositionStore()

  return createMemo<vec2>(
    out =>
      vec2.set(out, store.x - (safeWindow()?.scrollX ?? 0), store.y - (safeWindow()?.scrollY ?? 0)),
    vec2.create(),
    { equals: false },
  )
}

/**
 * Create a new real-time spring transition to the target value.
 * @param target - An accessor for the target position
 * @param halflife - The halflife of the transition spring.
 * @returns A 2d body representing the current position and velocity of the spring.
 */
export function createTransition(
  target: Accessor<vec2 | undefined>,
  halflife: number,
): Accessor<Body2d.Type> {
  const [value, setValue] = createSignal<Body2d.Type>(new Body2d.Instance(), { equals: false })

  const isRunning = createMemo(() => maybe(Body2d.isAtRest, value, target) === false)

  createEffect(
    on(isRunning, isRunning => {
      if (isRunning) {
        createTimeCallback((_, deltaTime) => {
          setValue(out => maybe(Body2d.simpleSpring, out, out, target, halflife, deltaTime) ?? out)
        })
      }
    }),
  )

  return value
}
