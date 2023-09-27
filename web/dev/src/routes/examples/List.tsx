import classes from './List.module.css'
import { For, createComputed, createRoot, createSignal, onCleanup } from 'solid-js'
import clsx from 'clsx'
import { borderRadius } from '@chloranthy/solid'
import { Directive, access } from '@solid-primitives/utils'
import { createContextProvider } from '@solid-primitives/context'
import { ReactiveMap } from '@solid-primitives/map'
import { createSubRoot } from '@solid-primitives/rootless'
import { useLayoutModel } from '@chloranthy/layout-model'
import { vec2Create, vec2Div, vec2Sub } from '@chloranthy/gl-matrix'
import { rectPosition, rectSize } from '@chloranthy/core'

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

function createMatchAttempt<T, U, V>(
  key: T,
  value: U,
  self: ReactiveMap<T, U>,
  other: ReactiveMap<T, V>,
  onSuccess: (value: V) => void,
  onFailure: () => void,
) {
  createSubRoot(dispose => {
    let disposed = false
    self.set(key, value)
    createComputed(() => {
      if (other.has(key)) {
        onSuccess(other.get(key)!)
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

function getRect(element: HTMLElement): Promise<DOMRect> {
  return createRoot(dispose => {
    return new Promise<DOMRect>((resolve, reject) => {
      const layoutModel = useLayoutModel()
      const rect = layoutModel.useRect(element)
      createComputed(() => {
        if (rect()) {
          resolve(rect()!)
        }
      })
      layoutModel.invalidateRect(element).then(reject)
    }).finally(dispose)
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
      async from => {
        console.log('transition enter', from)
        const [targetRect, fromRect] = await Promise.all([getRect(target), getRect(from)])
        const deltaPosition = vec2Sub(
          vec2Create(),
          rectPosition(vec2Create(), fromRect),
          rectPosition(vec2Create(), targetRect),
        )
        const deltaSize = vec2Div(
          vec2Create(),
          rectSize(vec2Create(), fromRect),
          rectSize(vec2Create(), targetRect),
        )
        target.animate(
          {
            transform: [
              `translate(${deltaPosition[0]}px, ${deltaPosition[1]}px) scale(${deltaSize[0]}, ${deltaSize[1]})`,
              `translate(0px, 0px) scale(1, 1)`,
            ],
          },
          { duration: 1000 },
        )
      },
      () => {
        console.log('enter')
      },
    )

    onCleanup(() => {
      const clone = target.cloneNode(true) as HTMLElement
      target.parentElement?.insertBefore(clone, target)
      clone.style.opacity = '0.5'

      function complete() {
        clone.parentElement?.removeChild(clone)
      }

      createMatchAttempt(
        key,
        clone,
        exiting,
        entering,
        async value => {
          console.log('transition exit', value)
          setTimeout(() => {
            complete()
          }, 1000)
        },
        () => {
          console.log('exit')
          complete()
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
