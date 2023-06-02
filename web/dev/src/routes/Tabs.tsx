import { For, createSignal, createUniqueId } from 'solid-js'

const items = [
  { title: 'Alpha', id: createUniqueId(), image: 0 },
  { title: 'Bravo', id: createUniqueId(), image: 1 },
  { title: 'Charlie', id: createUniqueId(), image: 2 },
  { title: 'Delta', id: createUniqueId(), image: 3 },
  { title: 'Echo', id: createUniqueId(), image: 4 },
]

export default function Tabs() {
  const [selectedId, setSelectedId] = createSignal<string>(items[0]?.id ?? '')

  return (
    <div>
      <nav>
        <For each={items}>
          {({ title, id }) => (
            <button
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
              onClick={() => {
                setSelectedId(id)
              }}
            >
              {title}
            </button>
          )}
        </For>
      </nav>
      <div>
        <For each={items}>{({ id }) => <div>{id}</div>}</For>
      </div>
    </div>
  )
}
