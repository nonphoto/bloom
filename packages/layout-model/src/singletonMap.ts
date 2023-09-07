import { ReactiveMap } from '@solid-primitives/map'
import { createSingletonRoot } from '@solid-primitives/rootless'
import { Owner, createRoot, getOwner, onCleanup, untrack } from 'solid-js'

export class SingletonMap<T, U> {
  #map = new ReactiveMap<T, () => U>()
  #factory: (key: T) => U
  #owner: Owner | null

  constructor(factory: (key: T) => U) {
    this.#factory = factory
    this.#owner = getOwner()
  }

  get(key: T): U | undefined {
    const use = this.#map.get(key)
    if (use) {
      return createRoot(dispose => {
        dispose()
        return use()
      })
    }
  }

  use(key: T): U {
    const value = untrack(() => this.#map.get(key))
    if (value) {
      return value()
    } else {
      const use = createSingletonRoot(() => {
        onCleanup(() => {
          this.#map.delete(key)
        })
        return this.#factory(key)
      }, this.#owner)
      this.#map.set(key, use)
      return use()
    }
  }

  clear() {
    return this.#map.clear()
  }

  keys() {
    return this.#map.keys()
  }
}
