import classes from './TabsHeader.module.css'
import { For } from 'solid-js'
import { A } from 'solid-start'
import { projects } from '~/data/projects'

export default function TabsHeader() {
  return (
    <nav>
      <ul class={classes.ul}>
        <For each={projects}>
          {project => (
            <li>
              <A href={`/examples/tabs/${project.slug}`}>{project.title.text}</A>
            </li>
          )}
        </For>
      </ul>
    </nav>
  )
}
