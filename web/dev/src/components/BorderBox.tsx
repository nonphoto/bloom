import classes from './BorderBox.module.css'
import type { Rect } from 'chloranthy/rect'
import type { mat2d } from 'gl-matrix'
import { createEffect, ParentComponent } from 'solid-js'

const BorderBox: ParentComponent<{
  rect?: Rect
  transform?: mat2d
  borderWidth: number
  borderRadius: number
  borderStyle: string
  class: string
  ref?: HTMLDivElement
}> = props => {
  const borderRadius = () => props.borderRadius + 'px'
  const borderWidth = () => props.borderWidth + 'px'

  return (
    <div
      ref={props.ref}
      class={`${props.class} ${classes.grid}`}
      style={{
        '--border-radius': borderRadius(),
        '--border-style': props.borderStyle,
        '--border-width': borderWidth(),
      }}
    >
      <div class={classes.content}>{props.children}</div>
      <div aria-hidden="true" class={classes.topCorners} />
      <div aria-hidden="true" class={classes.bottomCorners} />
      <div aria-hidden="true" class={classes.middleEdges} />
      <div aria-hidden="true" class={classes.centerEdges} />
    </div>
  )
}

export default BorderBox
