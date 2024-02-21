import classes from "./ScrollingLayout.module.css";
import { quad, setTransform } from "@chloranthy/solid";
import {
  Quad2d,
  quad2dCreate,
  quad2dFromRect,
  quad2dTransformMat2d,
} from "@chloranthy/core";
import { createRAF } from "@solid-primitives/raf";
import { Mat2d, mat2dCreate, mat2dFromRotation } from "@chloranthy/core";
import { createEffect, createMemo, createSignal } from "solid-js";
import { useLayoutModel } from "@chloranthy/layout-model";

quad;
setTransform;

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      setTransform: Mat2d | undefined;
      quad: Quad2d | undefined;
    }
  }
}

export default function ScrollingLayout() {
  const [parentTransform, setParentTransform] = createSignal<Mat2d>(
    mat2dCreate(),
    {
      equals: false,
    },
  );

  const [innerElement, setInnerElement] = createSignal<HTMLElement>();

  const [, start] = createRAF(function raf(t) {
    setParentTransform((prev) => mat2dFromRotation(prev, t * 0.001));
  });

  createEffect(() => {
    start();
  });

  const layout = useLayoutModel();
  const innerRect = layout.useRect(innerElement);
  const innerMatrix = layout.useMatrix(innerElement);

  const shadowQuad = createMemo<Quad2d>(
    (out) => {
      const innerRectValue = innerRect();
      const innerMatrixValue = innerMatrix();
      if (innerRectValue && innerMatrixValue) {
        quad2dFromRect(out, innerRectValue);
        quad2dTransformMat2d(out, out, innerMatrixValue);
      }
      return out;
    },
    quad2dCreate(),
    { equals: false },
  );

  return (
    <>
      <div
        id="test"
        class={`${classes.container} ${classes.outer}`}
        use:setTransform={parentTransform()}
      >
        <div class={classes.container}>
          <div class={classes.sticky}></div>
          <div class={classes.absolute} ref={setInnerElement}></div>
        </div>
      </div>
      <div class={classes.shadow} use:quad={shadowQuad()} />
    </>
  );
}
