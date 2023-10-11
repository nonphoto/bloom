import {
  BodyQuad2d,
  bodyQuad2dClone,
  bodyQuad2dCreate,
  bodyQuad2dFromRect,
  quad2dCreate,
  quad2dFromRect,
} from '@chloranthy/core'
import { createContextProvider } from '@solid-primitives/context'
import { Directive, MaybeAccessor, access } from '@solid-primitives/utils'
import {
  Accessor,
  Setter,
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
import { createSubRoot } from '@solid-primitives/rootless'

export type ViewTransitionKey = string | symbol
export type ViewTransitionConfig = { key: ViewTransitionKey }
export type ReactiveAnimation = {
  isFinished: Accessor<boolean>
  body: Accessor<BodyQuad2d>
  setBody: Setter<BodyQuad2d>
}

export function createViewTransitionContext() {
  return createContextProvider(() => {
    const matcher = new MutationMatcher<
      ViewTransitionKey,
      Accessor<ReactiveAnimation | null | undefined>,
      { animation: ReactiveAnimation | null | undefined; rect: DOMRect }
    >()

    return {
      matcher,
    }
  })
}

export const [ViewTransitionContextProvider, useViewTransitionContext] =
  createViewTransitionContext()

function setInert(element: HTMLElement, rect: DOMRect) {
  element.style.width = rect?.width + 'px'
  element.style.height = rect?.height + 'px'
  element.style.position = 'absolute'
  element.inert = true
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
        const contextValue = access(context)
        if (contextValue && elementValue) {
          const owner = getOwner()
          const key = access(config).key
          const { matcher } = contextValue
          const [animation, setAnimation] = createSignal<ReactiveAnimation | null | undefined>()

          matcher.attemptEnter(
            key,
            animation,
            exitingMatch => {
              createSubRoot(dispose => {
                const [body, setBody] = createSignal<BodyQuad2d>(
                  exitingMatch.animation
                    ? untrack(exitingMatch.animation.body)
                    : bodyQuad2dFromRect(bodyQuad2dCreate(), exitingMatch.rect),
                  {
                    equals: false,
                  },
                )
                const quad = createMaybeMemo(quad2dFromRect, quad2dCreate(), rect)
                const isRunning = createSpringQuad2d(quad, body, setBody, 500)
                const isFinished = () => quad() != null && !isRunning()
                createSetQuad(elementValue, () => body().p)
                setAnimation({
                  body,
                  setBody,
                  isFinished,
                })
                createEffect(() => {
                  if (isFinished()) {
                    dispose()
                  }
                })
              }, owner)
            },
            () => {},
          )

          onCleanup(() => {
            const rectValue = untrack(rect)
            const parent = elementValue.parentElement
            if (!rectValue) return
            matcher.attemptExit(
              key,
              { animation: untrack(animation), rect: rectValue },
              enteringAnimation => {
                createRoot(dispose => {
                  setInert(elementValue, rectValue)
                  parent?.appendChild(elementValue)
                  layoutModel.invalidateRect(elementValue)
                  onCleanup(() => {
                    elementValue.parentElement?.removeChild(elementValue)
                  })
                  createEffect(() => {
                    const enteringAnimationValue = enteringAnimation()
                    if (enteringAnimationValue != null) {
                      setAnimation(enteringAnimationValue)
                      createSetQuad(elementValue, () => enteringAnimationValue.body().p)
                      createEffect(() => {
                        if (enteringAnimationValue.isFinished()) {
                          dispose()
                        }
                      })
                    } else if (enteringAnimationValue === null) {
                      dispose()
                    }
                  })
                })
              },
              () => {
                setAnimation(null)
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
