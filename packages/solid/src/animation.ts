import { Accessor, Setter, batch, createEffect, createMemo, createSignal, on } from 'solid-js'
import { createRAF } from '@solid-primitives/raf'
import { createMousePosition as createMousePositionStore } from '@solid-primitives/mouse'
import { maybe, safeWindow } from './utils.js'
import { Vec2, vec2Set, vec2Create } from '@chloranthy/gl-matrix'
import {
  Body2d,
  BodyQuad2d,
  body2dCreate,
  body2dIsAtRest,
  body2dSimpleSpring,
} from '@chloranthy/core'
import { MaybeAccessor } from '@solid-primitives/utils'
import { Quad2d } from '@chloranthy/core'
import { bodyQuad2dIsAtRest } from '@chloranthy/core'
import { bodyQuad2dSimpleSpring } from '@chloranthy/core'

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
export function createMousePosition(): Accessor<Vec2> {
  const store = createMousePositionStore()

  return createMemo<Vec2>(
    out =>
      vec2Set(out, store.x - (safeWindow()?.scrollX ?? 0), store.y - (safeWindow()?.scrollY ?? 0)),
    vec2Create(),
    { equals: false },
  )
}

/**
 * Create a new real-time spring transition to the target value.
 * @param target - An accessor for the target position
 * @param halflife - The halflife of the transition spring.
 * @returns A 2d body representing the current position and velocity of the spring.
 */

export function createSpringBody(
  target: Accessor<Vec2 | undefined>,
  halflife: number,
): [Accessor<Body2d>, Accessor<boolean>] {
  const [value, setValue] = createSignal<Body2d>(body2dCreate(), { equals: false })

  const isRunning = createMemo(() => maybe(body2dIsAtRest, value, target) === false)

  createEffect(
    on(isRunning, isRunning => {
      if (isRunning) {
        createTimeCallback((_, deltaTime) => {
          setValue(out => maybe(body2dSimpleSpring, out, out, target, halflife, deltaTime) ?? out)
        })
      }
    }),
  )

  return [value, isRunning]
}

export function createSpring(
  target: MaybeAccessor<Vec2 | undefined>,
  body: MaybeAccessor<Body2d | undefined>,
  setBody: Setter<Body2d>,
  halflife: number,
): Accessor<boolean> {
  const isRunning = createMemo(() => maybe(body2dIsAtRest, body, target) === false)

  createEffect(
    on(isRunning, isRunning => {
      if (isRunning) {
        createTimeCallback((_, deltaTime) => {
          setBody(out => maybe(body2dSimpleSpring, out, out, target, halflife, deltaTime) ?? out)
        })
      }
    }),
  )

  return isRunning
}

export function createSpringQuad2d(
  target: MaybeAccessor<Quad2d | undefined>,
  body: MaybeAccessor<BodyQuad2d | undefined>,
  setBody: Setter<BodyQuad2d>,
  halflife: number,
): Accessor<boolean> {
  const isRunning = createMemo(() => maybe(bodyQuad2dIsAtRest, body, target) === false)

  createEffect(
    on(isRunning, isRunning => {
      if (isRunning) {
        createTimeCallback((_, deltaTime) => {
          setBody(
            out => maybe(bodyQuad2dSimpleSpring, out, out, target, halflife, deltaTime) ?? out,
          )
        })
      }
    }),
  )

  return isRunning
}
