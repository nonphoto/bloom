import { Accessor, batch, createEffect, createMemo, createSignal, on } from 'solid-js'
import { createRAF } from '@solid-primitives/raf'
import { createMousePosition as createMousePositionStore } from '@solid-primitives/mouse'
import { maybe, safeWindow } from './utils'
import { vec2 } from 'gl-matrix'
import { Body2d } from '@chloranthy/core'

export function createTimeCallback(fn: (time: number, deltaTime: number) => void) {
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

type CreateTimeReturn = [Accessor<number>, Accessor<number>]

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

export function createMousePosition() {
  const store = createMousePositionStore()

  return createMemo<vec2>(
    out =>
      vec2.set(out, store.x - (safeWindow()?.scrollX ?? 0), store.y - (safeWindow()?.scrollY ?? 0)),
    vec2.create(),
    { equals: false },
  )
}

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
