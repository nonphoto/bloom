import {
  BodyQuad2d,
  bodyQuad2dCreate,
  bodyQuad2dFromRect,
  quad2dCreate,
  quad2dFromRect,
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
  on,
  onCleanup,
} from 'solid-js'
import { createMatchAttempt } from './microtask'
import { useLayoutModel } from '@chloranthy/layout-model'
import { createMaybeMemo } from './utils'
import { createSpringQuad2d } from './animation'
import { createSetQuad } from './quad'

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

function copyNodeStyle(sourceNode: HTMLElement, targetNode: HTMLElement) {
  const computedStyle = window.getComputedStyle(sourceNode)
  Array.from(computedStyle).forEach(key =>
    targetNode.style.setProperty(
      key,
      computedStyle.getPropertyValue(key),
      computedStyle.getPropertyPriority(key),
    ),
  )
}

export function createViewTransition(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  config: Accessor<ViewTransitionConfig>,
) {
  const context = useViewTransitionContext()
  const key = access(config)?.key
  createComputed(
    on(
      () => access(element),
      elementValue => {
        if (context && elementValue && key) {
          const { exiting, entering } = context
          const [state, setState] = createSignal<AnimationState>()
          const layoutModel = useLayoutModel()
          const rect = layoutModel.useRect(elementValue)

          createMatchAttempt(
            key,
            state,
            entering,
            exiting,
            exitingState => {
              const {
                body: [body, setBody],
              } = exitingState()
              elementValue.style.outline = 'solid blue 1px'
              const layoutModel = useLayoutModel()
              const targetRect = layoutModel.useRect(elementValue)
              const targetQuad = createMaybeMemo(quad2dFromRect, quad2dCreate, targetRect)
              createComputed(() => {
                if (targetQuad()) {
                  const isRunning = createSpringQuad2d(targetQuad, body, setBody, 500)
                  createSetQuad(elementValue, () => body().p)
                  createEffect(() => {
                    if (!isRunning()) {
                      elementValue.style.outline = ''
                    }
                  })
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
            const clone = elementValue.cloneNode(false) as HTMLElement
            copyNodeStyle(elementValue, clone)
            const rectValue = rect()
            if (rectValue) {
              document.body.appendChild(clone)
              clone.style.width = rectValue.width + 'px'
              clone.style.height = rectValue.height + 'px'
              clone.style.transform = ''
              clone.style.position = 'absolute'
              clone.style.pointerEvents = 'none'
              clone.style.outline = 'solid red 1px'
            }

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
                  if (rectValue) {
                    setBody(bodyQuad2dFromRect(bodyQuad2dCreate(), rectValue))
                  } else {
                    setBody(bodyQuad2dCreate())
                  }
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
      },
    ),
  )
}

export const viewTransition: Directive<ViewTransitionConfig> = (target, config) => {
  if (target instanceof HTMLElement) {
    createViewTransition(target, config)
  }
}
