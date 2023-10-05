import {
  BodyQuad2d,
  bodyQuad2dCreate,
  bodyQuad2dFromRect,
  quad2dCreate,
  quad2dFromRect,
  quad2dTransformMat2d,
} from '@chloranthy/core'
import { createContextProvider } from '@solid-primitives/context'
import { ReactiveMap } from '@solid-primitives/map'
import { Directive, MaybeAccessor, access } from '@solid-primitives/utils'
import {
  Accessor,
  Signal,
  createComputed,
  createEffect,
  createRoot,
  createSignal,
  onCleanup,
} from 'solid-js'
import { createMatchAttempt } from './microtask'
import { useLayoutModel } from '@chloranthy/layout-model'
import { createMaybeMemo } from './utils'
import { createSpringQuad2d } from './animation'
import { createSetQuad } from './quad'
import { getRect } from './rect'

export type ViewTransitionKey = string | symbol
export type ViewTransitionConfig = { key: ViewTransitionKey }
export type AnimationState = {
  isRunning: Accessor<boolean>
  body: Signal<BodyQuad2d>
}

export function createViewTransitionContext() {
  return createContextProvider(() => {
    const exiting = new ReactiveMap<ViewTransitionKey, Accessor<AnimationState>>()
    const entering = new ReactiveMap<ViewTransitionKey, Accessor<AnimationState | undefined>>()

    return {
      exiting,
      entering,
    }
  })
}

export const [ViewTransitionContextProvider, useViewTransitionContext] =
  createViewTransitionContext()

export function createViewTransition(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  config: Accessor<ViewTransitionConfig>,
) {
  const context = useViewTransitionContext()
  const key = access(config)?.key
  createComputed(() => {
    const elementValue = access(element)
    if (context && elementValue && key) {
      const { exiting, entering } = context
      const [state, setState] = createSignal<AnimationState>()

      createMatchAttempt(
        key,
        state,
        entering,
        exiting,
        exitingState => {
          const {
            body: [body, setBody],
          } = exitingState()
          const layoutModel = useLayoutModel()
          const targetRect = layoutModel.useRect(elementValue)
          const targetMatrix = layoutModel.useMatrix(elementValue)
          const targetQuad = createMaybeMemo(quad2dFromRect, quad2dCreate, targetRect)
          createComputed(() => {
            if (targetQuad()) {
              const isRunning = createSpringQuad2d(targetQuad, body, setBody, 150)
              const quad = createMaybeMemo(
                quad2dTransformMat2d,
                quad2dCreate,
                () => body().p,
                targetMatrix,
              )
              createSetQuad(elementValue, quad)
              setState({
                body: [body, setBody],
                isRunning,
              })
            }
          })
        },
        () => {},
      )

      onCleanup(() => {
        const clone = elementValue.cloneNode(true) as HTMLElement
        elementValue.parentElement?.insertBefore(clone, elementValue)
        clone.style.transform = ''
        clone.style.position = 'absolute'
        clone.style.pointerEvents = 'none'

        function removeClone() {
          clone.parentElement?.removeChild(clone)
        }

        createMatchAttempt(
          key,
          () => {
            const stateValue = state()
            if (stateValue) {
              return stateValue
            } else {
              const [body, setBody] = createSignal<BodyQuad2d | undefined>(undefined, {
                equals: false,
              })
              getRect(elementValue).then(rect => {
                setBody(bodyQuad2dFromRect(bodyQuad2dCreate(), rect))
              })
              return {
                isRunning: () => false,
                body: [body, setBody],
              }
            }
          },
          exiting,
          entering,
          async enteringState => {
            createRoot(dispose => {
              createComputed(() => {
                const enteringStateValue = enteringState()
                if (enteringStateValue) {
                  setState(enteringStateValue)
                  const {
                    isRunning,
                    body: [body],
                  } = enteringStateValue
                  createSetQuad(clone, () => body().p)
                  createEffect(() => {
                    if (!isRunning()) {
                      dispose()
                      removeClone()
                    }
                  })
                }
              })
            })
          },
          () => {
            removeClone()
          },
        )
      })
    }
  })
}

export const viewTransition: Directive<ViewTransitionConfig> = (target, config) => {
  if (target instanceof HTMLElement) {
    createViewTransition(target, config)
  }
}
