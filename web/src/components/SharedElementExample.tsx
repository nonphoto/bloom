import classes from "./SharedElementExample.module.css";
import {
  Accessor,
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
import type Rect from "@nonphoto/animate/rect";
import { toStyleString } from "@nonphoto/animate/transform";

const areas = xprod([1, 2], [1, 2]);

function borderRadius(radius: number, size: vec2, transform: mat2d) {
  const x = (radius / (size[0] * transform[0])) * 100;
  const y = (radius / (size[1] * transform[3])) * 100;
  return `${x}% / ${y}%`;
}

function boxShadow(
  inset: boolean,
  offsetX: number,
  offsetY: number,
  blurRadius: number,
  spreadRadius: number,
  color: string,
  transform: mat2d
) {
  const meanScale = (transform[0] + transform[3]) / 2;
  return `${inset ? "inset " : ""}${offsetX / transform[0]}px ${
    offsetY / transform[3]
  }px ${blurRadius / meanScale}px ${spreadRadius / meanScale}px ${color}`;
}

export default function SharedElementExample() {
  let outerElement: HTMLDivElement | undefined,
    innerElement: HTMLDivElement | undefined;

  const [areaIndex, setAreaIndex] = createSignal(0);
  const [outerRect, setOuterRect] = createSignal<Rect>(undefined, {
    equals: false,
  });
  const [innerRect, setInnerRect] = createSignal<Rect>(undefined, {
    equals: false,
  });
  const [animatedOuterRect, setAnimatedOuterRect] = createSignal<Rect>(
    undefined,
    { equals: false }
  );
  const outerTransform = createMemo<mat2d>(
    (prev) =>
      animatedOuterRect() && outerRect()
        ? rect.divide(prev, animatedOuterRect(), outerRect())
        : prev,
    mat2d.create(),
    { equals: false }
  );
  const layoutTranslation = createMemo<vec2>(
    (prev) => {
      if (innerRect() && outerRect()) {
        vec2.sub(prev, innerRect().position, outerRect().position);
      }
      return prev;
    },
    vec2.create(),
    { equals: false }
  );
  const outerTransformInverse = createMemo<mat2d>(
    (prev) => {
      mat2d.translate(prev, outerTransform(), layoutTranslation());
      mat2d.invert(prev, prev);
      mat2d.translate(prev, prev, layoutTranslation());
      return prev;
    },
    mat2d.create(),
    { equals: false }
  );
  const innerTargetRect = createMemo<Rect>(
    (prev) => {
      if (animatedOuterRect() && innerRect()) {
        rect.cover(prev, animatedOuterRect(), innerRect());
      }
      return prev;
    },
    rect.create(),
    { equals: false }
  );
  const innerTransform = createMemo<mat2d>(
    (prev) => {
      if (innerRect()) {
        rect.divide(prev, innerTargetRect(), innerRect());
        mat2d.multiply(prev, outerTransformInverse(), prev);
      }
      return prev;
    },
    mat2d.create(),
    { equals: false }
  );

  const combinedTransform = createMemo<mat2d>(
    (prev) => mat2d.multiply(prev, outerTransform(), innerTransform()),
    mat2d.create(),
    { equals: false }
  );

  let springX = new Spring();
  let springY = new Spring();
  let springWidth = new Spring();
  let springHeight = new Spring();

  const animation = new AnimationDriver((time: DOMHighResTimeStamp) => {
    untrack(() => {
      springX.setTime(time);
      springY.setTime(time);
      springWidth.setTime(time);
      springHeight.setTime(time);
      if (animatedOuterRect()) {
        setAnimatedOuterRect((prev: Rect | undefined) => {
          if (prev) {
            prev.position[0] = springX.position;
            prev.position[1] = springY.position;
            prev.size[0] = springWidth.position;
            prev.size[1] = springHeight.position;
          }
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
            stiffness: 10,
            initialPosition: animatedOuterRect().position[0],
            targetPosition: outerRect().position[0],
            initialVelocity: springX.velocity,
          });
          springY = new Spring({
            stiffness: 10,
            initialPosition: animatedOuterRect().position[1],
            targetPosition: outerRect().position[1],
            initialVelocity: springY.velocity,
          });
          springWidth = new Spring({
            stiffness: 10,

            initialPosition: animatedOuterRect().size[0],
            targetPosition: outerRect().size[0],
            initialVelocity: springWidth.velocity,
          });
          springHeight = new Spring({
            stiffness: 10,

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
        class={classes.shadow}
        style={{
          "grid-row-start": areas[areaIndex()][0],
          "grid-column-start": areas[areaIndex()][1],
        }}
      >
        <div
          ref={outerElement}
          class={classes.outer}
          style={{
            transform: toStyleString(outerTransform()),
            "border-radius": outerRect()
              ? borderRadius(50, outerRect().size, outerTransform())
              : undefined,
          }}
        >
          <div
            ref={innerElement}
            class={classes.inner}
            style={{
              transform: toStyleString(innerTransform()),
              "border-radius": innerRect()
                ? borderRadius(50, innerRect().size, combinedTransform())
                : undefined,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
