import classes from './SharedElement.module.css'
import { createSignal, createMemo } from 'solid-js'
import { xprod } from 'ramda'
import { useLayoutObserver, transform, createReactiveBuilder } from '@chloranthy/solid'
import { Quad, criticalSpring } from '@chloranthy/animation'
import { createRAF } from '@solid-primitives/raf'
import { mat2d, vec2 } from 'gl-matrix'

transform

const areas = xprod([1, 2], [1, 2])

function styleBorderRadius(radius: number, size: vec2, transform: mat2d) {
  const x = (radius / (size[0] * transform[0])) * 100
  const y = (radius / (size[1] * transform[3])) * 100
  return `${x}% / ${y}%`
}

const ReactiveQuad = createReactiveBuilder(Quad)

export default function SharedElement() {
  const [areaIndex, setAreaIndex] = createSignal(0)

  const [outerElement, setOuterElement] = createSignal<HTMLElement | undefined>()
  const [innerElement, setInnerElement] = createSignal<HTMLElement | undefined>()

  const layoutObserver = useLayoutObserver()

  const outerRect = layoutObserver.useRect(outerElement)
  const innerRect = layoutObserver.useRect(innerElement)
  const innerMatrix = layoutObserver.useMatrix(innerElement)

  const borderRadius = () => 50

  const outerTargetQuad = new ReactiveQuad().fromDOMRect(outerRect())

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
        outerTargetQuad().translation.x,
        200,
        deltaTime,
      )
      criticalSpring(
        quad.translation.y,
        quad.translation.y,
        outerTargetQuad().translation.y,
        200,
        deltaTime,
      )
      criticalSpring(quad.scaling.x, quad.scaling.x, outerTargetQuad().scaling.x, 300, deltaTime)
      criticalSpring(quad.scaling.y, quad.scaling.y, outerTargetQuad().scaling.y, 300, deltaTime)
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
    prev => Quad.divide(prev, outerQuad(), outerTargetQuad()),
    mat2d.create(),
    {
      equals: false,
    },
  )

  const innerDeltaMatrix = createMemo<mat2d>(
    prev => Quad.divide(prev, innerQuad(), innerTargetQuad()),
    mat2d.create(),
    { equals: false },
  )

  const innerTransform = createMemo<mat2d>(
    prev => {
      return mat2d.multiply(prev, inverseInnerMatrix(), innerDeltaMatrix())
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
        <div
          ref={setOuterElement}
          class={classes.outer}
          use:transform={outerTransform()}
          style={{
            'border-radius': styleBorderRadius(
              borderRadius(),
              outerTargetQuad().scaling.p,
              outerTransform(),
            ),
          }}
        >
          <div
            ref={setInnerElement}
            class={classes.inner}
            use:transform={innerTransform()}
            style={{
              'border-radius': styleBorderRadius(
                borderRadius(),
                innerTargetQuad().scaling.p,
                innerDeltaMatrix(),
              ),
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
