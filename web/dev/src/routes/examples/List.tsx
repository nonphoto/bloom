import classes from './List.module.css'
import { For, createSignal, untrack } from 'solid-js'
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
  const [clickCount, setClickCount] = createSignal(0)

  function addItem(item: string) {
    setClickCount(count => count + 1)
    console.log('addItem', untrack(clickCount))
    setActiveItems(items => [...items, item])
  }

  function removeItem(item: string) {
    setClickCount(count => count + 1)
    console.log('removeItem', untrack(clickCount))
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
              <li
                data-count={untrack(clickCount)}
                data-key={item}
                use:viewTransition={{ key: item }}
              >
                <button
                  data-button="true"
                  data-count={untrack(clickCount)}
                  data-key={item}
                  // use:viewTransition={{ key: `${item}-button` }}
                  onClick={[addItem, item]}
                >
                  {item}
                </button>
              </li>
            )}
          </For>
        </ul>
        <ul class={clsx(classes.list, classes.active)}>
          <For each={activeItems()}>
            {item => (
              <li
                data-active="true"
                data-count={untrack(clickCount)}
                data-key={item}
                use:borderRadius={20}
                use:viewTransition={{ key: item }}
              >
                <button
                  data-active="true"
                  data-button="true"
                  data-count={untrack(clickCount)}
                  data-key={item}
                  // use:viewTransition={{ key: `${item}-button` }}
                  onClick={[removeItem, item]}
                >
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
