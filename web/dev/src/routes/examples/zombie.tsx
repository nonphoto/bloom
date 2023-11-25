import { Zombie, ZombieContext } from '@chloranthy/solid'
import { ParentProps, Show, createSignal, useContext, untrack, createEffect } from 'solid-js'

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
                }, 1000)
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
    <Zombie>
      <Button>
        Zombie A<Button>Zombie B</Button>
      </Button>
    </Zombie>
  )
}
