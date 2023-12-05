import classes from './index.module.css'
import { useParams } from 'solid-start'
import { projects } from '~/data/projects'
import TabsHeader from '~/components/TabsHeader'
import {
  ReactiveAnimation,
  ViewTransitionMatch,
  createMaybeMemo,
  createSetQuad,
  createSpringQuad2d,
  viewTransition,
} from '@chloranthy/solid'
import { useLayoutModel } from '@chloranthy/layout-model'
import { Show, createSignal, untrack } from 'solid-js'
import {
  BodyQuad2d,
  bodyQuad2dCreate,
  bodyQuad2dFromRect,
  quad2dCreate,
  quad2dFromRect,
} from '@nonphoto/math'

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

export default function UserPage() {
  const params = useParams()
  const project = () => projects.find(project => project.slug === params['projectSlug'])
  return (
    <main class={classes.main}>
      <TabsHeader />
      <Show when={project()} keyed>
        {project => (
          <h1
            class={classes.h1}
            use:viewTransition={{ key: project.slug, onEnterMatch, onExitMatch }}
          >
            {project.title.text}
          </h1>
        )}
      </Show>
    </main>
  )
}
