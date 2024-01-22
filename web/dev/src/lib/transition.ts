import { BodyQuad2d, bodyQuad2dCreate, bodyQuad2dFromRect, quad2dCreate, quad2dFromRect } from "@chloranthy/core"
import { useLayoutModel } from "@chloranthy/layout-model"
import { ReactiveAnimation, ViewTransitionMatch, createMaybeMemo, createSetQuad, createSpringQuad2d } from "@chloranthy/solid"
import {  createEffect, createSignal, untrack } from "solid-js"

export function onEnterMatch(
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

export function onExitMatch(
  element: HTMLElement,
  match: ViewTransitionMatch,
): ReactiveAnimation | undefined {
  if (match.animation) {
    const body = match.animation.body
    createSetQuad(element, () => body().p)
    return match.animation
  }
}
