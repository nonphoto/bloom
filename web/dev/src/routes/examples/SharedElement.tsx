import classes from './SharedElement.module.css'
import { createSignal, createEffect, on, createMemo } from 'solid-js'
import { xprod } from 'ramda'
import {
  quad,
  borderRadius,
  createMaybeMemo,
  maybe,
  createTimeCallback,
  MapMaybeAccessor,
  MaybeAccessor,
} from '@chloranthy/solid'
import { Axis2, Quad } from '@chloranthy/animation'
import { useLayoutObserver } from '@chloranthy/layout-observer'
import { mat2d, vec2 } from 'gl-matrix'

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

function createTransition(target: MaybeAccessor<Axis2 | undefined>, halflife: number) {
  const [value, setValue] = createSignal(new Axis2(), { equals: false })

  const isRunning = createMemo(() => maybe(Axis2.isAtRest, value, target) === false)

  createEffect(
    on(isRunning, isRunning => {
      if (isRunning) {
        createTimeCallback((_, deltaTime) => {
          setValue(out => maybe(Axis2.criticalSpring, out, out, target, halflife, deltaTime) ?? out)
        })
      }
    }),
  )

  return value
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

  const translation = createTransition(() => outerTargetQuad()?.translation, 150)
  const scaling = createTransition(() => outerTargetQuad()?.scaling, 300)

  const outerQuad = createMaybeMemo(
    Quad.fromTranslationScaling,
    Quad.create(),
    translation,
    scaling,
  )

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
