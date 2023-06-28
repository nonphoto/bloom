import classes from './index.module.css'
import { For, Show, createEffect, createSignal } from 'solid-js'
import { A } from 'solid-start'
import { imageOptions } from '~/data/images'
import { projects } from '~/data/projects'
import {
  createMaybeMemo,
  quad,
  borderRadius,
  createMousePosition,
  createTransition,
} from '@chloranthy/solid'
import { Quad2d, Rect } from '@chloranthy/animation'
import { vec2 } from 'gl-matrix'
import { Transition } from 'solid-transition-group'
import { useLayoutObserver } from '@chloranthy/layout-observer'

quad
borderRadius

function styleAspectRatio(props: { naturalWidth: number; naturalHeight: number }) {
  return `${props.naturalWidth} / ${props.naturalHeight}`
}

function Image(props: {
  src: string
  naturalWidth: number
  naturalHeight: number
  parentQuad: Quad2d.Type | undefined
}) {
  const [element, setElement] = createSignal<HTMLDivElement>()
  const layoutObserver = useLayoutObserver()
  const rect = layoutObserver.useRect(element)

  const childQuad = createMaybeMemo(Quad2d.fromRect, Quad2d.create(), rect)

  const fitQuad = createMaybeMemo(Quad2d.cover, Quad2d.create(), childQuad, () => props.parentQuad)

  return (
    <img
      ref={setElement}
      src={imageOptions(props.src, { w: 500 })}
      class={classes.img}
      style={{ 'aspect-ratio': styleAspectRatio(props) }}
      use:quad={fitQuad()}
    />
  )
}

export default function ProjectListIndex() {
  const [imageContainerElement, setImageContainerElement] = createSignal<HTMLDivElement>()

  const [hoveredIndex, setHoveredIndex] = createSignal<number>()
  const hoveredProject = () => (hoveredIndex() != null ? projects[hoveredIndex()!] : undefined)

  const mousePosition = createMousePosition()

  const layoutObserver = useLayoutObserver()
  const imageContainerRect = layoutObserver.useRect(imageContainerElement)
  const imageContainerFitRect = createMaybeMemo(
    Rect.setAspectRatio,
    Rect.create(),
    imageContainerRect,
    9 / 16,
    () => (a: number, b: number) => (a + b) / 2,
  )

  const size = createMaybeMemo(Rect.size, vec2.create(), imageContainerFitRect)

  const transitionSize = createTransition(size, 200)

  const imageContainerQuad = createMaybeMemo(
    Quad2d.fromPositionSize,
    Quad2d.create(),
    mousePosition,
    () => transitionSize().p,
  )

  return (
    <section class={classes.section}>
      <h1 class={classes.h1}>Projects</h1>
      <p class={classes.p}>
        Supports keyframes, spring and inertia animations on numbers, colors, and complex strings.
      </p>
      <div
        ref={setImageContainerElement}
        class={classes.images}
        use:quad={imageContainerQuad()}
        use:borderRadius={50}
      >
        <Transition>
          <Show when={hoveredProject()} keyed>
            {project => <Image {...project.image} parentQuad={imageContainerQuad()} />}
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
