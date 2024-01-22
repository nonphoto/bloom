import classes from './index.module.css'
import { useParams } from 'solid-start'
import { projects } from '~/data/projects'
import TabsHeader from '~/components/TabsHeader'
import { Zombie, createViewTransition } from '@chloranthy/solid'
import { Show, createEffect, untrack } from 'solid-js'
import { onEnterMatch, onExitMatch } from '~/lib/transition'
import { useLayoutModel } from '@chloranthy/layout-model'
import { rectCy } from '@chloranthy/core'

export default function UserPage() {
  const params = useParams()
  const project = () => projects.find(project => project.slug === params['projectSlug'])
  return (
    <main class={classes.main}>
      <Zombie>
        <TabsHeader />
        <Show when={project()} keyed>
          {project => (
            <Zombie>
              {untrack(() => {
                const element = (
                  <h1 class={classes.h1} data-key={project.slug}>
                    {project.title.text}
                  </h1>
                ) as HTMLElement
                createViewTransition(element, { key: project.slug, onEnterMatch, onExitMatch })
                const layoutModel = useLayoutModel()
                const rect = layoutModel.useRect(element)
                createEffect(() => {
                  if (element.dataset['key'] === 'alpha') {
                    console.log('rect', rect() ? rectCy(rect()!) : undefined)
                  }
                })
                return element
              })}
            </Zombie>
          )}
        </Show>
      </Zombie>
    </main>
  )
}
