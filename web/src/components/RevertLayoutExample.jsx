import classes from "./RevertLayoutExample.module.css";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { mat2d, vec2 } from "gl-matrix";
import {
  RectObserver,
  toStyleString,
  difference,
} from "@nonphoto-animate/rect-observer";

export default function ReverLayoutExample() {
  let outerElement, innerElement;

  const [outerRect, setOuterRect] = createSignal(mat2d.create());
  const [innerRect, setInnerRect] = createSignal(mat2d.create());
  const [rotation, setRotation] = createSignal(0);
  const outerTransform = createMemo(
    (prev) => mat2d.fromRotation(prev, rotation()),
    mat2d.create(),
    { equals: false }
  );
  const translation = createMemo(
    (prev) => difference(prev, outerRect(), innerRect()),
    vec2.create(),
    { equals: false }
  );

  const innerTransform = createMemo(
    (prev) => {
      mat2d.copy(prev, outerTransform());
      mat2d.translate(prev, prev, translation());
      mat2d.invert(prev, prev);
      mat2d.translate(prev, prev, translation());
      return prev;
    },
    mat2d.create(),
    { equals: false }
  );

  const observer = new RectObserver();

  onMount(() => {
    observer.addListener(outerElement, setOuterRect);
    observer.addListener(innerElement, setInnerRect);
    observer.measure();
  });

  onCleanup(() => {
    observer.removeListener(outerElement, setOuterRect);
    observer.removeListener(innerElement, setInnerRect);
  });

  function onInput(event) {
    setRotation(Number(event.target.value));
  }

  createEffect(() => {
    console.log(innerTransform());
  });

  return (
    <>
      <div class={classes.input}>
        <label for="rotate">Rotate</label>
        <input
          id="rotate"
          type="number"
          onInput={onInput}
          step="0.1"
          value={rotation()}
        ></input>
      </div>
      <div
        ref={outerElement}
        class={classes.outer}
        style={{ transform: toStyleString(outerTransform()) }}
      >
        <div
          ref={innerElement}
          class={classes.inner}
          style={{ transform: toStyleString(innerTransform()) }}
        ></div>
      </div>
    </>
  );
}
