import {
  BodyQuad2d,
  bodyQuad2dCreate,
  bodyQuad2dFromRect,
  quad2dCreate,
  quad2dFromRect,
} from '@chloranthy/core'
import { createContextProvider } from '@solid-primitives/context'
import { ReactiveMap } from '@solid-primitives/map'
import { Directive, MaybeAccessor, access, noop } from '@solid-primitives/utils'
import {
  Accessor,
  Signal,
  createComputed,
  createEffect,
  createRoot,
  createSignal,
  getOwner,
  on,
  onCleanup,
  untrack,
} from 'solid-js'
import { createMatchAttempt } from './microtask'
import { useLayoutModel } from '@chloranthy/layout-model'
import { awaitWithOwner, createMaybeMemo } from './utils'
import { createSpringQuad2d } from './animation'
import { createSetQuad } from './quad'
import { getRect } from './rect'
import { createSubRoot } from '@solid-primitives/rootless'

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

function cloneInert(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(false) as HTMLElement
  copyNodeStyle(element, clone)
  clone.style.width = element.offsetWidth + 'px'
  clone.style.height = element.offsetHeight + 'px'
  clone.style.transform = ''
  clone.style.position = 'absolute'
  clone.style.pointerEvents = 'none'
  clone.style.outline = 'solid red 1px'
  return clone
}

function createOnce<S>(deps: Accessor<S>, fn: () => void) {
  const owner = getOwner()
  let created = false
  createComputed(
    on(deps, value => {
      if (!created && value) {
        created = true
        createSubRoot(fn, owner)
      }
    }),
  )
}

export function createViewTransition(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  config: Accessor<ViewTransitionConfig>,
) {
  const context = useViewTransitionContext()
  const layoutModel = useLayoutModel()

  createComputed(
    on(
      () => access(element),
      elementValue => {
        const key = access(config)?.key
        if (context && elementValue && key) {
          const { exiting, entering } = context
          const [state, setState] = createSignal<AnimationState>()

          createMatchAttempt(
            key,
            state,
            entering,
            exiting,
            exitingState => {
              console.log(key, 'enter match success')
              const {
                body: [body, setBody],
              } = exitingState()
              elementValue.style.outline = 'solid blue 1px'
              const rect = layoutModel.useRect(elementValue)
              const quad = createMaybeMemo(quad2dFromRect, quad2dCreate, rect)
              createOnce(quad, () => {
                console.log(key, 'once')
                const isRunning = createSpringQuad2d(quad, body, setBody, 500)
                createSetQuad(elementValue, () => body().p)
                createEffect(() => {
                  if (!isRunning()) {
                    console.log(key, 'done')
                    elementValue.style.outline = ''
                  }
                })
                setState({
                  body: [body, setBody],
                  isRunning,
                })
              })
            },
            noop,
          )

          onCleanup(() => {
            createMatchAttempt(
              key,
              () => {
                const stateValue = untrack(state)
                if (stateValue) {
                  return stateValue
                } else {
                  const [body, setBody] = createSignal<BodyQuad2d>(bodyQuad2dCreate(), {
                    equals: false,
                  })
                  console.log(key, 'exit getRect start')
                  awaitWithOwner(getRect(layoutModel, elementValue), rectValue => {
                    console.log(key, 'exit getRect end')
                    setBody(body => bodyQuad2dFromRect(body, rectValue))
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
                console.log(key, 'exit match success')
                createRoot(dispose => {
                  const clone = cloneInert(elementValue)
                  document.body.appendChild(clone)
                  onCleanup(() => {
                    clone.parentElement?.removeChild(clone)
                  })
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
                        }
                      })
                    }
                  })
                })
              },
              noop,
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
