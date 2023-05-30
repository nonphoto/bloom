import classes from './SharedElement.module.css'
import { createSignal, createEffect, batch, Accessor } from 'solid-js'
import { xprod } from 'ramda'
import { useLayoutObserver, transform, borderRadius, createMaybeMemo } from '@chloranthy/solid'
import { Quad, criticalSpring } from '@chloranthy/animation'
import { createRAF } from '@solid-primitives/raf'
import { mat2d } from 'gl-matrix'

transform
borderRadius

const areas = xprod([1, 2], [1, 2])

function createTime(): [Accessor<number>, Accessor<number>] {
  const [time, setTime] = createSignal(0, { equals: false })
  const [deltaTime, setDeltaTime] = createSignal(0, { equals: false })
  let prevTime = 0

  const [, start] = createRAF(time => {
    batch(() => {
      setTime(time)
      setDeltaTime(time - prevTime)
      prevTime = time
    })
  })

  createEffect(() => {
    start()
  })

  return [time, deltaTime]
}

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

  const [, deltaTime] = createTime()

  const outerQuadValue = Quad.create()
  const outerQuad = createMaybeMemo(
    Quad.criticalSpring,
    outerQuadValue,
    outerQuadValue,
    outerTargetQuad,
    deltaTime,
    200,
    300,
  )

  const innerQuad = createMaybeMemo(Quad.cover, Quad.create(), innerTargetQuad, outerQuad)

  const inverseInnerMatrix = createMaybeMemo(mat2d.invert, mat2d.create(), innerMatrix)

  const outerTransform = createMaybeMemo(Quad.divide, mat2d.create(), outerQuad, outerTargetQuad)

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
