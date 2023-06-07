import classes from './SharedElement.module.css'
import { createSignal, createEffect, on } from 'solid-js'
import { xprod } from 'ramda'
import { quad, borderRadius, createMaybeMemo, maybe, createTimeCallback } from '@chloranthy/solid'
import { Quad } from '@chloranthy/animation'
import { useLayoutObserver } from '@chloranthy/layout-observer'

quad
borderRadius

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      quad: Quad | undefined
      borderRadius: number | undefined
    }
  }
}

const areas = xprod([1, 2, 3], [1, 2, 3])

export default function SharedElement() {
  const [areaIndex, setAreaIndex] = createSignal(0)

  const [outerElement, setOuterElement] = createSignal<HTMLElement | undefined>()
  const [innerElement, setInnerElement] = createSignal<HTMLElement | undefined>()

  const layoutObserver = useLayoutObserver()
  const outerTargetQuad = createMaybeMemo(
    Quad.fromDOMRect,
    Quad.create(),
    layoutObserver.useRect(outerElement),
  )
  const innerTargetQuad = createMaybeMemo(
    Quad.fromDOMRect,
    Quad.create(),
    layoutObserver.useRect(innerElement),
  )

  const [outerQuad, setOuterQuad] = createSignal(Quad.create(), { equals: false })

  createEffect(() => {
    if (maybe(Quad.isAtRest, outerQuad, outerTargetQuad) === false) {
      createTimeCallback((_, deltaTime) => {
        setOuterQuad(
          quad =>
            maybe(Quad.criticalSpring, quad, quad, outerTargetQuad, deltaTime, 150, 300) ?? quad,
        )
      })
    }
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
