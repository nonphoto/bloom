import { comp, map, partition, Transducer } from "@thi.ng/transducers";
import { frameDuration, maxKeyframes } from "./const";

export type AnimateOptions =
  | Omit<KeyframeAnimationOptions, "duration" | "delay" | "easing">
  | undefined;

export function animations(
  target: Element,
  options: AnimateOptions = {},
): Transducer<Keyframe, Animation> {
  return comp(
    partition(maxKeyframes + 1, maxKeyframes, true),
    map(
      (keyframes) =>
        new Animation(
          new KeyframeEffect(target, keyframes, {
            ...options,
            duration: keyframes.length * frameDuration,
          }),
        ),
    ),
  );
}
