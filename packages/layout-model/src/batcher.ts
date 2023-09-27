import { batch } from 'solid-js'

function microtask(): Promise<void> {
  return new Promise(resolve => queueMicrotask(() => resolve()))
}

export class Batcher {
  #microtask: Promise<void> = Promise.resolve()
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

  enqueue(callback: () => void): Promise<void> {
    if (this.#callbacks.length === 0) {
      this.#microtask = microtask().then(() => this.#run())
    }
    this.#callbacks.push(callback)
    return this.#microtask
  }
}
