import { Zombie, createViewTransition } from '@chloranthy/solid'
import classes from './TabsHeader.module.css'
import { For, ParentProps, Show, untrack } from 'solid-js'
import { A, useMatch } from 'solid-start'
import { projects } from '~/data/projects'
import { onEnterMatch, onExitMatch } from '~/lib/transition'

function TabLink(props: { href: string; hidden?: boolean } & ParentProps) {
  return (
    <A
      href={props.href}
      style={{ display: 'block', visibility: props.hidden ? 'hidden' : 'visible' }}
    >
      {props.children}
    </A>
  )
}

function Tab(props: { slug: string } & ParentProps) {
  const href = () => `/examples/tabs/${props.slug}`
  const match = useMatch(href)

  return (
    <Show
      when={!match()}
      fallback={
        <TabLink href={href()} hidden>
          {props.children}
        </TabLink>
      }
    >
      <Zombie>
        {untrack(() => {
          const element = (<TabLink href={href()}>{props.children}</TabLink>) as HTMLElement
          createViewTransition(element, { key: props.slug, onEnterMatch, onExitMatch })
          return element
        })}
      </Zombie>
    </Show>
  )
}

export default function TabsHeader() {
  return (
    <nav>
      <ul class={classes.ul}>
        <li>
          <A href="/examples/tabs">Home</A>
        </li>
        <For each={projects}>
          {project => (
            <li>
              <Tab slug={project.slug}>{project.title.text}</Tab>
            </li>
          )}
        </For>
      </ul>
    </nav>
  )
}
