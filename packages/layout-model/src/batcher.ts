import { batch } from 'solid-js'

export class Batcher {
  #callbacks: Array<() => void> = []
  #onPreRun?: () => void
  #onPostRun?: () => void

  constructor(options?: { onPreRun?: () => void; onPostRun?: () => void }) {
    this.#onPreRun = options?.onPreRun
    this.#onPostRun = options?.onPostRun
  }

  #run() {
    this.#onPreRun?.()
    batch(() => {
      while (this.#callbacks.length > 0) {
        const callback = this.#callbacks.shift()
        if (callback) {
          callback.call(undefined)
        }
      }
    })
    this.#onPostRun?.()
  }

  enqueue(callback: () => void) {
    if (this.#callbacks.length === 0) {
      queueMicrotask(() => this.#run())
    }

    this.#callbacks.push(callback)
  }
}
