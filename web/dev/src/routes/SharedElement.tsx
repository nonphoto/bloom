import classes from './SharedElement.module.css'
import { createEffect, createSignal, createMemo } from 'solid-js'
import { xprod } from 'ramda'
import { useLayoutObserver } from '@chloranthy/solid'
import { Quad, criticalSpring } from '@chloranthy/animation'
import { createRAF } from '@solid-primitives/raf'
import { mat2d } from 'gl-matrix'

const areas = xprod([1, 2], [1, 2])

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
  ) as HTMLElement

  const [areaIndex, setAreaIndex] = createSignal(0)

  const layoutObserver = useLayoutObserver()

  const outerRect = layoutObserver.useRect(outerElement)

  const targetQuad = createMemo<Quad>(
    prev => {
      const outerRectValue = outerRect()
      if (outerRectValue) {
        Quad.fromDOMRect(prev, outerRectValue)
      }
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
        quad.translation.x,
        quad.translation.x,
        targetQuad().translation.x,
        100,
        deltaTime,
      )
      criticalSpring(
        quad.translation.y,
        quad.translation.y,
        targetQuad().translation.y,
        100,
        deltaTime,
      )
      criticalSpring(quad.scaling.x, quad.scaling.x, targetQuad().scaling.x, 200, deltaTime)
      criticalSpring(quad.scaling.y, quad.scaling.y, targetQuad().scaling.y, 200, deltaTime)
      return quad
    })

    prevTime = time
  })

  start()

  const outerTransform = createMemo<mat2d>(
    prev => Quad.divide(prev, outerQuad(), targetQuad()),
    mat2d.create(),
    {
      equals: false,
    },
  )

  createEffect(() => {
    layoutObserver.setTransform(outerElement, outerTransform())
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
