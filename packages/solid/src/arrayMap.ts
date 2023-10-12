export class ArrayMap<K, V> {
  #map = new Map<K, V[]>()

  push(key: K, value: V): void {
    const array = this.#map.get(key)
    if (array) {
      array.push(value)
    } else {
      this.#map.set(key, [value])
    }
  }

  shift(key: K): V | undefined {
    const array = this.#map.get(key)
    if (array) {
      const value = array.shift()
      if (array.length === 0) {
        this.#map.delete(key)
      }
      return value
    } else {
      return undefined
    }
  }

  delete(key: K, value: V) {
    const array = this.#map.get(key)
    if (array) {
      const index = array.indexOf(value)
      if (index >= 0) {
        array.splice(index, 1)
      }
    }
  }

  has(key: K): boolean {
    const array = this.#map.get(key)
    if (array && array.length > 0) {
      return true
    } else {
      return false
    }
  }
}
