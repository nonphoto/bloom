import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Transducer } from "@thi.ng/transducers";
import { Accessor, createMemo } from "solid-js";
import { animateKeyframes } from "./animateKeyframes";

export function createAnimation(
  element: MaybeAccessor<HTMLElement | undefined>,
  keyframes: MaybeAccessor<Transducer<number, Keyframe> | undefined>,
): Accessor<Animation | undefined> {
  return createMemo<Animation | undefined>((prev) => {
    prev?.cancel();
    const keyframesValue = access(keyframes);
    const elementValue = access(element);
    if (keyframesValue && elementValue) {
      return animateKeyframes(elementValue, keyframesValue);
    }
  });
}
