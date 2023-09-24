import classes from './index.module.css'
import { For, createEffect, createSignal } from 'solid-js'
import { A } from 'solid-start'
import { imageOptions } from '~/data/images'
import { projects } from '~/data/projects'
import {
  TransitionCallback,
  createMaybeMemo,
  quad,
  borderRadius,
  createMousePosition,
  createSpringBody,
  createListTransition,
} from '@chloranthy/solid'
import {
  Quad2d,
  quad2dFromRect,
  quad2dCreate,
  quad2dCover,
  quad2dFromPositionSize,
  rectSetAspectRatio,
  rectCreate,
  rectSize,
} from '@chloranthy/core'
import { vec2Create } from '@chloranthy/gl-matrix'
import { useLayoutModel } from '@chloranthy/layout-model'

quad
borderRadius

function styleAspectRatio(props: { naturalWidth: number; naturalHeight: number }) {
  return `${props.naturalWidth} / ${props.naturalHeight}`
}

function Image(props: {
  src: string
  naturalWidth: number
  naturalHeight: number
  parentQuad: Quad2d | undefined
  useExit: (callback: TransitionCallback) => void
}) {
  const [element, setElement] = createSignal<HTMLDivElement>()
  const layoutModel = useLayoutModel()
  const rect = layoutModel.useRect(element)

  const childQuad = createMaybeMemo(quad2dFromRect, quad2dCreate, rect)

  const fitQuad = createMaybeMemo(quad2dCover, quad2dCreate, childQuad, () => props.parentQuad)

  createEffect(() => {
    props.useExit(() => () => {
      return (
        element()?.animate({ opacity: [1, 0] }, { duration: 500 })?.finished ?? Promise.resolve()
      )
    })
  })

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

  const layoutModel = useLayoutModel()
  const imageContainerRect = layoutModel.useRect(imageContainerElement)
  const imageContainerFitRect = createMaybeMemo(
    rectSetAspectRatio,
    rectCreate,
    imageContainerRect,
    9 / 16,
    () => (a: number, b: number) => (a + b) / 2,
  )

  const size = createMaybeMemo(rectSize, vec2Create(), imageContainerFitRect)

  const transitionSize = createSpringBody(size, 150)

  const imageContainerQuad = createMaybeMemo(
    quad2dFromPositionSize,
    quad2dCreate(),
    mousePosition,
    () => transitionSize().p,
  )

  const visibleProjects = createListTransition(
    () => (hoveredProject() ? [hoveredProject()!] : []),
    { exitMethod: 'move-to-end' },
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
        <For each={visibleProjects()}>
          {([project, { useExit }]) => {
            return <Image {...project.image} parentQuad={imageContainerQuad()} useExit={useExit} />
          }}
        </For>
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
