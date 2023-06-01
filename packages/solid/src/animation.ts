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
  fn: (time: number, deltaTime: number, stop: VoidFunction) => void,
) {
  let time = 0
  let deltaTime = 0

  const [, start, stop] = createRAF(nextTime => {
    deltaTime = nextTime - time
    time = nextTime
    fn(time, deltaTime, stop)
  })

  createEffect(() => {
    start()
  })
}
