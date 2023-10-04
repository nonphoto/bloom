import classes from './List.module.css'
import {
  Accessor,
  For,
  Signal,
  createComputed,
  createEffect,
  createRoot,
  createSignal,
  getOwner,
  onCleanup,
  runWithOwner,
  untrack,
} from 'solid-js'
import clsx from 'clsx'
import { borderRadius, createMaybeMemo, createSetQuad, createSpringQuad2d } from '@chloranthy/solid'
import { Directive, access } from '@solid-primitives/utils'
import { createContextProvider } from '@solid-primitives/context'
import { ReactiveMap } from '@solid-primitives/map'
import { useLayoutModel } from '@chloranthy/layout-model'
import {
  BodyQuad2d,
  bodyQuad2dCreate,
  bodyQuad2dFromRect,
  quad2dCreate,
  quad2dFromRect,
} from '@chloranthy/core'

borderRadius

const items = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel']

type AnimationState = {
  isRunning: Accessor<boolean>
  body: Signal<BodyQuad2d>
}

const [ViewTransitionContextProvider, useViewTransitionContext] = createContextProvider(() => {
  const exiting = new ReactiveMap<ViewTransitionKey, () => AnimationState>()
  const entering = new ReactiveMap<ViewTransitionKey, Accessor<AnimationState | undefined>>()

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
  let done = false
  self.set(key, value)
  const owner = getOwner()
  createComputed(() => {
    if (!done && other.has(key)) {
      done = true
      runWithOwner(owner, () => {
        onSuccess(other.get(key)!)
      })
      other.delete(key)
    }
  })
  queueMicrotask(() => {
    if (!done) {
      done = true
      onFailure()
      self.delete(key)
    }
  })
}

export function getRect(element: HTMLElement): Promise<DOMRect> {
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

    const [state, setState] = createSignal<AnimationState>()

    createMatchAttempt(
      key,
      state,
      entering,
      exiting,
      getState => {
        const {
          body: [body, setBody],
        } = getState()
        const layoutModel = useLayoutModel()
        const targetRect = layoutModel.useRect(target)
        const targetQuad = createMaybeMemo(quad2dFromRect, quad2dCreate, targetRect)
        createComputed(() => {
          if (targetQuad()) {
            const isRunning = createSpringQuad2d(targetQuad, body, setBody, 150)
            createSetQuad(target, () => body().p)
            setState({
              body: [body, setBody],
              isRunning,
            })
          }
        })
      },
      () => {},
    )

    onCleanup(() => {
      const clone = target.cloneNode(true) as HTMLElement
      target.parentElement?.insertBefore(clone, target)
      clone.style.transform = ''
      clone.style.position = 'absolute'
      clone.style.pointerEvents = 'none'

      function removeClone() {
        clone.parentElement?.removeChild(clone)
      }

      createMatchAttempt(
        key,
        () =>
          untrack(() => {
            if (state()) {
              return state()!
            } else {
              const [body, setBody] = createSignal<BodyQuad2d | undefined>(undefined, {
                equals: false,
              })
              getRect(target).then(rect => {
                setBody(bodyQuad2dFromRect(bodyQuad2dCreate(), rect))
              })
              return {
                isRunning: () => false,
                body: [body, setBody],
              }
            }
          }),
        exiting,
        entering,
        async state => {
          createRoot(dispose => {
            createComputed(() => {
              const stateValue = state()
              if (stateValue) {
                console.log(stateValue)
                setState(stateValue)
                const {
                  isRunning,
                  body: [body],
                } = stateValue
                createSetQuad(clone, () => body().p)
                createEffect(() => {
                  if (!isRunning()) {
                    dispose()
                    removeClone()
                  }
                })
              }
            })
          })
        },
        () => {
          removeClone()
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
