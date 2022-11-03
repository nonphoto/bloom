import classes from "./BorderBox.module.css";
import type { Rect } from "@nonphoto/rect";
import type { mat2d } from "gl-matrix";
import type { ParentComponent } from "solid-js";

const BorderBox: ParentComponent<{
  rect?: Rect;
  transform?: mat2d;
  borderWidth: number;
  borderRadius: number;
  borderStyle: string;
  class: string;
}> = (props) => {
  const borderRadius = () => props.borderRadius + "px";
  const borderWidth = () => props.borderWidth + "px";
  return (
    <div
      class={props.class}
      style={{
        position: "relative",
        "--border-radius": borderRadius(),
        "--border-style": props.borderStyle,
        "--border-width": borderWidth(),
      }}
    >
      {props.children}
      <div aria-hidden="true" class={classes.topCorners} />
      <div aria-hidden="true" class={classes.bottomCorners} />
      <div aria-hidden="true" class={classes.middleEdges} />
      <div aria-hidden="true" class={classes.centerEdges} />
    </div>
  );
};

export default BorderBox;
