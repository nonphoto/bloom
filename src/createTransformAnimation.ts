import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Mat } from "@thi.ng/matrices";
import { comp, map, Transducer } from "@thi.ng/transducers";
import { Accessor } from "solid-js";
import { createAnimation } from "./createAnimation";
import { styleTransformMat33 } from "../dist";
import { keyframes } from "./transducer";

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
