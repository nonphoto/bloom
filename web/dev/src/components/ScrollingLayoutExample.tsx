import classes from './ScrollingLayoutExample.module.css'

export default function ScrollingLayoutExample() {
  return (
    <div class={`${classes.container} ${classes.outer}`}>
      <div class={classes.container}>
        <div class={classes.sticky}></div>
        <div class={classes.fixed}></div>
        <div class={classes.absolute}></div>
      </div>
    </div>
  )
}
