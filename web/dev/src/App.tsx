import { createSignal, createUniqueId } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import MatrixPlayground from './routes/MatrixPlayground'
import ScrollingLayout from './routes/ScrollingLayout'
import SharedElement from './routes/SharedElement'
import Tabs from './routes/Tabs'
import Header from './components/Header'

const options = [
  { label: 'Tabs', component: Tabs },
  { label: 'Scrolling layout', component: ScrollingLayout },
  { label: 'Shared element', component: SharedElement },
  { label: 'Matrix playground', component: MatrixPlayground },
].map(option => ({ ...option, value: createUniqueId() }))

export default function App() {
  const [value, setValue] = createSignal(options[0]?.value)

  return (
    <>
      <Header options={options} value={value()} onValue={setValue} />
      <Dynamic component={options.find(option => option.value === value())?.component} />
    </>
  )
}
