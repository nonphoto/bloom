import classes from './SharedElement.module.css'
import { createEffect, createSignal, EffectFunction, Signal, createMemo } from 'solid-js'
import { xprod } from 'ramda'
import { mat2d, vec2 } from 'gl-matrix'
import * as rect from '@chloranthy/rect'
import { createLayout, useLayoutObserver, layout } from '@chloranthy/solid'
import { Quad, criticalSpring } from '@chloranthy/animation'
import { createRAF } from '@solid-primitives/raf'

layout

type Rect = rect.Rect

const areas = xprod([1, 2], [1, 2])

function createComplexSignal<T>(
  fn: EffectFunction<T, T>,
  { create }: { create: () => T },
): Signal<T> {
  const [value, setValue] = createSignal(create(), { equals: false })
  createEffect(() => {
    setValue(fn)
  })
  return [value, setValue]
}

function createMat2d(fn: EffectFunction<mat2d, mat2d>) {
  return createComplexSignal<mat2d>(fn, mat2d)
}

function createVec2(fn: EffectFunction<vec2, vec2>) {
  return createComplexSignal<vec2>(fn, vec2)
}

function createRect(fn: EffectFunction<Rect, Rect>) {
  return createComplexSignal<Rect>(fn, rect)
}

export default function SharedElement() {
  const outerElement = (
    <div
      class={classes.outer}
      // style={{
      //   transform: style.transform(outerTransform()),
      //   'border-radius': outerRect()
      //     ? style.borderRadius(50, outerRect()!.size, outerTransform())
      //     : undefined,
      // }}
    >
      {/* <div
    ref={innerElement}
    class={classes.inner}
    // style={{
    //   transform: style.transform(innerTransform()),
    //   'border-radius': innerRect()
    //     ? style.borderRadius(50, innerRect()!.size, combinedTransform())
    //     : undefined,
    // }}
  ></div> */}
    </div>
  )

  const [areaIndex, setAreaIndex] = createSignal(0)

  const layoutObserver = useLayoutObserver()

  const outerLayout = createLayout(outerElement as HTMLDivElement)

  const targetQuad = createMemo<Quad>(
    prev => {
      const rect = outerLayout.layoutRect()
      vec2.copy(prev.translation, rect.position)
      vec2.copy(prev.scaling, rect.size)
      return prev
    },
    new Quad(),
    { equals: false },
  )

  const [outerQuad, setOuterQuad] = createSignal(new Quad(), { equals: false })

  let prevTime = performance.now()
  const [, start] = createRAF(time => {
    const deltaTime = time - prevTime
    setOuterQuad(quad => {
      criticalSpring(
        quad.translationX,
        quad.translationX,
        targetQuad().translationX,
        100,
        deltaTime,
      )
      criticalSpring(
        quad.translationY,
        quad.translationY,
        targetQuad().translationY,
        100,
        deltaTime,
      )
      criticalSpring(quad.scalingX, quad.scalingX, targetQuad().scalingX, 200, deltaTime)
      criticalSpring(quad.scalingY, quad.scalingY, targetQuad().scalingY, 200, deltaTime)
      return quad
    })

    prevTime = time
  })

  start()

  const [matrix] = createMat2d(prev => {
    const a = outerQuad()
    const b = outerLayout.layoutRect()
    prev[0] = a.scaling[0] / b.size[0]
    prev[1] = 0
    prev[2] = 0
    prev[3] = a.scaling[1] / b.size[1]
    prev[4] = a.translation[0] - b.position[0]
    prev[5] = a.translation[1] - b.position[1]
    return prev
  })

  createEffect(() => {
    outerLayout.setIntrinsicTransform(matrix())
  })

  // const [outerRect, setOuterRect] = createSignal<Rect | undefined>(undefined, {
  //   equals: false,
  // })
  // const [innerRect, setInnerRect] = createSignal<Rect | undefined>(undefined, {
  //   equals: false,
  // })
  // const [animatedOuterRect, setAnimatedOuterRect] = createSignal<Rect | undefined>(undefined, {
  //   equals: false,
  // })
  // const [outerTransform] = createMat2d(out => {
  //   if (animatedOuterRect() && outerRect()) {
  //     rect.divide(out, animatedOuterRect()!, outerRect()!)
  //   }
  //   return out
  // })
  // const [layoutTranslation] = createVec2(out => {
  //   if (innerRect() && outerRect()) {
  //     vec2.sub(out, innerRect()!.position, outerRect()!.position)
  //   }
  //   return out
  // })
  // const [outerTransformInverse] = createMat2d(out => {
  //   mat2d.translate(out, outerTransform(), layoutTranslation())
  //   mat2d.invert(out, out)
  //   mat2d.translate(out, out, layoutTranslation())
  //   return out
  // })
  // const [animatedInnerRect] = createRect(out => {
  //   if (animatedOuterRect() && innerRect()) {
  //     rect.cover(out, animatedOuterRect()!, innerRect()!)
  //   }
  //   return out
  // })
  // const [innerTransform] = createMat2d(out => {
  //   if (innerRect()) {
  //     rect.divide(out, animatedInnerRect(), innerRect()!)
  //     mat2d.multiply(out, outerTransformInverse(), out)
  //   }
  //   return out
  // })
  // const [combinedTransform] = createMat2d(out =>
  //   mat2d.multiply(out, outerTransform(), innerTransform()),
  // )

  // const springX = new Spring()
  // const springY = new Spring()
  // const springWidth = new Spring()
  // const springHeight = new Spring()

  // const animation = new AnimationDriver((time: DOMHighResTimeStamp) => {
  //   springX.time = time
  //   springY.time = time
  //   springWidth.time = time
  //   springHeight.time = time
  //   springX.update()
  //   springY.update()
  //   springWidth.update()
  //   springHeight.update()

  //   if (springX.isAtRest && springY.isAtRest && springWidth.isAtRest && springHeight.isAtRest) {
  //     animation.stop()
  //   }

  //   setAnimatedOuterRect((prev: Rect | undefined) => {
  //     if (prev) {
  //       prev.position[0] = springX.position
  //       prev.position[1] = springY.position
  //       prev.size[0] = springWidth.position
  //       prev.size[1] = springHeight.position
  //     }
  //     return prev
  //   })
  // })

  // const observer = new RectObserver()

  // function onResize() {
  //   batch(() => {
  //     observer.measure()
  //   })
  // }

  // onMount(() => {
  //   if (outerElement && innerElement) {
  //     observer.addListener(outerElement, setOuterRect)
  //     observer.addListener(innerElement, setInnerRect)
  //   }
  //   window.addEventListener('resize', onResize)
  //   onResize()
  // })

  // onCleanup(() => {
  //   if (outerElement && innerElement) {
  //     observer.removeListener(outerElement, setOuterRect)
  //     observer.removeListener(innerElement, setInnerRect)
  //   }
  //   window.addEventListener('resize', onResize)
  // })

  // createEffect(
  //   on(outerRect, () => {
  //     if (outerRect()) {
  //       if (animatedOuterRect()) {
  //         springX.startPosition = springX.position
  //         springX.startVelocity = springX.velocity
  //         springX.endPosition = outerRect()!.position[0]
  //         springY.startPosition = springY.position
  //         springY.startVelocity = springY.velocity
  //         springY.endPosition = outerRect()!.position[1]
  //         springWidth.startPosition = springWidth.position
  //         springWidth.startVelocity = springWidth.velocity
  //         springWidth.endPosition = outerRect()!.size[0]
  //         springHeight.startPosition = springHeight.position
  //         springHeight.startVelocity = springHeight.velocity
  //         springHeight.endPosition = outerRect()!.size[1]
  //         animation.start()
  //       } else {
  //         setAnimatedOuterRect(rect.clone(outerRect()!))
  //       }
  //     }
  //   }),
  // )

  return (
    <div
      class={classes.grid}
      onClick={() => {
        setAreaIndex(index => (index + 1) % areas.length)
        layoutObserver.measureAll()
      }}
    >
      <div
        class={classes.shadow}
        style={{
          'grid-row-start': areas[areaIndex()]?.[0],
          'grid-column-start': areas[areaIndex()]?.[1],
        }}
      >
        {outerElement}
      </div>
    </div>
  )
}
