import {
  Behavior,
  Body1d,
  body1dCreate,
  body1dIsAtRest,
  body1dSpring,
  toAnimationGenerator,
} from '@chloranthy/core'
import { createReaction, createSignal, onMount } from 'solid-js'

function at(start: number = Infinity, t: number) {
  return Math.max(0, t - start)
}

export default function () {
  const [startTime, setStartTime] = createSignal<number>()
  const element = (
    <div
      style={{ width: '100px', height: '100px', background: 'skyblue' }}
      onClick={() => {
        setStartTime(performance.now())
      }}
    >
      Hello
    </div>
  ) as Element

  const start = body1dCreate()
  const out = body1dCreate()
  const end = body1dCreate()
  end.p = 100
  const x: Behavior<Body1d> = t => [
    body1dSpring(out, start, end, 500, 0.5, at(startTime(), t)),
    body1dIsAtRest(out, end.p),
  ]
  const transform: Behavior<string> = t => [`translateX(${x(t)[0].p}px)`, x(t)[1]]

  onMount(async () => {
    let animationGenerator = toAnimationGenerator(element, 'transform', transform)
    let animation: IteratorResult<Animation, Animation> | undefined
    const track = createReaction(() => {
      animationGenerator = toAnimationGenerator(element, 'transform', transform)
      if (animation) {
        animation.value.cancel()
      }
    })
    const next = () => {
      track(() => {
        animation = animationGenerator.next()
      })
    }
    next()
    while (animation && !animation.done) {
      await animation.value.finished
      next()
    }
  })

  return element
}
