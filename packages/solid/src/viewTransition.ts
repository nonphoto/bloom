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
  on,
  onCleanup,
  untrack,
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
    const exiting = new ReactiveMap<ViewTransitionKey, () => AnimationState>()
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

export function createViewTransition(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  config: Accessor<ViewTransitionConfig>,
) {
  const context = useViewTransitionContext()
  const layoutModel = useLayoutModel()
  const rect = layoutModel.useRect(element)

  createComputed(
    on(
      () => access(element),
      elementValue => {
        const key = access(config).key
        if (context && elementValue) {
          const { exiting, entering } = context
          const [animation, setAnimation] = createSignal<AnimationState>()

          createMatchAttempt<
            ViewTransitionKey,
            Accessor<AnimationState | undefined>,
            () => AnimationState
          >(
            key,
            animation,
            entering,
            exiting,
            exitingAnimation => {
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
            },
            noop,
          )

          onCleanup(() => {
            createMatchAttempt<
              ViewTransitionKey,
              () => AnimationState,
              Accessor<AnimationState | undefined>
            >(
              key,
              () => {
                const animationValue = untrack(animation)
                const rectValue = untrack(rect)
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
              exiting,
              entering,
              async enteringAnimation => {
                createRoot(dispose => {
                  const clone = cloneInert(elementValue)
                  document.body.appendChild(clone)
                  onCleanup(() => {
                    clone.parentElement?.removeChild(clone)
                  })
                  createEffect(() => {
                    const enteringAnimationValue = enteringAnimation()
                    if (enteringAnimationValue) {
                      setAnimation(enteringAnimationValue)
                      const {
                        isRunning,
                        body: [body],
                      } = enteringAnimationValue
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
