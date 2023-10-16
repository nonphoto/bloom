import { Batcher } from '@chloranthy/layout-model'
import { ArrayMap } from './arrayMap'

type Mutation<T, U> = {
  value: T
  onSuccess: (value: U) => void
  onFailure: () => void
}

export class MutationMatcher<T, Enter, Exit> {
  #entering = new ArrayMap<T, Mutation<Enter, Exit>>()
  #exiting = new ArrayMap<T, Mutation<Exit, Enter>>()
  #batcher = new Batcher({
    onPreRun: () => {
      const keys = new Set([...this.#entering.keys(), ...this.#exiting.keys()])
      for (const key of keys) {
        const entering = this.#entering.get(key) ?? []
        const exiting = this.#exiting.get(key) ?? []
        let i = 0
        while (i < (entering?.length ?? 0)) {
          if (i === 0 && entering[i] && exiting[i]) {
            entering[i]!.onSuccess(exiting[i]!.value)
            exiting[i]!.onSuccess(entering[i]!.value)
          } else {
            if (entering[i]) {
              entering[i]?.onFailure()
            }
            if (exiting[i]) {
              exiting[i]?.onFailure()
            }
          }
          i++
        }
        while (i < (exiting?.length ?? 0)) {
          if (exiting[i]) {
            exiting[i]?.onFailure()
          }
          i++
        }
      }
    },
  })

  #attempt<Send, Receive>(
    key: T,
    value: Send,
    map: ArrayMap<T, Mutation<Send, Receive>>,
    onSuccess: (value: Receive) => void,
    onFailure: () => void,
  ): void {
    const mutation = { value, onSuccess, onFailure }
    map.push(key, mutation)
    this.#batcher.enqueue(() => {
      map.delete(key, mutation)
    })
  }

  attemptEnter(
    key: T,
    value: Enter,
    onSuccess: (value: Exit) => void,
    onFailure: () => void,
  ): void {
    this.#attempt(key, value, this.#entering, onSuccess, onFailure)
  }

  attemptExit(key: T, value: Exit, onSuccess: (value: Enter) => void, onFailure: () => void): void {
    this.#attempt(key, value, this.#exiting, onSuccess, onFailure)
  }
}
