import { Iterator } from 'iterator-helpers-polyfill'

Iterator

export type Behavior<T> = (t: number) => [T, boolean]

const duration = 10_000

export function bToAnimation(
  element: Element,
  prop: string,
  b: Behavior<string>,
): Generator<Animation> {
  return (function* () {
    let done = false
    while (!done) {
      const keyframes = []
      let time = performance.now()
      const endTime = time + duration
      while (time < endTime && !done) {
        const [value, behaviorDone] = b(time)
        keyframes.push({
          [prop]: value,
        })
        if (behaviorDone) {
          done = true
        } else {
          time += 1_000 / 60
        }
      }
      yield element.animate(keyframes, { duration, easing: 'linear' })
    }
  })()
}
