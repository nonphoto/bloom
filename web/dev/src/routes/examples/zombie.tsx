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
  JSX,
  untrack,
  createUniqueId,
  createEffect,
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

interface ZombieContextValue {
  unmounted: Accessor<boolean>
  addUnmountedChild: (jsx: JSX.Element) => () => void
  useDisposal: () => () => void
}

const ZombieContext = createContext<ZombieContextValue>()

function Zombie(props: ParentProps) {
  const parent = useContext(ZombieContext)
  const [unmounted, setUnmounted] = createSignal(false)
  const [unmountedChildren, setUnmountedChildren] = createSignal<JSX.Element[]>([])
  const disposalDeps = new Map<string, boolean>()

  let removeUnmountedChild: (() => void) | undefined

  const [jsx, dispose] = createRootWithContext(disposeRoot => {
    const dispose = () => {
      disposeRoot()
      removeUnmountedChild?.()
    }

    const context: ZombieContextValue = {
      unmounted: () => unmounted() || (parent?.unmounted() ?? false),
      addUnmountedChild: jsx => {
        const object = [jsx]
        setUnmountedChildren(prev => [...prev, object])
        return () => {
          setUnmountedChildren(prev => prev.filter(item => item !== object))
        }
      },
      useDisposal: () => {
        const id = createUniqueId()

        disposalDeps.set(id, false)
        onCleanup(() => {
          disposalDeps.delete(id)
        })

        return () => {
          disposalDeps.set(id, true)
          if (untrack(unmounted) && Array.from(disposalDeps.values()).every(value => value)) {
            dispose()
          }
        }
      },
    }

    return [
      <ZombieContext.Provider value={context}>
        {props.children}
        {unmountedChildren()}
      </ZombieContext.Provider>,
      dispose,
    ]
  })

  onCleanup(() => {
    setUnmounted(true)
    if (disposalDeps.size > 0) {
      removeUnmountedChild = parent?.addUnmountedChild(jsx)
    } else {
      dispose()
    }
  })

  return jsx
}

function Button(props: ParentProps) {
  const [pressed, setPressed] = createSignal(false)
  return (
    <Show when={!pressed()}>
      <div
        style={{
          padding: '1rem',
          border: 'solid 1px #00000044',
          'border-radius': '0.5rem',
        }}
      >
        <button onClick={[setPressed, true]} style={{ 'align-self': 'start' }}>
          Remove
        </button>
        <Zombie>
          {untrack(() => {
            const zombie = useContext(ZombieContext)
            const release = zombie?.useDisposal()
            createEffect(() => {
              if (zombie?.unmounted()) {
                setTimeout(() => {
                  release?.()
                }, 5000)
              }
            })
            return (
              <div
                style={{
                  padding: '1rem',
                  background: zombie?.unmounted() ? '#ff000022' : '#0000ff22',
                  'border-radius': '0.5rem',
                }}
              >
                {props.children}
              </div>
            )
          })}
        </Zombie>
      </div>
    </Show>
  )
}

export default function () {
  return (
    <Button>
      Zombie A<Button>Zombie B</Button>
    </Button>
  )
}
