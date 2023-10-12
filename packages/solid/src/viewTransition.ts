import { BodyQuad2d } from '@chloranthy/core'
import { createContextProvider } from '@solid-primitives/context'
import { Directive, MaybeAccessor, access } from '@solid-primitives/utils'
import {
  Accessor,
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
import { createSubRoot } from '@solid-primitives/rootless'

export type ViewTransitionKey = string | symbol
export type ViewTransitionOptions = {
  key: ViewTransitionKey
  onEnterMatch?: (element: HTMLElement, match: ViewTransitionMatch) => ReactiveAnimation | undefined
  onExitMatch?: (element: HTMLElement, match: ViewTransitionMatch) => ReactiveAnimation | undefined
  onEnter?: (element: HTMLElement) => ReactiveAnimation | undefined
  onExit?: (element: HTMLElement) => ReactiveAnimation | undefined
}
export type ViewTransitionMatch = {
  animation: ReactiveAnimation | null | undefined
  rect: DOMRect
}
export type ReactiveAnimation = {
  isFinished: Accessor<boolean>
  body: Accessor<BodyQuad2d>
}

export function createViewTransitionContext() {
  return createContextProvider(() => {
    const matcher = new MutationMatcher<
      ViewTransitionKey,
      Accessor<ReactiveAnimation | null | undefined>,
      ViewTransitionMatch
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
  options: Accessor<ViewTransitionOptions>,
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
          const { key, onEnterMatch, onExitMatch, onEnter, onExit } = access(options)
          const { matcher } = contextValue
          const [animation, setAnimation] = createSignal<ReactiveAnimation | null | undefined>()

          const onEnterAttempt = (exitingMatch?: ViewTransitionMatch) => {
            createSubRoot(dispose => {
              const animation = exitingMatch
                ? onEnterMatch?.(elementValue, exitingMatch)
                : onEnter?.(elementValue)
              if (animation) {
                setAnimation(animation)
                createEffect(() => {
                  if (animation.isFinished()) {
                    dispose()
                  }
                })
              } else {
                dispose()
              }
            }, owner)
          }

          matcher.attemptEnter(key, animation, onEnterAttempt, onEnterAttempt)

          onCleanup(() => {
            const rectValue = untrack(rect)
            const parent = elementValue.parentElement
            if (!rectValue) return

            const onExitAttempt = (
              prevAnimation?: Accessor<ReactiveAnimation | null | undefined>,
            ) => {
              createRoot(dispose => {
                setInert(elementValue, rectValue)
                parent?.appendChild(elementValue)
                layoutModel.invalidateRect(elementValue)
                onCleanup(() => {
                  elementValue.parentElement?.removeChild(elementValue)
                })
                createEffect(() => {
                  const prevAnimationValue = prevAnimation?.()
                  if (prevAnimationValue != null) {
                    const animation = prevAnimationValue
                      ? onExitMatch?.(elementValue, {
                          animation: prevAnimationValue,
                          rect: rectValue,
                        })
                      : onExit?.(elementValue) ?? null
                    setAnimation(animation)
                    if (animation) {
                      createEffect(() => {
                        if (animation.isFinished()) {
                          dispose()
                        }
                      })
                    } else {
                      dispose()
                    }
                  } else if (prevAnimationValue === null) {
                    dispose()
                  }
                })
              })
            }

            matcher.attemptExit(
              key,
              { animation: untrack(animation), rect: rectValue },
              onExitAttempt,
              onExitAttempt,
            )
          })
        }
      },
    ),
  )
}

export const viewTransition: Directive<ViewTransitionOptions> = (target, options) => {
  if (target instanceof HTMLElement) {
    createViewTransition(target, options)
  }
}
