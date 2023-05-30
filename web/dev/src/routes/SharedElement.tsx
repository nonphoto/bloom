import classes from './SharedElement.module.css'
import { createSignal, createMemo } from 'solid-js'
import { xprod } from 'ramda'
import { useLayoutObserver, transform, borderRadius, createMaybeMemo } from '@chloranthy/solid'
import { Quad, criticalSpring } from '@chloranthy/animation'
import { createRAF } from '@solid-primitives/raf'
import { mat2d } from 'gl-matrix'

transform
borderRadius

const areas = xprod([1, 2], [1, 2])

export default function SharedElement() {
  const [areaIndex, setAreaIndex] = createSignal(0)

  const [outerElement, setOuterElement] = createSignal<HTMLElement | undefined>()
  const [innerElement, setInnerElement] = createSignal<HTMLElement | undefined>()

  const layoutObserver = useLayoutObserver()

  const outerRect = layoutObserver.useRect(outerElement)
  const innerRect = layoutObserver.useRect(innerElement)
  const innerMatrix = layoutObserver.useMatrix(innerElement)

  const outerTargetQuad = createMaybeMemo(Quad.fromDOMRect, Quad.create(), outerRect)
  const innerTargetQuad = createMaybeMemo(Quad.fromDOMRect, Quad.create(), innerRect)

  const [outerQuad, setOuterQuad] = createSignal(new Quad(), { equals: false })

  let prevTime = performance.now()
  const [, start] = createRAF(time => {
    const deltaTime = time - prevTime
    const targetQuad = outerTargetQuad()
    if (targetQuad) {
      setOuterQuad(quad => {
        criticalSpring(
          quad.translation.x,
          quad.translation.x,
          targetQuad.translation.x,
          200,
          deltaTime,
        )
        criticalSpring(
          quad.translation.y,
          quad.translation.y,
          targetQuad.translation.y,
          200,
          deltaTime,
        )
        criticalSpring(quad.scaling.x, quad.scaling.x, targetQuad.scaling.x, 300, deltaTime)
        criticalSpring(quad.scaling.y, quad.scaling.y, targetQuad.scaling.y, 300, deltaTime)
        return quad
      })
    }

    prevTime = time
  })

  start()

  const innerQuad = createMaybeMemo(Quad.cover, Quad.create(), innerTargetQuad, outerQuad)

  const inverseInnerMatrix = createMemo<mat2d>(
    prev => mat2d.invert(prev, innerMatrix() ?? mat2d.identity(mat2d.create())),
    mat2d.create(),
    { equals: false },
  )

  const outerTransform = createMemo<mat2d | undefined>(
    prev => {
      const outerTargetQuadValue = outerTargetQuad()
      if (outerTargetQuadValue) {
        return Quad.divide(prev ?? mat2d.create(), outerQuad(), outerTargetQuadValue)
      }
    },
    undefined,
    {
      equals: false,
    },
  )

  const innerDeltaMatrix = createMaybeMemo(Quad.divide, mat2d.create(), innerQuad, innerTargetQuad)

  const innerTransform = createMaybeMemo(
    mat2d.multiply,
    mat2d.create(),
    inverseInnerMatrix,
    innerDeltaMatrix,
  )

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
        <div
          ref={setOuterElement}
          class={classes.outer}
          use:transform={outerTransform()}
          use:borderRadius={50}
        >
          <div
            ref={setInnerElement}
            class={classes.inner}
            use:transform={innerTransform()}
            use:borderRadius={50}
          ></div>
        </div>
      </div>
    </div>
  )
}
