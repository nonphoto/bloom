import { resolveElements } from '@solid-primitives/refs'
import { createListTransition } from '@solid-primitives/transition-group'
import {
  ParentProps,
  Show,
  createRoot,
  createSignal,
  getOwner,
  onCleanup,
  createContext,
  Accessor,
  useContext,
  createMemo,
  JSX,
  children,
  untrack,
  createUniqueId,
} from 'solid-js'

function createRootWithContext<T>(fn: (dispose: () => void) => T) {
  const owner = getOwner()
  return createRoot(dispose => {
    const rootOwner = getOwner()
    if (rootOwner && owner) {
      rootOwner.context = owner.context
    }
    return fn(dispose)
  })
}
interface ZombieBoundaryContextValue {}

const ZombieBoundaryContext = createContext<ZombieBoundaryContextValue>()

function ZombieBoundary(props: ParentProps) {
  const [zombies, setZombies] = createSignal<JSX.ArrayElement>([])

  const context = {
    useBoundary: () => {},
  }
  return (
    <ZombieBoundaryContext.Provider value={context}>
      {props.children}
      {zombies()}
    </ZombieBoundaryContext.Provider>
  )
}

interface ZombieContextValue {
  unmounted: Accessor<boolean>
  dispose: () => void
  onChildCleanup(jsx: JSX.Element, dispose: () => void): void
}

const ZombieContext = createContext<ZombieContextValue>()

function Zombie(props: ParentProps) {
  const parent = useContext(ZombieContext)
  const [unmounted, setUnmounted] = createSignal(false)
  const [unmountedChildren, setUnmountedChildren] = createSignal<JSX.Element[]>([])

  const [jsx, dispose] = createRootWithContext(dispose => {
    const context: ZombieContextValue = {
      unmounted: () => unmounted() || (parent?.unmounted() ?? false),
      dispose: () => {
        if (untrack(() => parent?.unmounted())) {
          dispose()
        }
      },
      onChildCleanup: (jsx, dispose) => {
        setUnmountedChildren(prev => [...prev, jsx])
      },
    }

    return [
      <>
        <ZombieContext.Provider value={context}>{props.children}</ZombieContext.Provider>
        {unmountedChildren()}
      </>,
      dispose,
    ]
  })

  onCleanup(() => {
    parent?.onChildCleanup(jsx, dispose)
    setUnmounted(true)
  })

  return jsx
}

function Button(props: ParentProps) {
  const [pressed, setPressed] = createSignal(false)
  return (
    <ZombieBoundary>
      <Show when={!pressed()}>
        <button onClick={[setPressed, true]} style={{ 'align-self': 'start' }}>
          Close
        </button>
        <Zombie>
          {untrack(() => {
            const zombie = useContext(ZombieContext)
            return (
              <div
                style={{
                  padding: '1rem',
                  border: 'solid gray 1px',
                  background: zombie?.unmounted() ? 'lightgray' : 'white',
                }}
              >
                {props.children}
              </div>
            )
          })}
        </Zombie>
      </Show>
    </ZombieBoundary>
  )
}

export default function () {
  return (
    <Button>
      <Button>Hello</Button>
    </Button>
  )
}
