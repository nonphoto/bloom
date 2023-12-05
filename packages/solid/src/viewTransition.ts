import { BodyQuad2d } from '@nonphoto/math'
import { Directive, MaybeAccessor, access, isServer } from '@solid-primitives/utils'
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
  createComputed,
} from 'solid-js'
import { TransitionMatcher } from './transitionMatcher'
import { useLayoutModel } from '@chloranthy/layout-model'
import { createSingletonRoot, createSubRoot } from '@solid-primitives/rootless'
import { createMutationObserver } from '@solid-primitives/mutation-observer'

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
export type ViewTransitionContext = {
  matcher: TransitionMatcher<
    ViewTransitionKey,
    Accessor<ReactiveAnimation | undefined>,
    ViewTransitionMatch
  >
  set: Set<HTMLElement>
}

export const useViewTransitionContext = createSingletonRoot(() => {
  const removals = new Set<{ element: HTMLElement; parent: HTMLElement }>()

  let watchRemovals = false

  createMutationObserver(
    isServer ? [] : document.body,
    { childList: true, subtree: true },
    records => {
      if (watchRemovals) {
        for (const record of records) {
          for (const node of record.removedNodes) {
            if (node instanceof HTMLElement && record.target instanceof HTMLElement) {
              removals.add({ element: node, parent: record.target })
            }
          }
        }
      }
    },
  )

  const matcher = new TransitionMatcher<
    ViewTransitionKey,
    Accessor<ReactiveAnimation | undefined>,
    ViewTransitionMatch
  >({
    onFirstAttempt: () => {
      watchRemovals = true
    },
    onPostRun: () => {
      watchRemovals = false
      removals.clear()
    },
  })

  return {
    matcher,
  }
})

export function setInert(element: HTMLElement, rect: DOMRect) {
  element.style.width = rect?.width + 'px'
  element.style.height = rect?.height + 'px'
  element.style.position = 'absolute'
  element.inert = true
}

function makeViewTransition(element: HTMLElement, options: ViewTransitionOptions) {
  const owner = getOwner()
  const { key, onEnterMatch, onExitMatch, onEnter, onExit } = options
  const { matcher } = useViewTransitionContext()
  const [animation, setAnimation] = createSignal<ReactiveAnimation | undefined>()
  const layoutModel = useLayoutModel()
  const rect = layoutModel.useRect(element)

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
        (exitingMatch ? onEnterMatch?.(element, exitingMatch) : onEnter?.(element)) ?? undefined,
      )
      createOnAnimationFinished(dispose)
    }, owner)
  }

  matcher.attemptEnter(key, animation, onEnterAttempt, onEnterAttempt)

  onCleanup(() => {
    const parent = element.parentElement
    const rectValue = untrack(rect)
    if (rectValue && parent) {
      createRoot(dispose => {
        const owner = getOwner()

        const onExitAttempt = (matchAnimation?: Accessor<ReactiveAnimation | undefined>) => {
          runWithOwner(owner, () => {
            // useOnExit(element, () => {
            //   setInert(element, rectValue)
            //   parent.appendChild(element)

            //   onCleanup(() => {
            //     parent.removeChild(element)
            //   })
            // })

            if (matchAnimation) {
              createEffect(
                on(
                  matchAnimation,
                  matchAnimationValue => {
                    setAnimation(
                      onExitMatch?.(element, {
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
              setAnimation(onExit?.(element) ?? undefined)
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

export function createViewTransition(
  element: MaybeAccessor<HTMLElement | null | undefined>,
  options: MaybeAccessor<ViewTransitionOptions | undefined>,
) {
  createComputed(() => {
    const elementValue = access(element)
    const optionsValue = access(options)

    if (elementValue && optionsValue) {
      makeViewTransition(elementValue, optionsValue)
    }
  })
}

export const viewTransition: Directive<ViewTransitionOptions> = (target, options) => {
  if (target instanceof HTMLElement) {
    createViewTransition(target, options)
  }
}
