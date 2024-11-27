import { centroid, Rect } from "@thi.ng/geom";
import { Mat, mul23, set23, translation23 } from "@thi.ng/matrices";
import { Transducer } from "@thi.ng/transducers";
import { neg, sub2, Vec } from "@thi.ng/vectors";
import { Accessor, createMemo } from "solid-js";
import { maybe, withValue } from "./utils";

export interface Layout {
  offsetCenter: () => Vec;
  accMatrix: () => Mat;
  worldMatrix: () => Mat;
}

interface LayoutCreateOptions {
  parent?: Layout;
  rect: Accessor<Rect | undefined>;
  matrix: Accessor<Transducer<number, Mat | undefined>>;
}

export function createLayout({
  parent,
  rect,
  matrix,
}: LayoutCreateOptions): Layout {
  const offsetCenter = createMemo<Vec | undefined>(() =>
    maybe(rect, (rect) => centroid(rect, [])),
  );

  const offsetDelta = createMemo<Vec | undefined>(() =>
    parent
      ? maybe(offsetCenter, (offsetCenter) =>
          maybe(parent.offsetCenter, (parentOffsetCenter) =>
            sub2([], offsetCenter, parentOffsetCenter),
          ),
        )
      : offsetCenter(),
  );

  const offsetDeltaMatrix = createMemo<Vec | undefined>(() =>
    maybe(offsetDelta, (offsetDelta) => translation23([], offsetDelta)),
  );

  const offsetMatrix = withValue([], (offsetMatrix) => {
    if (parent) {
      return mul23(
        offsetMatrix,
        parent.accMatrix(),
        translation23([], offsetDelta()),
      );
    } else {
      return translation23(offsetMatrix, offsetDelta());
    }
  });

  const accMatrix = withValue([], (accMatrix) => {
    set23(accMatrix, offsetMatrix());
    const matrixValue = matrix();
    if (matrixValue) {
      mul23(accMatrix, accMatrix, matrixValue);
    }
    return accMatrix;
  });

  const worldMatrix = withValue([], (worldMatrix) => {
    mul23(worldMatrix, worldMatrix, translation23([], neg([], offsetCenter())));
    return mul23(worldMatrix, worldMatrix, offsetMatrix());
  });

  return {
    offsetCenter,
    accMatrix,
    worldMatrix,
  };
}
