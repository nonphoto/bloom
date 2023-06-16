import classes from './SharedElement.module.css'
import { createSignal, createEffect, on, createMemo } from 'solid-js'
import { xprod } from 'ramda'
import {
  quad,
  borderRadius,
  createMaybeMemo,
  maybe,
  createTimeCallback,
  MaybeAccessor,
} from '@chloranthy/solid'
import { Body2d, Mat2d, Rect } from '@chloranthy/animation'
import { useLayoutObserver } from '@chloranthy/layout-observer'
import { vec2 } from 'gl-matrix'

quad
borderRadius

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      quad: Mat2d.Type | undefined
      borderRadius: number | undefined
    }
  }
}

function createTransition(target: MaybeAccessor<vec2 | undefined>, halflife: number) {
  const [value, setValue] = createSignal<Body2d.Type>(new Body2d.Instance(), { equals: false })

  const isRunning = createMemo(() => maybe(Body2d.isAtRest, value, target) === false)

  createEffect(() => {
    console.log(isRunning())
  })

  createEffect(
    on(isRunning, isRunning => {
      if (isRunning) {
        createTimeCallback((_, deltaTime) => {
          setValue(out => maybe(Body2d.simpleSpring, out, out, target, halflife, deltaTime) ?? out)
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
  const outerTargetRect = layoutObserver.useRect(outerElement)
  const innerTargetRect = layoutObserver.useRect(innerElement)

  const targetTranslation = createMaybeMemo(Rect.getTranslation, vec2.create(), outerTargetRect)
  const targetScaling = createMaybeMemo(Rect.getScaling, vec2.create(), outerTargetRect)

  const translation = createTransition(targetTranslation, 150)
  const scaling = createTransition(targetScaling, 300)

  const outerMatrix = layoutObserver.useMatrix(outerElement)

  const outerQuad = createMaybeMemo(
    (out: Mat2d.Type, translation: vec2, scaling: vec2, matrix: Mat2d.Type) => {
      Mat2d.translate(out, matrix, translation)
      Mat2d.scale(out, out, scaling)
      return out
    },
    Mat2d.create(),
    () => translation().p,
    () => scaling().p,
    outerMatrix,
  )

  createEffect(() => {
    console.log(targetTranslation())
  })

  const innerTargetQuad = createMaybeMemo(Mat2d.fromRect, Mat2d.create(), innerTargetRect)

  const innerQuad = createMaybeMemo(Mat2d.cover, Mat2d.create(), innerTargetQuad, outerQuad)

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
