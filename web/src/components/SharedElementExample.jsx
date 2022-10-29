import classes from "./SharedElementExample.module.css";
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
import { xprod } from "ramda";
import { mat2, mat2d, vec2 } from "gl-matrix";
import AnimationDriver from "@nonphoto/animate/animation-driver";
import Spring from "@nonphoto/animate/spring";
import RectObserver from "@nonphoto/animate/rect-observer";
import * as rect from "@nonphoto/animate/rect";
import { toStyleString } from "@nonphoto/animate/transform";

const areas = xprod([1, 2], [1, 2]);

export default function SharedElementExample() {
  let element;

  const [areaIndex, setAreaIndex] = createSignal(0);
  const [layoutRect, setLayoutRect] = createSignal(undefined, {
    equals: false,
  });
  const [clientRect, setClientRect] = createSignal(undefined, {
    equals: false,
  });
  const transform = createMemo(
    (prev) =>
      clientRect() && layoutRect()
        ? rect.divide(prev, clientRect(), layoutRect())
        : prev,
    mat2d.create(),
    { equals: false }
  );

  let springX = new Spring();
  let springY = new Spring();
  let springWidth = new Spring();
  let springHeight = new Spring();
  const animation = new AnimationDriver((time) => {
    untrack(() => {
      springX.setTime(time);
      springY.setTime(time);
      springWidth.setTime(time);
      springHeight.setTime(time);
      if (clientRect()) {
        setClientRect((prev) => {
          prev.position[0] = springX.position;
          prev.position[1] = springY.position;
          prev.size[0] = springWidth.position;
          prev.size[1] = springHeight.position;
          return prev;
        });
      }
    });
  });

  const observer = new RectObserver();

  function onResize() {
    batch(() => {
      observer.measure();
    });
  }

  onMount(() => {
    observer.addListener(element, setLayoutRect);
    window.addEventListener("resize", onResize);
    onResize();
  });

  onCleanup(() => {
    observer.removeListener(element, setLayoutRect);
    window.addEventListener("resize", onResize);
  });

  createEffect(
    on(layoutRect, () => {
      if (layoutRect()) {
        if (clientRect()) {
          springX = new Spring({
            initialPosition: clientRect().position[0],
            targetPosition: layoutRect().position[0],
            initialVelocity: springX.velocity,
          });
          springY = new Spring({
            initialPosition: clientRect().position[1],
            targetPosition: layoutRect().position[1],
            initialVelocity: springY.velocity,
          });
          springWidth = new Spring({
            initialPosition: clientRect().size[0],
            targetPosition: layoutRect().size[0],
            initialVelocity: springWidth.velocity,
          });
          springHeight = new Spring({
            initialPosition: clientRect().size[1],
            targetPosition: layoutRect().size[1],
            initialVelocity: springHeight.velocity,
          });
          animation.start();
        } else {
          setClientRect(rect.clone(layoutRect()));
        }
      }
    })
  );

  return (
    <div
      class={classes.grid}
      onClick={() => {
        setAreaIndex((index) => (index + 1) % areas.length);
        batch(() => {
          observer.measure();
        });
      }}
    >
      <div
        ref={element}
        class={classes.box}
        style={{
          "grid-row-start": areas[areaIndex()][0],
          "grid-column-start": areas[areaIndex()][1],
          transform: toStyleString(transform()),
        }}
      ></div>
    </div>
  );
}
