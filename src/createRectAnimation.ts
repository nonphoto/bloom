import { rect, Rect } from "@thi.ng/geom";
import { Mat } from "@thi.ng/matrices";
import { comp, map, Transducer } from "@thi.ng/transducers";
import { Accessor, createMemo } from "solid-js";
import { createSpring2 } from "./createSpring";
import { untransform33 } from "./rect/untransform";
import { springPosition2, tuples } from "./transducer";

export function createRectTransducer(
  target: Accessor<Rect | undefined>,
  options?: {
    damping?: number;
    stiffness?: number;
  },
): Accessor<Transducer<number, Mat | undefined>> {
  const pos = createSpring2(() => target()?.pos, options);
  const size = createSpring2(() => target()?.size, options);

  return createMemo(
    () => {
      const targetValue = target();
      return comp(
        tuples(springPosition2(pos()), springPosition2(size())),
        map(([pos, size]) => {
          return targetValue && pos && size
            ? untransform33([], targetValue, rect(pos, size))
            : undefined;
        }),
      );
    },
    { equals: false },
  );
}
