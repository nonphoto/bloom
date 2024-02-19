import { Iterator } from 'iterator-helpers-polyfill'

Iterator

export type Behavior<T> = (t: number) => T

type Range = {
  start: number
  end: number
}

let RANGES: Range[] | undefined = undefined

function withRange<T>(start: number, end: number, b: Behavior<T>): Behavior<T> {
  const range = { start, end }
  return t => {
    RANGES?.push(range)
    return b(t)
  }
}

function getRanges<T>(b: Behavior<T>, t: number): [Range[], T] {
  RANGES = []
  const value = b(t)
  const ranges = RANGES
  RANGES = []
  return [ranges, value]
}

const x: Behavior<number> = withRange(-Infinity, 100, t => t * 2)

const maxDuration = 10_000

export function toAnimationGenerator(
  element: Element,
  prop: string,
  b: Behavior<string>,
  options?: Pick<KeyframeAnimationOptions, 'timeline'>,
): Generator<Animation> {
  return (function* () {
    let done = false
    while (!done) {
      const keyframes = []
      let time = performance.now()
      const endTime = time + maxDuration
      const [ranges, value] = getRanges(b, time)
      while (time < endTime && !done) {
        const [value, behaviorDone] = b(time)
        keyframes.push({ [prop]: value })
        if (behaviorDone) {
          done = true
        } else {
          time += 1_000 / 60
        }
      }
      yield element.animate(keyframes, {
        duration: maxDuration,
        easing: 'linear',
        ...(options ?? {}),
      })
    }
  })()
}
