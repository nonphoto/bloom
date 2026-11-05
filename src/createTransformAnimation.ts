import { Mat } from "@thi.ng/matrices";
import { comp, map, Transducer } from "@thi.ng/transducers";
import { Accessor } from "solid-js";
import { createAnimation } from "./createAnimation";
import { keyframes } from "./transducer";
import { access, MaybeAccessor } from "@solid-primitives/utils";
import { styleTransformMat33 } from "./style";

export function createTransformAnimation(
  element: MaybeAccessor<HTMLElement | undefined>,
  transform: MaybeAccessor<Transducer<number, Mat> | undefined>,
): Accessor<Animation | undefined> {
  return createAnimation(element, () => {
    const transformValue = access(transform);
    if (transformValue) {
      return comp(
        transformValue,
        map(styleTransformMat33),
        keyframes("transform"),
      );
    }
  });
}
