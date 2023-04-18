import classes from './BorderBoxExample.module.css'
import BorderBox from './BorderBox'
import { AnimationDriver } from 'chloranthy/animation'
import { createSignal, onMount } from 'solid-js'
import { mat2d, vec2 } from 'gl-matrix'

export default function BorderBoxExample() {
  const [transform, setTransform] = createSignal(mat2d.create(), {
    equals: false,
  })

  const animation = new AnimationDriver((time: DOMHighResTimeStamp) => {
    const seconds = time / 1000
    setTransform(prev => {
      mat2d.fromScaling(prev, vec2.fromValues(Math.cos(seconds), Math.sin(seconds)))
      return prev
    })
  })

  onMount(() => {
    animation.start()
  })

  return (
    <BorderBox
      transform={transform()}
      class={classes.box}
      borderRadius={50}
      borderWidth={10}
      borderStyle="solid turquoise"
    />
  )
}
