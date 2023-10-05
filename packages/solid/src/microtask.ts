import { ReactiveMap } from '@solid-primitives/map'
import { createComputed, getOwner, runWithOwner } from 'solid-js'

export function createMatchAttempt<T, U, V>(
  key: T,
  value: U,
  self: ReactiveMap<T, U>,
  other: ReactiveMap<T, V>,
  onSuccess: (value: V) => void,
  onFailure: () => void,
) {
  let done = false
  self.set(key, value)
  const owner = getOwner()
  createComputed(() => {
    if (!done && other.has(key)) {
      done = true
      runWithOwner(owner, () => {
        onSuccess(other.get(key)!)
      })
      other.delete(key)
    }
  })
  queueMicrotask(() => {
    if (!done) {
      done = true
      onFailure()
      self.delete(key)
    }
  })
}
