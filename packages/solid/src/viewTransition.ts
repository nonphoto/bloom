import { BodyQuad2d } from '@chloranthy/core'
import { createContextProvider } from '@solid-primitives/context'
import { Directive, MaybeAccessor, access } from '@solid-primitives/utils'
import {
  Accessor,
  createEffect,
  createRoot,
  createSignal,
  createComputed,
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

export function createViewTransitionContext() {
  return createContextProvider(() => {
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
}

export const [ViewTransitionContextProvider, useViewTransitionContext] =
  createViewTransitionContext()

function setInert(element: HTMLElement, rect: DOMRect) {
  element.style.width = rect?.width + 'px'
  element.style.height = rect?.height + 'px'
  element.style.position = 'absolute'
  element.inert = true
}

function createOnce<T>(dep: Accessor<T>, fn: (value: NonNullable<T>) => void) {
  let done = false
  createComputed(
    on(dep, value => {
      if (!done && value) {
        done = true
        fn(value)
      }
    }),
  )
}

export function createViewTransition(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  options: Accessor<ViewTransitionOptions>,
) {
  const context = useViewTransitionContext()

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

            createRoot(dispose => {
              const layoutModel = useLayoutModel()
              const rect = layoutModel.useRect(elementValue)

              createOnce(rect, rectValue => {
                const onExitAttempt = (
                  matchAnimation?: Accessor<ReactiveAnimation | undefined>,
                ) => {
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
                }

                matcher.attemptExit(
                  key,
                  { animation: untrack(animation), rect: rectValue },
                  onExitAttempt,
                  onExitAttempt,
                )
              })
            })
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
