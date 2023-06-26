import classes from './index.module.css'
import { For } from 'solid-js'
import { A } from 'solid-start'
import { projects } from '~/data/projects'

export default function ProjectListIndex() {
  return (
    <section class={classes.section}>
      <h1 class={classes.h1}>Projects</h1>
      <p class={classes.p}>
        Supports keyframes, spring and inertia animations on numbers, colors, and complex strings.
      </p>
      <div class={classes.images}>
        <For each={projects}>{project => <img src={project.image.src} />}</For>
      </div>
      <ul class={classes.ul}>
        <For each={projects}>
          {project => (
            <li class={classes.li}>
              <A style={project.title.style} href={project.slug}>
                {project.title.text}
              </A>
            </li>
          )}
        </For>
      </ul>
    </section>
  )
}
