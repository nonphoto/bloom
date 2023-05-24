import { MaybeAccessor, access, isServer } from '@solid-primitives/utils'
import { createRAF } from '@solid-primitives/raf'
import { Accessor, createEffect, createSignal, untrack } from 'solid-js'

export function createComputedStyle<T extends keyof CSSStyleDeclaration>(
  element: HTMLElement,
  propertyName: MaybeAccessor<T>,
): Accessor<CSSStyleDeclaration[T]>
export function createComputedStyle<T extends keyof CSSStyleDeclaration>(
  element: Accessor<HTMLElement | false | null | undefined>,
  propertyName: MaybeAccessor<T>,
): Accessor<CSSStyleDeclaration[T] | undefined>
export function createComputedStyle<T extends keyof CSSStyleDeclaration>(
  element: HTMLElement | Accessor<HTMLElement | false | null | undefined>,
  propertyName: MaybeAccessor<T>,
): Accessor<CSSStyleDeclaration[T]> | Accessor<CSSStyleDeclaration[T] | undefined> {
  if (isServer) {
    return () => undefined
  }

  const [value, setValue] = createSignal<CSSStyleDeclaration[T] | undefined>()

  createEffect(() => {
    const elementValue = access(element)
    if (elementValue) {
      const computedStyle = getComputedStyle(elementValue)

      const [, start] = createRAF(() => {
        const name = untrack(() => access(propertyName)) as T
        setValue(() => computedStyle[name])
      })

      createEffect(() => {
        start()
      })
    }
  })

  return value
}
