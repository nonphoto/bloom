import { comp, iterator, take, Transducer } from "@thi.ng/transducers";
import { delay, frameDuration, maxKeyframes, time } from "./transducer";

export function animateKeyframes(
  element: HTMLElement,
  keyframes: Transducer<number, Keyframe>,
): Animation {
  const keyframesArray = Array.from(
    iterator(
      comp(take(maxKeyframes), delay(-performance.now()), keyframes),
      time(),
    ),
  );
  return element.animate(keyframesArray, {
    duration: keyframesArray.length * frameDuration,
  });
}
