import { Accessor, batch, createEffect, createSignal } from 'solid-js'
import { createRAF } from '@solid-primitives/raf'

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
