import { ComponentProps, createSignal } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { ViewTransitionKey, createViewTransition } from './viewTransition'

export default function View(props: ComponentProps<typeof Dynamic> & { key: ViewTransitionKey }) {
  const [element, setElement] = createSignal<HTMLElement>()
  createViewTransition(element, () => ({ key: props.key }))
  return <Dynamic {...props} ref={setElement} />
}
