import classes from './List.module.css'
import {
  For,
  Signal,
  createComputed,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  getOwner,
  onCleanup,
  runWithOwner,
} from 'solid-js'
import clsx from 'clsx'
import { borderRadius, createMaybeMemo, createSetQuad, createSpring } from '@chloranthy/solid'
import { Directive, access } from '@solid-primitives/utils'
import { createContextProvider } from '@solid-primitives/context'
import { ReactiveMap } from '@solid-primitives/map'
import { createSubRoot } from '@solid-primitives/rootless'
import { SingletonMap, useLayoutModel } from '@chloranthy/layout-model'
import { Mat2d, Vec2, vec2Copy, vec2Create } from '@chloranthy/gl-matrix'
import {
  Body2d,
  Quad2d,
  body2dCreate,
  quad2dCreate,
  quad2dFromPositionSize,
  quad2dTransformMat2d,
  rectPosition,
  rectSize,
} from '@chloranthy/core'

borderRadius

const items = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel']

interface ViewTransitionKeyState {
  size: Signal<Body2d>
  position: Signal<Body2d>
}

const [ViewTransitionContextProvider, useViewTransitionContext] = createContextProvider(() => {
  const exiting = new ReactiveMap<ViewTransitionKey, HTMLElement>()
  const entering = new ReactiveMap<ViewTransitionKey, Promise<void>>()
  const state = new SingletonMap<
    ViewTransitionKey,
    ViewTransitionKeyState,
    { size: Vec2; position: Vec2 }
  >((_, args) => {
    const size = body2dCreate()
    const position = body2dCreate()
    if (args) {
      vec2Copy(size.p, args.size)
      vec2Copy(position.p, args.position)
    }
    return {
      size: createSignal(size, { equals: false }),
      position: createSignal(position, { equals: false }),
    }
  })

  return {
    exiting,
    entering,
    state,
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

    let resolveComplete: () => void

    const complete = new Promise<void>(resolve => {
      resolveComplete = resolve
    })

    createMatchAttempt(
      key,
      complete,
      entering,
      exiting,
      from => {
        const layoutModel = useLayoutModel()
        const fromRect = layoutModel.useRect(from)
        const toRect = layoutModel.useRect(target)
        const outerMatrix = layoutModel.useMatrix(target)
        createComputed(() => {
          const fromRectValue = fromRect()
          const toRectValue = toRect()
          console.log(fromRectValue, toRectValue)
          if (fromRectValue && toRectValue) {
            const fromPosition = rectPosition(vec2Create(), fromRectValue)
            const fromSize = rectSize(vec2Create(), fromRectValue)
            const toPosition = rectPosition(vec2Create(), toRectValue)
            const toSize = rectSize(vec2Create(), toRectValue)
            const state = context.state.use(key, { size: fromSize, position: fromPosition })
            const positionSpringRunning = createSpring(toPosition, ...state.position, 150)
            const sizeSpringRunning = createSpring(toSize, ...state.size, 300)
            const quad = createMaybeMemo(
              (out: Quad2d, position: Vec2, size: Vec2, matrix: Mat2d) => {
                quad2dFromPositionSize(out, position, size)
                quad2dTransformMat2d(out, out, matrix)
                return out
              },
              quad2dCreate,
              () => state.position[0]().p,
              () => state.size[0]().p,
              outerMatrix,
            )
            createSetQuad(from, quad)
            createSetQuad(target, quad)
            createEffect(() => {
              if (fromRect() && toRect() && !positionSpringRunning() && !sizeSpringRunning()) {
                resolveComplete()
              }
            })
          }
        })
      },
      () => {},
    )

    onCleanup(() => {
      const clone = target.cloneNode(true) as HTMLElement
      target.parentElement?.insertBefore(clone, target)
      clone.style.opacity = '0.5'
      clone.style.pointerEvents = 'none'

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
