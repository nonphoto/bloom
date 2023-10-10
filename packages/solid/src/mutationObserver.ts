import { createMutationObserver } from '@solid-primitives/mutation-observer'
import { Listeners } from './listeners'
import { isServer } from 'solid-js/web'

export function createOnExit() {
  const exitListeners = new Listeners<HTMLElement, HTMLElement>()

  createMutationObserver(
    isServer ? [] : document.body,
    { childList: true, subtree: true },
    records => {
      for (const record of records) {
        for (const node of record.removedNodes) {
          if (node instanceof HTMLElement && record.target instanceof HTMLElement) {
            exitListeners.notify(node, record.target)
          }
        }
      }
    },
  )

  return (element: HTMLElement, callback: (parent: HTMLElement) => void) => {
    const listener = (parent: HTMLElement) => {
      exitListeners.remove(element, listener)
      callback(parent)
    }
    exitListeners.add(element, listener)
  }
}
