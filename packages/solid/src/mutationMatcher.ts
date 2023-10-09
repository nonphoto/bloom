export class MutationMatcher<T, Enter, Exit> {
  #entering = new Map<T, Enter[]>()
  #exiting = new Map<T, Exit[]>()

  #add(map: Map<T, Enter[]>, key: T, value: Enter): void
  #add(map: Map<T, Exit[]>, key: T, value: Exit): void
  #add(map: Map<T, unknown[]>, key: T, value: unknown) {
    const array = map.get(key)
    if (array) {
      array.push(value)
    } else {
      map.set(key, [value])
    }
  }

  #remove(map: Map<T, Enter[]>, key: T): Enter | undefined
  #remove(map: Map<T, Exit[]>, key: T): Exit | undefined
  #remove(map: Map<T, unknown[]>, key: T): unknown | undefined {
    const array = map.get(key)
    if (array) {
      const value = array.shift()
      if (array.length === 0) {
        map.delete(key)
      }
      return value
    } else {
      return undefined
    }
  }

  #has(map: Map<T, unknown[]>, key: T): boolean {
    const array = map.get(key)
    if (array && array.length > 0) {
      return true
    } else {
      return false
    }
  }

  #attempt(
    key: T,
    value: Enter,
    self: Map<T, Enter[]>,
    other: Map<T, Exit[]>,
    onSuccess: (value: Exit) => void,
    onFailure: () => void,
  ): void
  #attempt(
    key: T,
    value: Exit,
    self: Map<T, Exit[]>,
    other: Map<T, Enter[]>,
    onSuccess: (value: Enter) => void,
    onFailure: () => void,
  ): void
  #attempt(
    key: T,
    value: any,
    self: Map<T, any[]>,
    other: Map<T, any[]>,
    onSuccess: (value: any) => void,
    onFailure: () => void,
  ): void {
    this.#add(self, key, value)
    queueMicrotask(() => {
      if (this.#has(other, key)) {
        const value = this.#remove(other, key)!
        onSuccess(value)
      } else {
        this.#remove(self, key)
        onFailure()
      }
    })
  }

  attemptEnter(
    key: T,
    value: Enter,
    onSuccess: (value: Exit) => void,
    onFailure: () => void,
  ): void {
    this.#attempt(key, value, this.#entering, this.#exiting, onSuccess, onFailure)
  }

  attemptExit(key: T, value: Exit, onSuccess: (value: Enter) => void, onFailure: () => void): void {
    this.#attempt(key, value, this.#exiting, this.#entering, onSuccess, onFailure)
  }
}
