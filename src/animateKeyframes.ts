import { comp, iterator, take, Transducer } from "@thi.ng/transducers";
import {
  delay,
  duration,
  frameDuration,
  maxKeyframes,
  time,
} from "./transducer";

export function animateKeyframes(
  element: HTMLElement,
  keyframes: Transducer<number, Keyframe>,
): Animation {
  const keyframesArray = Array.from(
    iterator(
      comp(duration(maxKeyframes), delay(-performance.now()), keyframes),
      time(),
    ),
  );
  return element.animate(keyframesArray, {
    duration: keyframes.length * frameDuration,
  });
}
