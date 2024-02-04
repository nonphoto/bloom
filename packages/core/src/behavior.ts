import { Iterator } from 'iterator-helpers-polyfill'

Iterator

export type Easing = (t: number) => number

const linear: Easing = t => t

export type BehaviorKeyframe<T> = {
  value: T
  offset: number
}

export type BehaviorOperation<T> = {
  keyframes: BehaviorKeyframe<T>[]
  startTime: number
  duration: number
  easing: Easing
}

export type Behavior<T> = Iterator<BehaviorOperation<T>>

export const time: () => Behavior<number> = function* () {
  const interval = 100_000
  for (let i = 0; i < Infinity; i += interval) {
    yield {
      keyframes: [
        { value: i, offset: 0 },
        { value: i + interval, offset: 1 },
      ],
      startTime: i,
      duration: interval,
      easing: linear,
    }
  }
}

export function bMap<T, U>(b: Behavior<T>, fn: (n: T) => U): Behavior<U> {
  return b.map(op => ({
    ...op,
    keyframes: op.keyframes.map(keyframe => ({ ...keyframe, value: fn(keyframe.value) })),
  }))
}

export function bShift<T>(b: Behavior<T>): BehaviorOperation<T> | undefined {
  return b.next().value
}

export function bAnimate(
  element: Element,
  prop: string,
  b: Behavior<string>,
): AsyncIterator<Animation> {
  return (async function* () {
    for (const op of b) {
      yield element.animate(
        op.keyframes.map(keyframe => ({ [prop]: keyframe.value })),
        { duration: op.duration },
      ).finished
    }
  })()
}
