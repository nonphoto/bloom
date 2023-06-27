import { createMousePosition } from '@solid-primitives/mouse'
import classes from './index.module.css'
import { For, Show, createEffect, createSignal } from 'solid-js'
import { A } from 'solid-start'
import { imageOptions } from '~/data/images'
import { projects } from '~/data/projects'
import { createMaybeMemo, quad } from '@chloranthy/solid'
import { Quad2d } from '@chloranthy/animation'
import { vec2 } from 'gl-matrix'
import { createWindowSize } from '@solid-primitives/resize-observer'
import { Transition } from 'solid-transition-group'

quad

function styleAspectRatio(props: { naturalWidth: number; naturalHeight: number }) {
  return `${props.naturalWidth} / ${props.naturalHeight}`
}

function safeWindow() {
  return typeof window !== 'undefined' ? window : undefined
}

export default function ProjectListIndex() {
  const [hoveredIndex, setHoveredIndex] = createSignal<number>()
  const hoveredProject = () => (hoveredIndex() != null ? projects[hoveredIndex()!] : undefined)

  createEffect(() => {
    console.log(hoveredProject())
  })

  const mousePosition = createMousePosition()
  const windowSize = createWindowSize()

  const mousePositionVec2 = createMaybeMemo(
    vec2.fromValues,
    () => mousePosition.x - (safeWindow()?.scrollX ?? 0),
    () => mousePosition.y - (safeWindow()?.scrollY ?? 0),
  )

  const windowSizeVec2 = createMaybeMemo(
    vec2.fromValues,
    () => windowSize.width,
    () => windowSize.height,
  )

  const scaledWindowSize = createMaybeMemo(vec2.scale, vec2.create(), windowSizeVec2, 0.4)

  const imageContainerQuad = createMaybeMemo(
    Quad2d.fromPositionSize,
    Quad2d.create(),
    mousePositionVec2,
    scaledWindowSize,
  )

  return (
    <section class={classes.section}>
      <h1 class={classes.h1}>Projects</h1>
      <p class={classes.p}>
        Supports keyframes, spring and inertia animations on numbers, colors, and complex strings.
      </p>
      <div class={classes.images} use:quad={imageContainerQuad()}>
        <Transition>
          <Show when={hoveredProject()} keyed>
            {project => (
              <img
                src={imageOptions(project.image.src, { w: 500 })}
                class={classes.img}
                style={{ 'aspect-ratio': styleAspectRatio(project.image) }}
              />
            )}
          </Show>
        </Transition>
      </div>
      <ul class={classes.ul}>
        <For each={projects}>
          {(project, index) => (
            <li class={classes.li} onMouseEnter={[setHoveredIndex, index()]}>
              <A href={project.slug}>
                <span style={project.title.style}>{project.title.text}</span>
              </A>
            </li>
          )}
        </For>
      </ul>
    </section>
  )
}
