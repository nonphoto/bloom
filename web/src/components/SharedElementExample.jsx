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
import { mat2d, vec2 } from "gl-matrix";
import AnimationDriver from "@nonphoto/animate/animation-driver";
import Spring from "@nonphoto/animate/spring";
import RectObserver from "@nonphoto/animate/rect-observer";
import * as rect from "@nonphoto/animate/rect";
import { toStyleString } from "@nonphoto/animate/transform";

const areas = xprod([1, 2], [1, 2]);

function borderRadius(radius, size, scale) {
  const x = (radius / (size[0] * scale[0])) * 100;
  const y = (radius / (size[1] * scale[1])) * 100;
  return `${x}% / ${y}%`;
}

function boxShadow(
  inset,
  offsetX,
  offsetY,
  blurRadius,
  spreadRadius,
  color,
  scale
) {
  const meanScale = (scale[0] + scale[1]) / 2;
  return `${inset ? "inset " : ""}${offsetX / scale[0]}px ${
    offsetY / scale[1]
  }px ${blurRadius / meanScale}px ${spreadRadius / meanScale}px ${color}`;
}

export default function SharedElementExample() {
  let outerElement, innerElement;

  const [areaIndex, setAreaIndex] = createSignal(0);
  const [outerRect, setOuterRect] = createSignal(undefined, {
    equals: false,
  });
  const [innerRect, setInnerRect] = createSignal(undefined, {
    equals: false,
  });
  const [animatedOuterRect, setAnimatedOuterRect] = createSignal(undefined, {
    equals: false,
  });
  const outerTransform = createMemo(
    (prev) =>
      animatedOuterRect() && outerRect()
        ? rect.divide(prev, animatedOuterRect(), outerRect())
        : prev,
    mat2d.create(),
    { equals: false }
  );
  const innerTransform = createMemo((prev) => prev, mat2d.create(), {
    equals: false,
  });

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
      if (animatedOuterRect()) {
        setAnimatedOuterRect((prev) => {
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
    observer.addListener(outerElement, setOuterRect);
    observer.addListener(innerElement, setInnerRect);
    window.addEventListener("resize", onResize);
    onResize();
  });

  onCleanup(() => {
    observer.removeListener(outerElement, setOuterRect);
    observer.removeListener(innerElement, setInnerRect);
    window.addEventListener("resize", onResize);
  });

  createEffect(
    on(outerRect, () => {
      if (outerRect()) {
        if (animatedOuterRect()) {
          springX = new Spring({
            initialPosition: animatedOuterRect().position[0],
            targetPosition: outerRect().position[0],
            initialVelocity: springX.velocity,
          });
          springY = new Spring({
            initialPosition: animatedOuterRect().position[1],
            targetPosition: outerRect().position[1],
            initialVelocity: springY.velocity,
          });
          springWidth = new Spring({
            initialPosition: animatedOuterRect().size[0],
            targetPosition: outerRect().size[0],
            initialVelocity: springWidth.velocity,
          });
          springHeight = new Spring({
            initialPosition: animatedOuterRect().size[1],
            targetPosition: outerRect().size[1],
            initialVelocity: springHeight.velocity,
          });
          animation.start();
        } else {
          setAnimatedOuterRect(rect.clone(outerRect()));
        }
      }
    })
  );

  const scaling = createMemo(
    (prev) => vec2.set(prev, outerTransform()[0], outerTransform()[3]),
    vec2.create(),
    { equals: false }
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
        ref={outerElement}
        class={classes.outer}
        style={{
          "grid-row-start": areas[areaIndex()][0],
          "grid-column-start": areas[areaIndex()][1],
          transform: toStyleString(outerTransform()),
          "border-radius": outerRect()
            ? borderRadius(1000, outerRect().size, scaling())
            : false,
          "box-shadow": boxShadow(
            false,
            0,
            0,
            0,
            10,
            "darkturquoise",
            scaling()
          ),
        }}
      >
        <div
          ref={innerElement}
          class={classes.inner}
          style={{
            transform: toStyleString(innerTransform()),
            "box-shadow": boxShadow(true, 0, 0, 0, 10, "dodgerblue", scaling()),
          }}
        ></div>
      </div>
    </div>
  );
}
