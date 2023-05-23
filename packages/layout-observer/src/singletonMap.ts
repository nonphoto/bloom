import { createSingletonRoot } from '@solid-primitives/rootless'
import { createRoot, onCleanup } from 'solid-js'

export class SingletonMap<T extends object, U> {
  #map = new Map<T, () => U>()
  #factory: (key: T) => U

  constructor(factory: (key: T) => U) {
    this.#factory = factory
  }

  get(key: T): U | undefined {
    const use = this.#map.get(key)
    return createRoot(dispose => {
      dispose()
      return use?.()
    })
  }

  use(key: T): U {
    const value = this.#map.get(key)
    if (value) {
      return value()
    } else {
      const use = createSingletonRoot(() => {
        onCleanup(() => {
          this.#map.delete(key)
        })
        return this.#factory(key)
      })
      this.#map.set(key, use)
      return use()
    }
  }
}
