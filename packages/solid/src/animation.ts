import { Accessor, batch, createEffect, createSignal } from 'solid-js'
import { createRAF } from '@solid-primitives/raf'

export function createTime(): [Accessor<number>, Accessor<number>] {
  const [time, setTime] = createSignal(0, { equals: false })
  const [deltaTime, setDeltaTime] = createSignal(0, { equals: false })
  let prevTime = 0

  const [, start] = createRAF(time => {
    batch(() => {
      setTime(time)
      setDeltaTime(time - prevTime)
      prevTime = time
    })
  })

  createEffect(() => {
    start()
  })

  return [time, deltaTime]
}

export function createTimeCallback(
  fn: (time: number, deltaTime: number) => void,
): ReturnType<typeof createRAF> {
  let time: number | null = null
  let deltaTime: number | null = null
  let startTime: number | null = null

  const raf = createRAF(nextTime => {
    startTime ??= nextTime
    deltaTime = time === null ? 0 : nextTime - time
    time = nextTime
    fn(time - startTime, deltaTime)
  })

  raf[1]()

  return raf
}
