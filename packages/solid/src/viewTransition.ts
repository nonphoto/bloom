import {
  BodyQuad2d,
  bodyQuad2dCreate,
  bodyQuad2dFromRect,
  quad2dCreate,
  quad2dFromRect,
} from '@chloranthy/core'
import { createContextProvider } from '@solid-primitives/context'
import { Directive, MaybeAccessor, access, isServer } from '@solid-primitives/utils'
import {
  Accessor,
  Signal,
  createEffect,
  createRoot,
  createSignal,
  getOwner,
  on,
  onCleanup,
  untrack,
} from 'solid-js'
import { MutationMatcher } from './mutationMatcher'
import { useLayoutModel } from '@chloranthy/layout-model'
import { createMaybeMemo } from './utils'
import { createSpringQuad2d } from './animation'
import { createSetQuad } from './quad'
import { createMutationObserver } from '@solid-primitives/mutation-observer'
import { Listeners } from './listeners'
import { createSubRoot } from '@solid-primitives/rootless'

export type ViewTransitionKey = string | symbol
export type ViewTransitionConfig = { key: ViewTransitionKey }
export type AnimationState = {
  isRunning: Accessor<boolean>
  body: Signal<BodyQuad2d>
}

export function createViewTransitionContext() {
  return createContextProvider(() => {
    const matcher = new MutationMatcher<
      ViewTransitionKey,
      Accessor<AnimationState | undefined>,
      () => AnimationState
    >()
    const exitListeners = new Listeners<HTMLElement, HTMLElement>()
    createMutationObserver(
      isServer ? [] : document.body,
      { childList: true, subtree: true },
      records => {
        for (const record of records) {
          for (const node of record.removedNodes) {
            if (node instanceof HTMLElement && record.target instanceof HTMLElement) {
              exitListeners.notify(node, record.target)
            }
          }
        }
      },
    )

    function onExit(element: HTMLElement, callback: (parent: HTMLElement) => void) {
      const listener = (parent: HTMLElement) => {
        exitListeners.remove(element, listener)
        callback(parent)
      }
      exitListeners.add(element, listener)
    }

    return {
      matcher,
      onExit,
    }
  })
}

export const [ViewTransitionContextProvider, useViewTransitionContext] =
  createViewTransitionContext()

function setInert(element: HTMLElement, rect?: DOMRect) {
  element.style.width = (rect?.width ?? element.offsetWidth) + 'px'
  element.style.height = (rect?.height ?? element.offsetHeight) + 'px'
  element.style.position = 'absolute'
  element.style.outline = 'solid red 1px'
  element.inert = true
}

function getElementId(element: HTMLElement) {
  return [
    element.dataset['key'],
    Boolean(element.dataset['button']) && 'button',
    Boolean(element.dataset['active']) && 'active',
    element.dataset['count'],
  ]
    .filter(item => Boolean(item))
    .join('-')
}

export function createViewTransition(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  config: Accessor<ViewTransitionConfig>,
) {
  const context = useViewTransitionContext()
  const layoutModel = useLayoutModel()
  const rect = layoutModel.useRect(element)

  createEffect(
    on(
      () => access(element),
      elementValue => {
        const owner = getOwner()
        const contextValue = access(context)
        const key = access(config).key
        if (contextValue && elementValue) {
          const elementId = getElementId(elementValue)
          const { matcher } = contextValue
          const [animation, setAnimation] = createSignal<AnimationState>()

          console.log(elementId, 'enter match attempt')
          matcher.attemptEnter(
            key,
            animation,
            exitingAnimation => {
              console.log(elementId, 'enter match success')
              createSubRoot(() => {
                const {
                  body: [body, setBody],
                } = exitingAnimation()
                const quad = createMaybeMemo(quad2dFromRect, quad2dCreate(), rect)
                const isRunning = createSpringQuad2d(quad, body, setBody, 500)
                createSetQuad(elementValue, () => body().p)
                setAnimation({
                  body: [body, setBody],
                  isRunning: () => !quad() || isRunning(),
                })
              }, owner)
            },
            () => {
              console.log(elementId, 'enter match fail')
            },
          )

          onCleanup(() => {
            const rectValue = untrack(rect)
            const parent = elementValue.parentElement
            console.log(elementId, 'exit match attempt')
            matcher.attemptExit(
              key,
              () => {
                const animationValue = untrack(animation)
                return (
                  animationValue ?? {
                    isRunning: () => false,
                    body: createSignal<BodyQuad2d>(
                      rectValue
                        ? bodyQuad2dFromRect(bodyQuad2dCreate(), rectValue)
                        : bodyQuad2dCreate(),
                      {
                        equals: false,
                      },
                    ),
                  }
                )
              },
              enteringAnimation => {
                console.log(elementId, 'exit match success')
                createRoot(dispose => {
                  setInert(elementValue, rectValue)
                  parent?.appendChild(elementValue)
                  onCleanup(() => {
                    elementValue.parentElement?.removeChild(elementValue)
                  })
                  createEffect(() => {
                    const enteringAnimationValue = enteringAnimation()
                    console.log(elementId, 'enteringAnimationValue', enteringAnimationValue)
                    if (enteringAnimationValue) {
                      setAnimation(enteringAnimationValue)
                      const {
                        isRunning,
                        body: [body],
                      } = enteringAnimationValue
                      createSetQuad(elementValue, () => body().p)
                      createEffect(() => {
                        if (!isRunning()) {
                          dispose()
                        }
                      })
                    }
                  })
                })
              },
              () => {
                console.log(elementId, 'exit match fail')
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
