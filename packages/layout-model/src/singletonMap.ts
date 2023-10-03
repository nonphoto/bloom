import { ReactiveMap } from '@solid-primitives/map'
import { createSingletonRoot } from '@solid-primitives/rootless'
import { Owner, createRoot, getOwner, onCleanup, untrack } from 'solid-js'

type Factory<T, U, V> = (key: T, args?: V) => U

export class SingletonMap<T, U, V = void> {
  #map = new ReactiveMap<T, () => U>()
  #factory: Factory<T, U, V>
  #owner: Owner | null

  constructor(factory: Factory<T, U, V>) {
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

  use(key: T, args?: V): U {
    const value = untrack(() => this.#map.get(key))
    if (value) {
      return value()
    } else {
      const use = createSingletonRoot(() => {
        onCleanup(() => {
          this.#map.delete(key)
        })
        return this.#factory(key, args)
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
