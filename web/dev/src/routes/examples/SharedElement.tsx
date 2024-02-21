import classes from "./SharedElement.module.css";
import { createSignal } from "solid-js";
import { xprod } from "ramda";
import {
  borderRadius,
  createMaybeMemo,
  createSpringBody,
  quad,
} from "@chloranthy/solid";
import {
  Quad2d,
  quad2dCover,
  quad2dCreate,
  quad2dFromPositionSize,
  quad2dFromRect,
  quad2dTransformMat2d,
  rectPosition,
  rectSize,
} from "@chloranthy/core";
import { Mat2d, Vec2, vec2Create } from "@chloranthy/core";
import { useLayoutModel } from "@chloranthy/layout-model";

quad;
borderRadius;

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      quad: Quad2d | undefined;
      borderRadius: number;
    }
  }
}

const areas = xprod([1, 2, 3], [1, 2, 3]);

export default function SharedElement() {
  const [areaIndex, setAreaIndex] = createSignal(0);

  const [outerElement, setOuterElement] = createSignal<
    HTMLElement | undefined
  >();
  const [innerElement, setInnerElement] = createSignal<
    HTMLElement | undefined
  >();

  const layoutModel = useLayoutModel();
  const outerTargetRect = layoutModel.useRect(outerElement);
  const innerTargetRect = layoutModel.useRect(innerElement);

  const targetPosition = createMaybeMemo(
    rectPosition,
    vec2Create(),
    outerTargetRect,
  );
  const targetSize = createMaybeMemo(rectSize, vec2Create(), outerTargetRect);

  const [position] = createSpringBody(targetPosition, 150);
  const [size] = createSpringBody(targetSize, 300);

  const outerMatrix = layoutModel.useMatrix(outerElement);

  const outerQuad = createMaybeMemo(
    (out: Quad2d, position: Vec2, size: Vec2, matrix: Mat2d) => {
      quad2dFromPositionSize(out, position, size);
      quad2dTransformMat2d(out, out, matrix);
      return out;
    },
    quad2dCreate,
    () => position().p,
    () => size().p,
    outerMatrix,
  );

  const innerTargetQuad = createMaybeMemo(
    quad2dFromRect,
    quad2dCreate,
    innerTargetRect,
  );

  const innerQuad = createMaybeMemo(
    quad2dCover,
    quad2dCreate,
    innerTargetQuad,
    outerQuad,
  );

  return (
    <>
      <div
        class={classes.grid}
        onClick={() => {
          setAreaIndex((index) => (index + 1) % areas.length);
        }}
      >
        <div
          class={classes.shadow}
          style={{
            "grid-row-start": areas[areaIndex()]?.[0],
            "grid-column-start": areas[areaIndex()]?.[1],
          }}
        >
          <div
            ref={setOuterElement}
            class={classes.outer}
            use:quad={outerQuad()}
            use:borderRadius={50}
            id="outer"
          >
            <div
              ref={setInnerElement}
              class={classes.inner}
              use:quad={innerQuad()}
              use:borderRadius={50}
            >
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: "100vh" }}></div>
    </>
  );
}
