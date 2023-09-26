import { Listener, Listeners } from './listeners'

export class PresenceObserver {
  #enterListeners = new Listeners<HTMLElement, void>()
  #exitListeners = new Listeners<HTMLElement, void>()
  #observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.removedNodes) {
        if (node instanceof HTMLElement) {
          console.log('exit', node)
          this.#exitListeners.notify(node)
        }
      }
      for (const node of record.addedNodes) {
        if (node instanceof HTMLElement) {
          this.#enterListeners.notify(node)
        }
      }
    }
  })

  constructor() {
    this.#observer.observe(document.body, { subtree: true, childList: true })
  }

  disconnect() {
    this.#observer.disconnect()
    this.#enterListeners.clear()
    this.#exitListeners.clear()
  }

  addEnterListener(element: HTMLElement, listener: Listener<void>) {
    this.#enterListeners.add(element, listener)
  }

  removeEnterListener(element: HTMLElement, listener: Listener<void>) {
    this.#enterListeners.remove(element, listener)
  }

  addExitListener(element: HTMLElement, listener: Listener<void>) {
    this.#exitListeners.add(element, listener)
  }

  removeExitListener(element: HTMLElement, listener: Listener<void>) {
    this.#exitListeners.remove(element, listener)
  }
}
