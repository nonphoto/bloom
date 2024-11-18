import { centroid, Rect } from "@thi.ng/geom";
import { Mat, mul23, set23, translation23 } from "@thi.ng/matrices";
import { neg, sub2, Vec } from "@thi.ng/vectors";
import { withValue } from "./utils";

export interface Layout {
  offsetCenter: Vec;
  rect: Rect;
  accMatrix: () => Mat;
  worldMatrix: () => Mat;
  matrix: () => Mat | undefined;
  scroll: () => Vec;
}

export function layoutCreate(
  parent: Layout | null,
  rect: Rect,
  matrix: () => Mat | undefined,
  scroll: () => Vec,
): Layout {
  const offsetCenter = centroid(rect, [])!;

  const layoutDelta = parent
    ? sub2([], offsetCenter, parent.offsetCenter)
    : offsetCenter;

  const offsetMatrix = withValue([], (offsetMatrix) => {
    if (parent) {
      return mul23(
        offsetMatrix,
        parent.accMatrix(),
        translation23([], layoutDelta),
      );
    } else {
      return translation23(offsetMatrix, layoutDelta);
    }
  });

  const accMatrix = withValue([], (accMatrix) => {
    set23(accMatrix, offsetMatrix());
    const matrixValue = matrix();
    if (matrixValue) {
      mul23(accMatrix, accMatrix, matrixValue);
    }
    return mul23(accMatrix, accMatrix, translation23([], scroll()));
  });

  const worldMatrix = withValue([], (worldMatrix) => {
    mul23(worldMatrix, worldMatrix, translation23([], neg([], offsetCenter)));
    return mul23(worldMatrix, worldMatrix, offsetMatrix());
  });

  return {
    rect,
    offsetCenter,
    accMatrix,
    worldMatrix,
    matrix,
    scroll,
  };
}
