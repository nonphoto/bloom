import classes from './SharedElement.module.css'
import { createSignal } from 'solid-js'
import { xprod } from 'ramda'
import { quad, borderRadius, createMaybeMemo, createTransition } from '@chloranthy/solid'
import { Quad2d, Rect } from '@chloranthy/animation'
import { useLayoutObserver } from '@chloranthy/layout-observer'
import { mat2d, vec2 } from 'gl-matrix'

quad
borderRadius

const areas = xprod([1, 2, 3], [1, 2, 3])

export default function SharedElement() {
  const [areaIndex, setAreaIndex] = createSignal(0)

  const [outerElement, setOuterElement] = createSignal<HTMLElement | undefined>()
  const [innerElement, setInnerElement] = createSignal<HTMLElement | undefined>()

  const layoutObserver = useLayoutObserver()
  const outerTargetRect = layoutObserver.useRect(outerElement)
  const innerTargetRect = layoutObserver.useRect(innerElement)

  const targetPosition = createMaybeMemo(Rect.position, vec2.create(), outerTargetRect)
  const targetSize = createMaybeMemo(Rect.size, vec2.create(), outerTargetRect)

  const position = createTransition(targetPosition, 150)
  const size = createTransition(targetSize, 300)

  const outerMatrix = layoutObserver.useMatrix(outerElement)

  const outerQuad = createMaybeMemo(
    (out: Quad2d.Type, position: vec2, size: vec2, matrix: mat2d) => {
      Quad2d.fromPositionSize(out, position, size)
      Quad2d.transformMat2d(out, out, matrix)
      return out
    },
    Quad2d.create(),
    () => position().p,
    () => size().p,
    outerMatrix,
  )

  const innerTargetQuad = createMaybeMemo(Quad2d.fromRect, Quad2d.create(), innerTargetRect)

  const innerQuad = createMaybeMemo(Quad2d.cover, Quad2d.create(), innerTargetQuad, outerQuad)

  return (
    <>
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
            use:quad={outerQuad()}
            use:borderRadius={50}
            id="outer"
          >
            <div
              ref={setInnerElement}
              class={classes.inner}
              use:quad={innerQuad()}
              use:borderRadius={50}
            ></div>
          </div>
        </div>
      </div>
      <div style={{ height: '100vh' }}></div>
    </>
  )
}
