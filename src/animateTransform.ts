import { Mat } from "@thi.ng/matrices";
import { comp, map, Transducer } from "@thi.ng/transducers";
import { animateKeyframes } from "./animateKeyframes";
import { styleTransformMat33 } from "./style";
import { keyframes } from "./transducer";

export function animateTransform(
  element: Element,
  transform: Transducer<number, Mat>,
): Animation {
  return animateKeyframes(
    element,
    comp(transform, map(styleTransformMat33), keyframes("transform")),
  );
}
