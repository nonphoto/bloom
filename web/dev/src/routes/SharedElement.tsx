import classes from './SharedElement.module.css'
import { createSignal, createEffect, batch, Accessor, on } from 'solid-js'
import { xprod } from 'ramda'
import {
  useLayoutObserver,
  quad,
  borderRadius,
  createMaybeMemo,
  maybe,
  createTimeCallback,
} from '@chloranthy/solid'
import { Quad } from '@chloranthy/animation'

quad
borderRadius

const areas = xprod([1, 2], [1, 2])

export default function SharedElement() {
  const [areaIndex, setAreaIndex] = createSignal(0)

  const [outerElement, setOuterElement] = createSignal<HTMLElement | undefined>()
  const [innerElement, setInnerElement] = createSignal<HTMLElement | undefined>()

  const layoutObserver = useLayoutObserver()

  const outerRect = layoutObserver.useRect(outerElement)
  const innerRect = layoutObserver.useRect(innerElement)

  const outerTargetQuad = createMaybeMemo(Quad.fromDOMRect, Quad.create(), outerRect)
  const innerTargetQuad = createMaybeMemo(Quad.fromDOMRect, Quad.create(), innerRect)

  const [outerQuad, setOuterQuad] = createSignal(Quad.create(), { equals: false })

  createEffect(() => {
    createTimeCallback((_, deltaTime, stop) => {
      setOuterQuad(
        quad =>
          maybe(Quad.criticalSpring, quad, quad, outerTargetQuad, deltaTime, 150, 300) ?? quad,
      )

      if (Quad.isAtRest(outerQuad())) {
        stop()
      }
    })
  })

  const innerQuad = createMaybeMemo(Quad.cover, Quad.create(), innerTargetQuad, outerQuad)

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
          use:quad={outerQuad()}
          use:borderRadius={50}
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
  )
}
