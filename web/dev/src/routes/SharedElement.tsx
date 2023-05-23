import classes from './SharedElement.module.css'
import { createSignal, createMemo, createEffect } from 'solid-js'
import { xprod } from 'ramda'
import { useLayoutObserver, transform } from '@chloranthy/solid'
import { Quad, criticalSpring } from '@chloranthy/animation'
import { createRAF } from '@solid-primitives/raf'
import { mat2d } from 'gl-matrix'

transform

const areas = xprod([1, 2], [1, 2])

export default function SharedElement() {
  const [areaIndex, setAreaIndex] = createSignal(0)

  const [outerElement, setOuterElement] = createSignal<HTMLElement | undefined>()
  const [innerElement, setInnerElement] = createSignal<HTMLElement | undefined>()

  const layoutObserver = useLayoutObserver()

  const outerRect = layoutObserver.useRect(outerElement)
  const innerRect = layoutObserver.useRect(innerElement)
  const innerMatrix = layoutObserver.useMatrix(innerElement)

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

  const innerTargetQuad = createMemo<Quad>(
    prev => {
      const innerRectValue = innerRect()
      if (innerRectValue) {
        Quad.fromDOMRect(prev, innerRectValue)
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
        500,
        deltaTime,
      )
      criticalSpring(
        quad.translation.y,
        quad.translation.y,
        targetQuad().translation.y,
        500,
        deltaTime,
      )
      criticalSpring(quad.scaling.x, quad.scaling.x, targetQuad().scaling.x, 500, deltaTime)
      criticalSpring(quad.scaling.y, quad.scaling.y, targetQuad().scaling.y, 500, deltaTime)
      return quad
    })

    prevTime = time
  })

  start()

  const innerQuad = createMemo<Quad>(
    prev => Quad.cover(prev, innerTargetQuad(), outerQuad()),
    new Quad(),
    { equals: false },
  )

  const inverseInnerMatrix = createMemo<mat2d>(
    prev => mat2d.invert(prev, innerMatrix() ?? mat2d.identity(mat2d.create())),
    mat2d.create(),
    { equals: false },
  )

  const outerTransform = createMemo<mat2d>(
    prev => Quad.divide(prev, outerQuad(), targetQuad()),
    mat2d.create(),
    {
      equals: false,
    },
  )

  const innerTransform = createMemo<mat2d>(
    prev => {
      Quad.divide(prev, innerQuad(), innerTargetQuad())
      return mat2d.multiply(prev, inverseInnerMatrix(), prev)
    },
    mat2d.create(),
    { equals: false },
  )

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
        <div ref={setOuterElement} class={classes.outer} use:transform={outerTransform()}>
          <div ref={setInnerElement} class={classes.inner} use:transform={innerTransform()}></div>
        </div>
      </div>
    </div>
  )
}
