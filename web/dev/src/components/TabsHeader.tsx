import {
  ReactiveAnimation,
  ViewTransitionMatch,
  Zombie,
  createMaybeMemo,
  createSetQuad,
  createSpringQuad2d,
  createViewTransition,
  viewTransition,
} from '@chloranthy/solid'
import classes from './TabsHeader.module.css'
import { For, ParentProps, Show, createSignal, untrack } from 'solid-js'
import { A, useMatch } from 'solid-start'
import { projects } from '~/data/projects'
import { useLayoutModel } from '@chloranthy/layout-model'
import {
  BodyQuad2d,
  bodyQuad2dCreate,
  bodyQuad2dFromRect,
  quad2dCreate,
  quad2dFromRect,
} from '@chloranthy/core'

viewTransition

function onEnterMatch(
  element: HTMLElement,
  match: ViewTransitionMatch,
): ReactiveAnimation | undefined {
  const layoutModel = useLayoutModel()
  const rect = layoutModel.useRect(element)
  const [body, setBody] = createSignal<BodyQuad2d>(
    match.animation
      ? untrack(match.animation.body)
      : bodyQuad2dFromRect(bodyQuad2dCreate(), match.rect),
    {
      equals: false,
    },
  )
  const quad = createMaybeMemo(quad2dFromRect, quad2dCreate(), rect)
  const isRunning = createSpringQuad2d(quad, body, setBody, 300)
  const isFinished = () => quad() != null && !isRunning()
  createSetQuad(element, () => body().p)
  return {
    isFinished,
    body,
  }
}

function onExitMatch(
  element: HTMLElement,
  match: ViewTransitionMatch,
): ReactiveAnimation | undefined {
  if (match.animation) {
    const body = match.animation.body
    createSetQuad(element, () => body().p)
    return match.animation
  }
}

function TabLink(props: { href: string } & ParentProps) {
  return (
    <A href={props.href} style={{ display: 'block' }}>
      {props.children}
    </A>
  )
}

function Tab(props: { slug: string } & ParentProps) {
  const href = () => `/examples/tabs/${props.slug}`
  const match = useMatch(href)

  return (
    <Show when={!match()} fallback={<TabLink href={href()}>{props.children}</TabLink>}>
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
