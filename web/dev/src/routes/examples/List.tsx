import classes from './List.module.css'
import { For, createSignal } from 'solid-js'
import clsx from 'clsx'
import { borderRadius } from '@chloranthy/solid'

borderRadius

const items = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel']

export default function () {
  const [activeItems, setActiveItems] = createSignal(['Charlie', 'Delta'])

  function addItem(item: string) {
    setActiveItems(items => [...items, item])
  }

  function removeItem(item: string) {
    setActiveItems(items => items.filter(activeItem => activeItem !== item))
  }

  return (
    <div class={classes.root}>
      <ul class={classes.list}>
        <For each={items.filter(item => !activeItems().includes(item))}>
          {item => <li onClick={[addItem, item]}>{item}</li>}
        </For>
      </ul>
      <ul class={clsx(classes.list, classes.active)}>
        <For each={activeItems()}>
          {item => (
            <li onClick={[removeItem, item]} use:borderRadius={20}>
              {item}
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}
