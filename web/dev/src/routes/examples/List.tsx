import classes from './List.module.css'
import { For, createSignal } from 'solid-js'
import clsx from 'clsx'
import {
  ViewTransitionConfig,
  ViewTransitionContextProvider,
  borderRadius,
  viewTransition,
} from '@chloranthy/solid'

borderRadius
viewTransition

const items = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel']

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      viewTransition: ViewTransitionConfig
    }
  }
}

function* cycle<T>(n: number, array: T[]) {
  for (let i = 0; i < n; i++) {
    yield array[i % array.length]!
  }
}

export default function () {
  const [count, setCount] = createSignal(10)
  const [activeItems, setActiveItems] = createSignal(['Delta', 'Echo'])
  const cycledItems = () => [...cycle(count(), items)]

  function addItem(item: string) {
    setActiveItems(items => [...items, item])
  }

  function removeItem(item: string) {
    setActiveItems(items => items.filter(activeItem => activeItem !== item))
  }

  return (
    <ViewTransitionContextProvider>
      <div class={classes.root}>
        <div class={classes.buttons}>
          <button
            onClick={() => {
              setCount(count => Math.max(0, count - 1))
            }}
          >
            Less
          </button>
          <button
            onClick={() => {
              setCount(count => count + 1)
            }}
          >
            More
          </button>
        </div>
        <ul class={classes.list}>
          <For each={cycledItems().filter(item => !activeItems().includes(item))}>
            {item => (
              <li use:viewTransition={{ key: item }}>
                <button use:viewTransition={{ key: `${item}-button` }} onClick={[addItem, item]}>
                  {item}
                </button>
              </li>
            )}
          </For>
        </ul>
        <ul class={clsx(classes.list, classes.active)}>
          <For each={activeItems()}>
            {item => (
              <li use:borderRadius={20} use:viewTransition={{ key: item }}>
                <button use:viewTransition={{ key: `${item}-button` }} onClick={[removeItem, item]}>
                  {item}
                </button>
              </li>
            )}
          </For>
        </ul>
      </div>
    </ViewTransitionContextProvider>
  )
}
