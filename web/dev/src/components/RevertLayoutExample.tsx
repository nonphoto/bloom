import classes from './RevertLayoutExample.module.css'
import createRAF from '@solid-primitives/raf'
import { batch, createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { mat2d, vec2 } from 'gl-matrix'
import * as rect from 'chloranthy/rect'
import { RectObserver } from 'chloranthy/dom'
import { transform } from 'chloranthy/style'

export default function RevertLayoutExample() {
  let outerElement: HTMLDivElement | undefined, innerElement: HTMLDivElement | undefined

  const [time, setTime] = createSignal(0)
  const [scroll, setScroll] = createSignal(vec2.create(), { equals: false })
  const [outerRect, setOuterRect] = createSignal(rect.create(), {
    equals: false,
  })
  const [innerRect, setInnerRect] = createSignal(rect.create(), {
    equals: false,
  })
  const outerTransform = createMemo<mat2d>(
    prev => {
      const seconds = time() / 10000
      mat2d.fromRotation(prev, seconds * 1.2)
      // mat2d.scale(
      //   prev,
      //   prev,
      //   vec2.fromValues(Math.cos(seconds), Math.sin(seconds))
      // );
      return prev
    },
    mat2d.create(),
    { equals: false },
  )
  const layoutTranslation = createMemo<vec2>(
    prev => vec2.sub(prev, innerRect().position, outerRect().position),
    vec2.create(),
    { equals: false },
  )
  const clientTranslation = createMemo<vec2>(
    prev => vec2.sub(prev, layoutTranslation(), scroll()),
    vec2.create(),
    { equals: false },
  )

  const innerTransform = createMemo<mat2d>(
    prev => {
      mat2d.translate(prev, outerTransform(), clientTranslation())
      mat2d.invert(prev, prev)
      mat2d.translate(prev, prev, layoutTranslation())
      return prev
    },
    mat2d.create(),
    { equals: false },
  )

  const shadowTransform = createMemo<mat2d>(
    prev => {
      mat2d.translate(prev, outerTransform(), clientTranslation())
      mat2d.invert(prev, prev)
      mat2d.translate(prev, prev, clientTranslation())
      return prev
    },
    mat2d.create(),
    { equals: false },
  )

  const observer = new RectObserver()

  function onResize() {
    batch(() => {
      observer.measure()
    })
  }

  const [, start] = createRAF(setTime)

  onMount(() => {
    start()
    observer.addListener(outerElement!, setOuterRect)
    observer.addListener(innerElement!, setInnerRect)
    window.addEventListener('resize', onResize)
    onResize()
  })

  onCleanup(() => {
    observer.removeListener(outerElement!, setOuterRect)
    observer.removeListener(innerElement!, setInnerRect)
    window.addEventListener('resize', onResize)
  })

  return (
    <>
      <div
        ref={outerElement}
        class={classes.outer}
        style={{ transform: transform(outerTransform()) }}
        onScroll={event => {
          setScroll(prev => {
            prev[0] = event.target.scrollLeft
            prev[1] = event.target.scrollTop
            return prev
          })
        }}
      >
        <div class={classes.spacer}>
          <div class={classes.shadow} style={{ transform: transform(shadowTransform()) }}></div>
          <div
            ref={innerElement}
            class={classes.inner}
            style={{ transform: transform(innerTransform()) }}
          ></div>
        </div>
      </div>
    </>
  )
}
