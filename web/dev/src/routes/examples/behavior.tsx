import { Behavior, bToAnimation } from '@chloranthy/core'
import { createEffect } from 'solid-js'

export default function () {
  const element = (
    <div style={{ width: '100px', height: '100px', background: 'skyblue' }}>Hello</div>
  ) as Element

  const x = (t: number) => Math.cos(t * 0.001) * 100
  const y = (t: number) => Math.sin(t * 0.001) * 100

  const transform: Behavior<string> = (t: number) => [`translate(${x(t)}px, ${y(t)}px)`, false]

  createEffect(async () => {
    for (const animation of bToAnimation(element, 'transform', transform)) {
      await animation.finished
    }
  })

  return element
}
