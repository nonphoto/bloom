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
  createComputed,
} from 'solid-js'
import { MutationMatcher } from './mutationMatcher'
import { useLayoutModel } from '@chloranthy/layout-model'
import { createSingletonRoot, createSubRoot } from '@solid-primitives/rootless'
import { createOnExit } from './mutationObserver'
import { match } from 'assert'

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
  matcher: MutationMatcher<
    ViewTransitionKey,
    Accessor<ReactiveAnimation | undefined>,
    ViewTransitionMatch
  >
  set: Set<HTMLElement>
}

export const useViewTransitionContext = createSingletonRoot(() => {
  const matcher = new MutationMatcher<
    ViewTransitionKey,
    Accessor<ReactiveAnimation | undefined>,
    ViewTransitionMatch
  >()
  const elements = new Set<HTMLElement>()
  const useOnExit = createOnExit()
  return {
    matcher,
    elements,
    useOnExit,
  }
})

function setInert(element: HTMLElement, rect: DOMRect) {
  element.style.width = rect?.width + 'px'
  element.style.height = rect?.height + 'px'
  element.style.position = 'absolute'
  element.inert = true
}

function makeViewTransition(element: HTMLElement, options: ViewTransitionOptions) {
  const owner = getOwner()
  const { key, onEnterMatch, onExitMatch, onEnter, onExit } = options
  const { matcher, useOnExit } = useViewTransitionContext()
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
            useOnExit(element, () => {
              setInert(element, rectValue)
              parent.appendChild(element)

              onCleanup(() => {
                parent.removeChild(element)
              })
            })

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
