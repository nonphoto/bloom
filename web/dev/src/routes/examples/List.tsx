import classes from './List.module.css'
import { For, createSignal, onCleanup } from 'solid-js'
import clsx from 'clsx'
import { borderRadius } from '@chloranthy/solid'
import { Directive, access } from '@solid-primitives/utils'
import { createContextProvider } from '@solid-primitives/context'
import { isServer } from 'solid-js/web'
import { PresenceObserver } from '~/lib/presenceObserver'

borderRadius

const items = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel']

const [ViewTransitionContextProvider, useViewTransitionContext] = createContextProvider(() => {
  const exiting = new Map<ViewTransitionKey, HTMLElement>()
  const observer = isServer ? undefined : new PresenceObserver()

  return {
    exiting,
    observer,
  }
})

type ViewTransitionKey = string | symbol
type ViewTransitionConfig = { key: ViewTransitionKey }

const viewTransition: Directive<ViewTransitionConfig> = (target, config) => {
  const context = useViewTransitionContext()
  const configValue = access(config)
  if (context && target instanceof HTMLElement && configValue) {
    const { key } = configValue
    const { observer, exiting } = context

    function onEnter() {
      queueMicrotask(() => {
        if (exiting.has(key)) {
          console.log('match', key)
          exiting.delete(key)
        }
      })
    }

    function onExit() {
      exiting.set(key, target as HTMLElement)
    }

    observer?.addEnterListener(target, onEnter)
    observer?.addExitListener(target, onExit)

    onCleanup(() => {
      observer?.removeEnterListener(target, onEnter)
      observer?.removeExitListener(target, onExit)
    })
  }
}

viewTransition

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      viewTransition: ViewTransitionConfig
    }
  }
}

export default function () {
  const [activeItems, setActiveItems] = createSignal(['Delta', 'Echo'])

  function addItem(item: string) {
    setActiveItems(items => [...items, item])
  }

  function removeItem(item: string) {
    setActiveItems(items => items.filter(activeItem => activeItem !== item))
  }

  return (
    <ViewTransitionContextProvider>
      <div class={classes.root}>
        <ul class={classes.list}>
          <For each={items.filter(item => !activeItems().includes(item))}>
            {item => (
              <li use:viewTransition={{ key: item }}>
                <button onClick={[addItem, item]}>{item}</button>
              </li>
            )}
          </For>
        </ul>
        <ul class={clsx(classes.list, classes.active)}>
          <For each={activeItems()}>
            {item => (
              <li use:borderRadius={20} use:viewTransition={{ key: item }}>
                <button onClick={[removeItem, item]}>{item}</button>
              </li>
            )}
          </For>
        </ul>
      </div>
    </ViewTransitionContextProvider>
  )
}
