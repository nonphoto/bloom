import classes from "./SharedElementExample.module.css";
import {
  batch,
  createEffect,
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
import { borderRadius, transform } from "@nonphoto/animate/style";
import type { EffectFunction, Signal } from "solid-js/types/reactive/signal";

const areas = xprod([1, 2], [1, 2]);

function createMutable<T>(
  fn: EffectFunction<T, T>,
  { create }: { create: () => T }
): Signal<T> {
  const [value, setValue] = createSignal(create(), { equals: false });
  createEffect(() => {
    setValue(fn);
  });
  return [value, setValue];
}

function createMat2d(fn: EffectFunction<mat2d, mat2d>) {
  return createMutable<mat2d>(fn, mat2d);
}

function createVec2(fn: EffectFunction<vec2, vec2>) {
  return createMutable<vec2>(fn, vec2);
}

function createRect(fn: EffectFunction<Rect, Rect>) {
  return createMutable<Rect>(fn, rect);
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
  const [outerTransform] = createMat2d((out) =>
    animatedOuterRect() && outerRect()
      ? rect.divide(out, animatedOuterRect(), outerRect())
      : out
  );
  const [layoutTranslation] = createVec2((out) => {
    if (innerRect() && outerRect()) {
      vec2.sub(out, innerRect().position, outerRect().position);
    }
    return out;
  });
  const [outerTransformInverse] = createMat2d((out) => {
    mat2d.translate(out, outerTransform(), layoutTranslation());
    mat2d.invert(out, out);
    mat2d.translate(out, out, layoutTranslation());
    return out;
  });
  const [animatedInnerRect] = createRect((out) => {
    if (animatedOuterRect() && innerRect()) {
      rect.cover(out, animatedOuterRect(), innerRect());
    }
    return out;
  });
  const [innerTransform] = createMat2d((out) => {
    if (innerRect()) {
      rect.divide(out, animatedInnerRect(), innerRect());
      mat2d.multiply(out, outerTransformInverse(), out);
    }
    return out;
  });
  const [combinedTransform] = createMat2d((out) =>
    mat2d.multiply(out, outerTransform(), innerTransform())
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
            transform: transform(outerTransform()),
            "border-radius": outerRect()
              ? borderRadius(50, outerRect().size, outerTransform())
              : undefined,
          }}
        >
          <div
            ref={innerElement}
            class={classes.inner}
            style={{
              transform: transform(innerTransform()),
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
