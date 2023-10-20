import { batch } from 'solid-js'

function microtask(): Promise<void> {
  return new Promise(resolve => queueMicrotask(() => resolve()))
}

export class Batcher {
  #microtask: Promise<void> = Promise.resolve()
  #callbacks: Array<(() => void) | undefined> = []
  #onPreRun?: () => void
  #onPostRun?: () => void
  #onFirstEnqueue?: () => void

  constructor(options?: {
    onPreRun?: () => void
    onPostRun?: () => void
    onFirstEnqueue?: () => void
  }) {
    this.#onPreRun = options?.onPreRun
    this.#onPostRun = options?.onPostRun
    this.#onFirstEnqueue = options?.onFirstEnqueue
  }

  #run() {
    this.#onPreRun?.()
    batch(() => {
      for (let i = 0; i < this.#callbacks.length; i++) {
        this.#callbacks[i]?.call(undefined)
      }
      this.#callbacks = []
    })
    this.#onPostRun?.()
  }

  enqueue(callback?: () => void): Promise<void> {
    if (this.#callbacks.length === 0) {
      this.#onFirstEnqueue?.()
      this.#microtask = microtask().then(() => this.#run())
    }
    this.#callbacks.push(callback)
    return this.#microtask
  }
}
