import classes from './List.module.css'
import {
  For,
  createComputed,
  createEffect,
  createRoot,
  createSignal,
  on,
  onCleanup,
} from 'solid-js'
import clsx from 'clsx'
import { borderRadius, createMaybeMemo, createSetQuad, createSpringBody } from '@chloranthy/solid'
import { Directive, access } from '@solid-primitives/utils'
import { createContextProvider } from '@solid-primitives/context'
import { ReactiveMap } from '@solid-primitives/map'
import { createSubRoot } from '@solid-primitives/rootless'
import { useLayoutModel } from '@chloranthy/layout-model'
import { Mat2d, Vec2, vec2Create } from '@chloranthy/gl-matrix'
import {
  Quad2d,
  quad2dCreate,
  quad2dFromPositionSize,
  quad2dTransformMat2d,
  rectPosition,
  rectSize,
} from '@chloranthy/core'

borderRadius

const items = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel']

const [ViewTransitionContextProvider, useViewTransitionContext] = createContextProvider(() => {
  const exiting = new ReactiveMap<ViewTransitionKey, HTMLElement>()
  const entering = new ReactiveMap<ViewTransitionKey, Promise<void>>()

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

function createSpringViewTransition(from: HTMLElement, to: HTMLElement, onComplete: () => void) {
  const layoutModel = useLayoutModel()
  const fromRect = layoutModel.useRect(from)
  const toRect = layoutModel.useRect(to)
  const outerMatrix = layoutModel.useMatrix(to)
  const fromPosition = createMaybeMemo(rectPosition, vec2Create, fromRect)
  const fromSize = createMaybeMemo(rectSize, vec2Create, fromRect)
  const toPosition = createMaybeMemo(rectPosition, vec2Create, toRect)
  const toSize = createMaybeMemo(rectSize, vec2Create, toRect)

  createEffect(
    on(
      () => [fromPosition(), fromSize()],
      ([fromPosition, fromSize]) => {
        if (!fromSize || !fromPosition) return
        const [positionSpring, positionSpringRunning] = createSpringBody(
          toPosition,
          150,
          fromPosition,
        )
        const [sizeSpring, sizeSpringRunning] = createSpringBody(toSize, 300, fromSize)
        const quad = createMaybeMemo(
          (out: Quad2d, position: Vec2, size: Vec2, matrix: Mat2d) => {
            quad2dFromPositionSize(out, position, size)
            quad2dTransformMat2d(out, out, matrix)
            return out
          },
          quad2dCreate,
          () => positionSpring().p,
          () => sizeSpring().p,
          outerMatrix,
        )
        createSetQuad(from, quad)
        createSetQuad(to, quad)
        createEffect(() => {
          if (fromRect() && toRect() && !positionSpringRunning() && !sizeSpringRunning()) {
            onComplete()
          }
        })
      },
    ),
  )
}

const viewTransition: Directive<ViewTransitionConfig> = (target, config) => {
  const context = useViewTransitionContext()
  const configValue = access(config)
  if (context && target instanceof HTMLElement && configValue) {
    const { key } = configValue
    const { exiting, entering } = context
    const [from, setFrom] = createSignal<HTMLElement>()

    const complete = new Promise<void>(resolve => {
      createEffect(() => {
        const fromValue = from()
        if (fromValue) {
          createRoot(dispose => {
            createSpringViewTransition(fromValue, target, () => {
              dispose()
              resolve()
            })
          })
        }
      })
    })

    createMatchAttempt(key, complete, entering, exiting, setFrom, () => {
      console.log('enter')
    })

    onCleanup(() => {
      const clone = target.cloneNode(true) as HTMLElement
      target.parentElement?.insertBefore(clone, target)
      clone.style.opacity = '0.5'

      function removeClone() {
        clone.parentElement?.removeChild(clone)
      }

      createMatchAttempt(
        key,
        clone,
        exiting,
        entering,
        async complete => {
          await complete
          removeClone()
        },
        () => {
          console.log('exit')
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
