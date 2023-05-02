import { For, createSignal, createUniqueId } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import MatrixPlayground from './routes/MatrixPlayground'
import ScrollingLayout from './routes/ScrollingLayout'

const options = [
  { label: 'Scrolling layout', component: ScrollingLayout },
  { label: 'Matrix playground', component: MatrixPlayground },
].map(option => ({ ...option, value: createUniqueId() }))

export default function App() {
  const [value, setValue] = createSignal(options[0]?.value)

  return (
    <>
      <select
        value={value()}
        onInput={event => {
          setValue(event.currentTarget.value)
        }}
        style={{ position: 'fixed' }}
      >
        <For each={options}>{option => <option value={option.value}>{option.label}</option>}</For>
      </select>
      <Dynamic component={options.find(option => option.value === value())?.component} />
    </>
  )
}
