import classes from './SharedElementExample.module.css'
import { batch, createEffect, createSignal, on, onCleanup, onMount } from 'solid-js'
import { xprod } from 'ramda'
import { mat2d, vec2 } from 'gl-matrix'
import { AnimationDriver, Spring } from 'chloranthy/animation'
import * as rect from 'chloranthy/rect'
import type { Rect } from 'chloranthy/rect'
import * as style from 'chloranthy/style'
import { RectObserver } from 'chloranthy/dom'
import type { EffectFunction, Signal } from 'solid-js/types/reactive/signal'

const areas = xprod([1, 2], [1, 2])

function createMutable<T>(fn: EffectFunction<T, T>, { create }: { create: () => T }): Signal<T> {
  const [value, setValue] = createSignal(create(), { equals: false })
  createEffect(() => {
    setValue(fn)
  })
  return [value, setValue]
}

function createMat2d(fn: EffectFunction<mat2d, mat2d>) {
  return createMutable<mat2d>(fn, mat2d)
}

function createVec2(fn: EffectFunction<vec2, vec2>) {
  return createMutable<vec2>(fn, vec2)
}

function createRect(fn: EffectFunction<Rect, Rect>) {
  return createMutable<Rect>(fn, rect)
}

export default function SharedElementExample() {
  let outerElement: HTMLDivElement | undefined, innerElement: HTMLDivElement | undefined

  const [areaIndex, setAreaIndex] = createSignal(0)
  const [outerRect, setOuterRect] = createSignal<Rect | undefined>(undefined, {
    equals: false,
  })
  const [innerRect, setInnerRect] = createSignal<Rect | undefined>(undefined, {
    equals: false,
  })
  const [animatedOuterRect, setAnimatedOuterRect] = createSignal<Rect | undefined>(undefined, {
    equals: false,
  })
  const [outerTransform] = createMat2d(out => {
    if (animatedOuterRect() && outerRect()) {
      rect.divide(out, animatedOuterRect()!, outerRect()!)
    }
    return out
  })
  const [layoutTranslation] = createVec2(out => {
    if (innerRect() && outerRect()) {
      vec2.sub(out, innerRect()!.position, outerRect()!.position)
    }
    return out
  })
  const [outerTransformInverse] = createMat2d(out => {
    mat2d.translate(out, outerTransform(), layoutTranslation())
    mat2d.invert(out, out)
    mat2d.translate(out, out, layoutTranslation())
    return out
  })
  const [animatedInnerRect] = createRect(out => {
    if (animatedOuterRect() && innerRect()) {
      rect.cover(out, animatedOuterRect()!, innerRect()!)
    }
    return out
  })
  const [innerTransform] = createMat2d(out => {
    if (innerRect()) {
      rect.divide(out, animatedInnerRect(), innerRect()!)
      mat2d.multiply(out, outerTransformInverse(), out)
    }
    return out
  })
  const [combinedTransform] = createMat2d(out =>
    mat2d.multiply(out, outerTransform(), innerTransform()),
  )

  const springX = new Spring()
  const springY = new Spring()
  const springWidth = new Spring()
  const springHeight = new Spring()

  const animation = new AnimationDriver((time: DOMHighResTimeStamp) => {
    springX.time = time
    springY.time = time
    springWidth.time = time
    springHeight.time = time
    springX.update()
    springY.update()
    springWidth.update()
    springHeight.update()

    if (springX.isAtRest && springY.isAtRest && springWidth.isAtRest && springHeight.isAtRest) {
      animation.stop()
    }

    setAnimatedOuterRect((prev: Rect | undefined) => {
      if (prev) {
        prev.position[0] = springX.position
        prev.position[1] = springY.position
        prev.size[0] = springWidth.position
        prev.size[1] = springHeight.position
      }
      return prev
    })
  })

  const observer = new RectObserver()

  function onResize() {
    batch(() => {
      observer.measure()
    })
  }

  onMount(() => {
    if (outerElement && innerElement) {
      observer.addListener(outerElement, setOuterRect)
      observer.addListener(innerElement, setInnerRect)
    }
    window.addEventListener('resize', onResize)
    onResize()
  })

  onCleanup(() => {
    if (outerElement && innerElement) {
      observer.removeListener(outerElement, setOuterRect)
      observer.removeListener(innerElement, setInnerRect)
    }
    window.addEventListener('resize', onResize)
  })

  createEffect(
    on(outerRect, () => {
      if (outerRect()) {
        if (animatedOuterRect()) {
          springX.startPosition = springX.position
          springX.startVelocity = springX.velocity
          springX.endPosition = outerRect()!.position[0]
          springY.startPosition = springY.position
          springY.startVelocity = springY.velocity
          springY.endPosition = outerRect()!.position[1]
          springWidth.startPosition = springWidth.position
          springWidth.startVelocity = springWidth.velocity
          springWidth.endPosition = outerRect()!.size[0]
          springHeight.startPosition = springHeight.position
          springHeight.startVelocity = springHeight.velocity
          springHeight.endPosition = outerRect()!.size[1]
          animation.start()
        } else {
          setAnimatedOuterRect(rect.clone(outerRect()!))
        }
      }
    }),
  )

  return (
    <div
      class={classes.grid}
      onClick={() => {
        setAreaIndex(index => (index + 1) % areas.length)
        batch(() => {
          observer.measure()
        })
      }}
    >
      <div
        class={classes.shadow}
        style={{
          'grid-row-start': areas[areaIndex()][0],
          'grid-column-start': areas[areaIndex()][1],
        }}
      >
        <div
          ref={outerElement}
          class={classes.outer}
          style={{
            transform: style.transform(outerTransform()),
            'border-radius': outerRect()
              ? style.borderRadius(50, outerRect()!.size, outerTransform())
              : undefined,
          }}
        >
          <div
            ref={innerElement}
            class={classes.inner}
            style={{
              transform: style.transform(innerTransform()),
              'border-radius': innerRect()
                ? style.borderRadius(50, innerRect()!.size, combinedTransform())
                : undefined,
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
