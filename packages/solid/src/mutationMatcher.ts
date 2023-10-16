import { Batcher } from '@chloranthy/layout-model'

type Mutation<T, U> = {
  value: T
  onSuccess: (value: U) => void
  onFailure: () => void
}

export class MutationMatcher<T, Enter, Exit> {
  #entering = new Map<T, Mutation<Enter, Exit>[]>()
  #exiting = new Map<T, Mutation<Exit, Enter>[]>()
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
    onPostRun: () => {
      this.#entering = new Map<T, Mutation<Enter, Exit>[]>()
      this.#exiting = new Map<T, Mutation<Exit, Enter>[]>()
    },
  })

  #attempt<Send, Receive>(
    key: T,
    value: Send,
    map: Map<T, Mutation<Send, Receive>[]>,
    onSuccess: (value: Receive) => void,
    onFailure: () => void,
  ): void {
    const mutation = { value, onSuccess, onFailure }
    const array = map.get(key)
    if (array) {
      array.push(mutation)
    } else {
      map.set(key, [mutation])
    }
    this.#batcher.enqueue()
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
