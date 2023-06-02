import classes from './Header.module.css'
import { For } from 'solid-js'

export default function Header(props: {
  options: { value: string; label: string }[]
  value: string | undefined
  onValue: (value: string) => void
}) {
  return (
    <header class={classes.header}>
      <select
        value={props.value}
        onInput={event => {
          props.onValue(event.currentTarget.value)
        }}
      >
        <For each={props.options}>
          {option => <option value={option.value}>{option.label}</option>}
        </For>
      </select>
    </header>
  )
}
