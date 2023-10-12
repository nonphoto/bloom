import { ArrayMap } from './arrayMap'

export class MutationMatcher<T, Enter, Exit> {
  #entering = new ArrayMap<T, Enter>()
  #exiting = new ArrayMap<T, Exit>()

  #attempt(
    key: T,
    value: Enter,
    self: ArrayMap<T, Enter>,
    other: ArrayMap<T, Exit>,
    onSuccess: (value: Exit) => void,
    onFailure: () => void,
  ): void
  #attempt(
    key: T,
    value: Exit,
    self: ArrayMap<T, Exit>,
    other: ArrayMap<T, Enter>,
    onSuccess: (value: Enter) => void,
    onFailure: () => void,
  ): void
  #attempt(
    key: T,
    value: any,
    self: ArrayMap<T, any>,
    other: ArrayMap<T, any>,
    onSuccess: (value: any) => void,
    onFailure: () => void,
  ): void {
    self.push(key, value)
    queueMicrotask(() => {
      if (other.has(key)) {
        const value = other.shift(key)!
        onSuccess(value)
      } else {
        self.delete(key, value)
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
