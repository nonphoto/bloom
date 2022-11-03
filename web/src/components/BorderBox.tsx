import classes from "./BorderBox.module.css";
import type { Rect } from "@nonphoto/rect";
import type { mat2d } from "gl-matrix";
import type { ParentComponent } from "solid-js";

const BorderBox: ParentComponent<{
  rect: Rect;
  transform: mat2d;
  borderWidth: number;
  borderRadius: number;
  borderStyle: string;
}> = (props) => {
  const borderRadius = () => props.borderRadius + "px";
  const borderWidth = () => props.borderWidth + "px";
  return (
    <div
      class={classes.middle}
      style={{
        "--border-radius": borderRadius(),
        "--border-style": props.borderStyle,
        "--border-width": borderWidth(),
      }}
    >
      {props.children}
      <div class={classes.top} />
      <div class={classes.bottom} />
    </div>
  );
};

export default BorderBox;
