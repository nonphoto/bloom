import classes from './SharedElement.module.css'
import { createSignal, createMemo } from 'solid-js'
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
