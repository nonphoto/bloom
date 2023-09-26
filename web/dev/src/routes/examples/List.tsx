import classes from './List.module.css'
import { For, createComputed, createSignal, on, onCleanup, untrack } from 'solid-js'
import clsx from 'clsx'
import { borderRadius } from '@chloranthy/solid'
import { Directive, access } from '@solid-primitives/utils'
import { createContextProvider } from '@solid-primitives/context'
import { ReactiveMap } from '@solid-primitives/map'
import { createSubRoot } from '@solid-primitives/rootless'
import { take } from 'ramda'

borderRadius

const items = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel']

const [ViewTransitionContextProvider, useViewTransitionContext] = createContextProvider(() => {
  const exiting = new ReactiveMap<ViewTransitionKey, HTMLElement>()
  const entering = new ReactiveMap<ViewTransitionKey, HTMLElement>()

  return {
    exiting,
    entering,
  }
})

type ViewTransitionKey = string | symbol
type ViewTransitionConfig = { key: ViewTransitionKey }

function createMatchAttempt<T, U>(
  key: T,
  value: U,
  self: ReactiveMap<T, U>,
  other: ReactiveMap<T, U>,
  onSuccess: () => void,
  onFailure: () => void,
) {
  createSubRoot(dispose => {
    let disposed = false
    self.set(key, value)
    createComputed(() => {
      if (other.has(key)) {
        onSuccess()
        other.delete(key)
        dispose()
        disposed = true
      }
    })
    queueMicrotask(() => {
      if (!disposed) {
        onFailure()
        self.delete(key)
        dispose()
      }
    })
  })
}

const viewTransition: Directive<ViewTransitionConfig> = (target, config) => {
  const context = useViewTransitionContext()
  const configValue = access(config)
  if (context && target instanceof HTMLElement && configValue) {
    const { key } = configValue
    const { exiting, entering } = context

    createMatchAttempt(
      key,
      target,
      entering,
      exiting,
      () => {
        console.log('transition enter', key, target)
      },
      () => {
        console.log('enter', key, target)
      },
    )

    onCleanup(() => {
      createMatchAttempt(
        key,
        target,
        exiting,
        entering,
        () => {
          console.log('transition exit', key, target)
        },
        () => {
          console.log('exit', key, target)
        },
      )
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

function* cycle<T>(n: number, array: T[]) {
  for (let i = 0; i < n; i++) {
    yield array[i % array.length]!
  }
}

export default function () {
  const [count, setCount] = createSignal(5)
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
