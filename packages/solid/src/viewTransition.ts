import { BodyQuad2d } from '@chloranthy/core'
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
  runWithOwner,
} from 'solid-js'
import { MutationMatcher } from './mutationMatcher'
import { useLayoutModel } from '@chloranthy/layout-model'
import { createSingletonRoot, createSubRoot } from '@solid-primitives/rootless'

export type ViewTransitionKey = string | symbol
export type ViewTransitionOptions = {
  key: ViewTransitionKey
  onEnterMatch?: (
    element: HTMLElement,
    match: ViewTransitionMatch,
  ) => ReactiveAnimation | undefined | void
  onExitMatch?: (
    element: HTMLElement,
    match: ViewTransitionMatch,
  ) => ReactiveAnimation | undefined | void
  onEnter?: (element: HTMLElement) => ReactiveAnimation | undefined | void
  onExit?: (element: HTMLElement) => ReactiveAnimation | undefined | void
}
export type ViewTransitionMatch = {
  animation?: ReactiveAnimation
  rect: DOMRect
}
export type ReactiveAnimation = {
  isFinished: Accessor<boolean>
  body: Accessor<BodyQuad2d>
}

export const useViewTransitionContext = createSingletonRoot(() => {
  const matcher = new MutationMatcher<
    ViewTransitionKey,
    Accessor<ReactiveAnimation | undefined>,
    ViewTransitionMatch
  >()
  const elements = new Set<HTMLElement>()
  return {
    matcher,
    elements,
  }
})

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
          const { matcher, elements } = contextValue
          const [animation, setAnimation] = createSignal<ReactiveAnimation | undefined>()

          elements.add(elementValue)

          const createOnAnimationFinished = (fn: () => void) => {
            createEffect(() => {
              if (animation()?.isFinished() ?? true) {
                fn()
              }
            })
          }

          const onEnterAttempt = (exitingMatch?: ViewTransitionMatch) => {
            createSubRoot(dispose => {
              setAnimation(
                (exitingMatch
                  ? onEnterMatch?.(elementValue, exitingMatch)
                  : onEnter?.(elementValue)) ?? undefined,
              )
              createOnAnimationFinished(dispose)
            }, owner)
          }

          matcher.attemptEnter(key, animation, onEnterAttempt, onEnterAttempt)

          onCleanup(() => {
            const parent = elementValue.parentElement
            const rectValue = untrack(rect)
            if (rectValue) {
              createRoot(dispose => {
                const owner = getOwner()

                const onExitAttempt = (
                  matchAnimation?: Accessor<ReactiveAnimation | undefined>,
                ) => {
                  runWithOwner(owner, () => {
                    setInert(elementValue, rectValue)
                    parent?.appendChild(elementValue)
                    layoutModel.invalidateRect(elementValue)

                    onCleanup(() => {
                      elementValue.parentElement?.removeChild(elementValue)
                      elements.delete(elementValue)
                    })

                    if (matchAnimation) {
                      createEffect(
                        on(
                          matchAnimation,
                          matchAnimationValue => {
                            setAnimation(
                              onExitMatch?.(elementValue, {
                                animation: matchAnimationValue,
                                rect: rectValue,
                              }) ?? undefined,
                            )
                            createOnAnimationFinished(dispose)
                          },
                          { defer: true },
                        ),
                      )
                    } else {
                      setAnimation(onExit?.(elementValue) ?? undefined)
                      createOnAnimationFinished(dispose)
                    }
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
